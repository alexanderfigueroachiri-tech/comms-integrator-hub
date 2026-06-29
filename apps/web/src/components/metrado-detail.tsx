import type { Metrado, PhaseDefinition, PhaseValues } from "@cih/shared";
import { computeMetradoProgress } from "@cih/shared";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function formatPhaseValue(phase: PhaseDefinition, value: unknown): string {
  if (value === undefined || value === null) return "—";
  if (phase.valueType === "CONTINUOUS") return `${value}`;
  return String(value).replace(/_/g, " ");
}

export function MetradoDetail({
  systemCode,
  systemName,
  phases,
  metrado,
}: {
  systemCode: string;
  systemName: string;
  phases: PhaseDefinition[];
  metrado: Metrado;
}) {
  const sorted = [...phases].sort((a, b) => a.sortOrder - b.sortOrder);
  const pct = computeMetradoProgress(phases, metrado.phases);

  return (
    <div className="min-h-screen bg-[#080b10]">
      <header className="border-b border-surface-border px-6 py-5 lg:px-8">
        <Link
          href={`/systems/${encodeURIComponent(systemCode)}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {systemName}
        </Link>
        <p className="font-mono text-sm text-accent">{metrado.code}</p>
        <h1 className="mt-1 text-xl font-bold text-white">
          Metrado — {metrado.ambiente}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Nivel {metrado.nivel} · Bloque {metrado.bloque} · {metrado.rotulado}
        </p>
      </header>

      <div className="space-y-6 p-6 lg:p-8">
        <div className="glass rounded-xl p-5">
          <p className="text-xs uppercase text-slate-500">Avance metrado</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{pct}%</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Atributos
          </h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ["Nivel", metrado.nivel],
              ["Bloque", metrado.bloque],
              ["Ambiente", metrado.ambiente],
              ["Rotulado", metrado.rotulado],
              ["Salida", metrado.salidaTipo ?? "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="text-sm text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Fases del trencito
          </h2>
          <ul className="space-y-3">
            {sorted.map((p) => {
              const val = (metrado.phases as PhaseValues)[p.code];
              const done =
                val === "YES" ||
                val === "DONE" ||
                (typeof val === "number" && val >= 100);
              return (
                <li
                  key={p.code}
                  className="flex items-center justify-between rounded-lg border border-surface-border px-4 py-3"
                >
                  <span className="text-sm text-slate-200">{p.label}</span>
                  <span className={done ? "text-emerald-400" : "text-slate-500"}>
                    {formatPhaseValue(p, val)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
