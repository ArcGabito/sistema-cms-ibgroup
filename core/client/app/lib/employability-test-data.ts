export const NIVEL_PROFESIONAL_OPTIONS = [
  "Analista",
  "Jefe",
  "Supervisor",
  "Gerente",
  "Director",
  "Vicepresidente / C-Level",
  "Otro",
];

export interface TestBlock {
  id: string;
  label: string;
  questions: { key: string; text: string }[];
}

export const TEST_BLOCKS: TestBlock[] = [
  {
    id: "A",
    label: "Bloque A: Estrategia y claridad profesional",
    questions: [
      { key: "q1", text: "Tengo definida mi estrategia de búsqueda de empleo para los próximos 6 meses." },
      { key: "q2", text: "Mi propuesta de valor profesional (lo que ofrezco) es clara y diferenciadora." },
      { key: "q3", text: "Tengo objetivos profesionales a corto, mediano y largo plazo bien establecidos." },
      { key: "q4", text: "Mi perfil profesional en redes sociales (ej. LinkedIn) está optimizado y actualizado." },
      { key: "q5", text: "Comprendo perfectamente los requerimientos del puesto que deseo obtener." },
    ],
  },
  {
    id: "B",
    label: "Bloque B: Entrevistas y lenguaje no verbal",
    questions: [
      { key: "q6", text: "Me siento seguro al responder preguntas complejas durante una entrevista." },
      { key: "q7", text: "Sé cómo proyectarme profesionalmente en cada interacción." },
      { key: "q8", text: "Mi lenguaje corporal (postura, contacto visual) es adecuado y positivo en entrevistas." },
      { key: "q9", text: "Puedo responder preguntas conductuales de forma clara y concisa." },
      { key: "q10", text: "Soy capaz de negociar mi salario y beneficios con confianza." },
    ],
  },
  {
    id: "C",
    label: "Bloque C: Fortalezas, debilidades y autoconocimiento",
    questions: [
      { key: "q11", text: "Conozco mis 3 principales fortalezas y sé cómo aplicarlas en un entorno laboral." },
      { key: "q12", text: "Identifico mis áreas de mejora (debilidades) y tengo un plan para trabajarlas." },
      { key: "q13", text: "Mi nivel de autoconocimiento me permite tomar decisiones profesionales acertadas." },
      { key: "q14", text: "Tengo claro el tipo de cultura organizacional donde mejor me desempeño." },
    ],
  },
  {
    id: "D",
    label: "Bloque D: Networking y habilidades comerciales",
    questions: [
      { key: "q15", text: "Mi red de contactos profesionales es activa y me genera oportunidades laborales." },
      { key: "q16", text: "Me siento cómodo al iniciar conversaciones de networking con desconocidos." },
      { key: "q17", text: "Sé cómo hacer un seguimiento efectivo después de un evento de networking o entrevista." },
      {
        key: "q18",
        text: "Domino la habilidad de iniciar y mantener una conversación productiva con desconocidos para expandir mi red de contactos.",
      },
      { key: "q19", text: "Tengo habilidades sólidas para la negociación y persuasión." },
      { key: "q20", text: "Utilizo bases de datos o CRM para gestionar mis contactos profesionales." },
    ],
  },
  {
    id: "E",
    label: "Bloque E: Manejo emocional y presión",
    questions: [
      { key: "q21", text: "Manejo el estrés y la presión laboral de manera efectiva sin afectar mi rendimiento." },
      { key: "q22", text: "Mantengo una actitud positiva y resiliente ante los rechazos o las dificultades." },
      { key: "q23", text: "Mi inteligencia emocional me permite relacionarme bien con diferentes tipos de personas." },
      { key: "q24", text: "Puedo adaptarme rápidamente a los cambios en entornos de trabajo ambiguos." },
    ],
  },
  {
    id: "F",
    label: "Bloque F: Actualización y habilidades digitales",
    questions: [
      { key: "q25", text: "Me mantengo constantemente actualizado sobre las tendencias de mi industria." },
      { key: "q26", text: "Manejo las herramientas digitales (software, apps) esenciales para mi área de trabajo." },
      { key: "q27", text: "Tengo conocimientos básicos o intermedios en el uso de la Inteligencia Artificial (IA)." },
      { key: "q28", text: "Invierto tiempo y recursos en mi formación continua (cursos, certificaciones)." },
    ],
  },
  {
    id: "G",
    label: "Bloque G: Riesgo laboral y competitividad",
    questions: [
      { key: "q29", text: "Tengo un plan de contingencia si mi situación laboral actual cambiara." },
      { key: "q30", text: "Soy consciente de mi valor en el mercado laboral y mi nivel de competitividad." },
      { key: "q31", text: "Conozco a fondo a mi competencia profesional (otras personas que aspiran a mi puesto)." },
      { key: "q32", text: "Estoy dispuesto a tomar riesgos calculados para impulsar mi carrera profesional." },
    ],
  },
];

export const TEST_QUESTION_KEYS = TEST_BLOCKS.flatMap((block) => block.questions.map((q) => q.key));
