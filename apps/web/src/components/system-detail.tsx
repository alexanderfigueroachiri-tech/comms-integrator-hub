import type { ProjectDemo, SystemProgress } from "@cih/shared";
import { computePhaseAverage, getCatalogSystem } from "@cih/shared";
import Link from "next/link";
import { HealthBadge } from "./health-badge";
import { PhaseTrain } from "./phase-train";
import { MetradoTable } from "./metrado-table";
import { PhaseBreakdownChart } from "./analytics-panel";
import { ArrowLeft } from "lucide-react";

interface Props {
  system: ProjectDemo["systems"][0];
  progress: SystemProgress;
  scheduledPct: number;
  simulatedToday: string;
}

export function SystemDetail({
  system,
  progress,
  scheduledPct,
  simulatedToday,
}: Props) {
  const catalog = getCatalogSystem(system.code);
  const phaseChartData = system.phases
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((p) => ({
      phase: p.label,
      pct: computePhaseAverage(p, system.metrados),
    }));

  return (
    <div className="min-h-screen bg-[#080b10]">
      <header className="border-b border-surface-border px-6 py-5 lg:px-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Command Center
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-sm text-accent">{system.code}</p>
            <h1 className="mt-1 text-xl font-bold text-white lg:text-2xl">
              {system.name}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {system.metrados.length} metrados · {simulatedToday}
              {catalog?.standardRef && (
                <span className="ml-2 text-slate-600">
                  · Ref: {catalog.standardRef}
                </span>
              )}
            </p>
          </div>
          <HealthBadge status={progress.health} size="lg" />
        </div>
      </header>

      <div className="space-y-8 p-6 lg:p-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="glass rounded-xl p-5">
            <p className="text-xs uppercase text-slate-500">Avance</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">
              {progress.actualPct}%
            </p>
          </div>
          <div className="glass rounded-xl p-5">
            <p className="text-xs uppercase text-slate-500">Tiempo contrato</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">
              {scheduledPct}%
            </p>
          </div>
          <div className="glass rounded-xl p-5">
            <p className="text-xs uppercase text-slate-500">Brecha</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">
              {scheduledPct - progress.actualPct} pts
            </p>
          </div>
        </div>

        {progress.inheritedRisk && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
            {progress.riskReason}
          </div>
        )}

        <PhaseBreakdownChart data={phaseChartData} />

        <section>
          <h2 className="mb-4 text-lg font-semibold">Trencito de fases</h2>
          <PhaseTrain phases={system.phases} metrados={system.metrados} />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Metrados</h2>
          <MetradoTable phases={system.phases} metrados={system.metrados} />
        </section>
      </div>
    </div>
  );
}
