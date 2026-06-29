import { buildDashboardSnapshot, getProjectSystem } from "@cih/shared";
import { notFound } from "next/navigation";
import { SystemDetail } from "@/components/system-detail";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function SystemPage({ params }: Props) {
  const { code } = await params;
  const decoded = decodeURIComponent(code);
  const snapshot = buildDashboardSnapshot();
  const system = getProjectSystem(snapshot.project, decoded);
  const progress = snapshot.systems.find((s) => s.code === decoded);

  if (!system || !progress) notFound();

  return (
    <SystemDetail
      system={system}
      progress={progress}
      scheduledPct={snapshot.scheduledPct}
      simulatedToday={snapshot.project.simulatedToday}
    />
  );
}
