"use client";

import type { Metrado, PhaseDefinition, PhaseValues } from "@cih/shared";
import { computeMetradoProgress } from "@cih/shared";
import Link from "next/link";
import { useMemo, useState } from "react";

function formatPhaseValue(
  phase: PhaseDefinition,
  value: unknown,
): string {
  if (value === undefined || value === null) return "—";
  if (phase.valueType === "CONTINUOUS") return `${value}`;
  return String(value).replace(/_/g, " ");
}

export function MetradoTable({
  systemCode,
  phases,
  metrados,
}: {
  systemCode: string;
  phases: PhaseDefinition[];
  metrados: Metrado[];
}) {
  const sorted = [...phases].sort((a, b) => a.sortOrder - b.sortOrder);
  const niveles = useMemo(
    () => [...new Set(metrados.map((m) => m.nivel))].sort(),
    [metrados],
  );
  const bloques = useMemo(
    () => [...new Set(metrados.map((m) => m.bloque))].sort(),
    [metrados],
  );
  const ambientes = useMemo(
    () => [...new Set(metrados.map((m) => m.ambiente))].sort(),
    [metrados],
  );

  const [nivel, setNivel] = useState("");
  const [bloque, setBloque] = useState("");
  const [ambiente, setAmbiente] = useState("");

  const filtered = metrados.filter((m) => {
    if (nivel && m.nivel !== nivel) return false;
    if (bloque && m.bloque !== bloque) return false;
    if (ambiente && m.ambiente !== ambiente) return false;
    return true;
  });

  const selectClass =
    "rounded-lg border border-surface-border bg-surface-raised px-3 py-2 text-sm text-slate-200";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select
          className={selectClass}
          value={nivel}
          onChange={(e) => setNivel(e.target.value)}
          aria-label="Filtrar por nivel"
        >
          <option value="">Todos los niveles</option>
          {niveles.map((n) => (
            <option key={n} value={n}>
              Nivel {n}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={bloque}
          onChange={(e) => setBloque(e.target.value)}
          aria-label="Filtrar por bloque"
        >
          <option value="">Todos los bloques</option>
          {bloques.map((b) => (
            <option key={b} value={b}>
              Bloque {b}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={ambiente}
          onChange={(e) => setAmbiente(e.target.value)}
          aria-label="Filtrar por ambiente"
        >
          <option value="">Todos los ambientes</option>
          {ambientes.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <span className="self-center text-xs text-slate-500">
          {filtered.length} de {metrados.length} metrados
        </span>
      </div>

      <div className="glass overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border text-xs uppercase text-slate-500">
              <th className="p-3">Código</th>
              <th className="p-3">Nivel</th>
              <th className="p-3">Bloque</th>
              <th className="p-3">Ambiente</th>
              <th className="p-3">Salida</th>
              <th className="p-3">%</th>
              {sorted.map((p) => (
                <th key={p.code} className="p-3 text-[10px]">
                  {p.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => {
              const pct = computeMetradoProgress(phases, m.phases);
              return (
                <tr
                  key={m.id}
                  className="border-b border-surface-border/50 hover:bg-surface-raised/30"
                >
                  <td className="p-3">
                    <Link
                      href={`/systems/${encodeURIComponent(systemCode)}/metrados/${encodeURIComponent(m.id)}`}
                      className="font-mono text-xs text-accent hover:underline"
                    >
                      {m.code}
                    </Link>
                  </td>
                  <td className="p-3">{m.nivel}</td>
                  <td className="p-3">{m.bloque}</td>
                  <td className="p-3">{m.ambiente}</td>
                  <td className="p-3">{m.salidaTipo ?? "—"}</td>
                  <td className="p-3 font-semibold">{pct}%</td>
                  {sorted.map((p) => (
                    <td key={p.code} className="p-3 text-xs text-slate-400">
                      {formatPhaseValue(
                        p,
                        (m.phases as PhaseValues)[p.code],
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-500">
            Sin metrados para estos filtros.
          </p>
        )}
      </div>
    </div>
  );
}
