import type { Alert } from "@cih/shared";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import clsx from "clsx";

const iconMap = {
  INFO: Info,
  WARNING: AlertTriangle,
  CRITICAL: AlertCircle,
};

const styleMap = {
  INFO: "border-slate-600 bg-slate-800/50 text-slate-300",
  WARNING: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  CRITICAL: "border-red-500/40 bg-red-500/10 text-red-200",
};

export function AlertPanel({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) {
    return (
      <p className="glass rounded-xl p-6 text-sm text-slate-400">
        Sin alertas activas.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const Icon = iconMap[alert.severity];
        return (
          <div
            key={alert.id}
            className={clsx(
              "flex gap-4 rounded-xl border p-4",
              styleMap[alert.severity],
            )}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="text-xs font-mono opacity-70">{alert.code}</p>
              <p className="mt-1 text-sm leading-relaxed">{alert.message}</p>
              {alert.systemCode && (
                <p className="mt-1 text-xs opacity-60">
                  Sistema {alert.systemCode}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
