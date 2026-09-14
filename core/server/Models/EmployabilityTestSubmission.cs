namespace server.Models;

public class EmployabilityTestSubmission
{
    public int Id { get; set; }

    // Datos personales
    public string Nombres { get; set; } = string.Empty;
    public string ApellidoPaterno { get; set; } = string.Empty;
    public string ApellidoMaterno { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string TieneLinkedin { get; set; } = string.Empty;
    public string Pais { get; set; } = string.Empty;
    public string Departamento { get; set; } = string.Empty;
    public int Edad { get; set; }
    public string NivelProfesional { get; set; } = string.Empty;
    public string Industria { get; set; } = string.Empty;
    public string ActualmenteTrabajando { get; set; } = string.Empty;
    public string UltimoSalario { get; set; } = string.Empty;

    // Respuestas del test (A1-G32), como JSON: {"q1":"3","q2":"5",...}
    public string RespuestasJson { get; set; } = "{}";
    public int PuntajeTotal { get; set; }
    public double PuntajePromedio { get; set; }

    // Autorización y orientación
    public string AutorizaDatos { get; set; } = string.Empty;
    public string DeseaOrientacion { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
