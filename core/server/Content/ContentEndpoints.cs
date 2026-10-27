using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Server.Auth;
using Server.Data;
using Server.Models;

namespace Server.Content;

public static class ContentEndpoints
{
    public static void MapContentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/content");

        MapContentType<ServiceItem, ServiceRequest>(group, "services", db => db.Services);
        MapContentType<FaqItem, FaqRequest>(group, "faqs", db => db.Faqs);
        MapContentType<CountryItem, CountryRequest>(group, "countries", db => db.Countries);
        MapContentType<StatChart, StatChartRequest>(group, "stats", db => db.StatCharts);
    }

    // The same five routes for every content type:
    //   GET    /api/content/{name}         public: visible items; signed in: all of them
    //   POST   /api/content/{name}         append at the end
    //   PUT    /api/content/{name}/{id}
    //   DELETE /api/content/{name}/{id}
    //   PUT    /api/content/{name}/order   body: every id, in the new order
    private static void MapContentType<TEntity, TRequest>(
        RouteGroupBuilder group,
        string name,
        Func<AppDbContext, DbSet<TEntity>> set)
        where TEntity : class, IContentItem, new()
        where TRequest : IContentRequest<TEntity>
    {
        var items = group.MapGroup($"/{name}");

        items.MapGet("/", async (AppDbContext db, ClaimsPrincipal principal) =>
        {
            var query = set(db).AsNoTracking();

            if (principal.Identity?.IsAuthenticated != true)
            {
                query = query.Where(i => i.IsVisible);
            }

            return Results.Ok(await query.OrderBy(i => i.SortOrder).ThenBy(i => i.Id).ToListAsync());
        });

        items.MapPost("/", async (TRequest request, AppDbContext db) =>
        {
            var error = request.Validate();
            if (error is not null)
            {
                return Results.BadRequest(new { message = error });
            }

            var entity = new TEntity();
            request.ApplyTo(entity);
            entity.SortOrder = (await set(db).MaxAsync(i => (int?)i.SortOrder) ?? -1) + 1;
            entity.UpdatedAt = DateTime.UtcNow;

            set(db).Add(entity);
            await db.SaveChangesAsync();

            return Results.Created($"/api/content/{name}/{entity.Id}", entity);
        }).RequireAuthorization(Policies.ContentEditor);

        items.MapPut("/{id:int}", async (int id, TRequest request, AppDbContext db) =>
        {
            var error = request.Validate();
            if (error is not null)
            {
                return Results.BadRequest(new { message = error });
            }

            var entity = await set(db).FindAsync(id);
            if (entity is null)
            {
                return Results.NotFound();
            }

            request.ApplyTo(entity);
            entity.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();

            return Results.Ok(entity);
        }).RequireAuthorization(Policies.ContentEditor);

        items.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            var entity = await set(db).FindAsync(id);
            if (entity is null)
            {
                return Results.NotFound();
            }

            set(db).Remove(entity);
            await db.SaveChangesAsync();

            return Results.NoContent();
        }).RequireAuthorization(Policies.ContentEditor);

        items.MapPut("/order", async (int[] ids, AppDbContext db) =>
        {
            var all = await set(db).ToListAsync();

            // Requiring the full list avoids two editors silently interleaving
            // partial reorders; a stale list just gets rejected.
            if (ids.Length != all.Count || ids.Distinct().Count() != ids.Length || ids.Except(all.Select(i => i.Id)).Any())
            {
                return Results.BadRequest(new { message = "El orden enviado no coincide con los elementos actuales. Recarga la página." });
            }

            var byId = all.ToDictionary(i => i.Id);
            for (var index = 0; index < ids.Length; index++)
            {
                byId[ids[index]].SortOrder = index;
            }

            await db.SaveChangesAsync();

            return Results.Ok(all.OrderBy(i => i.SortOrder));
        }).RequireAuthorization(Policies.ContentEditor);
    }
}
