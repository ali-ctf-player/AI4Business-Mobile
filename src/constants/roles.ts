import type { RoleSlug } from "@/types/database.types";

export const ROLE_SLUGS = [
  "startup",
  "investor",
  "it_company",
  "organizer",
  "admin",
  "super_admin",
] as const satisfies readonly RoleSlug[];

export const ROLE_DISPLAY_NAMES: Record<RoleSlug, string> = {
  startup: "Startup",
  investor: "Investor",
  it_company: "IT Company",
  organizer: "Organizer",
  admin: "Admin",
  super_admin: "Super Admin",
};

export type { RoleSlug };
