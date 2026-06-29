"use client";

import type { DashboardSnapshot, HealthStatus } from "@cih/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import clsx from "clsx";

const HEALTH_STROKE: Record<HealthStatus, string> = {
  good: "#22c55e",
  warning: "#eab308",
  critical: "#ef4444",
};

/** Capas lógicas del DAG — extensible */
const LAYERS: string[][] = [
  ["07.14", "07.17", "07.16"],
  ["07.08", "07.05"],
  ["07", "07.02", "07.03", "07.06", "07.07", "07.09", "07.12"],
  ["07.04", "07.10", "07.11", "07.13"],
  ["07.20", "07.21", "07.23", "07.19"],
];

const NODE_W = 128;
const NODE_H = 72;
const GAP_X = 24;
const GAP_Y = 100;

export function DependencyGraph({
  snapshot,
}: {
  snapshot: DashboardSnapshot;
}) {
  const router = useRouter();
  const [hover, setHover] = useState<string | null>(null);
  const byCode = useMemo(
    () => Object.fromEntries(snapshot.systems.map((s) => [s.code, s])),
    [snapshot.systems],
  );

  const positions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    LAYERS.forEach((layer, li) => {
      const rowW = layer.length * NODE_W + (layer.length - 1) * GAP_X;
      const startX = -rowW / 2;
      layer.forEach((code, i) => {
        pos[code] = {
          x: startX + i * (NODE_W + GAP_X) + NODE_W / 2,
          y: li * GAP_Y + 40,
        };
      });
    });
    return pos;
  }, []);

  const width = Math.max(
    900,
    Math.max(...LAYERS.map((l) => l.length)) * (NODE_W + GAP_X),
  );
  const height = LAYERS.length * GAP_Y + 80;

  const related = useMemo(() => {
    if (!hover) return new Set<string>();
    const set = new Set<string>([hover]);
    snapshot.project.dependencies.forEach((d) => {
      if (d.upstreamCode === hover) set.add(d.downstreamCode);
      if (d.downstreamCode === hover) set.add(d.upstreamCode);
    });
    return set;
  }, [hover, snapshot.project.dependencies]);

  return (
    <div className="glass overflow-x-auto rounded-2xl p-4">
      <svg
        viewBox={`${-width / 2} 0 ${width} ${height}`}
        className="mx-auto w-full min-w-[720px]"
        style={{ height: Math.min(520, height) }}
      >
        <defs>
          <marker
            id="arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 Z" fill="#475569" />
          </marker>
        </defs>

        {snapshot.project.dependencies.map((dep) => {
          const from = positions[dep.upstreamCode];
          const to = positions[dep.downstreamCode];
          if (!from || !to) return null;
          const active =
            !hover ||
            related.has(dep.upstreamCode) ||
            related.has(dep.downstreamCode);
          return (
            <line
              key={`${dep.upstreamCode}-${dep.downstreamCode}`}
              x1={from.x}
              y1={from.y + NODE_H / 2}
              x2={to.x}
              y2={to.y - NODE_H / 2}
              stroke={active ? "#64748b" : "#1e293b"}
              strokeWidth={active ? 2 : 1}
              strokeOpacity={active ? 0.8 : 0.25}
              markerEnd="url(#arrow)"
            />
          );
        })}

        {LAYERS.flat().map((code) => {
          const sys = byCode[code];
          const pos = positions[code];
          if (!sys || !pos) return null;
          const dimmed = hover && !related.has(code);
          const stroke = HEALTH_STROKE[sys.health];

          return (
            <g
              key={code}
              transform={`translate(${pos.x - NODE_W / 2}, ${pos.y - NODE_H / 2})`}
              onMouseEnter={() => setHover(code)}
              onMouseLeave={() => setHover(null)}
              onClick={() =>
                router.push(`/systems/${encodeURIComponent(code)}`)
              }
              className="cursor-pointer"
              opacity={dimmed ? 0.35 : 1}
            >
              <rect
                width={NODE_W}
                height={NODE_H}
                rx={10}
                fill="#1a2332"
                stroke={stroke}
                strokeWidth={hover === code ? 3 : 2}
              />
              <text
                x={NODE_W / 2}
                y={22}
                textAnchor="middle"
                fill="#64748b"
                fontSize={10}
                fontFamily="monospace"
              >
                {code}
              </text>
              <text
                x={NODE_W / 2}
                y={40}
                textAnchor="middle"
                fill="#f1f5f9"
                fontSize={11}
                fontWeight={600}
              >
                {sys.actualPct}%
              </text>
              <text
                x={NODE_W / 2}
                y={58}
                textAnchor="middle"
                fill={stroke}
                fontSize={9}
                fontWeight={700}
              >
                {sys.health === "good"
                  ? "BIEN"
                  : sys.health === "warning"
                    ? "ATENCIÓN"
                    : "MAL"}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500">
        {snapshot.project.dependencies.length} dependencias configurables · Pasa
        el cursor para resaltar cadena · Clic para detalle
      </p>
    </div>
  );
}

export function SystemsMatrix({
  snapshot,
}: {
  snapshot: DashboardSnapshot;
}) {
  const [filter, setFilter] = useState<"all" | HealthStatus>("all");
  const items = snapshot.systems.filter(
    (s) => filter === "all" || s.health === filter,
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "critical", "warning", "good"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={clsx(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition",
              filter === f
                ? "bg-accent text-white"
                : "bg-surface-raised text-slate-400 hover:text-white",
            )}
          >
            {f === "all" ? "Todos" : f.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((sys) => (
          <Link
            key={sys.code}
            href={`/systems/${encodeURIComponent(sys.code)}`}
            className="glass group rounded-lg p-3 transition hover:border-accent/40"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] text-slate-500">
                {sys.code}
              </span>
              <span
                className={clsx(
                  "h-2 w-2 rounded-full",
                  sys.health === "good" && "bg-emerald-400",
                  sys.health === "warning" && "bg-amber-400",
                  sys.health === "critical" && "bg-red-400",
                )}
              />
            </div>
            <p className="mt-1 truncate text-sm font-medium text-slate-200 group-hover:text-accent">
              {sys.name}
            </p>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-xl font-bold">{sys.actualPct}%</span>
              <span className="text-[10px] text-slate-500">
                {sys.metradoCount} metrados
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className={clsx(
                  "h-full rounded-full transition-all",
                  sys.health === "good" && "bg-emerald-500",
                  sys.health === "warning" && "bg-amber-500",
                  sys.health === "critical" && "bg-red-500",
                )}
                style={{ width: `${sys.actualPct}%` }}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
