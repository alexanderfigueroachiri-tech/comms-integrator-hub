import { describe, expect, it } from "vitest";
import { SCE_PHASES } from "./system-catalog";
import { computeHealth, computeScheduledProgress } from "./progress-engine";
import {
  DEMO_PROJECT,
  buildDashboardSnapshot,
  getProjectSystem,
} from "./demo-data";

describe("buildDashboardSnapshot", () => {
  const snapshot = buildDashboardSnapshot();

  it("DS-01: exposes dashboard fields required by Command Center", () => {
    expect(snapshot.scheduledPct).toBeTypeOf("number");
    expect(snapshot.overallActualPct).toBeTypeOf("number");
    expect(snapshot.overallHealth).toMatch(/^(good|warning|critical)$/);
    expect(snapshot.executiveSummary.length).toBeGreaterThan(0);
    expect(snapshot.systems.length).toBeGreaterThan(0);
    expect(Array.isArray(snapshot.alerts)).toBe(true);
    expect(snapshot.timelineSeries.length).toBeGreaterThan(0);
  });

  it("DS-02/03: aligns scheduled progress and global health with engine", () => {
    const scheduled = computeScheduledProgress(
      DEMO_PROJECT.contract.startDate,
      DEMO_PROJECT.contract.endDate,
      DEMO_PROJECT.simulatedToday,
    );

    expect(snapshot.scheduledPct).toBe(scheduled);
    expect(snapshot.overallHealth).toBe(
      computeHealth(snapshot.overallActualPct, snapshot.scheduledPct),
    );
  });

  it("DS-04: marks SCE horizontal as critical in demo narrative", () => {
    const sce = snapshot.systems.find((s) => s.code === "07.14");
    expect(sce).toBeDefined();
    expect(sce!.health).toBe("critical");
    expect(sce!.actualPct).toBeLessThan(snapshot.scheduledPct);
  });

  it("DS-05 / AC-D03: propagates inherited risk to telephony downstream", () => {
    const telephony = snapshot.systems.find((s) => s.code === "07");
    expect(telephony).toBeDefined();
    expect(telephony!.inheritedRisk).toBe(true);
    expect(telephony!.riskReason).toMatch(/07\.14/);
  });

  it("DS-06/07: emits contract and cascade alerts (A1, A3)", () => {
    const codes = snapshot.alerts.map((a) => a.code);
    expect(codes).toContain("A1");
    expect(codes).toContain("A3");

    const cascade = snapshot.alerts.find((a) => a.code === "A3");
    expect(cascade?.message.toLowerCase()).toContain("riesgo heredado");
  });

  it("DS-08: executive summary uses natural language for critical state", () => {
    if (snapshot.overallHealth === "critical") {
      expect(snapshot.executiveSummary).toMatch(/riesgo|penalidad/i);
    }
    expect(snapshot.executiveSummary).toMatch(/\d+%/);
  });

  it("DS-09 / AC-D02: SCE catalog has six ordered phases and twelve metrados", () => {
    expect(SCE_PHASES).toHaveLength(6);
    expect(SCE_PHASES.map((p) => p.sortOrder)).toEqual([1, 2, 3, 4, 5, 6]);

    const sce = getProjectSystem(DEMO_PROJECT, "07.14");
    expect(sce?.metrados).toHaveLength(12);
    expect(sce?.phases.map((p) => p.code)).toEqual(
      SCE_PHASES.map((p) => p.code),
    );
  });

  it("DS-04 bottleneck: SCE bottleneck phase is defined for alert A2", () => {
    const sce = snapshot.systems.find((s) => s.code === "07.14");
    expect(sce?.bottleneckPhase).toBeDefined();
    expect(snapshot.alerts.some((a) => a.code === "A2")).toBe(true);
  });
});
