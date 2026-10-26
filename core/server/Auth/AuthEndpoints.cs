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
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth");

        group.MapPost("/login", async (LoginRequest request, AppDbContext db, JwtTokenService tokenService) =>
        {
            var user = await db.Users.SingleOrDefaultAsync(u => u.Username == request.Username);
            if (user is null)
            {
                return Results.Unauthorized();
            }

            var hasher = new PasswordHasher<User>();
            var verification = hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (verification == PasswordVerificationResult.Failed)
            {
                return Results.Unauthorized();
            }

            var (token, expiresAt) = tokenService.CreateToken(user);
            var response = new LoginResponse(
                token,
                expiresAt,
                new UserResponse(user.Id, user.Username, user.FullName, user.Role));

            return Results.Ok(response);
        });

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
