import { describe, expect, it } from "vitest";
import { canAccessAdmin } from "../access";

describe("accès à l’administration", () => {
  it("autorise un membre CardMyAnime", () => {
    expect(canAccessAdmin({ app: "cardmyanime", roles: ["member"] })).toBe(
      true,
    );
  });

  it("autorise un super-admin de la plateforme", () => {
    expect(canAccessAdmin({ app: "cardmyanime", prole: ["superadmin"] })).toBe(
      true,
    );
  });

  it("refuse un compte connecté mais sans rôle autorisé", () => {
    expect(canAccessAdmin({ app: "cardmyanime", roles: [] })).toBe(false);
  });

  it("refuse un jeton émis pour une autre application", () => {
    expect(
      canAccessAdmin({
        app: "another-app",
        roles: ["member"],
        prole: ["superadmin"],
      }),
    ).toBe(false);
  });
});
