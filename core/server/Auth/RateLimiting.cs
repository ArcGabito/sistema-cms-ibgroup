using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace Server.Auth;

public static class RateLimiting
{
    public const string Login = "Login";
    public const string PublicForms = "PublicForms";
    public const string Uploads = "Uploads";

    public static IServiceCollection AddAppRateLimiting(this IServiceCollection services)
    {
        return services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = async (context, cancellationToken) =>
            {
                await context.HttpContext.Response.WriteAsJsonAsync(
                    new { message = "Demasiadas solicitudes. Intenta nuevamente en unos minutos." },
                    cancellationToken);
            };

            options.AddPolicy(Login, context => FixedWindowPerClient(context, permitLimit: 10, TimeSpan.FromMinutes(1)));
            options.AddPolicy(PublicForms, context => FixedWindowPerClient(context, permitLimit: 5, TimeSpan.FromMinutes(10)));
            options.AddPolicy(Uploads, context => FixedWindowPerClient(context, permitLimit: 30, TimeSpan.FromMinutes(10)));
        });
    }

    private static RateLimitPartition<string> FixedWindowPerClient(
        HttpContext context, int permitLimit, TimeSpan window) =>
        RateLimitPartition.GetFixedWindowLimiter(GetClientIp(context), _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = permitLimit,
            Window = window,
            QueueLimit = 0,
        });

    // Every request reaches this API through the Next.js server, which forwards
    // the visitor's address in X-Forwarded-For. The header can be spoofed by
    // anyone who reaches the API directly, which is why login also has a
    // per-account lockout (User.LockoutEnd) that doesn't depend on it.
    private static string GetClientIp(HttpContext context)
    {
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].ToString();
        if (!string.IsNullOrWhiteSpace(forwardedFor))
        {
            return forwardedFor.Split(',')[0].Trim();
        }

        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}
