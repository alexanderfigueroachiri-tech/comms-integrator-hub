import type { DashboardSnapshot } from "@cih/shared";
import { HealthBadge } from "./health-badge";
import { AlertPanel } from "./alert-panel";
import { AnalyticsPanel } from "./analytics-panel";
import {
  DependencyGraph,
  SystemsMatrix,
} from "./dependency-graph";
import { Calendar, Clock, Layers, TrendingUp } from "lucide-react";

function Kpi({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <Icon className="h-4 w-4 text-slate-600" />
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export function CommandCenter({ snapshot }: { snapshot: DashboardSnapshot }) {
  const { project } = snapshot;

  return (
    <div className="min-h-screen bg-[#080b10]">
      <header className="border-b border-surface-border bg-surface/80 px-6 py-5 backdrop-blur-md lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              IntegraCom Hub · Command Center
            </p>
            <h1 className="mt-1 text-xl font-bold text-white lg:text-2xl">
              {project.name}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {project.client} · {project.systems.length} sistemas · Contrato{" "}
              {project.contract.startDate} → {project.contract.endDate}
            </p>
          </div>
          <HealthBadge status={snapshot.overallHealth} size="lg" />
        </div>
      </header>

      <div className="space-y-8 p-6 lg:p-8">
        <section className="glass rounded-2xl border-l-4 border-l-accent p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Reporte ejecutivo
          </p>
          <p className="mt-3 text-base leading-relaxed text-slate-100 lg:text-lg">
            {snapshot.executiveSummary}
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi
            label="Avance global"
            value={`${snapshot.overallActualPct}%`}
            sub={`${project.systems.length} sistemas hospitalarios`}
            icon={TrendingUp}
          />
          <Kpi
            label="Tiempo contractual"
            value={`${snapshot.scheduledPct}%`}
            sub={`${snapshot.elapsedDays} / ${snapshot.totalDays} días`}
            icon={Clock}
          />
          <Kpi
            label="Días restantes"
            value={String(snapshot.remainingDays)}
            sub="Hasta fin de contrato"
            icon={Calendar}
          />
          <Kpi
            label="Brecha global"
            value={`${snapshot.scheduledPct - snapshot.overallActualPct} pts`}
            sub={
              snapshot.overallActualPct >= snapshot.scheduledPct
                ? "En línea o adelantado"
                : "Rezago vs programado"
            }
            icon={Layers}
          />
        </section>

        <AnalyticsPanel snapshot={snapshot} />

        <section id="trenes">
          <h2 className="mb-1 text-lg font-semibold text-white">
            Red de dependencias
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            Trencitos inter-sistema · Extensible por proyecto
          </p>
          <DependencyGraph snapshot={snapshot} />
        </section>

        <section id="sistemas">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Matriz de sistemas (07 — 07.23)
          </h2>
          <SystemsMatrix snapshot={snapshot} />
        </section>

        <section id="alertas">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Alertas activas
          </h2>
          <AlertPanel alerts={snapshot.alerts} />
        </section>
      </div>
    </div>
  );
}
