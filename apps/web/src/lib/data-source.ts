import {
  buildDashboardSnapshot,
  type DashboardSnapshot,
  type ProjectDemo,
  getProjectSystem,
} from "@cih/shared";

export type DataSource = "seed" | "db";

export function getDataSource(): DataSource {
  return process.env.CIH_DATA_SOURCE === "db" ? "db" : "seed";
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  if (getDataSource() === "db") {
    const { loadDashboardFromDb } = await import("@cih/database/load-project");
    return loadDashboardFromDb();
  }
  return buildDashboardSnapshot();
}

export async function getProjectDemo(): Promise<ProjectDemo> {
  const snapshot = await getDashboardSnapshot();
  return snapshot.project;
}

export async function getSystemFromProject(
  code: string,
): Promise<ReturnType<typeof getProjectSystem>> {
  const project = await getProjectDemo();
  return getProjectSystem(project, code);
}
