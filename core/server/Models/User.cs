namespace Server.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = "Admin";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Deactivated users can't log in, and their existing tokens stop working.
    public bool IsActive { get; set; } = true;

    // Set for the seeded admin and after an admin resets a password: the
    // panel blocks everything else until the user picks their own password.
    public bool MustChangePassword { get; set; }

    // Copied into every JWT. Rotating it (password change, deactivation,
    // role change) invalidates every token issued before.
    public string SecurityStamp { get; set; } = Guid.NewGuid().ToString("N");

    // Persisted lockout, so it survives restarts and is shared by every instance.
    public int FailedLoginCount { get; set; }
    public DateTime? LockoutEnd { get; set; }
}
