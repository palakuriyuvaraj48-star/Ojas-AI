/**
 * Role-Based Access Control definitions and helpers (Features 131–135).
 * Permissions are additive; super_admin implicitly holds every permission.
 */
import type { AdminRole, Permission } from "./types";

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: [
    "flags:read", "flags:write", "flags:delete",
    "notifications:read", "notifications:write", "notifications:send", "notifications:delete",
    "feedback:read", "feedback:write", "feedback:delete",
    "content:read", "content:write", "content:publish", "content:delete",
    "system:read", "system:write", "system:alerts",
    "audit:read", "users:read", "users:write",
  ],
  admin: [
    "flags:read", "flags:write",
    "notifications:read", "notifications:write", "notifications:send",
    "feedback:read", "feedback:write",
    "content:read", "content:write", "content:publish",
    "system:read", "system:alerts",
    "audit:read", "users:read",
  ],
  moderator: [
    "flags:read",
    "notifications:read", "notifications:write",
    "feedback:read", "feedback:write", "feedback:delete",
    "content:read", "content:write",
    "system:read",
    "audit:read",
  ],
  viewer: [
    "flags:read",
    "notifications:read",
    "feedback:read",
    "content:read",
    "system:read",
    "audit:read",
  ],
};

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  moderator: "Moderator",
  viewer: "Viewer",
};

export function permissionsForRole(role: AdminRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  if (role === "super_admin") return true;
  return permissionsForRole(role).includes(permission);
}

export function hasAll(role: AdminRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function hasAny(role: AdminRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export const ALL_ROLES: AdminRole[] = ["super_admin", "admin", "moderator", "viewer"];
