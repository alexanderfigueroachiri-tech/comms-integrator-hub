import { describe, expect, it } from "vitest";
import { SCE_PHASES } from "./system-catalog";
import type { PhaseDefinition, PhaseValues } from "./types";
import {
  computeHealth,
  computeMetradoProgress,
  computeScheduledProgress,
  computeSystemProgressFromMetrados,
  phaseScore,
} from "./progress-engine";

describe("computeHealth", () => {
  it("HC-01: returns good when actual meets or exceeds scheduled", () => {
    expect(computeHealth(90, 75)).toBe("good");
    expect(computeHealth(85, 85)).toBe("good");
  });

  it("HC-02/05: returns warning within 10 points of scheduled", () => {
    expect(computeHealth(80, 85)).toBe("warning");
    expect(computeHealth(75, 85)).toBe("warning");
  });

  it("HC-03/06: returns critical when lag exceeds 10 points (spec example)", () => {
    expect(computeHealth(75, 90)).toBe("critical");
    expect(computeHealth(74, 85)).toBe("critical");
  });
});

describe("computeMetradoProgress", () => {
  it("MP-01: returns 0 for empty phase list", () => {
    expect(computeMetradoProgress([], {})).toBe(0);
  });

  it("MP-02/03: averages binary SCE phases with equal weight (BR-A02)", () => {
    const allYes: PhaseValues = Object.fromEntries(
      SCE_PHASES.map((p) => [p.code, "YES"]),
    );
    const allNo: PhaseValues = Object.fromEntries(
      SCE_PHASES.map((p) => [p.code, "NO"]),
    );

    expect(computeMetradoProgress(SCE_PHASES, allYes)).toBe(100);
    expect(computeMetradoProgress(SCE_PHASES, allNo)).toBe(0);
  });

  it("MP-04/05: matches seeded SCE metrado examples", () => {
    const m1: PhaseValues = {
      COMPATIBILIZACION: "YES",
      CANALIZADO: "YES",
      CABLEADO: "YES",
      PONCHADO: "NO",
      PLAQUEADO: "NO",
      CERTIFICADO: "NO",
    };
    const m5: PhaseValues = Object.fromEntries(
      SCE_PHASES.map((p) => [p.code, "YES"]),
    );

    expect(computeMetradoProgress(SCE_PHASES, m1)).toBe(50);
    expect(computeMetradoProgress(SCE_PHASES, m5)).toBe(100);
  });

  it("MP-06: scores ternary phases as 100 / 50 / 0", () => {
    const phases: PhaseDefinition[] = [
      {
        code: "STEP",
        label: "Step",
        sortOrder: 1,
        valueType: "TERNARY",
        valueTypeCode: 1,
      },
    ];

    expect(
      phaseScore(phases[0], { STEP: "DONE" }),
    ).toBe(100);
    expect(
      phaseScore(phases[0], { STEP: "PARTIAL" }),
    ).toBe(50);
    expect(
      phaseScore(phases[0], { STEP: "PENDING" }),
    ).toBe(0);
  });
});

describe("computeScheduledProgress", () => {
  it("SP-02/05: returns 0 at or before contract start", () => {
    expect(
      computeScheduledProgress("2025-01-01", "2025-06-30", "2025-01-01"),
    ).toBe(0);
    expect(
      computeScheduledProgress("2025-01-01", "2025-06-30", "2024-12-01"),
    ).toBe(0);
  });

  it("SP-03/06: returns 100 at or after contract end", () => {
    expect(
      computeScheduledProgress("2025-01-01", "2025-06-30", "2025-06-30"),
    ).toBe(100);
    expect(
      computeScheduledProgress("2025-01-01", "2025-06-30", "2025-12-01"),
    ).toBe(100);
  });

  it("SP-04: matches demo contract midpoint (~day 135 of 180)", () => {
    const scheduled = computeScheduledProgress(
      "2025-01-01",
      "2025-06-30",
      "2025-05-15",
    );
    expect(scheduled).toBeGreaterThanOrEqual(70);
    expect(scheduled).toBeLessThanOrEqual(78);
  });

  it("SP-01: returns 0 on same-day contract at start boundary", () => {
    expect(
      computeScheduledProgress("2025-03-01", "2025-03-01", "2025-03-01"),
    ).toBe(0);
  });
});

describe("computeSystemProgressFromMetrados", () => {
  it("averages metrado progress for SCE seed (§7.2)", () => {
    const metrados = [
      {
        id: "m1",
        code: "SCE-H-0001",
        nivel: "1",
        bloque: "A",
        ambiente: "Admisión",
        rotulado: "IDF-A-001",
        phases: {
          COMPATIBILIZACION: "YES",
          CANALIZADO: "YES",
          CABLEADO: "YES",
          PONCHADO: "NO",
          PLAQUEADO: "NO",
          CERTIFICADO: "NO",
        },
      },
      {
        id: "m5",
        code: "SCE-H-0005",
        nivel: "3",
        bloque: "C",
        ambiente: "UCI",
        rotulado: "IDF-C-001",
        phases: Object.fromEntries(SCE_PHASES.map((p) => [p.code, "YES"])),
      },
    ] as const;

    expect(computeSystemProgressFromMetrados(SCE_PHASES, [...metrados])).toBe(
      75,
    );
  });
});
