import { getDashboardSnapshot } from "@/lib/data-source";
import { CommandCenter } from "@/components/command-center";

export default async function HomePage() {
  const snapshot = await getDashboardSnapshot();

  return <CommandCenter snapshot={snapshot} />;
}
