using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using server.Ai;
using server.Data;
using server.Models;

namespace server.Blog;

public static class PostsEndpoints
{
    public static void MapPostsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/posts");

        // Public: the site's blog pages read published posts anonymously.
        // Authenticated dashboard users (the only ones who can reach a
        // valid token) see every post, drafts included.
        group.MapGet("/", async (AppDbContext db, ClaimsPrincipal principal) =>
        {
            var query = db.Posts.Include(p => p.Author).AsQueryable();

            if (principal.Identity?.IsAuthenticated != true)
            {
                query = query.Where(p => p.Published);
            }

            var posts = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();

            return Results.Ok(posts.Select(ToResponse));
        });

        group.MapPost("/", async (CreatePostRequest request, AppDbContext db, ClaimsPrincipal principal) =>
        {
            var validation = Validate(request.Title, request.Excerpt, request.Content);
            if (validation is not null)
            {
                return validation;
            }

            var post = new BlogPost
            {
                Title = request.Title,
                Slug = await GenerateUniqueSlug(db, request.Title),
                Excerpt = request.Excerpt,
                Content = request.Content,
                ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl,
                Published = request.Published,
                AuthorId = GetUserId(principal),
            };

            db.Posts.Add(post);
            await db.SaveChangesAsync();
            await db.Entry(post).Reference(p => p.Author).LoadAsync();

            return Results.Created($"/api/posts/{post.Id}", ToResponse(post));
        }).RequireAuthorization();

        group.MapPut("/{id:int}", async (int id, UpdatePostRequest request, AppDbContext db) =>
        {
            var validation = Validate(request.Title, request.Excerpt, request.Content);
            if (validation is not null)
            {
                return validation;
            }

            var post = await db.Posts.Include(p => p.Author).FirstOrDefaultAsync(p => p.Id == id);
            if (post is null)
            {
                return Results.NotFound();
            }

            post.Title = request.Title;
            post.Excerpt = request.Excerpt;
            post.Content = request.Content;
            post.ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl;
            post.Published = request.Published;
            post.UpdatedAt = DateTime.UtcNow;

            await db.SaveChangesAsync();

            return Results.Ok(ToResponse(post));
        }).RequireAuthorization();

        group.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            var post = await db.Posts.FindAsync(id);
            if (post is null)
            {
                return Results.NotFound();
            }

            db.Posts.Remove(post);
            await db.SaveChangesAsync();

            return Results.NoContent();
        }).RequireAuthorization();

        group.MapPost("/generate", async (
            GeneratePostRequest request,
            AppDbContext db,
            ClaimsPrincipal principal,
            AiDraftGenerator generator) =>
        {
            if (string.IsNullOrWhiteSpace(request.Topic))
            {
                return Results.BadRequest(new { message = "Ingresa un tema para generar el borrador." });
            }

            AiDraft draft;
            try
            {
                draft = await generator.GenerateDraftAsync(request.Topic);
            }
            catch (AiNotConfiguredException)
            {
                return Results.Problem(
                    detail: "La generación con IA no está configurada. Define ANTHROPIC_API_KEY en el servidor.",
                    statusCode: StatusCodes.Status503ServiceUnavailable);
            }
            catch (Exception ex)
            {
                return Results.Problem(
                    detail: $"No se pudo generar el borrador: {ex.Message}",
                    statusCode: StatusCodes.Status502BadGateway);
            }

            var post = new BlogPost
            {
                Title = draft.Title,
                Slug = await GenerateUniqueSlug(db, draft.Title),
                Excerpt = draft.Excerpt,
                Content = draft.Content,
                Published = false,
                AuthorId = GetUserId(principal),
            };

            db.Posts.Add(post);
            await db.SaveChangesAsync();
            await db.Entry(post).Reference(p => p.Author).LoadAsync();

            return Results.Created($"/api/posts/{post.Id}", ToResponse(post));
        }).RequireAuthorization();
    }

    private static IResult? Validate(string title, string excerpt, string content)
    {
        if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(excerpt) || string.IsNullOrWhiteSpace(content))
        {
            return Results.BadRequest(new { message = "Título, resumen y contenido son obligatorios." });
        }

        return null;
    }

    private static int GetUserId(ClaimsPrincipal principal) =>
        int.Parse(principal.FindFirstValue(JwtRegisteredClaimNames.Sub)!);

    private static async Task<string> GenerateUniqueSlug(AppDbContext db, string title)
    {
        var baseSlug = SlugGenerator.Generate(title);
        var slug = baseSlug;
        var suffix = 2;

        while (await db.Posts.AnyAsync(p => p.Slug == slug))
        {
            slug = $"{baseSlug}-{suffix}";
            suffix++;
        }

        return slug;
    }

    private static PostResponse ToResponse(BlogPost p) => new(
        p.Id,
        p.Title,
        p.Slug,
        p.Excerpt,
        p.Content,
        p.ImageUrl,
        p.Published,
        p.Author?.FullName ?? "—",
        p.CreatedAt,
        p.UpdatedAt);
}
