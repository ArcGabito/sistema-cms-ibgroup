namespace Server.Auth;

public static class Policies
{
    // Admins only: users, plus the contact and employability-test submissions
    // (they hold visitors' personal data).
    public const string AdminOnly = "AdminOnly";

    // Any panel role: blog content, AI drafts and the aggregated analytics.
    public const string ContentEditor = "ContentEditor";
}
