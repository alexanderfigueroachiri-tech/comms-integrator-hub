export { prisma } from "./client";
export * from "@prisma/client";
export {
  loadAlertsFromDb,
  loadDashboardFromDb,
  loadProjectFromDb,
} from "./load-project";
