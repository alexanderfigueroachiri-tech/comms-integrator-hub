import type { Metrado, PhaseDefinition } from "@cih/shared";
import { computePhaseAverage } from "@cih/shared";
import clsx from "clsx";

export function PhaseTrain({
  phases,
  metrados,
}: {
  phases: PhaseDefinition[];
  metrados: Metrado[];
}) {
  const sorted = [...phases].sort((a, b) => a.sortOrder - b.sortOrder);
  const avgs = sorted.map((p) => ({
    phase: p,
    avg: computePhaseAverage(p, metrados),
  }));
  const bottleneck = avgs.reduce((min, cur) =>
    cur.avg < min.avg ? cur : min,
  );

  return (
    <div className="glass overflow-x-auto rounded-2xl p-6">
      <div className="flex min-w-max items-center gap-2">
        {avgs.map(({ phase, avg }, i) => {
          const isBottleneck = phase.code === bottleneck.phase.code;
          const color =
            avg >= 80
              ? "border-emerald-500/60 bg-emerald-500/10"
              : avg >= 40
                ? "border-amber-500/60 bg-amber-500/10"
                : "border-red-500/60 bg-red-500/10";

          return (
            <div key={phase.code} className="flex items-center gap-2">
              <div
                className={clsx(
                  "relative w-36 rounded-xl border-2 p-4 text-center",
                  color,
                  isBottleneck &&
                    "ring-2 ring-red-400 ring-offset-2 ring-offset-[#1a2332]",
                )}
              >
                {isBottleneck && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    CUELLO
                  </span>
                )}
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  {phase.sortOrder}
                </p>
                <p className="mt-1 text-xs font-semibold leading-tight text-white">
                  {phase.label}
                </p>
                <p className="mt-2 text-xl font-bold">{avg}%</p>
                <p className="mt-1 text-[10px] text-slate-500">{phase.valueType}</p>
              </div>
              {i < avgs.length - 1 && (
                <div className="h-0.5 w-6 bg-slate-600" />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Promedio de {metrados.length} metrados por fase · Secuencia alineada a
        BICSI/TIA (compat → pathway → cable → label → faceplate → patch → certify)
      </p>
    </div>
  );
}
