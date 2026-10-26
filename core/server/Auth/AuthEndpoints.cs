using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Auth;

public record LoginRequest(string Username, string Password);
public record UserResponse(int Id, string Username, string FullName, string Role);
public record LoginResponse(string Token, DateTime ExpiresAt, UserResponse User);

public static class AuthEndpoints
{
    private static readonly PasswordHasher<User> Hasher = new();
    private static readonly User DummyUser = new();
    private static readonly string DummyPasswordHash = Hasher.HashPassword(DummyUser, Guid.NewGuid().ToString());

    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth");

        group.MapPost("/login", async (
            LoginRequest request,
            AppDbContext db,
            JwtTokenService tokenService,
            LoginAttemptTracker attempts) =>
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return Results.Unauthorized();
            }

            if (attempts.IsLockedOut(request.Username))
            {
                return Results.Json(
                    new { message = "Demasiados intentos fallidos. Intenta nuevamente en unos minutos." },
                    statusCode: StatusCodes.Status429TooManyRequests);
            }

            var user = await db.Users.SingleOrDefaultAsync(u => u.Username == request.Username);

            // Unknown usernames still pay for a hash verification, so response
            // time doesn't reveal which usernames exist.
            var verification = Hasher.VerifyHashedPassword(
                user ?? DummyUser, user?.PasswordHash ?? DummyPasswordHash, request.Password);

            if (user is null || verification == PasswordVerificationResult.Failed)
            {
                attempts.RegisterFailure(request.Username);
                return Results.Unauthorized();
            }

            attempts.Reset(request.Username);

            var (token, expiresAt) = tokenService.CreateToken(user);
            var response = new LoginResponse(
                token,
                expiresAt,
                new UserResponse(user.Id, user.Username, user.FullName, user.Role));

            return Results.Ok(response);
        }).RequireRateLimiting(RateLimiting.Login);

        group.MapGet("/me", (ClaimsPrincipal principal) =>
        {
            var id = int.Parse(principal.FindFirstValue(JwtRegisteredClaimNames.Sub)!);
            var username = principal.Identity!.Name!;
            var fullName = principal.FindFirstValue("full_name")!;
            var role = principal.FindFirstValue("role")!;

            return Results.Ok(new UserResponse(id, username, fullName, role));
        }).RequireAuthorization();
    }
}
