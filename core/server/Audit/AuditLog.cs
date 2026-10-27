using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Server.Data;
using Server.Models;

namespace Server.Audit;

public static class AuditActions
{
    public const string Create = "create";
    public const string Update = "update";
    public const string Delete = "delete";
    public const string Export = "export";

    public static readonly string[] All = [Create, Update, Delete, Export];
}

public record AuditActor(int? Id, string Username);

// The signed-in dashboard user making the current request, if any.
public class CurrentActor(IHttpContextAccessor accessor)
{
    public AuditActor? Get()
    {
        var principal = accessor.HttpContext?.User;
        if (principal?.Identity?.IsAuthenticated != true)
        {
            return null;
        }

        var id = int.TryParse(principal.FindFirstValue(JwtRegisteredClaimNames.Sub), out var parsed) ? parsed : (int?)null;
        return new AuditActor(id, principal.Identity.Name ?? "—");
    }
}

// For events that aren't entity changes (exports). Entity changes are
// recorded automatically by AuditInterceptor.
public class AuditLog(AppDbContext db, CurrentActor actor)
{
    public async Task RecordAsync(string action, string entityType, string? entityId, string? label, string? details = null)
    {
        var who = actor.Get();
        if (who is null)
        {
            return;
        }

        db.AuditEntries.Add(new AuditEntry
        {
            UserId = who.Id,
            Username = who.Username,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Label = AuditLabels.Truncate(label),
            Details = details,
        });
        await db.SaveChangesAsync();
    }
}
