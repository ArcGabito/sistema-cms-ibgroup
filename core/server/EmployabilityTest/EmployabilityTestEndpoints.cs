using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Server.Audit;
using Server.Auth;
using Server.Data;
using Server.Models;

namespace Server.EmployabilityTest;

public static class EmployabilityTestEndpoints
{
    private const int TotalQuestions = 32;

    public static void MapEmployabilityTestEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/employability-test");

        // Public: the /test-empleabilidad page submits here anonymously.
        group.MapPost("/", async (EmployabilityTestRequest request, AppDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(request.Nombres) ||
                string.IsNullOrWhiteSpace(request.ApellidoPaterno) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Telefono))
            {
                return Results.BadRequest(new { message = "Completa tus datos personales." });
            }

            if (request.Edad < 18 || request.Edad > 80)
            {
                return Results.BadRequest(new { message = "La edad debe estar entre 18 y 80 años." });
            }

            if (request.Respuestas.Count != TotalQuestions)
            {
                return Results.BadRequest(new { message = "Debes responder las 32 preguntas del test." });
            }

            foreach (var (key, value) in request.Respuestas)
            {
                if (value is not ("1" or "2" or "3" or "4" or "5"))
                {
                    return Results.BadRequest(new { message = $"Respuesta inválida para {key}." });
                }
            }

            var scores = request.Respuestas.Values.Select(int.Parse).ToList();
            var total = scores.Sum();
            var average = Math.Round(scores.Average(), 2);

            var submission = new EmployabilityTestSubmission
            {
                Nombres = request.Nombres,
                ApellidoPaterno = request.ApellidoPaterno,
                ApellidoMaterno = request.ApellidoMaterno,
                Email = request.Email,
                Telefono = request.Telefono,
                TieneLinkedin = request.TieneLinkedin,
                Pais = request.Pais,
                Departamento = request.Departamento,
                Edad = request.Edad,
                NivelProfesional = request.NivelProfesional,
                Industria = request.Industria,
                ActualmenteTrabajando = request.ActualmenteTrabajando,
                UltimoSalario = request.UltimoSalario,
                RespuestasJson = JsonSerializer.Serialize(request.Respuestas),
                PuntajeTotal = total,
                PuntajePromedio = average,
                AutorizaDatos = request.AutorizaDatos,
                DeseaOrientacion = request.DeseaOrientacion,
            };

            db.EmployabilityTestSubmissions.Add(submission);
            await db.SaveChangesAsync();

            return Results.Created(
                $"/api/employability-test/{submission.Id}",
                new EmployabilityTestResponse(submission.Id, submission.CreatedAt));
        }).RequireRateLimiting(RateLimiting.PublicForms);

        // Dashboard-only: list and manage submissions.
        group.MapGet("/", async (AppDbContext db) =>
        {
            var submissions = await db.EmployabilityTestSubmissions
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            return Results.Ok(submissions.Select(ToSummary));
        }).RequireAuthorization(Policies.AdminOnly);

        // One row per test, one column per answered question (q1, q2, ...).
        group.MapGet("/export", async (AppDbContext db, AuditLog audit) =>
        {
            var submissions = await db.EmployabilityTestSubmissions
                .AsNoTracking()
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
            await audit.RecordAsync(AuditActions.Export, "EmployabilityTestSubmission", null, $"{submissions.Count} tests");

            var answers = submissions.ToDictionary(
                s => s.Id,
                s => JsonSerializer.Deserialize<Dictionary<string, string>>(s.RespuestasJson) ?? []);

            // "q10" sorts after "q9", not after "q1".
            var questionKeys = answers.Values
                .SelectMany(a => a.Keys)
                .Distinct()
                .OrderBy(k => int.TryParse(k.TrimStart('q'), out var n) ? n : int.MaxValue)
                .ThenBy(k => k, StringComparer.Ordinal)
                .ToList();

            string[] fixedHeaders =
            [
                "Id", "Fecha (UTC)", "Nombres", "Apellido paterno", "Apellido materno", "Email", "Teléfono",
                "LinkedIn", "País", "Departamento", "Edad", "Nivel profesional", "Industria", "Trabajando",
                "Último salario", "Puntaje total", "Puntaje promedio", "Autoriza datos", "Desea orientación",
            ];

            return Csv.File(
                $"tests-empleabilidad-{Csv.Stamp()}.csv",
                [.. fixedHeaders, .. questionKeys.Select(k => k.ToUpperInvariant())],
                submissions.Select(s => (IReadOnlyList<object?>)
                [
                    s.Id, s.CreatedAt, s.Nombres, s.ApellidoPaterno, s.ApellidoMaterno, s.Email, s.Telefono,
                    s.TieneLinkedin, s.Pais, s.Departamento, s.Edad, s.NivelProfesional, s.Industria,
                    s.ActualmenteTrabajando, s.UltimoSalario, s.PuntajeTotal, s.PuntajePromedio, s.AutorizaDatos,
                    s.DeseaOrientacion,
                    .. questionKeys.Select(k => (object?)answers[s.Id].GetValueOrDefault(k)),
                ]));
        }).RequireAuthorization(Policies.AdminOnly);

        group.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            var submission = await db.EmployabilityTestSubmissions.FindAsync(id);
            if (submission is null)
            {
                return Results.NotFound();
            }

            db.EmployabilityTestSubmissions.Remove(submission);
            await db.SaveChangesAsync();

            return Results.NoContent();
        }).RequireAuthorization(Policies.AdminOnly);
    }

    private static EmployabilityTestSummary ToSummary(EmployabilityTestSubmission s)
    {
        var respuestas = JsonSerializer.Deserialize<Dictionary<string, string>>(s.RespuestasJson)
            ?? new Dictionary<string, string>();

        return new EmployabilityTestSummary(
            s.Id,
            s.Nombres,
            s.ApellidoPaterno,
            s.ApellidoMaterno,
            s.Email,
            s.Telefono,
            s.TieneLinkedin,
            s.Pais,
            s.Departamento,
            s.Edad,
            s.NivelProfesional,
            s.Industria,
            s.ActualmenteTrabajando,
            s.UltimoSalario,
            respuestas,
            s.PuntajeTotal,
            s.PuntajePromedio,
            s.AutorizaDatos,
            s.DeseaOrientacion,
            s.CreatedAt);
    }
}
