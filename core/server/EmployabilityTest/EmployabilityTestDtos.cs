namespace Server.EmployabilityTest;

public record EmployabilityTestRequest(
    string Nombres,
    string ApellidoPaterno,
    string ApellidoMaterno,
    string Email,
    string Telefono,
    string TieneLinkedin,
    string Pais,
    string Departamento,
    int Edad,
    string NivelProfesional,
    string Industria,
    string ActualmenteTrabajando,
    string UltimoSalario,
    Dictionary<string, string> Respuestas,
    string AutorizaDatos,
    string DeseaOrientacion);

public record EmployabilityTestResponse(int Id, DateTime CreatedAt);

public record EmployabilityTestSummary(
    int Id,
    string Nombres,
    string ApellidoPaterno,
    string ApellidoMaterno,
    string Email,
    string Telefono,
    string TieneLinkedin,
    string Pais,
    string Departamento,
    int Edad,
    string NivelProfesional,
    string Industria,
    string ActualmenteTrabajando,
    string UltimoSalario,
    Dictionary<string, string> Respuestas,
    int PuntajeTotal,
    double PuntajePromedio,
    string AutorizaDatos,
    string DeseaOrientacion,
    DateTime CreatedAt);
