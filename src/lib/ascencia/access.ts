export interface AdminAccessClaims {
  app?: unknown;
  roles?: unknown;
  prole?: unknown;
}

const APPLICATION_SLUG = "cardmyanime";
const MEMBER_ROLE = "member";
const PLATFORM_SUPERADMIN_ROLE = "superadmin";

/** CardMyAnime refuse localement tout jeton qui ne porte pas un droit admin. */
export function canAccessAdmin(claims: AdminAccessClaims): boolean {
  if (claims.app !== APPLICATION_SLUG) return false;

  const applicationRoles = Array.isArray(claims.roles) ? claims.roles : [];
  const platformRoles = Array.isArray(claims.prole) ? claims.prole : [];

  return (
    applicationRoles.includes(MEMBER_ROLE) ||
    platformRoles.includes(PLATFORM_SUPERADMIN_ROLE)
  );
}
