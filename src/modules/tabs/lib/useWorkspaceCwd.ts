import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Tab } from "./useTabs";

type Result = {
  explorerRoot: string | null;
  inheritedCwdForNewTab: () => string | undefined;
  /**
   * Folder picked without an active terminal (Open Folder / breadcrumb).
   * Overrides the remembered terminal cwd until a terminal becomes active
   * again, so picking a folder never has to spawn a terminal.
   */
  setPickedRoot: (path: string | null) => void;
  pickedRoot: string | null;
};

/**
 * All state is keyed by space: an empty space starts with a null root and
 * never inherits another space's terminal cwd.
 */
export function useWorkspaceCwd(
  activeTab: Tab | undefined,
  spaceTabs: Tab[],
  spaceId: string,
  home: string | null,
): Result {
  const lastTerminalCwd = useRef<Map<string, string>>(new Map());
  const [pickedRoots, setPickedRoots] = useState<Record<string, string | null>>(
    {},
  );
  const pickedRoot = pickedRoots[spaceId] ?? null;

  const setPickedRoot = useCallback(
    (path: string | null) => {
      setPickedRoots((prev) =>
        prev[spaceId] === path ? prev : { ...prev, [spaceId]: path },
      );
    },
    [spaceId],
  );

  useEffect(() => {
    if (activeTab?.kind === "terminal" && activeTab.cwd) {
      lastTerminalCwd.current.set(activeTab.spaceId, activeTab.cwd);
      // The active terminal is the source of truth again; the explicit
      // pick either got absorbed as its spawn cwd or was navigated away.
      setPickedRoots((prev) =>
        prev[activeTab.spaceId] == null
          ? prev
          : { ...prev, [activeTab.spaceId]: null },
      );
    }
  }, [activeTab]);

  const explorerRoot = useMemo<string | null>(() => {
    if (activeTab?.kind === "terminal" && activeTab.cwd) return activeTab.cwd;
    if (pickedRoot) return pickedRoot;
    // An empty space shows the folder-pick empty state, not a stale root.
    if (spaceTabs.length === 0) return null;
    const last = lastTerminalCwd.current.get(spaceId);
    if (last) return last;
    const anyTerm = spaceTabs.find((t) => t.kind === "terminal" && t.cwd);
    if (anyTerm?.kind === "terminal" && anyTerm.cwd) return anyTerm.cwd;
    return home;
  }, [activeTab, spaceTabs, spaceId, home, pickedRoot]);

  const inheritedCwdForNewTab = useCallback((): string | undefined => {
    if (activeTab?.kind === "terminal" && activeTab.cwd) return activeTab.cwd;
    // Editor tabs inherit the explicit pick, else the space's last terminal
    // cwd (or home), not the file's folder — opening a new terminal from a
    // file shouldn't hijack the user's working directory context.
    return (
      pickedRoot ?? lastTerminalCwd.current.get(spaceId) ?? home ?? undefined
    );
  }, [activeTab, spaceId, home, pickedRoot]);

  return { explorerRoot, inheritedCwdForNewTab, setPickedRoot, pickedRoot };
}
