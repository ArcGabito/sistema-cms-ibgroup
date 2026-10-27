using System.Globalization;
using System.Text;

namespace Server.Data;

public static class Csv
{
    // Spreadsheet apps run a cell as a formula when it starts with one of
    // these, which turns visitor-submitted text into code on the admin's
    // machine (CSV injection). Prefixing a quote makes it plain text.
    private static readonly char[] FormulaStarts = ['=', '+', '-', '@', '\t', '\r'];

    public static IResult File(string fileName, IReadOnlyList<string> headers, IEnumerable<IReadOnlyList<object?>> rows)
    {
        var builder = new StringBuilder();
        AppendRow(builder, headers);

        foreach (var row in rows)
        {
            AppendRow(builder, row.Select(Format).ToList());
        }

        // The BOM makes Excel read the file as UTF-8, so accents survive.
        var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(builder.ToString())).ToArray();
        return Results.File(bytes, "text/csv; charset=utf-8", fileName);
    }

    public static string Stamp() => DateTime.UtcNow.ToString("yyyyMMdd-HHmm", CultureInfo.InvariantCulture);

    private static string Format(object? value) => value switch
    {
        null => "",
        DateTime d => d.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture),
        double n => n.ToString("0.##", CultureInfo.InvariantCulture),
        IFormattable f => f.ToString(null, CultureInfo.InvariantCulture),
        _ => value.ToString() ?? "",
    };

    private static void AppendRow(StringBuilder builder, IReadOnlyList<string> cells)
    {
        for (var i = 0; i < cells.Count; i++)
        {
            if (i > 0) builder.Append(',');
            builder.Append(Escape(cells[i]));
        }

        builder.Append("\r\n");
    }

    private static string Escape(string value)
    {
        if (value.Length > 0 && FormulaStarts.Contains(value[0]))
        {
            value = "'" + value;
        }

        return value.IndexOfAny([',', '"', '\n', '\r']) >= 0
            ? $"\"{value.Replace("\"", "\"\"")}\""
            : value;
    }
}
