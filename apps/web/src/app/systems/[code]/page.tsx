import { notFound } from "next/navigation";
import {
  getDashboardSnapshot,
  getSystemFromProject,
} from "@/lib/data-source";
import { SystemDetail } from "@/components/system-detail";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function SystemPage({ params }: Props) {
  const { code } = await params;
  const decoded = decodeURIComponent(code);
  const snapshot = await getDashboardSnapshot();
  const system = await getSystemFromProject(decoded);
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
