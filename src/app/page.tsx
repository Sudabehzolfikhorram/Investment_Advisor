// اسکلت لندینگ — فقط ساختار و داده؛ دیزاین در مرحله بعد.
import Link from "next/link";
import { site, sitemap } from "@/data/site";
import { routes } from "@/data/routes";
import { projectGroups } from "@/data/taxonomy";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl space-y-10 p-8">
      <header>
        <h1 className="text-2xl font-bold text-primary">{site.name}</h1>
        <p className="text-muted-foreground">{site.tagline}</p>
      </header>
      <section>
        <h2 className="mb-2 font-bold">مسیرهای همکاری</h2>
        <ul className="list-disc space-y-1 pr-5">
          {routes.map((r) => <li key={r.id}>{r.name} — <span className="text-muted-foreground">{r.description}</span></li>)}
        </ul>
      </section>
      <section>
        <h2 className="mb-2 font-bold">گروه‌های پروژه</h2>
        <ul className="list-disc space-y-1 pr-5">
          {projectGroups.map((g) => <li key={g.id}>{g.name}: <span className="text-muted-foreground">{g.subtypes.map((s) => s.name).join("، ")}</span></li>)}
        </ul>
      </section>
      <section>
        <h2 className="mb-2 font-bold">صفحات</h2>
        <ul className="list-disc space-y-1 pr-5">
          {sitemap.map((p) => <li key={p.path}>{p.path.includes("[") ? p.name : <Link className="text-primary underline" href={p.path}>{p.name}</Link>} — <span className="text-muted-foreground">{p.note}</span></li>)}
        </ul>
      </section>
    </main>
  );
}
