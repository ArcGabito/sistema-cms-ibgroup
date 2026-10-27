namespace Server.Models;

// Editable blocks of the public site. Each type is an ordered list that the
// dashboard can reorder, hide or edit; the site renders the visible ones.
public interface IContentItem
{
    int Id { get; set; }
    int SortOrder { get; set; }
    bool IsVisible { get; set; }
    DateTime UpdatedAt { get; set; }
}

public class ServiceItem : IContentItem
{
    public int Id { get; set; }
    public int SortOrder { get; set; }
    public bool IsVisible { get; set; } = true;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Features { get; set; } = [];
    public string CtaLabel { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;

    // One of ContentIcons.Service; the site maps it to an icon component.
    public string Icon { get; set; } = string.Empty;
}

public class FaqItem : IContentItem
{
    public int Id { get; set; }
    public int SortOrder { get; set; }
    public bool IsVisible { get; set; } = true;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
}

public class CountryItem : IContentItem
{
    public int Id { get; set; }
    public int SortOrder { get; set; }
    public bool IsVisible { get; set; } = true;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string Name { get; set; } = string.Empty;

    // ISO 3166-1 alpha-2, lowercase; used for the flag image.
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class StatChart : IContentItem
{
    public int Id { get; set; }
    public int SortOrder { get; set; }
    public bool IsVisible { get; set; } = true;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // One of StatKinds: a single series in months or percent, or two percent
    // series side by side ("split").
    public string Kind { get; set; } = StatKinds.Percent;
    public string? SeriesLabel { get; set; }
    public string? SecondSeriesLabel { get; set; }
    public List<StatPoint> Points { get; set; } = [];
}

public class StatPoint
{
    public string Year { get; set; } = string.Empty;
    public double Value { get; set; }
    public double? SecondValue { get; set; }
}

public static class StatKinds
{
    public const string Months = "months";
    public const string Percent = "percent";
    public const string Split = "split";

    public static readonly string[] All = [Months, Percent, Split];
}

public static class ContentIcons
{
    public static readonly string[] Service = ["user", "id-card", "user-check", "accessibility", "users", "briefcase", "graduation-cap", "target"];
}
