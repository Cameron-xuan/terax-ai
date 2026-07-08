import { describe, expect, it, vi } from "vitest";
import {
  fileUrlToPath,
  isLocalUrl,
  normalizeInput,
  pathToFileUrl,
  toEmbedSrc,
} from "./url";

vi.mock("@tauri-apps/api/core", () => ({
  convertFileSrc: (p: string) => `asset://localhost/${encodeURIComponent(p)}`,
}));

describe("normalizeInput", () => {
  it("returns null for blank input", () => {
    expect(normalizeInput("")).toBeNull();
    expect(normalizeInput("   ")).toBeNull();
  });

  it("passes through http(s) URLs", () => {
    expect(normalizeInput("http://localhost:3000")).toBe(
      "http://localhost:3000",
    );
    expect(normalizeInput("https://example.com/x")).toBe(
      "https://example.com/x",
    );
  });

  it("prefixes bare localhost and IPs with http", () => {
    expect(normalizeInput("localhost:5173")).toBe("http://localhost:5173");
    expect(normalizeInput("127.0.0.1:8000")).toBe("http://127.0.0.1:8000");
  });

  it("prefixes bare domains with https", () => {
    expect(normalizeInput("example.com")).toBe("https://example.com");
  });

  it("passes through file URLs", () => {
    expect(normalizeInput("file:///a/b.html")).toBe("file:///a/b.html");
  });

  it("converts absolute posix paths to file URLs", () => {
    expect(normalizeInput("/Users/x/index.html")).toBe(
      "file:///Users/x/index.html",
    );
  });

  it("encodes special characters in paths", () => {
    expect(normalizeInput("/tmp/my page.html")).toBe(
      "file:///tmp/my%20page.html",
    );
    expect(normalizeInput("/tmp/a#b.html")).toBe("file:///tmp/a%23b.html");
  });

  it("converts windows paths to file URLs", () => {
    expect(normalizeInput("C:\\Users\\x\\index.html")).toBe(
      "file:///C:/Users/x/index.html",
    );
    expect(normalizeInput("D:/www/a.html")).toBe("file:///D:/www/a.html");
  });

  it("expands ~ against the provided home dir", () => {
    expect(normalizeInput("~/site/index.html", "/Users/x")).toBe(
      "file:///Users/x/site/index.html",
    );
    expect(normalizeInput("~", "/Users/x/")).toBe("file:///Users/x");
  });

  it("returns null for ~ without a home dir", () => {
    expect(normalizeInput("~/site/index.html")).toBeNull();
  });
});

describe("pathToFileUrl / fileUrlToPath round-trip", () => {
  it("round-trips posix paths", () => {
    const p = "/Users/x/my page/index.html";
    expect(fileUrlToPath(pathToFileUrl(p))).toBe(p);
  });

  it("round-trips windows paths (forward slashes)", () => {
    expect(fileUrlToPath(pathToFileUrl("C:\\www\\a b.html"))).toBe(
      "C:/www/a b.html",
    );
  });

  it("fileUrlToPath rejects non-file URLs", () => {
    expect(fileUrlToPath("http://localhost:3000")).toBeNull();
    expect(fileUrlToPath("not a url")).toBeNull();
  });
});

describe("toEmbedSrc", () => {
  it("passes non-file URLs through", () => {
    expect(toEmbedSrc("http://localhost:3000")).toBe("http://localhost:3000");
  });

  it("keeps directory structure so relative subresources resolve", () => {
    expect(toEmbedSrc("file:///Users/x/lessons/a.html")).toBe(
      "asset://localhost/Users/x/lessons/a.html",
    );
  });

  it("encodes special characters per segment", () => {
    expect(toEmbedSrc("file:///Users/x/my%20page/a%23b.html")).toBe(
      "asset://localhost/Users/x/my%20page/a%23b.html",
    );
  });

  it("keeps windows drive segments intact", () => {
    expect(toEmbedSrc("file:///C:/www/a.html")).toBe(
      "asset://localhost/C:/www/a.html",
    );
  });
});

describe("isLocalUrl", () => {
  it("treats localhost variants as local", () => {
    expect(isLocalUrl("http://localhost:3000")).toBe(true);
    expect(isLocalUrl("http://127.0.0.1:8080")).toBe(true);
    expect(isLocalUrl("http://app.localhost")).toBe(true);
  });

  it("treats file URLs as local", () => {
    expect(isLocalUrl("file:///Users/x/index.html")).toBe(true);
  });

  it("treats public sites as remote", () => {
    expect(isLocalUrl("https://example.com")).toBe(false);
  });

  it("rejects invalid input", () => {
    expect(isLocalUrl("nonsense")).toBe(false);
  });
});
