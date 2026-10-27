using Microsoft.EntityFrameworkCore;
using Server.Auth;
using Server.Data;

namespace Server.Audit;

public record AuditFilters(List<string> EntityTypes, List<string> Usernames);

public static class AuditEndpoints
{
    public static void MapAuditEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/audit").RequireAuthorization(Policies.AdminOnly);

        // Newest first. `q` matches the record's label or the username.
        group.MapGet("/", async (
            AppDbContext db, int? page, int? pageSize, string? q, string? entityType, string? action, string? username) =>
        {
            var query = db.AuditEntries.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(entityType)) query = query.Where(a => a.EntityType == entityType);
            if (!string.IsNullOrWhiteSpace(action)) query = query.Where(a => a.Action == action);
            if (!string.IsNullOrWhiteSpace(username)) query = query.Where(a => a.Username == username);

            var search = Paging.CleanQuery(q);
            if (search is not null)
            {
                query = query.Where(a => (a.Label != null && a.Label.Contains(search)) || a.Username.Contains(search));
            }

            var result = await query
                .OrderByDescending(a => a.At)
                .ThenByDescending(a => a.Id)
                .ToPagedAsync(page, pageSize, a => a);

            return Results.Ok(result);
        });

        group.MapGet("/filters", async (AppDbContext db) =>
        {
            var types = await db.AuditEntries.Select(a => a.EntityType).Distinct().OrderBy(t => t).ToListAsync();
            var users = await db.AuditEntries.Select(a => a.Username).Distinct().OrderBy(u => u).ToListAsync();
            return Results.Ok(new AuditFilters(types, users));
        });
    }
}
