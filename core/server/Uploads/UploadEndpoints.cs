using System.Text.RegularExpressions;
using Server.Auth;

namespace Server.Uploads;

public class UploadOptions
{
    public const string SectionName = "Uploads";

    // Relative paths resolve against the app's content root. In Docker this
    // points at a volume so uploads survive rebuilds.
    public string Path { get; set; } = "uploads";
}

public record UploadResponse(string Url);

public static partial class UploadEndpoints
{
    public const long MaxBytes = 5 * 1024 * 1024;

    // Detected from the file's first bytes, never from its name or the
    // declared content type, which the client controls.
    private static readonly (string Extension, string ContentType, Func<byte[], bool> Matches)[] ImageTypes =
    [
        (".jpg", "image/jpeg", b => b.Length >= 3 && b[0] == 0xFF && b[1] == 0xD8 && b[2] == 0xFF),
        (".png", "image/png", b => b.Length >= 8 && b.AsSpan(0, 8).SequenceEqual(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A })),
        (".webp", "image/webp", b => b.Length >= 12 && b.AsSpan(0, 4).SequenceEqual("RIFF"u8) && b.AsSpan(8, 4).SequenceEqual("WEBP"u8)),
    ];

    [GeneratedRegex(@"^[a-f0-9]{32}\.(jpg|png|webp)$")]
    private static partial Regex StoredName();

    public static void MapUploadEndpoints(this IEndpointRouteBuilder app, string directory)
    {
        Directory.CreateDirectory(directory);

        app.MapPost("/api/uploads", async (IFormFile? file) =>
        {
            if (file is null || file.Length == 0)
            {
                return Results.BadRequest(new { message = "Selecciona una imagen." });
            }

            if (file.Length > MaxBytes)
            {
                return Results.BadRequest(new { message = "La imagen no puede pesar más de 5 MB." });
            }

            var header = new byte[12];
            await using (var peek = file.OpenReadStream())
            {
                _ = await peek.ReadAtLeastAsync(header, header.Length, throwOnEndOfStream: false);
            }

            var type = ImageTypes.FirstOrDefault(t => t.Matches(header));
            if (type.Extension is null)
            {
                return Results.BadRequest(new { message = "Formato no permitido. Usa JPG, PNG o WebP." });
            }

            // A random name: nothing from the client ends up in the path.
            var name = $"{Guid.NewGuid():N}{type.Extension}";
            await using (var target = File.Create(System.IO.Path.Combine(directory, name)))
            {
                await file.CopyToAsync(target);
            }

            return Results.Created($"/uploads/{name}", new UploadResponse($"/uploads/{name}"));
        })
        .RequireAuthorization(Policies.ContentEditor)
        .RequireRateLimiting(RateLimiting.Uploads)
        // Called from the dashboard through the Next.js proxy with a bearer
        // token, not from an HTML form, so antiforgery doesn't apply.
        .DisableAntiforgery();

        // Public: the site's <img> tags point here (through the Next.js proxy).
        app.MapGet("/uploads/{name}", (string name) =>
        {
            if (!StoredName().IsMatch(name))
            {
                return Results.NotFound();
            }

            var path = System.IO.Path.Combine(directory, name);
            if (!File.Exists(path))
            {
                return Results.NotFound();
            }

            var contentType = ImageTypes.First(t => name.EndsWith(t.Extension, StringComparison.Ordinal)).ContentType;
            return Results.File(path, contentType, enableRangeProcessing: false);
        });
    }
}
