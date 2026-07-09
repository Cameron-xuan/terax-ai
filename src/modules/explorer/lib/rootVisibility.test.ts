import { describe, expect, it } from "vitest";
import { isSamePath, visibleExplorerRoot } from "./rootVisibility";

describe("isSamePath", () => {
  it("matches identical paths", () => {
    expect(isSamePath("/Users/bob", "/Users/bob")).toBe(true);
  });

  it("ignores trailing slashes", () => {
    expect(isSamePath("/Users/bob/", "/Users/bob")).toBe(true);
  });

  it("normalizes backslashes", () => {
    expect(isSamePath("C:\\Users\\bob", "C:/Users/bob")).toBe(true);
  });

  it("rejects different paths", () => {
    expect(isSamePath("/Users/bob", "/Users/bob/dev")).toBe(false);
  });
});

describe("visibleExplorerRoot", () => {
  const home = "/Users/bob";

  it("hides the home directory by default", () => {
    expect(visibleExplorerRoot(home, home, false)).toBeNull();
  });

  it("hides home with a trailing slash mismatch", () => {
    expect(visibleExplorerRoot("/Users/bob/", home, false)).toBeNull();
  });

  it("shows home once the user opted in", () => {
    expect(visibleExplorerRoot(home, home, true)).toBe(home);
  });

  it("shows any non-home root", () => {
    expect(visibleExplorerRoot("/Users/bob/dev", home, false)).toBe(
      "/Users/bob/dev",
    );
  });

  it("passes through null root", () => {
    expect(visibleExplorerRoot(null, home, false)).toBeNull();
  });

  it("shows the root when home is unknown", () => {
    expect(visibleExplorerRoot("/Users/bob", null, false)).toBe("/Users/bob");
  });
});
