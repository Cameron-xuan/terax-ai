export function isSamePath(a: string, b: string): boolean {
  const norm = (p: string) => p.replace(/\\/g, "/").replace(/\/+$/, "") || "/";
  return norm(a) === norm(b);
}

// The default explorer root falls back to the home directory, which would
// list the user's entire personal folder on first open. Hide it until the
// user explicitly picks a folder (or picks home itself).
export function visibleExplorerRoot(
  root: string | null,
  home: string | null,
  homeRootAllowed: boolean,
): string | null {
  if (!root) return null;
  if (!homeRootAllowed && home && isSamePath(root, home)) return null;
  return root;
}
