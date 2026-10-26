namespace Server.Models;

public class ContactSubmission
{
    public int Id { get; set; }

    // "Personas" | "Empresas"
    public string Type { get; set; } = string.Empty;

    // Common
    public string Email { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string? Cargo { get; set; }
    public string? Servicio { get; set; }
    public string Mensaje { get; set; } = string.Empty;

    // Personas
    public string? Nombres { get; set; }
    public string? ApellidoPaterno { get; set; }
    public string? ApellidoMaterno { get; set; }
    public string? Linkedin { get; set; }
    public string? Trabajando { get; set; }
    public string? Sector { get; set; }
    public string? RangoSalarial { get; set; }
    public string? Pais { get; set; }
    public string? Region { get; set; }

    // Empresas
    public string? Empresa { get; set; }
    public string? Contacto { get; set; }
    public string? Colaboradores { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
