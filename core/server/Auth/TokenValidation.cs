using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Server.Data;

namespace Server.Auth;

public static class TokenValidation
{
    // Paths a user who must change their password can still reach.
    private static readonly string[] PasswordChangePaths = ["/api/auth/me", "/api/auth/change-password"];

    // A JWT stays cryptographically valid until it expires, so on its own it
    // can't be revoked. Checking it against the user row on every request is
    // what makes deactivation, deletion and password changes take effect
    // immediately instead of up to Jwt:ExpiresMinutes later.
    public static async Task ValidateAgainstUserAsync(TokenValidatedContext context)
    {
        var principal = context.Principal!;
        var stamp = principal.FindFirst(JwtTokenService.SecurityStampClaim)?.Value;
        var userId = AuthEndpoints.GetUserId(principal);

        var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
        var user = await db.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new { u.IsActive, u.SecurityStamp, u.MustChangePassword })
            .SingleOrDefaultAsync();

        if (user is null || !user.IsActive || user.SecurityStamp != stamp)
        {
            context.Fail("The session is no longer valid.");
            return;
        }

        if (user.MustChangePassword &&
            !PasswordChangePaths.Contains(context.HttpContext.Request.Path.Value, StringComparer.OrdinalIgnoreCase))
        {
            context.Fail("The user must change their password first.");
        }
    }
}
