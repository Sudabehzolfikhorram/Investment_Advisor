import { notFound } from "next/navigation";
import { ToolView } from "@/components/tools/tools";
import { toolById, tools } from "@/data/tools";
import { site } from "@/data/site";

export function generateStaticParams() { return tools.map((t) => ({ id: t.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const t = toolById((await params).id);
  return { title: t ? `${t.name} | ${site.name}` : site.name };
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!toolById(id)) notFound();
  return <ToolView id={id} />;
}
