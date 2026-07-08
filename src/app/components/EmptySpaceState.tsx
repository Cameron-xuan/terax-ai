import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

/** Shown when the active space has no tabs: the user picks a module via +. */
export function EmptySpaceState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-card text-muted-foreground">
        <HugeiconsIcon icon={PlusSignIcon} size={20} strokeWidth={1.5} />
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-foreground">
          Nothing open in this space
        </p>
        <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
          Use the{" "}
          <span className="rounded bg-muted px-1 py-0.5 font-mono text-[10.5px]">
            +
          </span>{" "}
          button in the tab bar to open a Terminal, Editor, Preview, or Git
          view. New terminals start in the folder shown below.
        </p>
      </div>
    </div>
  );
}
