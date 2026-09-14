using System.Globalization;
using Microsoft.EntityFrameworkCore;
using server.Data;

namespace server.Analytics;

public record RoleCount(string Role, int Count);

public record MonthCount(string Month, int Count);

public record AnalyticsSummary(
    int TotalUsers,
    int TotalPosts,
    int PublishedPosts,
    int DraftPosts,
    List<RoleCount> UsersByRole,
    List<MonthCount> PostsByMonth);

public static class AnalyticsEndpoints
{
    public static void MapAnalyticsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/analytics/summary", async (AppDbContext db) =>
        {
            var totalUsers = await db.Users.CountAsync();
            var totalPosts = await db.Posts.CountAsync();
            var publishedPosts = await db.Posts.CountAsync(p => p.Published);
            var draftPosts = totalPosts - publishedPosts;

            var usersByRole = await db.Users
                .GroupBy(u => u.Role)
                .Select(g => new RoleCount(g.Key, g.Count()))
                .ToListAsync();

            var start = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc)
                .AddMonths(-5);

            var postDates = await db.Posts
                .Where(p => p.CreatedAt >= start)
                .Select(p => p.CreatedAt)
                .ToListAsync();

            var culture = new CultureInfo("es-PE");
            var postsByMonth = Enumerable.Range(0, 6)
                .Select(offset => start.AddMonths(offset))
                .Select(month => new MonthCount(
                    culture.TextInfo.ToTitleCase(month.ToString("MMM", culture)),
                    postDates.Count(d => d.Year == month.Year && d.Month == month.Month)))
                .ToList();

            return Results.Ok(new AnalyticsSummary(
                totalUsers, totalPosts, publishedPosts, draftPosts, usersByRole, postsByMonth));
        }).RequireAuthorization();
    }
}
