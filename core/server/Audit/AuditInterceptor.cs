using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Server.Data;
using Server.Models;

namespace Server.Audit;

// Records every create, update and delete that a signed-in dashboard user
// makes, from the change tracker, so endpoints don't have to remember to.
// Changes without a signed-in user (public forms, seeding, login counters)
// aren't recorded. Only SaveChangesAsync is intercepted; the app doesn't use
// the synchronous SaveChanges.
public class AuditInterceptor(CurrentActor actor) : SaveChangesInterceptor
{
    // Fields that change as a side effect and would only add noise.
    private static readonly HashSet<string> IgnoredFields =
        ["UpdatedAt", "SecurityStamp", "FailedLoginCount", "LockoutEnd"];

    // Shown by name only; never their values (none are stored anyway).
    private static readonly Dictionary<string, string> RenamedFields = new() { ["PasswordHash"] = "Password" };

    private sealed record Pending(EntityEntry Entry, string Action, string? EntityId, string? Label, string? Details);

    private List<Pending> _pending = [];
    private AuditActor? _actor;

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        _pending = [];
        _actor = actor.Get();

        if (_actor is not null && eventData.Context is not null)
        {
            foreach (var entry in eventData.Context.ChangeTracker.Entries())
            {
                var pending = Describe(entry);
                if (pending is not null) _pending.Add(pending);
            }
        }

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public override async ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData, int result, CancellationToken cancellationToken = default)
    {
        if (_pending.Count > 0 && _actor is not null && eventData.Context is AppDbContext db)
        {
            var entries = _pending.Select(p => new AuditEntry
            {
                UserId = _actor.Id,
                Username = _actor.Username,
                Action = p.Action,
                EntityType = p.Entry.Metadata.ClrType.Name,
                // New rows only get their id from the database, so read it now.
                EntityId = p.EntityId ?? PrimaryKey(p.Entry),
                Label = p.Label,
                Details = p.Details,
            }).ToList();
            _pending = [];

            // This second save contains only AuditEntry rows, which Describe
            // skips, so it doesn't record itself.
            db.AuditEntries.AddRange(entries);
            await db.SaveChangesAsync(cancellationToken);
        }

        return await base.SavedChangesAsync(eventData, result, cancellationToken);
    }

    public override Task SaveChangesFailedAsync(DbContextErrorEventData eventData, CancellationToken cancellationToken = default)
    {
        _pending = [];
        return base.SaveChangesFailedAsync(eventData, cancellationToken);
    }

    private static Pending? Describe(EntityEntry entry)
    {
        // Owned values (chart points) are recorded through their owner.
        if (entry.Entity is AuditEntry || entry.Metadata.IsOwned())
        {
            return null;
        }

        var label = AuditLabels.For(entry.Entity);

        switch (entry.State)
        {
            case EntityState.Added:
                return new Pending(entry, AuditActions.Create, null, label, null);

            case EntityState.Deleted:
                return new Pending(entry, AuditActions.Delete, PrimaryKey(entry), label, null);

            case EntityState.Modified:
                var fields = entry.Properties
                    .Where(p => p.IsModified && !Equals(p.OriginalValue, p.CurrentValue))
                    .Select(p => p.Metadata.Name)
                    .Where(name => !IgnoredFields.Contains(name))
                    .Select(name => RenamedFields.GetValueOrDefault(name, name))
                    .ToList();

                // A collection stored as JSON (chart points) changes through owned entries.
                fields.AddRange(entry.Collections
                    .Where(c => c.Metadata.TargetEntityType.IsOwned() && c.IsModified)
                    .Select(c => c.Metadata.Name));

                return fields.Count == 0
                    ? null
                    : new Pending(entry, AuditActions.Update, PrimaryKey(entry), label, string.Join(", ", fields.Distinct()));

            default:
                return null;
        }
    }

    private static string? PrimaryKey(EntityEntry entry)
    {
        var key = entry.Metadata.FindPrimaryKey();
        return key is null
            ? null
            : string.Join("-", key.Properties.Select(p => entry.Property(p.Name).CurrentValue));
    }
}

public static class AuditLabels
{
    public static string? For(object entity) => Truncate(entity switch
    {
        BlogPost p => p.Title,
        User u => u.Username,
        ServiceItem s => s.Title,
        FaqItem f => f.Question,
        CountryItem c => c.Name,
        StatChart s => s.Title,
        Client c => c.CompanyName,
        ContactSubmission c => c.Type == "Empresas" ? c.Empresa : $"{c.Nombres} {c.ApellidoPaterno}".Trim(),
        EmployabilityTestSubmission t => $"{t.Nombres} {t.ApellidoPaterno}".Trim(),
        _ => null,
    });

    public static string? Truncate(string? value) =>
        value is { Length: > 200 } ? value[..197] + "..." : value;
}
