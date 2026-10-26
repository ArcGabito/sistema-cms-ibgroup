using Microsoft.EntityFrameworkCore;
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
        });

        // Dashboard-only: list and manage submissions.
        group.MapGet("/", async (AppDbContext db) =>
        {
            var submissions = await db.ContactSubmissions
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            return Results.Ok(submissions.Select(ToResponse));
        }).RequireAuthorization();

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
        }).RequireAuthorization();
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
