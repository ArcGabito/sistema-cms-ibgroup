// Client-safe: types and labels shared by the audit page and its module.

export type AuditAction = "create" | "update" | "delete" | "export";

export interface AuditEntry {
  id: number;
  at: string;
  userId: number | null;
  username: string;
  action: AuditAction;
  entityType: string;
  entityId: string | null;
  label: string | null;
  details: string | null;
}

export interface AuditFilters {
  entityTypes: string[];
  usernames: string[];
}

// Backend entity names → what the dashboard calls them.
export const ENTITY_LABELS: Record<string, string> = {
  BlogPost: "Post",
  User: "Usuario",
  ServiceItem: "Servicio",
  FaqItem: "Pregunta frecuente",
  CountryItem: "País",
  StatChart: "Estadística",
  Client: "Cliente",
  ContactSubmission: "Consulta",
  EmployabilityTestSubmission: "Test de empleabilidad",
};

export const ACTION_LABELS: Record<AuditAction, string> = {
  create: "Creó",
  update: "Editó",
  delete: "Eliminó",
  export: "Exportó",
};
