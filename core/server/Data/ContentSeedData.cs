using Server.Models;

namespace Server.Data;

// The site's original content, loaded once into empty tables. After that the
// dashboard owns it; editing this file doesn't change an existing database.
public static class ContentSeedData
{
    public static List<ServiceItem> Services() =>
    [
        new()
        {
            Icon = "user",
            Title = "Programa de Outplacement para Personas en Perú",
            Description = "Acompañamos a profesionales y ejecutivos en su transición laboral con un programa personalizado de recolocación que combina coaching, entrenamiento y acceso a nuestra red de contactos.",
            Features =
            [
                "Diagnóstico de perfil profesional",
                "Actualización de CV y LinkedIn",
                "Estrategia de búsqueda activa y pasiva",
                "Seguimiento personalizado hasta la recolocación",
            ],
            CtaLabel = "Más información",
            ImageUrl = "/assets/service-1.jpg",
        },
        new()
        {
            Icon = "id-card",
            Title = "Consultoría de carrera profesional para Ejecutivos - Profesionales",
            Description = "Sesiones de consultoría especializada para definir tu siguiente paso profesional, ya sea dentro de tu organización actual o en una nueva oportunidad laboral.",
            Features =
            [
                "Evaluación de competencias y objetivos de carrera",
                "Plan de desarrollo profesional a medida",
                "Asesoría en decisiones de carrera",
                "Preparación para procesos de promoción interna",
            ],
            CtaLabel = "Más información",
            ImageUrl = "/assets/service-2.jpg",
        },
        new()
        {
            Icon = "user-check",
            Title = "Coaching en habilidades blandas para empleabilidad",
            Description = "Fortalecemos las habilidades blandas que marcan la diferencia en procesos de selección: comunicación, liderazgo, inteligencia emocional y manejo de entrevistas.",
            Features =
            [
                "Simulacros de entrevistas laborales",
                "Comunicación efectiva y presencia ejecutiva",
                "Manejo de la incertidumbre y resiliencia",
                "Negociación salarial",
            ],
            CtaLabel = "Más información",
            ImageUrl = "/assets/service-3.jpg",
        },
        new()
        {
            Icon = "accessibility",
            Title = "Servicios integrales de transición laboral",
            Description = "Un acompañamiento integral que cubre todas las etapas del proceso de transición, desde el diagnóstico inicial hasta la reinserción exitosa en el mercado laboral.",
            Features =
            [
                "Diagnóstico integral de empleabilidad",
                "Estrategia de marca personal",
                "Activación del mercado laboral oculto",
                "Acompañamiento continuo con tu consultor",
            ],
            CtaLabel = "Más información",
            ImageUrl = "/assets/service-4.jpg",
        },
        new()
        {
            Icon = "users",
            Title = "Nuestros Talleres de Desarrollo para ti",
            Description = "Talleres grupales enfocados en el desarrollo de competencias clave para la empleabilidad, ideales para complementar tu proceso individual de outplacement.",
            Features =
            [
                "Talleres de LinkedIn y marca personal",
                "Talleres de entrevistas y negociación",
                "Talleres de habilidades blandas",
                "Sesiones grupales de networking",
            ],
            CtaLabel = "Conócelos aquí",
            ImageUrl = "/assets/service-5.jpg",
        },
    ];

    public static List<FaqItem> Faqs() =>
    [
        Faq("¿Qué es IBOutplacement?",
            "IBOutplacement es el programa de recolocación laboral de IBGROUP, diseñado para acompañar a ejecutivos y profesionales en su transición de carrera mediante coaching de empleabilidad, entrenamiento en entrevistas y acceso al mercado laboral oculto."),
        Faq("¿Si estoy laborando en qué me ayudan ustedes?",
            "Si aún te encuentras trabajando, te ayudamos a preparar tu transición de forma confidencial: actualización de tu marca personal, estrategia de búsqueda activa y pasiva, y entrenamiento para negociar tu próxima posición sin exponer tu proceso ante tu empleador actual."),
        Faq("¿En qué se diferencia el programa de ustedes?",
            "Combinamos coaching personalizado uno a uno con metodologías probadas en Perú, Chile y Bolivia, un equipo de consultores con experiencia real en selección y headhunting, y acompañamiento activo hasta que consigues una nueva posición, no solo talleres genéricos."),
        Faq("¿Es un curso?",
            "No. A diferencia de un curso, el outplacement es un proceso de acompañamiento personalizado con sesiones de coaching individuales, donde el consultor trabaja contigo tu caso específico y tu estrategia de recolocación."),
        Faq("¿Tiempo de duración?",
            "La duración varía según el nivel del cargo y el plan contratado, generalmente entre 3 y 6 meses, con sesiones periódicas de seguimiento hasta lograr tu reinserción laboral."),
        Faq("¿Qué aspectos se abordan en el entrenamiento?",
            "Trabajamos tu marca personal y perfil en LinkedIn, hoja de vida y carta de presentación, estrategia de búsqueda en el mercado visible y oculto, simulacros de entrevista, negociación salarial y fortalecimiento de habilidades blandas."),
        Faq("¿En cuántos meses me recoloco?",
            "El tiempo de recolocación depende de tu perfil, sector y mercado objetivo; en promedio nuestros participantes avanzan con procesos concretos dentro de los primeros meses del programa, aunque no es un plazo garantizado."),
        Faq("¿Es muy costoso, cuentan con formas de pago o cuotas?",
            "Contamos con distintos planes según el nivel del cargo y ofrecemos facilidades de pago en cuotas para que el programa sea accesible. Escríbenos para recibir una propuesta personalizada."),
        Faq("¿Debo entender que IBOutplacement me conseguirá trabajo?",
            "No. Nuestro rol es entrenarte, acompañarte y potenciar tu estrategia de búsqueda para que tú mismo consigas tu próxima posición; no se trata de una bolsa de empleo ni de una colocación garantizada."),
        Faq("¿A partir de qué tiempo inicia mi búsqueda de empleo?",
            "La búsqueda activa inicia una vez que tu perfil, marca personal y estrategia están listos, usualmente desde las primeras semanas del programa, en paralelo a las sesiones de coaching."),
        Faq("¿El coach me puede acompañar a las entrevistas?",
            "El coach te prepara y entrena antes de cada entrevista mediante simulacros y retroalimentación detallada, aunque no asiste físicamente contigo a la entrevista."),
        Faq("¿Qué tipo de perfiles, cargos o posiciones tienen las personas que contratan sus servicios de entrenamiento?",
            "Trabajamos con jefaturas, gerencias, direcciones y posiciones ejecutivas de distintos sectores e industrias en Perú, Chile y Bolivia."),
        Faq("¿Qué me garantizan?",
            "Garantizamos un acompañamiento profesional, metodológico y personalizado durante todo el proceso, así como acceso a herramientas y a nuestra red de contactos; no garantizamos la colocación laboral, ya que esta depende también de tu gestión y del mercado."),
        Faq("¿El servicio de outplacement me recoloca en una empresa?",
            "El outplacement no es una agencia de colocación: te entrena y acompaña para que tú mismo gestiones tu búsqueda y te postules con una estrategia sólida a las oportunidades del mercado."),
        Faq("¿Trabajaré mi red de contactos o ustedes me recomendarán a su red de contactos?",
            "Ambas cosas: te ayudamos a fortalecer y activar tu propia red de contactos (networking), y en paralelo compartimos tu perfil dentro de nuestra red de empresas y aliados cuando existe un match con sus búsquedas."),
    ];

    public static List<CountryItem> Countries() =>
    [
        Country("Perú", "pe", "Sede central y equipo de consultores en Lima, con cobertura a nivel nacional."),
        Country("Chile", "cl", "Consultores locales especializados en el mercado laboral ejecutivo chileno."),
        Country("Bolivia", "bo", "Acompañamiento a profesionales y empresas en procesos de transición laboral."),
        Country("Argentina", "ar", "Red de coaches certificados con conocimiento del mercado laboral argentino."),
        Country("EE.UU.", "us", "Soporte a ejecutivos latinoamericanos en procesos de recolocación internacional."),
        Country("México", "mx", "Programas de outplacement adaptados a empresas y profesionales mexicanos."),
        Country("Colombia", "co", "Consultoría de carrera y coaching de empleabilidad para el mercado colombiano."),
        Country("Uruguay", "uy", "Acompañamiento personalizado para procesos de transición de carrera."),
        Country("España", "es", "Puente para profesionales en procesos de movilidad e inserción laboral internacional."),
    ];

    public static List<StatChart> Stats() =>
    [
        Stat("Meses promedio de recolocación",
            "Tiempo promedio, en meses, que toma a nuestros candidatos conseguir una nueva posición.",
            StatKinds.Months,
            [3.9, 4.4, 4.7, 3.4, 3.6, 3.9, 3.7, 3.2]),
        Stat("Recolocados por red de contactos",
            "Porcentaje de candidatos que logró su nueva posición activando su red de contactos.",
            StatKinds.Percent,
            [68, 76, 74, 81, 86, 88, 87, 82]),
        Stat("Mejoró o igualó sueldo anterior",
            "Porcentaje de candidatos que se recolocó con una compensación igual o superior a la anterior.",
            StatKinds.Percent,
            [69, 73, 62, 72, 76, 61, 77, 81]),
        Stat("Mejoró o igualó puesto anterior",
            "Porcentaje de candidatos que se recolocó en un nivel de puesto igual o superior al anterior.",
            StatKinds.Percent,
            [57, 73, 64, 79, 75, 62, 74, 83]),
        new()
        {
            Title = "Clientes que contratan nuestro servicio: trabajan o no trabajan",
            Description = "Distribución de candidatos que iniciaron su proceso de outplacement estando o no empleados.",
            Kind = StatKinds.Split,
            SeriesLabel = "Trabajan",
            SecondSeriesLabel = "No trabajan",
            Points = Years
                .Zip([75, 73, 76, 72, 76, 57, 77, 63], (year, value) => new StatPoint
                {
                    Year = year,
                    Value = value,
                    SecondValue = 100 - value,
                })
                .ToList(),
        },
    ];

    private static readonly string[] Years = ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"];

    private static FaqItem Faq(string question, string answer) => new() { Question = question, Answer = answer };

    private static CountryItem Country(string name, string code, string description) =>
        new() { Name = name, Code = code, Description = description };

    private static StatChart Stat(string title, string description, string kind, double[] values) => new()
    {
        Title = title,
        Description = description,
        Kind = kind,
        Points = Years.Zip(values, (year, value) => new StatPoint { Year = year, Value = value }).ToList(),
    };
}
