import { convertFileSrc } from "@tauri-apps/api/core";

const WINDOWS_PATH = /^[a-zA-Z]:[\\/]/;
const DRIVE_SEGMENT = /^[a-zA-Z]:$/;

export function normalizeInput(raw: string, home?: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^file:\/\//i.test(trimmed)) return trimmed;
  if (trimmed === "~" || trimmed.startsWith("~/")) {
    if (!home) return null;
    const rest = trimmed === "~" ? "" : trimmed.slice(2);
    const base = home.replace(/[\\/]+$/, "");
    return pathToFileUrl(rest ? `${base}/${rest}` : base);
  }
  if (trimmed.startsWith("/") || WINDOWS_PATH.test(trimmed)) {
    return pathToFileUrl(trimmed);
  }
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^localhost(:|\/|$)/i.test(trimmed)) return `http://${trimmed}`;
  if (/^\d{1,3}(\.\d{1,3}){3}(:|\/|$)/.test(trimmed))
    return `http://${trimmed}`;
  if (/^[\w.-]+\.[a-z]{2,}/i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

export function pathToFileUrl(path: string): string {
  const norm = path.replace(/\\/g, "/");
  const encoded = norm
    .split("/")
    .map((seg) => (DRIVE_SEGMENT.test(seg) ? seg : encodeURIComponent(seg)))
    .join("/");
  return norm.startsWith("/") ? `file://${encoded}` : `file:///${encoded}`;
}

export function fileUrlToPath(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.protocol !== "file:") return null;
  const pathname = decodeURIComponent(u.pathname);
  return WINDOWS_PATH.test(pathname.slice(1)) ? pathname.slice(1) : pathname;
}

// file: URLs cannot load in an iframe from the app origin; the Tauri asset
// protocol serves them instead (scope + CSP already allow it).
// convertFileSrc percent-encodes the whole path into a single URL segment,
// which collapses the document's directory structure and breaks relative
// subresources (../assets/style.css would resolve against the protocol
// root). Re-encode per segment so slashes survive.
export function toEmbedSrc(url: string): string {
  const path = fileUrlToPath(url);
  if (!path) return url;
  const converted = convertFileSrc(path);
  const flat = encodeURIComponent(path);
  if (!converted.endsWith(flat)) return converted;
  const prefix = converted.slice(0, converted.length - flat.length);
  const encoded = path
    .split("/")
    .map((seg) => (DRIVE_SEGMENT.test(seg) ? seg : encodeURIComponent(seg)))
    .join("/")
    .replace(/^\//, "");
  return prefix + encoded;
}

export function isLocalUrl(url: string): boolean {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  if (u.protocol === "file:") return true;
  const h = u.hostname;
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "0.0.0.0" ||
    h === "[::1]" ||
    h.endsWith(".localhost")
  );
}
