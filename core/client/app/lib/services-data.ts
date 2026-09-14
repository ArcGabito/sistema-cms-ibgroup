import { Accessibility, IdCard, User, UserCheck, Users, type LucideIcon } from "lucide-react";

export interface ServiceItem {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  cta: string;
  image: string;
}

export const SERVICES: ServiceItem[] = [
  {
    icon: User,
    title: "Programa de Outplacement para Personas en Perú",
    description:
      "Acompañamos a profesionales y ejecutivos en su transición laboral con un programa personalizado de recolocación que combina coaching, entrenamiento y acceso a nuestra red de contactos.",
    features: [
      "Diagnóstico de perfil profesional",
      "Actualización de CV y LinkedIn",
      "Estrategia de búsqueda activa y pasiva",
      "Seguimiento personalizado hasta la recolocación",
    ],
    cta: "Más información",
    image: "/assets/service-1.jpg",
  },
  {
    icon: IdCard,
    title: "Consultoría de carrera profesional para Ejecutivos - Profesionales",
    description:
      "Sesiones de consultoría especializada para definir tu siguiente paso profesional, ya sea dentro de tu organización actual o en una nueva oportunidad laboral.",
    features: [
      "Evaluación de competencias y objetivos de carrera",
      "Plan de desarrollo profesional a medida",
      "Asesoría en decisiones de carrera",
      "Preparación para procesos de promoción interna",
    ],
    cta: "Más información",
    image: "/assets/service-2.jpg",
  },
  {
    icon: UserCheck,
    title: "Coaching en habilidades blandas para empleabilidad",
    description:
      "Fortalecemos las habilidades blandas que marcan la diferencia en procesos de selección: comunicación, liderazgo, inteligencia emocional y manejo de entrevistas.",
    features: [
      "Simulacros de entrevistas laborales",
      "Comunicación efectiva y presencia ejecutiva",
      "Manejo de la incertidumbre y resiliencia",
      "Negociación salarial",
    ],
    cta: "Más información",
    image: "/assets/service-3.jpg",
  },
  {
    icon: Accessibility,
    title: "Servicios integrales de transición laboral",
    description:
      "Un acompañamiento integral que cubre todas las etapas del proceso de transición, desde el diagnóstico inicial hasta la reinserción exitosa en el mercado laboral.",
    features: [
      "Diagnóstico integral de empleabilidad",
      "Estrategia de marca personal",
      "Activación del mercado laboral oculto",
      "Acompañamiento continuo con tu consultor",
    ],
    cta: "Más información",
    image: "/assets/service-4.jpg",
  },
  {
    icon: Users,
    title: "Nuestros Talleres de Desarrollo para ti",
    description:
      "Talleres grupales enfocados en el desarrollo de competencias clave para la empleabilidad, ideales para complementar tu proceso individual de outplacement.",
    features: [
      "Talleres de LinkedIn y marca personal",
      "Talleres de entrevistas y negociación",
      "Talleres de habilidades blandas",
      "Sesiones grupales de networking",
    ],
    cta: "Conócelos aquí",
    image: "/assets/service-5.jpg",
  },
];
