namespace Server.Ai;

public class AiOptions
{
    public const string SectionName = "Ai";

    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "claude-haiku-4-5-20251001";
}
