using System.Globalization;
using System.Text;
using Server.Models;

namespace Server.Data;

// Generates fictional clients for development. A fixed seed keeps the output
// identical across runs, and every website/email uses the reserved ".example"
// TLD so no generated contact can point at a real company.
public static class ClientSeedData
{
    public const int DefaultCount = 500;

    private const int RandomSeed = 20260729;

    private static readonly string[] NamePrefixes =
    [
        "Andina", "Pacífico", "Inca", "Sol", "Cóndor", "Amazonía", "Costa", "Cordillera",
        "Horizonte", "Nova", "Altiplano", "Valle", "Puma", "Quinua", "Vicuña", "Titicaca",
        "Mistral", "Aurora", "Delta", "Orión",
    ];

    private static readonly string[] NameSuffixes =
    [
        "Global", "Group", "Corp", "Solutions", "Partners", "Tech", "Industrial", "Logistics",
        "Consulting", "Services", "Trading", "Holdings",
    ];

    private static readonly string[] LegalForms = ["S.A.", "S.A.C.", "S.R.L.", "E.I.R.L.", "S.A.A."];

    private static readonly string[] Industries =
    [
        "Agroindustria", "Alimentos", "Automotriz", "Banca y Finanzas", "Construcción", "Consultoría",
        "Educación", "Energía", "Logística", "Manufactura", "Minería", "Publicidad", "Retail", "Salud",
        "Seguros", "Tecnología", "Telecomunicaciones", "Textil", "Turismo", "Sector Público",
    ];

    private static readonly string[] FirstNames =
    [
        "María", "José", "Lucía", "Carlos", "Ana", "Luis", "Rosa", "Jorge", "Carmen", "Miguel",
        "Patricia", "Diego", "Sofía", "Andrés", "Valeria", "Ricardo", "Daniela", "Fernando",
        "Gabriela", "Javier", "Claudia", "Raúl", "Elena", "Martín",
    ];

    private static readonly string[] LastNames =
    [
        "Quispe", "Flores", "Rojas", "Torres", "Mendoza", "Vargas", "Castillo", "Ramírez",
        "Huamán", "Chávez", "Díaz", "Salazar", "Paredes", "Gutiérrez", "Romero", "Espinoza",
        "Silva", "Cárdenas", "Ríos", "Herrera",
    ];

    private static readonly string[] JobTitles =
    [
        "Gerente General", "Gerente de Recursos Humanos", "Jefe de Compras", "Jefe de Talento",
        "Analista de RR.HH.", "Director Comercial", "Coordinador de Administración",
        "Gerente de Operaciones", "Asistente de Gerencia",
    ];

    private static readonly string[] StreetTypes = ["Av.", "Jr.", "Calle", "Psje."];

    private static readonly string[] StreetNames =
    [
        "Los Olivos", "Las Magnolias", "Los Laureles", "San Martín", "Grau", "Bolognesi",
        "Los Cedros", "Las Begonias", "Primavera", "El Sol", "La Paz", "Los Pinos",
    ];

    private static readonly (string Province, string[] Districts)[] Locations =
    [
        ("Lima", ["Miraflores", "San Isidro", "Surco", "La Molina", "San Borja", "Ate", "Los Olivos", "Lince"]),
        ("Callao", ["Bellavista", "La Perla", "Ventanilla"]),
        ("Arequipa", ["Cayma", "Yanahuara", "Cerro Colorado"]),
        ("Trujillo", ["Víctor Larco Herrera", "La Esperanza"]),
        ("Piura", ["Castilla", "Veintiséis de Octubre"]),
        ("Chiclayo", ["José Leonardo Ortiz", "La Victoria"]),
        ("Cusco", ["Wanchaq", "San Sebastián"]),
    ];

    public static IReadOnlyList<Client> Generate(int count = DefaultCount)
    {
        var random = new Random(RandomSeed);
        var baseDate = new DateTime(2026, 07, 29, 14, 0, 0, DateTimeKind.Utc);
        var usedNames = new HashSet<string>();
        var clients = new List<Client>(count);

        for (var i = 0; i < count; i++)
        {
            var companyName = UniqueCompanyName(random, usedNames, i);
            var slug = Slugify(companyName);
            var (province, districts) = Pick(random, Locations);
            var hasContact = random.NextDouble() < 0.7;

            clients.Add(new Client
            {
                CompanyName = companyName,
                LegalName = $"{companyName} {Pick(random, LegalForms)}".ToUpperInvariant(),
                Industry = Maybe(random, 0.9, () => Pick(random, Industries)),
                FirstName = hasContact ? Pick(random, FirstNames) : null,
                LastName = hasContact ? $"{Pick(random, LastNames)} {Pick(random, LastNames)}" : null,
                JobTitle = hasContact ? Maybe(random, 0.8, () => Pick(random, JobTitles)) : null,
                TaxId = $"20{random.NextInt64(100_000_000, 1_000_000_000)}",
                PhoneNumber = Maybe(random, 0.6, () => $"+51 9{random.Next(10_000_000, 100_000_000)}"),
                Email = hasContact ? Maybe(random, 0.7, () => $"contacto@{slug}.example") : null,
                Website = Maybe(random, 0.8, () => $"https://www.{slug}.example"),
                Address = $"{Pick(random, StreetTypes)} {Pick(random, StreetNames)} {random.Next(100, 2000)}",
                District = Maybe(random, 0.85, () => Pick(random, districts)),
                Province = province,
                CreatedAt = baseDate.AddSeconds(i),
            });
        }

        return clients;
    }

    private static string UniqueCompanyName(Random random, HashSet<string> usedNames, int index)
    {
        var name = $"{Pick(random, NamePrefixes)} {Pick(random, NameSuffixes)}";

        // The prefix/suffix combinations run out quickly, so later clients get a number.
        if (!usedNames.Add(name))
        {
            name = $"{name} {index + 1}";
            usedNames.Add(name);
        }

        return name;
    }

    private static T Pick<T>(Random random, T[] items) => items[random.Next(items.Length)];

    private static string? Maybe(Random random, double probability, Func<string> value) =>
        random.NextDouble() < probability ? value() : null;

    private static string Slugify(string value)
    {
        var builder = new StringBuilder();

        foreach (var c in value.Normalize(NormalizationForm.FormD))
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) == UnicodeCategory.NonSpacingMark)
            {
                continue;
            }

            if (char.IsLetterOrDigit(c))
            {
                builder.Append(char.ToLowerInvariant(c));
            }
        }

        return builder.ToString();
    }
}
