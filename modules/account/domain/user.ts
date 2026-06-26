// Account domain layer (DDD), mirroring the catalog module. Decoupled from the
// raw database row shape — the repository maps rows into this type.

export type UserRole = "admin" | "manager" | "customer";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
};

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrateur",
  manager: "Gestionnaire",
  customer: "Client",
};

export function roleLabel(role: UserRole): string {
  return ROLE_LABELS[role] ?? role;
}

/** Staff (admin/manager) may access the back-office; customers may not. */
export function isStaff(role: UserRole): boolean {
  return role === "admin" || role === "manager";
}

/** Where a user lands after signing in, based on their role. */
export function landingPath(role: UserRole): string {
  return isStaff(role) ? "/admin/products" : "/";
}

/**
 * Short identity badge for the header: initials of each name part (e.g.
 * "Camille Durand" → "CD"), falling back to the first letters of a single
 * word. Always uppercase, max 3 characters.
 */
export function trigram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1
      ? parts.map((p) => p[0]).join("")
      : (parts[0] ?? "?").slice(0, 3);
  return letters.slice(0, 3).toUpperCase();
}
