using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Auth;

public record LoginRequest(string Username, string Password);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

public record UserResponse(
    int Id,
    string Username,
    string FullName,
    string Role,
    bool IsActive,
    bool MustChangePassword,
    DateTime? LockoutEnd)
{
    public static UserResponse From(User u) => new(
        u.Id,
        u.Username,
        u.FullName,
        u.Role,
        u.IsActive,
        u.MustChangePassword,
        u.LockoutEnd > DateTime.UtcNow ? u.LockoutEnd : null);
}

public record LoginResponse(string Token, DateTime ExpiresAt, UserResponse User);

public static class AuthEndpoints
{
    public const int MaxFailedAttempts = 5;
    public static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);

    private static readonly User DummyUser = new();
    private static readonly string DummyPasswordHash = Passwords.Hasher.HashPassword(DummyUser, Guid.NewGuid().ToString());

    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth");

        group.MapPost("/login", async (LoginRequest request, AppDbContext db, JwtTokenService tokenService) =>
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return Results.Unauthorized();
            }

            var user = await db.Users.SingleOrDefaultAsync(u => u.Username == request.Username);

            if (user?.LockoutEnd > DateTime.UtcNow)
            {
                return Results.Json(
                    new { message = "Demasiados intentos fallidos. Intenta nuevamente en unos minutos." },
                    statusCode: StatusCodes.Status429TooManyRequests);
            }

            // Unknown usernames still pay for a hash verification, so response
            // time doesn't reveal which usernames exist.
            var verification = Passwords.Hasher.VerifyHashedPassword(
                user ?? DummyUser, user?.PasswordHash ?? DummyPasswordHash, request.Password);

            if (user is null)
            {
                return Results.Unauthorized();
            }

            if (verification == PasswordVerificationResult.Failed)
            {
                user.FailedLoginCount++;
                if (user.FailedLoginCount >= MaxFailedAttempts)
                {
                    user.LockoutEnd = DateTime.UtcNow.Add(LockoutDuration);
                    user.FailedLoginCount = 0;
                }

                await db.SaveChangesAsync();
                return Results.Unauthorized();
            }

            // Checked after the password so a wrong guess can't tell an
            // inactive account apart from a nonexistent one.
            if (!user.IsActive)
            {
                return Results.Unauthorized();
            }

            user.FailedLoginCount = 0;
            user.LockoutEnd = null;
            await db.SaveChangesAsync();

            var (token, expiresAt) = tokenService.CreateToken(user);
            return Results.Ok(new LoginResponse(token, expiresAt, UserResponse.From(user)));
        }).RequireRateLimiting(RateLimiting.Login);

        group.MapGet("/me", async (ClaimsPrincipal principal, AppDbContext db) =>
        {
            var user = await db.Users.FindAsync(GetUserId(principal));
            return user is null ? Results.Unauthorized() : Results.Ok(UserResponse.From(user));
        }).RequireAuthorization();

        // Any signed-in user, including one forced to change their password.
        // Returns a fresh token: the password change rotates the security
        // stamp, so the token used for this call stops working.
        group.MapPost("/change-password", async (
            ChangePasswordRequest request,
            ClaimsPrincipal principal,
            AppDbContext db,
            JwtTokenService tokenService) =>
        {
            var user = await db.Users.FindAsync(GetUserId(principal));
            if (user is null)
            {
                return Results.Unauthorized();
            }

            var verification = Passwords.Hasher.VerifyHashedPassword(
                user, user.PasswordHash, request.CurrentPassword ?? string.Empty);
            if (verification == PasswordVerificationResult.Failed)
            {
                return Results.BadRequest(new { message = "La contraseña actual no es correcta." });
            }

            var error = Passwords.Validate(request.NewPassword);
            if (error is not null)
            {
                return Results.BadRequest(new { message = error });
            }

            if (request.NewPassword == request.CurrentPassword)
            {
                return Results.BadRequest(new { message = "La nueva contraseña debe ser distinta de la actual." });
            }

            Passwords.Set(user, request.NewPassword, mustChange: false);
            await db.SaveChangesAsync();

            var (token, expiresAt) = tokenService.CreateToken(user);
            return Results.Ok(new LoginResponse(token, expiresAt, UserResponse.From(user)));
        }).RequireAuthorization().RequireRateLimiting(RateLimiting.Login);
    }

    public static int GetUserId(ClaimsPrincipal principal) =>
        int.Parse(principal.FindFirstValue(JwtRegisteredClaimNames.Sub)!);
}
