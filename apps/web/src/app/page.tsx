import { buildDashboardSnapshot } from "@cih/shared";
import { CommandCenter } from "@/components/command-center";

export default function HomePage() {
  const snapshot = buildDashboardSnapshot();

  return <CommandCenter snapshot={snapshot} />;
}
