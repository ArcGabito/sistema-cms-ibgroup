using Microsoft.Extensions.Caching.Memory;

namespace Server.Auth;

// Locks an account after repeated failed logins, independently of the
// caller's IP. State lives in memory, so it resets on restart and is per
// instance — enough for the single-instance deployment this API runs as.
public class LoginAttemptTracker(IMemoryCache cache)
{
    public const int MaxFailedAttempts = 5;
    public static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);

    private sealed class Attempts
    {
        public int Failed;
        public DateTimeOffset? LockedUntil;
    }

    public bool IsLockedOut(string username) =>
        cache.TryGetValue(Key(username), out Attempts? attempts) &&
        attempts!.LockedUntil > DateTimeOffset.UtcNow;

    public void RegisterFailure(string username)
    {
        var attempts = cache.GetOrCreate(Key(username), entry =>
        {
            entry.SlidingExpiration = LockoutDuration;
            return new Attempts();
        })!;

        lock (attempts)
        {
            attempts.Failed++;
            if (attempts.Failed >= MaxFailedAttempts)
            {
                attempts.LockedUntil = DateTimeOffset.UtcNow.Add(LockoutDuration);
                attempts.Failed = 0;
            }
        }
    }

    public void Reset(string username) => cache.Remove(Key(username));

    private static string Key(string username) => $"login-attempts:{username.Trim().ToLowerInvariant()}";
}
