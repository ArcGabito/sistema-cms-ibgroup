using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Server.Ai;
using Server.Auth;
using Server.Data;
using Server.Models;

namespace Server.Blog;

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

        // Public: the site's post detail page. Drafts are never served here,
        // even to authenticated users, so a draft can't leak through a shared link.
        group.MapGet("/slug/{slug}", async (string slug, AppDbContext db) =>
        {
            var post = await db.Posts
                .Include(p => p.Author)
                .FirstOrDefaultAsync(p => p.Slug == slug && p.Published);

            return post is null ? Results.NotFound() : Results.Ok(ToResponse(post));
        });

        group.MapPost("/", async (CreatePostRequest request, AppDbContext db, ClaimsPrincipal principal, IConfiguration config) =>
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
                // The demo's posts never reach the public site.
                Published = request.Published && !DemoAccount.Is(config, principal),
                AuthorId = GetUserId(principal),
            };

            db.Posts.Add(post);
            await db.SaveChangesAsync();
            await db.Entry(post).Reference(p => p.Author).LoadAsync();

            return Results.Created($"/api/posts/{post.Id}", ToResponse(post));
        }).RequireAuthorization(Policies.ContentEditor);

        group.MapPut("/{id:int}", async (int id, UpdatePostRequest request, AppDbContext db, ClaimsPrincipal principal, IConfiguration config) =>
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

            var demo = DemoAccount.Is(config, principal);
            if (demo && post.AuthorId != GetUserId(principal))
            {
                return Results.Json(new { message = DemoAccount.OwnDraftsOnly }, statusCode: StatusCodes.Status403Forbidden);
            }

            post.Title = request.Title;
            post.Excerpt = request.Excerpt;
            post.Content = request.Content;
            post.ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl;
            post.Published = request.Published && !demo;
            post.UpdatedAt = DateTime.UtcNow;

            await db.SaveChangesAsync();

            return Results.Ok(ToResponse(post));
        }).RequireAuthorization(Policies.ContentEditor);

        group.MapDelete("/{id:int}", async (int id, AppDbContext db, ClaimsPrincipal principal, IConfiguration config) =>
        {
            var post = await db.Posts.FindAsync(id);
            if (post is null)
            {
                return Results.NotFound();
            }

            if (DemoAccount.Is(config, principal) && post.AuthorId != GetUserId(principal))
            {
                return Results.Json(new { message = DemoAccount.OwnDraftsOnly }, statusCode: StatusCodes.Status403Forbidden);
            }

            db.Posts.Remove(post);
            await db.SaveChangesAsync();

            return Results.NoContent();
        }).RequireAuthorization(Policies.ContentEditor);

        group.MapPost("/generate", async (
            GeneratePostRequest request,
            AppDbContext db,
            ClaimsPrincipal principal,
            AiDraftGenerator generator,
            IConfiguration config,
            DemoAiQuota demoQuota) =>
        {
            if (string.IsNullOrWhiteSpace(request.Topic))
            {
                return Results.BadRequest(new { message = "Ingresa un tema para generar el borrador." });
            }

            // Each draft is a paid API call: the public demo gets a few a day.
            var demo = DemoAccount.Is(config, principal);
            if (demo && !demoQuota.TryTake())
            {
                return Results.Problem(
                    detail: $"La demo permite {DemoAiQuota.DailyLimit} borradores con IA por día. Vuelve a intentarlo mañana.",
                    statusCode: StatusCodes.Status429TooManyRequests);
            }

            AiDraft draft;
            try
            {
                draft = await generator.GenerateDraftAsync(request.Topic);
            }
            catch (AiNotConfiguredException)
            {
                if (demo) demoQuota.GiveBack();
                return Results.Problem(
                    detail: "La generación con IA no está configurada. Define ANTHROPIC_API_KEY en el servidor.",
                    statusCode: StatusCodes.Status503ServiceUnavailable);
            }
            catch (Exception ex)
            {
                if (demo) demoQuota.GiveBack();
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
        }).RequireAuthorization(Policies.ContentEditor);
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
        p.UpdatedAt,
        p.AuthorId);
}
