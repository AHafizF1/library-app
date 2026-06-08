export function normalizeJoinCode(code: string) {
  return code.trim().toUpperCase();
}

export function authDestination(activeOrganizationId?: string | null) {
  return activeOrganizationId ? "/library" : "/join";
}
