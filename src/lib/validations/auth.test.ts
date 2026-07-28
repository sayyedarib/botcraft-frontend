import { describe, expect, it } from "vitest";

import { loginSchema, signupSchema } from "./auth";

const validSignup = {
  name: "Arib",
  email: "demo@botcraft.dev",
  password: "Passw0rdAB",
  confirmPassword: "Passw0rdAB",
};

describe("signupSchema", () => {
  it("accepts a well-formed signup", () => {
    expect(signupSchema.safeParse(validSignup).success).toBe(true);
  });

  it("rejects a mismatched confirmation and points at the right field", () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      confirmPassword: "Different1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
    }
  });

  it("rejects a malformed email", () => {
    expect(
      signupSchema.safeParse({ ...validSignup, email: "not-an-email" }).success
    ).toBe(false);
  });

  it.each([
    ["too short", "Pas1"],
    ["no uppercase", "passw0rdab"],
    ["no lowercase", "PASSW0RDAB"],
    ["no digit", "PasswordAB"],
  ])("rejects a password that is %s", (_label, password) => {
    const result = signupSchema.safeParse({
      ...validSignup,
      password,
      confirmPassword: password,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a one-character name", () => {
    expect(signupSchema.safeParse({ ...validSignup, name: "A" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    expect(
      loginSchema.safeParse({ email: "demo@botcraft.dev", password: "secret" }).success
    ).toBe(true);
  });

  it("rejects a malformed email", () => {
    expect(loginSchema.safeParse({ email: "nope", password: "secret" }).success).toBe(
      false
    );
  });

  it("rejects an empty password", () => {
    expect(
      loginSchema.safeParse({ email: "demo@botcraft.dev", password: "" }).success
    ).toBe(false);
  });
});
