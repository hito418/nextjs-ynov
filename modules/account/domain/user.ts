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
