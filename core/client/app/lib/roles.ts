export const ROLES = ["Admin", "Editor"] as const;

export type Role = (typeof ROLES)[number];
