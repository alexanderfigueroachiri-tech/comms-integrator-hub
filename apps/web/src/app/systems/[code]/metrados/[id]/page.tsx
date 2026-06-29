import { notFound } from "next/navigation";
import { getSystemFromProject } from "@/lib/data-source";
import { MetradoDetail } from "@/components/metrado-detail";

interface Props {
  params: Promise<{ code: string; id: string }>;
}

export default async function MetradoPage({ params }: Props) {
  const { code, id } = await params;
  const systemCode = decodeURIComponent(code);
  const metradoId = decodeURIComponent(id);
  const system = await getSystemFromProject(systemCode);

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
