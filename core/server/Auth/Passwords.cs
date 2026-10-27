using Microsoft.AspNetCore.Identity;
using Server.Models;

namespace Server.Auth;

public static class Passwords
{
    public const int MinLength = 8;

    public static readonly PasswordHasher<User> Hasher = new();

    public static string? Validate(string? password) =>
        string.IsNullOrEmpty(password) || password.Length < MinLength
            ? $"La contraseña debe tener al menos {MinLength} caracteres."
            : null;

    // Hashes the new password and rotates the security stamp, which signs out
    // every session that was using the old one.
    public static void Set(User user, string password, bool mustChange)
    {
        user.PasswordHash = Hasher.HashPassword(user, password);
        user.MustChangePassword = mustChange;
        user.FailedLoginCount = 0;
        user.LockoutEnd = null;
        RotateSecurityStamp(user);
    }

    public static void RotateSecurityStamp(User user) => user.SecurityStamp = Guid.NewGuid().ToString("N");
}
