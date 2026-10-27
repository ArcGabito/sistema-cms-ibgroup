using Server.Data;

namespace Server.Health;

public static class HealthEndpoints
{
    // Answers once the API is up and its database (Azure SQL serverless, which
    // pauses when idle) accepts connections. The login page pings it on load
    // so both are awake by the time the user submits.
    public static void MapHealthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/estado", async (AppDbContext db, CancellationToken cancellationToken) =>
            await db.Database.CanConnectAsync(cancellationToken)
                ? Results.Ok(new { listo = true })
                : Results.Json(new { listo = false }, statusCode: StatusCodes.Status503ServiceUnavailable));
    }
}
