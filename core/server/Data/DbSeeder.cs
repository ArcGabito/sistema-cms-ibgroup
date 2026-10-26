using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Server.Auth;
using Server.Blog;
using Server.Models;

namespace Server.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, IConfiguration config)
    {
        var author = await SeedAdminAsync(db, config);
        await SeedBlogPostsAsync(db, author);
        await SeedClientsAsync(db);
    }

    private static async Task SeedClientsAsync(AppDbContext db)
    {
        if (await db.Clients.AnyAsync())
        {
            return;
        }

        db.Clients.AddRange(ClientSeedData.Generate());
        await db.SaveChangesAsync();
    }

    private static async Task<User> SeedAdminAsync(AppDbContext db, IConfiguration config)
    {
        var existing = await db.Users.OrderBy(u => u.Id).FirstOrDefaultAsync();
        if (existing is not null)
        {
            return existing;
        }

        var username = config["Seed:AdminUsername"] ?? "admin";
        var password = config["Seed:AdminPassword"] ?? "Admin123!";
        var fullName = config["Seed:AdminFullName"] ?? "Administrador";

        var admin = new User
        {
            Username = username,
            FullName = fullName,
            Role = Roles.Admin,
        };

        var hasher = new PasswordHasher<User>();
        admin.PasswordHash = hasher.HashPassword(admin, password);

        db.Users.Add(admin);
        await db.SaveChangesAsync();

        return admin;
    }

    private static async Task SeedBlogPostsAsync(AppDbContext db, User author)
    {
        if (await db.Posts.AnyAsync())
        {
            return;
        }

        var now = DateTime.UtcNow;

        (string Title, string Excerpt, string Content, string ImageSeed, int DaysAgo)[] posts =
        [
            (
                "La experiencia abre puertas, pero la relevancia mantiene tu lugar en el mercado",
                "Este artículo explica que aunque la trayectoria profesional es valiosa, no asegura que sigas " +
                "vigente en el mercado laboral: lo que realmente importa es seguir siendo útil y necesario en " +
                "el contexto actual.",
                "Durante años, la experiencia fue el activo más valorado en cualquier proceso de selección " +
                "ejecutiva. Hoy, sin embargo, los años acumulados en un cargo ya no garantizan por sí solos " +
                "una posición en el mercado.\n\n" +
                "Lo que las organizaciones buscan es relevancia: profesionales capaces de conectar su " +
                "trayectoria con los retos actuales del negocio, actualizar sus competencias y demostrar que " +
                "siguen aportando valor real, no solo un historial extenso.\n\n" +
                "Mantenerse vigente implica una actualización constante: nuevas herramientas, nuevas formas de " +
                "liderar equipos y una comprensión clara de hacia dónde se mueve tu industria.",
                "ibout-blog-experiencia-relevancia",
                2
            ),
            (
                "La confianza es la moneda real en la empleabilidad Ejecutiva - Profesional",
                "Aquí se destaca que en niveles altos de liderazgo, no siempre gana el candidato más " +
                "calificado, sino aquel que genera mayor seguridad y credibilidad a la hora de tomar " +
                "decisiones estratégicas.",
                "En procesos de selección para posiciones ejecutivas, la calificación técnica suele ser un " +
                "filtro de entrada, no el factor decisivo. Lo que realmente inclina la balanza es la confianza " +
                "que un candidato transmite frente a un comité de decisión.\n\n" +
                "Esa confianza se construye con comunicación clara, ejemplos concretos de resultados y una " +
                "narrativa coherente sobre el propio recorrido profesional. No se trata de sobreactuar " +
                "seguridad, sino de mostrar dominio real de tu criterio y tus decisiones.\n\n" +
                "Trabajar esta habilidad, tanto como se trabaja el currículum, es hoy una de las inversiones " +
                "más rentables para un profesional en transición.",
                "ibout-blog-confianza-empleabilidad",
                5
            ),
            (
                "Más que rechazo, lo que pesa es la falta de consideración del mercado",
                "El texto analiza cómo muchas veces el problema no es ser evaluado negativamente, sino ni " +
                "siquiera aparecer en las agendas y conversaciones donde se toman las decisiones de " +
                "contratación.",
                "Uno de los mayores desgastes emocionales en una búsqueda de empleo no es el rechazo directo, " +
                "sino el silencio: procesos que nunca avanzan, perfiles que ni siquiera son considerados.\n\n" +
                "Esto ocurre, en buena parte, porque muchos candidatos dependen exclusivamente de postulaciones " +
                "abiertas, sin activar el mercado oculto de oportunidades que se mueve a través de redes de " +
                "contacto y recomendaciones directas.\n\n" +
                "Aparecer en las conversaciones correctas requiere una estrategia deliberada: identificar a los " +
                "tomadores de decisión de tu sector y construir presencia antes de necesitarlo.",
                "ibout-blog-falta-consideracion",
                8
            ),
            (
                "Historia del Outplacement en el Perú",
                "El mercado laboral peruano, en constante evolución, exige cada vez más estrategias de " +
                "transición laboral efectivas y humanizadas. El outplacement, un servicio que facilita la " +
                "reinserción laboral, ha evolucionado significativamente en el país.",
                "El outplacement llegó al Perú como una práctica reservada casi exclusivamente a grandes " +
                "corporaciones multinacionales, enfocada en procesos de reducción de personal a gran escala.\n\n" +
                "Con el paso de los años, el servicio se fue adaptando a la realidad del mercado local: hoy no " +
                "solo acompaña procesos de desvinculación, sino que también apoya a profesionales que buscan " +
                "una transición de carrera voluntaria, en cualquier etapa de su trayectoria.\n\n" +
                "Esta evolución refleja un cambio más profundo en la cultura organizacional peruana: la " +
                "transición laboral dejó de verse como un trámite y pasó a entenderse como una inversión en las " +
                "personas.",
                "ibout-blog-historia-outplacement",
                12
            ),
            (
                "Prepara tu próxima entrevista Ejecutiva - Profesional con estos 8 consejos",
                "Las entrevistas para puestos ejecutivos - profesionales son un desafío distinto. No solo " +
                "evalúan tus habilidades, sino también tu visión estratégica, tu liderazgo y tu capacidad para " +
                "manejar preguntas complejas con seguridad.",
                "A diferencia de una entrevista operativa, un proceso ejecutivo evalúa criterio, visión de " +
                "negocio y forma de liderar, más allá del dominio técnico del cargo.\n\n" +
                "Algunas claves para prepararte: investiga a fondo la empresa y su contexto de negocio, prepara " +
                "casos concretos que demuestren impacto medible, anticipa preguntas sobre decisiones difíciles " +
                "que hayas tomado, y define con claridad qué aportas que otros candidatos no.\n\n" +
                "Practicar tus respuestas en voz alta, con retroalimentación externa, marca una diferencia real " +
                "frente a prepararlas solo mentalmente.",
                "ibout-blog-consejos-entrevista",
                16
            ),
            (
                "Cómo Buscar Trabajo Gerencial: Claves para Conseguir tu Próximo Gran Reto Profesional",
                "El trabajo gerencial es un desafío que requiere una estrategia clara y bien ejecutada. No " +
                "basta con tener experiencia, también necesitas una marca personal sólida y una red de " +
                "contactos activa.",
                "Buscar una posición gerencial exige un enfoque distinto al de otras etapas de carrera: el " +
                "volumen de vacantes visibles es menor y la competencia suele ser más especializada.\n\n" +
                "Una estrategia efectiva combina tres frentes: una marca personal coherente en tu perfil " +
                "profesional, una red de contactos activada de forma constante, y una búsqueda dirigida hacia " +
                "empresas y sectores específicos, no genérica.\n\n" +
                "La constancia es determinante: un proceso gerencial suele tomar más tiempo, y sostener el " +
                "esfuerzo con una estrategia clara marca la diferencia entre una búsqueda larga y una " +
                "efectiva.",
                "ibout-blog-trabajo-gerencial",
                20
            ),
            (
                "3 Cosas que los Gerentes Deben Hacer Ahora para Aumentar el Compromiso y Vencer a la Gran " +
                "Renuncia",
                "\"Las empresas con malos gerentes ya no pueden existir\". Los expertos de Great Place to " +
                "Work comparten los movimientos clave que deben realizar los líderes para retener talento.",
                "La llamada \"gran renuncia\" puso en evidencia algo que ya se sabía: las personas no dejan " +
                "empresas, dejan gerentes. Retener talento hoy exige un rol más activo de parte de los " +
                "líderes.\n\n" +
                "Tres movimientos clave: generar conversaciones honestas y frecuentes sobre expectativas y " +
                "desarrollo, reconocer el aporte individual más allá de los resultados numéricos, y dar " +
                "flexibilidad real en la forma de trabajar.\n\n" +
                "Ninguno de estos tres requiere grandes presupuestos, pero sí un cambio genuino en la forma en " +
                "que los gerentes ejercen su liderazgo día a día.",
                "ibout-blog-gran-renuncia",
                24
            ),
            (
                "Errores Comunes de Directivos al Buscar Empleo y Cómo Evitarlos",
                "La búsqueda de empleo como directivo implica superar desafíos únicos. Muchos líderes suelen " +
                "caer en errores recurrentes que pueden retrasar su reubicación profesional.",
                "Buscar empleo desde una posición directiva tiene particularidades que pocas veces se " +
                "abordan: menos vacantes visibles, procesos más largos y una exposición pública que exige " +
                "mayor cuidado.\n\n" +
                "Entre los errores más frecuentes: depender solo de portales de empleo sin activar la red de " +
                "contactos, mantener un perfil profesional desactualizado, y esperar procesos con la misma " +
                "velocidad que en etapas anteriores de la carrera.\n\n" +
                "Evitarlos requiere una estrategia distinta: activar el mercado oculto, cuidar la marca " +
                "personal de forma constante y ajustar las expectativas de tiempo a la realidad de una " +
                "búsqueda directiva.",
                "ibout-blog-errores-directivos",
                28
            ),
        ];

        foreach (var post in posts)
        {
            db.Posts.Add(new BlogPost
            {
                Title = post.Title,
                Slug = SlugGenerator.Generate(post.Title),
                Excerpt = post.Excerpt,
                Content = post.Content,
                ImageUrl = $"https://picsum.photos/seed/{post.ImageSeed}/900/600",
                Published = true,
                AuthorId = author.Id,
                CreatedAt = now.AddDays(-post.DaysAgo),
                UpdatedAt = now.AddDays(-post.DaysAgo),
            });
        }

        await db.SaveChangesAsync();
    }
}
