using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace server.Blog;

public static class SlugGenerator
{
    public static string Generate(string title)
    {
        var normalized = title.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();

        foreach (var c in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
            {
                sb.Append(c);
            }
        }

        var slug = sb.ToString().Normalize(NormalizationForm.FormC).ToLowerInvariant();
        slug = Regex.Replace(slug, "[^a-z0-9\\s-]", "");
        slug = Regex.Replace(slug, "[\\s-]+", "-").Trim('-');

        return string.IsNullOrWhiteSpace(slug) ? "post" : slug;
    }
}
