"use client";

import type { DashboardSnapshot } from "@cih/shared";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const HEALTH_COLORS = {
  good: "#22c55e",
  warning: "#eab308",
  critical: "#ef4444",
};

export function AnalyticsPanel({ snapshot }: { snapshot: DashboardSnapshot }) {
  const ranking = [...snapshot.systems]
    .sort((a, b) => a.actualPct - b.actualPct)
    .slice(0, 10)
    .map((s) => ({
      name: s.code,
      avance: s.actualPct,
      contrato: snapshot.scheduledPct,
      gap: snapshot.scheduledPct - s.actualPct,
      health: s.health,
    }));

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white">
          Curva S — Avance vs tiempo contractual
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Respuesta visual: ¿vamos bien o mal frente al plazo?
        </p>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={snapshot.timelineSeries}>
              <defs>
                <linearGradient id="schedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#2d3a4f" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: "#1a2332",
                  border: "1px solid #2d3a4f",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="scheduled"
                name="Programado"
                stroke="#3b82f6"
                fill="url(#schedGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="actual"
                name="Real"
                stroke="#ef4444"
                fill="url(#actGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white">
          Brecha por sistema (top rezagados)
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Avance real vs {snapshot.scheduledPct}% tiempo consumido
        </p>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={ranking} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid stroke="#2d3a4f" strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748b"
                fontSize={10}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a2332",
                  border: "1px solid #2d3a4f",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="avance" name="Avance %" radius={[0, 4, 4, 0]}>
                {ranking.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={HEALTH_COLORS[entry.health]}
                  />
                ))}
              </Bar>
              <Line
                type="monotone"
                dataKey="contrato"
                name="Tiempo %"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function PhaseBreakdownChart({
  data,
}: {
  data: Array<{ phase: string; pct: number }>;
}) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-white">Avance por fase</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#2d3a4f" strokeDasharray="3 3" />
            <XAxis
              dataKey="phase"
              stroke="#64748b"
              fontSize={9}
              angle={-25}
              textAnchor="end"
              height={60}
            />
            <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                background: "#1a2332",
                border: "1px solid #2d3a4f",
                borderRadius: 8,
              }}
            />
            <Bar dataKey="pct" name="%" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
