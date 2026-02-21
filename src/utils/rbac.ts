import type { RoleSlug } from "@/types/database.types";

export function hasRole(userRole: RoleSlug | null | undefined, allowed: RoleSlug | RoleSlug[]): boolean {
  if (!userRole) return false;
  const allowedList = Array.isArray(allowed) ? allowed : [allowed];
  return allowedList.includes(userRole);
}

export function isSuperAdmin(role: RoleSlug | null | undefined): boolean {
  return role === "super_admin";
}

export function isAdmin(role: RoleSlug | null | undefined): boolean {
  return role === "admin";
}

export function isAdminOrSuperAdmin(role: RoleSlug | null | undefined): boolean {
  return hasRole(role, ["admin", "super_admin"]);
}

export function canManageHackathons(role: RoleSlug | null | undefined): boolean {
  return isAdminOrSuperAdmin(role);
}

/** Organizer və superadmin yeni hackathon yarada bilər */
export function canCreateHackathon(role: RoleSlug | null | undefined): boolean {
  return hasRole(role, ["organizer", "super_admin"]);
}

/** Admin yalnız hackathon adını redaktə edə bilər; başqa sahələrə toxunmaz */
export function canOnlyEditHackathonName(role: RoleSlug | null | undefined): boolean {
  return role === "admin";
}

export function canDeleteHackathons(role: RoleSlug | null | undefined): boolean {
  // Yalnız superadmin hackathonları silə bilər
  return isSuperAdmin(role);
}

export function canManageUsers(role: RoleSlug | null | undefined): boolean {
  // Yalnız superadmin istifadəçiləri idarə edə bilər
  return isSuperAdmin(role);
}

export function canManageRoles(role: RoleSlug | null | undefined): boolean {
  // Yalnız superadmin rolları idarə edə bilər
  return isSuperAdmin(role);
}

export function canSeeInvestorHub(role: RoleSlug | null | undefined): boolean {
  return hasRole(role, ["investor", "admin", "super_admin", "organizer"]);
}

export function canCreateStartup(role: RoleSlug | null | undefined): boolean {
  return hasRole(role, ["startup", "admin", "super_admin"]);
}

export function canEvaluateStartups(role: RoleSlug | null | undefined): boolean {
  return hasRole(role, ["admin", "super_admin", "investor", "organizer"]);
}

export function canManageTeams(role: RoleSlug | null | undefined): boolean {
  // Admin və superadmin komandaları idarə edə bilər
  return isAdminOrSuperAdmin(role);
}

export function canManageAwards(role: RoleSlug | null | undefined): boolean {
  // Admin və superadmin mükafatları idarə edə bilər
  return isAdminOrSuperAdmin(role);
}
