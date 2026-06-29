import type { Metrado, PhaseDefinition, PhaseValues } from "@cih/shared";

function formatPhaseValue(
  phase: PhaseDefinition,
  value: unknown,
): string {
  if (value === undefined || value === null) return "—";
  if (phase.valueType === "CONTINUOUS") return `${value}`;
  return String(value).replace(/_/g, " ");
}

export function MetradoTable({
  phases,
  metrados,
}: {
  phases: PhaseDefinition[];
  metrados: Metrado[];
}) {
  const sorted = [...phases].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="glass overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-surface-border text-xs uppercase text-slate-500">
            <th className="p-3">Código</th>
            <th className="p-3">Nivel</th>
            <th className="p-3">Bloque</th>
            <th className="p-3">Ambiente</th>
            <th className="p-3">Salida</th>
            {sorted.map((p) => (
              <th key={p.code} className="p-3 text-[10px]">
                {p.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrados.map((m) => (
            <tr
              key={m.id}
              className="border-b border-surface-border/50 hover:bg-surface-raised/30"
            >
              <td className="p-3 font-mono text-xs text-accent">{m.code}</td>
              <td className="p-3">{m.nivel}</td>
              <td className="p-3">{m.bloque}</td>
              <td className="p-3">{m.ambiente}</td>
              <td className="p-3">{m.salidaTipo ?? "—"}</td>
              {sorted.map((p) => (
                <td key={p.code} className="p-3 text-xs text-slate-400">
                  {formatPhaseValue(
                    p,
                    (m.phases as PhaseValues)[p.code],
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
