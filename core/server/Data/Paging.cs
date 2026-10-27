using Microsoft.EntityFrameworkCore;

namespace Server.Data;

public record PagedResult<T>(List<T> Items, int Total, int Page, int PageSize);

public static class Paging
{
    public const int DefaultPageSize = 20;
    public const int MaxPageSize = 100;

    public static (int Page, int PageSize) Normalize(int? page, int? pageSize) =>
        (Math.Max(1, page ?? 1), Math.Clamp(pageSize ?? DefaultPageSize, 1, MaxPageSize));

    // Runs the count and the page query against the same filtered query. A
    // page past the end returns an empty list with the real total, so the UI
    // can step back.
    public static async Task<PagedResult<TOut>> ToPagedAsync<TIn, TOut>(
        this IQueryable<TIn> query, int? page, int? pageSize, Func<TIn, TOut> map)
    {
        var (p, size) = Normalize(page, pageSize);
        var total = await query.CountAsync();
        var items = await query.Skip((p - 1) * size).Take(size).ToListAsync();

        return new PagedResult<TOut>(items.Select(map).ToList(), total, p, size);
    }

    public static string? CleanQuery(string? q) => string.IsNullOrWhiteSpace(q) ? null : q.Trim();
}
