namespace Server.Blog;

public record PostResponse(
    int Id,
    string Title,
    string Slug,
    string Excerpt,
    string Content,
    string? ImageUrl,
    bool Published,
    string AuthorName,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record CreatePostRequest(string Title, string Excerpt, string Content, string? ImageUrl, bool Published);

public record UpdatePostRequest(string Title, string Excerpt, string Content, string? ImageUrl, bool Published);

public record GeneratePostRequest(string Topic);
