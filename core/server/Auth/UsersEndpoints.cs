using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Auth;

public record CreateUserRequest(string Username, string Password, string FullName, string Role);
public record UpdateUserRequest(string FullName, string Role, bool IsActive);
public record ResetPasswordRequest(string NewPassword);

public static class UsersEndpoints
{
    public static void MapUsersEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/users")
            .RequireAuthorization(Policies.AdminOnly);

        group.MapGet("/", async (AppDbContext db) =>
        {
            var users = await db.Users.OrderBy(u => u.Username).ToListAsync();
            return Results.Ok(users.Select(UserResponse.From));
        });

        group.MapPost("/", async (CreateUserRequest request, AppDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(request.Username) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.FullName))
            {
                return Results.BadRequest(new { message = "Todos los campos son obligatorios." });
            }

            var passwordError = Passwords.Validate(request.Password);
            if (passwordError is not null)
            {
                return Results.BadRequest(new { message = passwordError });
            }

            if (!Roles.All.Contains(request.Role))
            {
                return Results.BadRequest(new { message = "Rol inválido." });
            }

            var exists = await db.Users.AnyAsync(u => u.Username == request.Username);
            if (exists)
            {
                return Results.Conflict(new { message = "Ya existe un usuario con ese nombre de usuario." });
            }

            var user = new User
            {
                Username = request.Username,
                FullName = request.FullName,
                Role = request.Role,
            };

            // The admin chose this password, so the new user replaces it on first login.
            Passwords.Set(user, request.Password, mustChange: true);

            db.Users.Add(user);
            await db.SaveChangesAsync();

            return Results.Created($"/api/users/{user.Id}", UserResponse.From(user));
        });

        group.MapPut("/{id:int}", async (int id, UpdateUserRequest request, ClaimsPrincipal principal, AppDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(request.FullName))
            {
                return Results.BadRequest(new { message = "Ingresa el nombre completo." });
            }

            if (!Roles.All.Contains(request.Role))
            {
                return Results.BadRequest(new { message = "Rol inválido." });
            }

            var user = await db.Users.FindAsync(id);
            if (user is null)
            {
                return Results.NotFound();
            }

            var isSelf = user.Id == AuthEndpoints.GetUserId(principal);
            if (isSelf && (!request.IsActive || request.Role != Roles.Admin))
            {
                return Results.BadRequest(new { message = "No puedes desactivarte ni quitarte el rol de administrador." });
            }

            var losesAdmin = user.Role == Roles.Admin && user.IsActive &&
                (request.Role != Roles.Admin || !request.IsActive);
            if (losesAdmin && await IsLastActiveAdmin(db, user.Id))
            {
                return Results.BadRequest(new { message = "Debe quedar al menos un administrador activo." });
            }

            // Role and status changes end the user's current sessions, so a
            // demoted or deactivated user can't keep using an old token.
            if (user.Role != request.Role || user.IsActive != request.IsActive)
            {
                Passwords.RotateSecurityStamp(user);
            }

            user.FullName = request.FullName.Trim();
            user.Role = request.Role;
            user.IsActive = request.IsActive;
            await db.SaveChangesAsync();

            return Results.Ok(UserResponse.From(user));
        });

        // Also clears a lockout. The user must replace this password on their next login.
        group.MapPost("/{id:int}/reset-password", async (int id, ResetPasswordRequest request, AppDbContext db) =>
        {
            var passwordError = Passwords.Validate(request.NewPassword);
            if (passwordError is not null)
            {
                return Results.BadRequest(new { message = passwordError });
            }

            var user = await db.Users.FindAsync(id);
            if (user is null)
            {
                return Results.NotFound();
            }

            Passwords.Set(user, request.NewPassword, mustChange: true);
            await db.SaveChangesAsync();

            return Results.Ok(UserResponse.From(user));
        });

        group.MapDelete("/{id:int}", async (int id, ClaimsPrincipal principal, AppDbContext db) =>
        {
            var user = await db.Users.FindAsync(id);
            if (user is null)
            {
                return Results.NotFound();
            }

            if (user.Id == AuthEndpoints.GetUserId(principal))
            {
                return Results.BadRequest(new { message = "No puedes eliminar tu propio usuario." });
            }

            if (user.Role == Roles.Admin && user.IsActive && await IsLastActiveAdmin(db, user.Id))
            {
                return Results.BadRequest(new { message = "Debe quedar al menos un administrador activo." });
            }

            // Posts keep a required reference to their author, so a user who
            // wrote any can only be deactivated.
            if (await db.Posts.AnyAsync(p => p.AuthorId == user.Id))
            {
                return Results.Conflict(new
                {
                    message = "Este usuario es autor de publicaciones. Desactívalo en lugar de eliminarlo.",
                });
            }

            db.Users.Remove(user);
            await db.SaveChangesAsync();

            return Results.NoContent();
        });
    }

    private static Task<bool> IsLastActiveAdmin(AppDbContext db, int userId) =>
        db.Users.AllAsync(u => u.Id == userId || u.Role != Roles.Admin || !u.IsActive);
}
