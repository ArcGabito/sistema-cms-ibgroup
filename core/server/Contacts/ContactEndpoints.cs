using Microsoft.EntityFrameworkCore;
using Server.Audit;
using Server.Auth;
using Server.Data;
using Server.Models;

namespace Server.Contacts;

public static class ContactEndpoints
{
    private static readonly string[] ValidTypes = ["Personas", "Empresas"];

    public static void MapContactEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/contact");

        // Public: the site's contact forms submit here anonymously.
        group.MapPost("/", async (ContactSubmissionRequest request, AppDbContext db) =>
        {
            if (!ValidTypes.Contains(request.Type))
            {
                return Results.BadRequest(new { message = "Tipo de contacto inválido." });
            }

            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Telefono) ||
                string.IsNullOrWhiteSpace(request.Mensaje))
            {
                return Results.BadRequest(new { message = "Completa los campos obligatorios." });
            }

            if (request.Type == "Personas" &&
                (string.IsNullOrWhiteSpace(request.Nombres) || string.IsNullOrWhiteSpace(request.ApellidoPaterno)))
            {
                return Results.BadRequest(new { message = "Completa tus nombres y apellido paterno." });
            }

            if (request.Type == "Empresas" &&
                (string.IsNullOrWhiteSpace(request.Empresa) || string.IsNullOrWhiteSpace(request.Contacto)))
            {
                return Results.BadRequest(new { message = "Completa el nombre de la empresa y la persona de contacto." });
            }

            var submission = new ContactSubmission
            {
                Type = request.Type,
                Nombres = request.Nombres,
                ApellidoPaterno = request.ApellidoPaterno,
                ApellidoMaterno = request.ApellidoMaterno,
                Cargo = request.Cargo,
                Email = request.Email,
                Telefono = request.Telefono,
                Linkedin = request.Linkedin,
                Trabajando = request.Trabajando,
                Servicio = request.Servicio,
                Sector = request.Sector,
                RangoSalarial = request.RangoSalarial,
                Pais = request.Pais,
                Region = request.Region,
                Empresa = request.Empresa,
                Contacto = request.Contacto,
                Colaboradores = request.Colaboradores,
                Mensaje = request.Mensaje,
            };

            db.ContactSubmissions.Add(submission);
            await db.SaveChangesAsync();

            return Results.Created($"/api/contact/{submission.Id}", ToResponse(submission));
        }).RequireRateLimiting(RateLimiting.PublicForms);

        // Dashboard-only: list (filtered and sorted by Filter) and manage submissions.
        group.MapGet("/", async (AppDbContext db, int? page, int? pageSize, string? q, string? type) =>
        {
            var result = await Filter(db, q, type).ToPagedAsync(page, pageSize, ToResponse);

            // Totals per type for the filter chips, regardless of the current filter.
            var counts = await db.ContactSubmissions
                .GroupBy(c => c.Type)
                .Select(g => new { Type = g.Key, Count = g.Count() })
                .ToDictionaryAsync(g => g.Type, g => g.Count);

            return Results.Ok(new ContactSubmissionPage(
                result.Items,
                result.Total,
                result.Page,
                result.PageSize,
                counts.GetValueOrDefault("Personas"),
                counts.GetValueOrDefault("Empresas")));
        }).RequireAuthorization(Policies.AdminOnly);

        // Same filters as the list, every matching row.
        group.MapGet("/export", async (AppDbContext db, AuditLog audit, string? q, string? type) =>
        {
            var rows = await Filter(db, q, type).ToListAsync();
            await audit.RecordAsync(AuditActions.Export, "ContactSubmission", null, $"{rows.Count} consultas");

            return Csv.File(
                $"consultas-{Csv.Stamp()}.csv",
                [
                    "Id", "Fecha (UTC)", "Tipo", "Nombres", "Apellido paterno", "Apellido materno", "Empresa",
                    "Persona de contacto", "Cargo", "Email", "Teléfono", "LinkedIn", "Trabajando", "Servicio",
                    "Sector", "Rango salarial", "País", "Región", "Colaboradores", "Mensaje",
                ],
                rows.Select(c => (IReadOnlyList<object?>)
                [
                    c.Id, c.CreatedAt, c.Type, c.Nombres, c.ApellidoPaterno, c.ApellidoMaterno, c.Empresa,
                    c.Contacto, c.Cargo, c.Email, c.Telefono, c.Linkedin, c.Trabajando, c.Servicio,
                    c.Sector, c.RangoSalarial, c.Pais, c.Region, c.Colaboradores, c.Mensaje,
                ]));
        }).RequireAuthorization(Policies.AdminOnly);

        group.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            var submission = await db.ContactSubmissions.FindAsync(id);
            if (submission is null)
            {
                return Results.NotFound();
            }

            db.ContactSubmissions.Remove(submission);
            await db.SaveChangesAsync();

            return Results.NoContent();
        }).RequireAuthorization(Policies.AdminOnly);
    }

    // Newest first. `q` matches names, company, email and phone; `type` is Personas/Empresas.
    private static IQueryable<ContactSubmission> Filter(AppDbContext db, string? q, string? type)
    {
        var query = db.ContactSubmissions.AsNoTracking();

        if (type is not null && ValidTypes.Contains(type))
        {
            query = query.Where(c => c.Type == type);
        }

        var search = Paging.CleanQuery(q);
        if (search is not null)
        {
            query = query.Where(c =>
                (c.Nombres != null && c.Nombres.Contains(search)) ||
                (c.ApellidoPaterno != null && c.ApellidoPaterno.Contains(search)) ||
                (c.ApellidoMaterno != null && c.ApellidoMaterno.Contains(search)) ||
                (c.Empresa != null && c.Empresa.Contains(search)) ||
                (c.Contacto != null && c.Contacto.Contains(search)) ||
                c.Email.Contains(search) ||
                c.Telefono.Contains(search));
        }

        return query.OrderByDescending(c => c.CreatedAt).ThenByDescending(c => c.Id);
    }

    private static ContactSubmissionResponse ToResponse(ContactSubmission c) => new(
        c.Id,
        c.Type,
        c.Nombres,
        c.ApellidoPaterno,
        c.ApellidoMaterno,
        c.Cargo,
        c.Email,
        c.Telefono,
        c.Linkedin,
        c.Trabajando,
        c.Servicio,
        c.Sector,
        c.RangoSalarial,
        c.Pais,
        c.Region,
        c.Empresa,
        c.Contacto,
        c.Colaboradores,
        c.Mensaje,
        c.CreatedAt);
}
