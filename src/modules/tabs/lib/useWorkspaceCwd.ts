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

export function useWorkspaceCwd(
  activeTab: Tab | undefined,
  tabs: Tab[],
  home: string | null,
): Result {
  const lastTerminalCwd = useRef<string | null>(null);
  const [pickedRoot, setPickedRoot] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab?.kind === "terminal" && activeTab.cwd) {
      lastTerminalCwd.current = activeTab.cwd;
      // The active terminal is the source of truth again; the explicit
      // pick either got absorbed as its spawn cwd or was navigated away.
      setPickedRoot(null);
    }
  }, [activeTab]);

  const explorerRoot = useMemo<string | null>(() => {
    if (activeTab?.kind === "terminal" && activeTab.cwd) return activeTab.cwd;
    if (pickedRoot) return pickedRoot;
    if (lastTerminalCwd.current) return lastTerminalCwd.current;
    const anyTerm = tabs.find((t) => t.kind === "terminal" && t.cwd);
    if (anyTerm?.kind === "terminal" && anyTerm.cwd) return anyTerm.cwd;
    return home;
  }, [activeTab, tabs, home, pickedRoot]);

  const inheritedCwdForNewTab = useCallback((): string | undefined => {
    if (activeTab?.kind === "terminal" && activeTab.cwd) return activeTab.cwd;
    // Editor tabs inherit the explicit pick, else the last terminal's cwd
    // (or workspace home), not the file's folder — opening a new terminal
    // from a file shouldn't hijack the user's working directory context.
    return pickedRoot ?? lastTerminalCwd.current ?? home ?? undefined;
  }, [activeTab, home, pickedRoot]);

  return { explorerRoot, inheritedCwdForNewTab, setPickedRoot, pickedRoot };
}
