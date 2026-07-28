import { describe, expect, it } from "vitest";

import { themeColorNameToCssVariable, themeColorsToCssVariables } from "./chart";

describe("themeColorNameToCssVariable", () => {
  it("converts camelCase to a kebab-case custom property", () => {
    expect(themeColorNameToCssVariable("primaryColor")).toBe("--primary-color");
  });

  it("leaves an already-lowercase name alone", () => {
    expect(themeColorNameToCssVariable("primary")).toBe("--primary");
  });

  it("handles several humps", () => {
    expect(themeColorNameToCssVariable("chatHeaderTextColor")).toBe(
      "--chat-header-text-color"
    );
  });
});

describe("themeColorsToCssVariables", () => {
  it("maps every colour to a custom property", () => {
    expect(
      themeColorsToCssVariables({ primaryColor: "#fff", textColor: "#000" })
    ).toEqual({ "--primary-color": "#fff", "--text-color": "#000" });
  });

  it("returns an empty object for empty input", () => {
    expect(themeColorsToCssVariables({})).toEqual({});
  });
});
