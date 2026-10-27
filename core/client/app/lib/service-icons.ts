import {
  Accessibility,
  Briefcase,
  GraduationCap,
  IdCard,
  Target,
  User,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

// Keys must match ContentIcons.Service in the backend.
export const SERVICE_ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  user: { icon: User, label: "Persona" },
  "id-card": { icon: IdCard, label: "Credencial" },
  "user-check": { icon: UserCheck, label: "Persona verificada" },
  accessibility: { icon: Accessibility, label: "Acompañamiento" },
  users: { icon: Users, label: "Grupo" },
  briefcase: { icon: Briefcase, label: "Maletín" },
  "graduation-cap": { icon: GraduationCap, label: "Formación" },
  target: { icon: Target, label: "Objetivo" },
};

export function serviceIcon(key: string): LucideIcon {
  return SERVICE_ICONS[key]?.icon ?? User;
}
