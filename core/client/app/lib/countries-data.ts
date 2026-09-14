export interface CountryPresence {
  name: string;
  code: string;
  description: string;
}

export const COUNTRIES: CountryPresence[] = [
  {
    name: "Perú",
    code: "pe",
    description: "Sede central y equipo de consultores en Lima, con cobertura a nivel nacional.",
  },
  {
    name: "Chile",
    code: "cl",
    description: "Consultores locales especializados en el mercado laboral ejecutivo chileno.",
  },
  {
    name: "Bolivia",
    code: "bo",
    description: "Acompañamiento a profesionales y empresas en procesos de transición laboral.",
  },
  {
    name: "Argentina",
    code: "ar",
    description: "Red de coaches certificados con conocimiento del mercado laboral argentino.",
  },
  {
    name: "EE.UU.",
    code: "us",
    description: "Soporte a ejecutivos latinoamericanos en procesos de recolocación internacional.",
  },
  {
    name: "México",
    code: "mx",
    description: "Programas de outplacement adaptados a empresas y profesionales mexicanos.",
  },
  {
    name: "Colombia",
    code: "co",
    description: "Consultoría de carrera y coaching de empleabilidad para el mercado colombiano.",
  },
  {
    name: "Uruguay",
    code: "uy",
    description: "Acompañamiento personalizado para procesos de transición de carrera.",
  },
  {
    name: "España",
    code: "es",
    description: "Puente para profesionales en procesos de movilidad e inserción laboral internacional.",
  },
];
