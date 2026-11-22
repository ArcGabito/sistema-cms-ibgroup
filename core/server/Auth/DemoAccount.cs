using System.Security.Claims;

namespace Server.Auth;

// The public demo's account (Seed:DemoUsername / Seed:DemoPassword; without
// both there's none). Its credentials are shown on the sign-in page, so:
// - it's an Editor: contacts, test results, clients, users and the audit log
//   stay admin-only;
// - nothing it does reaches the public site: its posts are always drafts, it
//   only edits or deletes its own, and the site's content is read-only for it;
// - it gets DemoAiQuota.DailyLimit AI drafts a day (each one is a paid call);
// - nobody can lock the other visitors out with it: every startup restores
//   it (Data/DbSeeder.cs), it can't change its password and the per-account
//   lockout doesn't apply to it (the per-IP login rate limit still does).
public static class DemoAccount
{
    public const string ContentReadOnly = "En la demo, el contenido del sitio público es de solo lectura.";
    public const string OwnDraftsOnly = "En la demo solo puedes editar o eliminar tus propios borradores.";

    public static string? Username(IConfiguration config)
    {
        var username = config["Seed:DemoUsername"]?.Trim();
        return string.IsNullOrEmpty(username) || string.IsNullOrEmpty(config["Seed:DemoPassword"])
            ? null
            : username;
    }

    public static bool Is(IConfiguration config, string? username) =>
        Username(config) is { } demo && string.Equals(demo, username?.Trim(), StringComparison.OrdinalIgnoreCase);

    // The token's "name" claim is the username (JwtTokenService).
    public static bool Is(IConfiguration config, ClaimsPrincipal principal) =>
        Is(config, principal.Identity?.Name);

    // Refuses the endpoint to the demo account with `message` (403).
    public static TBuilder DeniedToDemo<TBuilder>(this TBuilder builder, string message)
        where TBuilder : IEndpointConventionBuilder =>
        builder.AddEndpointFilter(async (context, next) =>
        {
            var config = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();
            return Is(config, context.HttpContext.User)
                ? Results.Json(new { message }, statusCode: StatusCodes.Status403Forbidden)
                : await next(context);
        });
}

// Caps the AI drafts the demo account can generate per day (UTC). Kept in
// memory, so a restart starts the count over; enough to stop a visitor from
// running up the API bill.
public sealed class DemoAiQuota
{
    public const int DailyLimit = 5;

    private readonly Lock _gate = new();
    private DateOnly _day;
    private int _used;

    public bool TryTake()
    {
        lock (_gate)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            if (today != _day)
            {
                _day = today;
                _used = 0;
            }

            if (_used >= DailyLimit)
            {
                return false;
            }

            _used++;
            return true;
        }
    }

    // A draft that failed to generate doesn't count.
    public void GiveBack()
    {
        lock (_gate)
        {
            _used = Math.Max(0, _used - 1);
        }
    }
}
