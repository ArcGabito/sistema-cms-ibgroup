using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Auth;

public record CreateUserRequest(string Username, string Password, string FullName, string Role);

public static class UsersEndpoints
{
    public static void MapUsersEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/users")
            .RequireAuthorization(policy => policy.RequireRole(Roles.Admin));

        group.MapGet("/", async (AppDbContext db) =>
        {
            var users = await db.Users
                .OrderBy(u => u.Username)
                .Select(u => new UserResponse(u.Id, u.Username, u.FullName, u.Role))
                .ToListAsync();

            return Results.Ok(users);
        });

        group.MapPost("/", async (CreateUserRequest request, AppDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(request.Username) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.FullName))
            {
                return Results.BadRequest(new { message = "Todos los campos son obligatorios." });
            }

            if (request.Password.Length < 8)
            {
                return Results.BadRequest(new { message = "La contraseña debe tener al menos 8 caracteres." });
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

            var hasher = new PasswordHasher<User>();
            user.PasswordHash = hasher.HashPassword(user, request.Password);

            db.Users.Add(user);
            await db.SaveChangesAsync();

            return Results.Created(
                $"/api/users/{user.Id}",
                new UserResponse(user.Id, user.Username, user.FullName, user.Role));
        });
    }
}
