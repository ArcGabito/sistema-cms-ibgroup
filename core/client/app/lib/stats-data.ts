export interface YearValue {
  year: string;
  value: number;
}

export interface YearGroupValue {
  year: string;
  trabajan: number;
  noTrabajan: number;
}

export const RECOLOCACION_MESES: YearValue[] = [
  { year: "2018", value: 3.9 },
  { year: "2019", value: 4.4 },
  { year: "2020", value: 4.7 },
  { year: "2021", value: 3.4 },
  { year: "2022", value: 3.6 },
  { year: "2023", value: 3.9 },
  { year: "2024", value: 3.7 },
  { year: "2025", value: 3.2 },
];

export const RECOLOCADOS_RED_CONTACTOS: YearValue[] = [
  { year: "2018", value: 68 },
  { year: "2019", value: 76 },
  { year: "2020", value: 74 },
  { year: "2021", value: 81 },
  { year: "2022", value: 86 },
  { year: "2023", value: 88 },
  { year: "2024", value: 87 },
  { year: "2025", value: 82 },
];

export const MEJORO_SUELDO: YearValue[] = [
  { year: "2018", value: 69 },
  { year: "2019", value: 73 },
  { year: "2020", value: 62 },
  { year: "2021", value: 72 },
  { year: "2022", value: 76 },
  { year: "2023", value: 61 },
  { year: "2024", value: 77 },
  { year: "2025", value: 81 },
];

export const MEJORO_PUESTO: YearValue[] = [
  { year: "2018", value: 57 },
  { year: "2019", value: 73 },
  { year: "2020", value: 64 },
  { year: "2021", value: 79 },
  { year: "2022", value: 75 },
  { year: "2023", value: 62 },
  { year: "2024", value: 74 },
  { year: "2025", value: 83 },
];

export const TRABAJAN_NO_TRABAJAN: YearGroupValue[] = [
  { year: "2018", trabajan: 75, noTrabajan: 25 },
  { year: "2019", trabajan: 73, noTrabajan: 27 },
  { year: "2020", trabajan: 76, noTrabajan: 24 },
  { year: "2021", trabajan: 72, noTrabajan: 28 },
  { year: "2022", trabajan: 76, noTrabajan: 24 },
  { year: "2023", trabajan: 57, noTrabajan: 43 },
  { year: "2024", trabajan: 77, noTrabajan: 23 },
  { year: "2025", trabajan: 63, noTrabajan: 37 },
];
