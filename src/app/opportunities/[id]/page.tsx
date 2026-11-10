// اسکلت صفحه پروژه — دیزاین در مرحله بعد.
import { notFound } from "next/navigation";
import { opportunities } from "@/data/opportunities";

export function generateStaticParams() {
  return opportunities.map((o) => ({ id: o.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = opportunities.find((x) => x.id === id);
  if (!o) notFound();
  return (
    <main className="mx-auto max-w-3xl space-y-3 p-8">
      <h1 className="text-xl font-bold">{o.title}</h1>
      <p className="text-muted-foreground">{o.province}، {o.city} · {o.model}</p>
      <p>{o.caution}</p>
      {/* تماس: کارشناس و موبایل، یا دانلود فایل راهنما */}
      {o.expert ? <p>{o.expert.name} — {o.expert.mobile}</p> : o.guideFileUrl ? <a href={o.guideFileUrl} download>دانلود فایل راهنما</a> : null}
    </main>
  );
}
