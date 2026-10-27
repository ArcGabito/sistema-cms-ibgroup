namespace Server.Models;

// Who did what in the dashboard. Rows are only ever added.
public class AuditEntry
{
    public long Id { get; set; }
    public DateTime At { get; set; } = DateTime.UtcNow;

    // Copied rather than referenced, so the history survives the user's deletion.
    public int? UserId { get; set; }
    public string Username { get; set; } = string.Empty;

    // One of AuditActions.
    public string Action { get; set; } = string.Empty;

    // CLR entity name (e.g. "BlogPost"); the dashboard maps it to a label.
    public string EntityType { get; set; } = string.Empty;
    public string? EntityId { get; set; }

    // A readable name for the record at the time (post title, username...).
    public string? Label { get; set; }

    // For updates, the names of the changed fields. Values are never stored.
    public string? Details { get; set; }
}
