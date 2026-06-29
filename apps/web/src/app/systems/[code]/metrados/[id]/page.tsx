import { buildDashboardSnapshot, getProjectSystem } from "@cih/shared";
import { notFound } from "next/navigation";
import { MetradoDetail } from "@/components/metrado-detail";

interface Props {
  params: Promise<{ code: string; id: string }>;
}

export default async function MetradoPage({ params }: Props) {
  const { code, id } = await params;
  const systemCode = decodeURIComponent(code);
  const metradoId = decodeURIComponent(id);
  const snapshot = buildDashboardSnapshot();
  const system = getProjectSystem(snapshot.project, systemCode);

  if (!system) notFound();

  const metrado = system.metrados.find((m) => m.id === metradoId);
  if (!metrado) notFound();

  return (
    <MetradoDetail
      systemCode={system.code}
      systemName={system.name}
      phases={system.phases}
      metrado={metrado}
    />
  );
}
