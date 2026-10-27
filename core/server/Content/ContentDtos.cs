using System.Text.RegularExpressions;
using Server.Models;

namespace Server.Content;

// Each request type validates itself and copies its fields onto the entity,
// so ContentEndpoints can handle every content type with the same routes.
public interface IContentRequest<in TEntity>
{
    bool IsVisible { get; }
    string? Validate();
    void ApplyTo(TEntity entity);
}

public record ServiceRequest(
    string Title,
    string Description,
    List<string>? Features,
    string CtaLabel,
    string ImageUrl,
    string Icon,
    bool IsVisible) : IContentRequest<ServiceItem>
{
    public string? Validate()
    {
        if (string.IsNullOrWhiteSpace(Title) || string.IsNullOrWhiteSpace(Description))
            return "El título y la descripción son obligatorios.";
        if (string.IsNullOrWhiteSpace(ImageUrl) || !ContentValidation.IsImageUrl(ImageUrl))
            return "La imagen debe ser una ruta /assets/..., una imagen subida o una URL https.";
        if (!ContentIcons.Service.Contains(Icon))
            return "Ícono inválido.";
        if (CleanFeatures().Count > 10)
            return "Máximo 10 características por servicio.";
        return null;
    }

    public void ApplyTo(ServiceItem entity)
    {
        entity.Title = Title.Trim();
        entity.Description = Description.Trim();
        entity.Features = CleanFeatures();
        entity.CtaLabel = string.IsNullOrWhiteSpace(CtaLabel) ? "Más información" : CtaLabel.Trim();
        entity.ImageUrl = ImageUrl.Trim();
        entity.Icon = Icon;
        entity.IsVisible = IsVisible;
    }

    private List<string> CleanFeatures() =>
        (Features ?? []).Select(f => f.Trim()).Where(f => f.Length > 0).ToList();
}

public record FaqRequest(string Question, string Answer, bool IsVisible) : IContentRequest<FaqItem>
{
    public string? Validate() =>
        string.IsNullOrWhiteSpace(Question) || string.IsNullOrWhiteSpace(Answer)
            ? "La pregunta y la respuesta son obligatorias."
            : null;

    public void ApplyTo(FaqItem entity)
    {
        entity.Question = Question.Trim();
        entity.Answer = Answer.Trim();
        entity.IsVisible = IsVisible;
    }
}

public record CountryRequest(string Name, string Code, string Description, bool IsVisible) : IContentRequest<CountryItem>
{
    public string? Validate()
    {
        if (string.IsNullOrWhiteSpace(Name) || string.IsNullOrWhiteSpace(Description))
            return "El nombre y la descripción son obligatorios.";
        if (!Regex.IsMatch(Code ?? "", "^[A-Za-z]{2}$"))
            return "El código debe ser el código ISO de 2 letras del país (por ejemplo, pe).";
        return null;
    }

    public void ApplyTo(CountryItem entity)
    {
        entity.Name = Name.Trim();
        entity.Code = Code.ToLowerInvariant();
        entity.Description = Description.Trim();
        entity.IsVisible = IsVisible;
    }
}

public record StatPointRequest(string Year, double Value, double? SecondValue);

public record StatChartRequest(
    string Title,
    string Description,
    string Kind,
    string? SeriesLabel,
    string? SecondSeriesLabel,
    List<StatPointRequest>? Points,
    bool IsVisible) : IContentRequest<StatChart>
{
    public string? Validate()
    {
        if (string.IsNullOrWhiteSpace(Title) || string.IsNullOrWhiteSpace(Description))
            return "El título y la descripción son obligatorios.";
        if (!StatKinds.All.Contains(Kind))
            return "Tipo de gráfico inválido.";

        var points = Points ?? [];
        if (points.Count is < 1 or > 20)
            return "El gráfico debe tener entre 1 y 20 valores.";
        if (points.Any(p => string.IsNullOrWhiteSpace(p.Year)))
            return "Cada valor necesita su año o etiqueta.";
        if (points.Any(p => p.Value < 0 || p.SecondValue < 0))
            return "Los valores no pueden ser negativos.";

        if (Kind != StatKinds.Months && points.Any(p => p.Value > 100 || p.SecondValue > 100))
            return "Los porcentajes deben estar entre 0 y 100.";

        if (Kind == StatKinds.Split)
        {
            if (string.IsNullOrWhiteSpace(SeriesLabel) || string.IsNullOrWhiteSpace(SecondSeriesLabel))
                return "Un gráfico comparativo necesita el nombre de ambas series.";
            if (points.Any(p => p.SecondValue is null))
                return "Un gráfico comparativo necesita los dos valores de cada año.";
        }

        return null;
    }

    public void ApplyTo(StatChart entity)
    {
        var isSplit = Kind == StatKinds.Split;
        entity.Title = Title.Trim();
        entity.Description = Description.Trim();
        entity.Kind = Kind;
        entity.SeriesLabel = isSplit ? SeriesLabel!.Trim() : null;
        entity.SecondSeriesLabel = isSplit ? SecondSeriesLabel!.Trim() : null;
        entity.Points = (Points ?? [])
            .Select(p => new StatPoint
            {
                Year = p.Year.Trim(),
                Value = p.Value,
                SecondValue = isSplit ? p.SecondValue : null,
            })
            .ToList();
        entity.IsVisible = IsVisible;
    }
}

public static class ContentValidation
{
    // Images come from the site's own /assets folder, an uploaded file, or an absolute https URL.
    public static bool IsImageUrl(string value) =>
        value.StartsWith("/assets/", StringComparison.Ordinal) ||
        value.StartsWith("/uploads/", StringComparison.Ordinal) ||
        (Uri.TryCreate(value, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps);
}
