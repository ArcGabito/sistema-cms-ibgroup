using Microsoft.EntityFrameworkCore;
using Server.Auth;
using Server.Data;
using Server.Models;

namespace Server.Clients;

// Client companies, as opposed to contact submissions (leads from the site).
// Admin-only: the records hold contact people's personal data.
public static class ClientEndpoints
{
    public static void MapClientEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/clients").RequireAuthorization(Policies.AdminOnly);

        // `q` matches company, legal name, contact person, RUC and email.
        group.MapGet("/", async (
            AppDbContext db, int? page, int? pageSize, string? q, string? industry, string? province) =>
        {
            var query = db.Clients.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(industry))
            {
                query = query.Where(c => c.Industry == industry);
            }

            if (!string.IsNullOrWhiteSpace(province))
            {
                query = query.Where(c => c.Province == province);
            }

            var search = Paging.CleanQuery(q);
            if (search is not null)
            {
                query = query.Where(c =>
                    c.CompanyName.Contains(search) ||
                    c.LegalName.Contains(search) ||
                    (c.FirstName != null && c.FirstName.Contains(search)) ||
                    (c.LastName != null && c.LastName.Contains(search)) ||
                    (c.TaxId != null && c.TaxId.Contains(search)) ||
                    (c.Email != null && c.Email.Contains(search)));
            }

            var result = await query
                .OrderBy(c => c.CompanyName)
                .ThenBy(c => c.Id)
                .ToPagedAsync(page, pageSize, c => c);

            return Results.Ok(result);
        });

        // Values for the filter dropdowns.
        group.MapGet("/filters", async (AppDbContext db) =>
        {
            var industries = await db.Clients
                .Where(c => c.Industry != null)
                .Select(c => c.Industry!)
                .Distinct()
                .OrderBy(i => i)
                .ToListAsync();

            var provinces = await db.Clients
                .Where(c => c.Province != null)
                .Select(c => c.Province!)
                .Distinct()
                .OrderBy(p => p)
                .ToListAsync();

            return Results.Ok(new ClientFilters(industries, provinces));
        });

        group.MapPost("/", async (ClientRequest request, AppDbContext db) =>
        {
            var error = request.Validate();
            if (error is not null)
            {
                return Results.BadRequest(new { message = error });
            }

            var client = new Client();
            request.ApplyTo(client);

            if (client.TaxId is not null && await db.Clients.AnyAsync(c => c.TaxId == client.TaxId))
            {
                return Results.Conflict(new { message = "Ya existe un cliente con ese RUC." });
            }

            db.Clients.Add(client);
            await db.SaveChangesAsync();

            return Results.Created($"/api/clients/{client.Id}", client);
        });

        group.MapPut("/{id:int}", async (int id, ClientRequest request, AppDbContext db) =>
        {
            var error = request.Validate();
            if (error is not null)
            {
                return Results.BadRequest(new { message = error });
            }

            var client = await db.Clients.FindAsync(id);
            if (client is null)
            {
                return Results.NotFound();
            }

            request.ApplyTo(client);

            if (client.TaxId is not null && await db.Clients.AnyAsync(c => c.Id != id && c.TaxId == client.TaxId))
            {
                return Results.Conflict(new { message = "Ya existe otro cliente con ese RUC." });
            }

            await db.SaveChangesAsync();

            return Results.Ok(client);
        });

        group.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            var client = await db.Clients.FindAsync(id);
            if (client is null)
            {
                return Results.NotFound();
            }

            db.Clients.Remove(client);
            await db.SaveChangesAsync();

            return Results.NoContent();
        });
    }
}
