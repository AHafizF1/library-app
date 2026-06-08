/**
 * Domain constants — single source of truth.
 *
 * Every magic number and role definition lives here.
 * Import from this file; never hardcode these values elsewhere.
 */

/** Minimum rows auto-created when a new column is added. */
export const DEFAULT_ROWS_PER_COLUMN = 6;

/**
 * Organization roles.
 * Both admin and member have identical permissions in Phase 1.
 * Owner is auto-assigned to the org creator by Better Auth.
 */
export const ORG_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
} as const;

export type OrgRole = (typeof ORG_ROLES)[keyof typeof ORG_ROLES];
