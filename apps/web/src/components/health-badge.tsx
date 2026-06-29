import type { HealthStatus } from "@cih/shared";
import clsx from "clsx";

const styles: Record<
  HealthStatus,
  { bg: string; text: string; label: string; dot: string }
> = {
  good: {
    bg: "bg-emerald-500/15 border-emerald-500/40",
    text: "text-emerald-400",
    label: "BIEN",
    dot: "bg-emerald-400",
  },
  warning: {
    bg: "bg-amber-500/15 border-amber-500/40",
    text: "text-amber-400",
    label: "ATENCIÓN",
    dot: "bg-amber-400",
  },
  critical: {
    bg: "bg-red-500/15 border-red-500/40",
    text: "text-red-400",
    label: "MAL",
    dot: "bg-red-400",
  },
};

export function HealthBadge({
  status,
  size = "md",
}: {
  status: HealthStatus;
  size?: "sm" | "md" | "lg";
}) {
  const s = styles[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border font-semibold tracking-wide",
        s.bg,
        s.text,
        size === "sm" && "px-2 py-0.5 text-[10px]",
        size === "md" && "px-3 py-1 text-xs",
        size === "lg" && "px-4 py-1.5 text-sm",
      )}
    >
      <span className={clsx("rounded-full", s.dot, size === "lg" ? "h-2.5 w-2.5" : "h-2 w-2")} />
      {s.label}
    </span>
  );
}
