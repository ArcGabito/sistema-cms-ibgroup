using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace Server.Ai;

public record AiDraft(string Title, string Excerpt, string Content);

public class AiNotConfiguredException : Exception { }

public class AiDraftGenerator(IHttpClientFactory httpClientFactory, IOptions<AiOptions> options)
{
    private readonly AiOptions _options = options.Value;

    private const string SystemPrompt =
        "Eres un redactor de contenido para el blog de IBOutplacement, una consultora de outplacement y " +
        "coaching de empleabilidad que opera en Perú, Chile y Bolivia. Escribe en español, con tono " +
        "profesional y cercano, dirigido a ejecutivos y profesionales en transición laboral. Responde " +
        "ÚNICAMENTE con un objeto JSON válido, sin bloques de código ni texto adicional, con esta forma " +
        "exacta: {\"title\": string, \"excerpt\": string, \"content\": string}. \"excerpt\" debe tener como " +
        "máximo 200 caracteres. \"content\" debe tener varios párrafos en texto plano (usa saltos de línea " +
        "dobles entre párrafos, sin markdown).";

    public async Task<AiDraft> GenerateDraftAsync(string topic)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            throw new AiNotConfiguredException();
        }

        var client = httpClientFactory.CreateClient();
        client.BaseAddress = new Uri("https://api.anthropic.com/");
        client.DefaultRequestHeaders.Add("x-api-key", _options.ApiKey);
        client.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");

        // Haiku 5.5 always thinks (adaptively), and thinking counts toward
        // max_tokens, so leave room for it; low effort is enough for a draft.
        var payload = new
        {
            model = _options.Model,
            max_tokens = 16000,
            output_config = new { effort = "low" },
            system = SystemPrompt,
            messages = new[]
            {
                new { role = "user", content = $"Escribe un borrador de artículo de blog sobre: {topic}" },
            },
        };

        using var response = await client.PostAsync(
            "v1/messages",
            new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json"));

        var body = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"Anthropic API error ({(int)response.StatusCode}): {body}");
        }

        using var doc = JsonDocument.Parse(body);

        var stopReason = doc.RootElement.TryGetProperty("stop_reason", out var sr) ? sr.GetString() : null;
        if (stopReason == "refusal")
        {
            throw new InvalidOperationException("El modelo rechazó generar un borrador sobre ese tema.");
        }

        if (stopReason == "max_tokens")
        {
            throw new InvalidOperationException("La respuesta del modelo quedó incompleta. Intenta con un tema más acotado.");
        }

        // The response can start with thinking blocks; the draft is in the text block.
        var text = doc.RootElement.GetProperty("content")
            .EnumerateArray()
            .Where(block => block.GetProperty("type").GetString() == "text")
            .Select(block => block.GetProperty("text").GetString())
            .FirstOrDefault() ?? "";

        var jsonText = ExtractJson(text);

        using var draftDoc = JsonDocument.Parse(jsonText);
        var root = draftDoc.RootElement;

        return new AiDraft(
            root.GetProperty("title").GetString() ?? topic,
            root.GetProperty("excerpt").GetString() ?? "",
            root.GetProperty("content").GetString() ?? "");
    }

    private static string ExtractJson(string text)
    {
        var trimmed = text.Trim();
        if (!trimmed.StartsWith("```"))
        {
            return trimmed;
        }

        var firstNewline = trimmed.IndexOf('\n');
        trimmed = firstNewline >= 0 ? trimmed[(firstNewline + 1)..] : trimmed;

        var lastFence = trimmed.LastIndexOf("```", StringComparison.Ordinal);
        if (lastFence >= 0)
        {
            trimmed = trimmed[..lastFence];
        }

        return trimmed.Trim();
    }
}
