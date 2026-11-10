// اسکلت صفحه نتایج — فهرست + فیلتر پیشرفته؛ دیزاین در مرحله بعد.
import Link from "next/link";
import { opportunities } from "@/data/opportunities";
import { rank } from "@/lib/match";
import { faNumber } from "@/lib/utils";

export default function Page() {
  const results = rank(opportunities, { route: "investor", groups: [], subtypes: [], provinces: [], cities: [], amount: [0, 30] });
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-4 text-xl font-bold">پروژه‌های پیشنهادی</h1>
      <ul className="space-y-2">
        {results.map(({ opportunity: o, score }) => (
          <li key={o.id} className="rounded-xl border border-border p-4">
            <Link href={`/opportunities/${o.id}`} className="font-bold text-primary">{o.title}</Link>
            <div className="text-sm text-muted-foreground">{o.province}، {o.city} · {faNumber(score)}٪ تطابق</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
