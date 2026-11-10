"use client";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@/components/iconsax";
import { AlgoPattern, NodeMark } from "@/components/brand/algo-pattern";
import { Header, Footer } from "@/components/site/header";
import { Card } from "@/components/ui/card";
import { toolIcons } from "@/components/icons";
import { toolById, toolGroups, tools } from "@/data/tools";
import { cn } from "@/lib/utils";
import { LegacyTool } from "./engine";

export function ToolsIndex() {
  return (
    <>
      <Header />
      <main className="relative mx-auto max-w-7xl px-6 pt-10">
        <AlgoPattern className="-top-24 left-0 -z-10 h-80 w-[36rem] text-ink/[0.05]" fade="radial" />
        <span className="inline-flex items-center gap-2 text-[13px] font-extrabold text-primary"><NodeMark />خدمات</span>
        <h1 className="mt-2 text-4xl font-black leading-[1.4] text-ink">هر کاری غیر از جست‌وجوی پروژه، از اینجا شروع می‌شود.</h1>
        {toolGroups.map((g) => (
          <section key={g.id} className="mt-10">
            <h2 className="mb-4 text-lg font-extrabold text-ink">{g.name}</h2>
            <div className="grid grid-cols-3 gap-4">
              {tools.filter((t) => t.group === g.id).map((t) => { const I = toolIcons[t.id];
                return (
                  <Link key={t.id} href={`/tools/${t.id}`} className="group">
                    <Card className="surface h-full gap-0 rounded-[1.75rem] p-5 shadow-none transition-all group-hover:-translate-y-0.5 group-hover:border-primary/50">
                      <span className="flex items-center justify-between">
                        <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white"><I size={22} variant="Bulk" /></span>
                        <ArrowLeft size={18} className="text-ink/30 transition-all group-hover:-translate-x-1 group-hover:text-primary" />
                      </span>
                      <h3 className="mt-4 text-base font-extrabold text-ink">{t.name}</h3>
                      <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">{t.description}</p>
                    </Card>
                  </Link>
                ); })}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}

export function ToolView({ id }: { id: string }) {
  const tool = toolById(id)!;
  const siblings = tools.filter((t) => t.group === tool.group);
  return (
    <>
      <Header />
      <main className="relative mx-auto max-w-7xl px-6 pt-8">
        <AlgoPattern className="-top-24 left-0 -z-10 h-80 w-[36rem] text-ink/[0.05]" fade="radial" />
        <div className="grid grid-cols-[17rem_1fr] items-start gap-8">
          <aside className="sticky top-24">
            <Link href="/tools" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-ink/60 hover:text-primary"><ArrowRight size={16} />همه خدمات</Link>
            <nav className="surface flex flex-col gap-1 rounded-[1.75rem] p-2.5">
              {tools.map((t, i) => { const I = toolIcons[t.id]; const on = t.id === id;
                return (
                  <Link key={t.id} href={`/tools/${t.id}`} aria-current={on ? "page" : undefined}
                    className={cn("flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[13px] font-bold transition-colors", on ? "bg-primary text-white" : "text-ink/70 hover:bg-primary/5 hover:text-primary", i > 0 && tools[i - 1].group !== t.group && "mt-2")}>
                    <I size={18} variant="Bulk" className="shrink-0" /><span className="min-w-0 truncate">{t.name}</span>
                  </Link>
                ); })}
            </nav>
          </aside>
          <Card className="surface block min-h-[60dvh] min-w-0 gap-0 rounded-[2rem] p-8 shadow-none" data-siblings={siblings.length}>
            <LegacyTool key={id} opener={tool.opener} root={tool.root} />
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
