"use client";
// فیلتر پیشرفته کنار نتایج. همه فیلدهای اختیاری از data/fields.ts خوانده می‌شوند.
// بخش‌ها تک‌بازشو هستند تا فهرست کوتاه بماند و اسکرول کم شود. مبلغ و محدوده بالای صفحه‌اند.
import { useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Danger, InfoCircle, Refresh2, Setting4 } from "@/components/iconsax";
import { advancedFields, advancedSections, profileFields } from "@/data/fields";
import { routes, routeSubcategories } from "@/data/routes";
import { projectGroups } from "@/data/taxonomy";
import { advisories } from "@/data/advisories";
import { listings } from "@/lib/listings";
import { useStore } from "@/lib/store";
import type { FieldDef, FieldOption, FilterValue, RouteId } from "@/types";
import { cn, faNumber } from "@/lib/utils";
import { Dropdown, FieldControl } from "./controls";
import { CityPicker } from "./province-picker";

const noLocation: RouteId[] = ["fund"];
const propertyRoutes: RouteId[] = ["buyer", "lessee"];
const sectionName: Record<string, string> = { amount: "بازده و زمان‌بندی", risk: "ریسک", project: "ویژگی‌های پروژه", location: "شهر و محله", contract: "شرایط قرارداد" };

function inRoute(f: FieldDef, route: RouteId) {
  if (f.routes && !f.routes.includes(route)) return false;
  if (!f.routes && f.section === "location" && noLocation.includes(route)) return false;
  if (!f.routes && (f.id === "usage" || f.id === "area") && !propertyRoutes.includes(route)) return false;
  return true;
}
function visible(f: FieldDef, route: RouteId, filters: Record<string, FilterValue>) {
  if (!inRoute(f, route)) return false;
  if (f.showWhen) {
    const v = filters[f.showWhen.field];
    if (f.showWhen.filled) return v != null && v !== 0;
    if (f.showWhen.in) return Array.isArray(v) ? (v as string[]).some((x) => f.showWhen!.in!.includes(x)) : f.showWhen.in.includes(v as string);
  }
  return true;
}

function Section({ id, title, count, children }: { id: string; title: string; count: number; children: React.ReactNode }) {
  return (
    <AccordionItem value={id} className="border-border">
      <AccordionTrigger className="items-center py-3.5 text-right text-[15px] font-extrabold text-ink hover:no-underline">
        <span className="flex items-center gap-2">{title}{count > 0 && <Badge className="h-5 min-w-5 px-1 text-[11px] font-bold">{faNumber(count)}</Badge>}</span>
      </AccordionTrigger>
      <AccordionContent className="space-y-5 px-0.5 pb-5">{children}</AccordionContent>
    </AccordionItem>
  );
}

/** پرسش‌های تخصصی نوع پروژه (از نسخه مرجع)؛ فقط برای نوع‌های انتخاب‌شده نمایش داده می‌شود */
function AdvisoryQuestions({ subtypes }: { subtypes: string[] }) {
  const { criteria, setFilter } = useStore();
  const names = useMemo(() => Object.fromEntries(projectGroups.flatMap((g) => g.subtypes).map((s) => [s.id, s.name])), []);
  const withAdvisory = subtypes.filter((s) => advisories[s]);
  if (!subtypes.length) return <p className="text-[13px] leading-6 text-muted-foreground">از «ویژگی‌های پروژه»، نوع دقیق پروژه را انتخاب کنید تا پرسش‌های همان نوع این‌جا بیاید.</p>;
  if (!withAdvisory.length) return <p className="text-[13px] leading-6 text-muted-foreground">برای نوع انتخاب‌شده پرسش تخصصی ثبت نشده است.</p>;
  return (
    <>
      {withAdvisory.map((st) => { const a = advisories[st];
        return (
          <div key={st} className="space-y-4">
            <p className="rounded-2xl bg-muted p-3 text-[13px] font-semibold leading-6 text-ink/80"><b className="text-primary">{names[st]}: </b>{a.context}</p>
            {a.questions.map((q) => { const key = `adv:${st}:${q.id}`; const v = criteria.filters[key] as string | undefined;
              return (
                <div key={q.id}>
                  <p className="mb-2 text-[13px] font-bold leading-6 text-ink/80">{q.label}</p>
                  <Dropdown options={q.options} value={v} onChange={(x) => setFilter(key, x)} />
                  {v && q.block.includes(v) && <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold leading-5 text-destructive"><Danger size={15} variant="Bold" className="mt-0.5 shrink-0" />{q.actions[v] ?? "با این پاسخ، ابتدا باید این مانع برطرف شود."}</p>}
                  {v && !q.block.includes(v) && (q.review.includes(v) || q.actions[v]) && <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold leading-5 text-ink/70"><InfoCircle size={15} variant="Bold" className="mt-0.5 shrink-0 text-primary" />{q.actions[v] ?? "این مورد را کارشناس باید بررسی کند."}</p>}
                </div>
              ); })}
          </div>
        ); })}
    </>
  );
}

export function AdvancedFilter({ className }: { className?: string }) {
  const { criteria, setFilter } = useStore();
  const route = routes.find((r) => r.id === criteria.route)!;
  const f = criteria.filters;

  const dynamicOptions = useMemo<Record<string, FieldOption[]>>(() => {
    const groups = criteria.groups.length ? projectGroups.filter((g) => criteria.groups.includes(g.id)) : projectGroups;
    const cities = [...new Set(listings.filter((l) => l.city && (!criteria.provinces.length || criteria.provinces.includes(l.province!))).map((l) => l.city!))];
    const sub = (r: RouteId) => (routeSubcategories[r] ?? []).map((s) => ({ value: s.id, label: s.name }));
    return {
      subtypes: groups.flatMap((g) => g.subtypes.map((s) => ({ value: s.id, label: s.name }))),
      cities: cities.map((c) => ({ value: c, label: c })),
      fundType: sub("fund"), saleCategory: sub("buyer"), charityType: sub("charity"),
    };
  }, [criteria.groups, criteria.provinces]);

  const fields = advancedFields.filter((x) => visible(x, route.id, f));
  // فیلدهای وابسته‌ای که هنوز بسته‌اند؛ زیر فیلد والد یک خط راهنما می‌گیرند
  const waiting = advancedFields.filter((x) => x.showWhen && inRoute(x, route.id) && !visible(x, route.id, f));
  const hintFor = (x: FieldDef) => {
    const deps = waiting.filter((d) => d.showWhen!.field === x.id); if (!deps.length) return null;
    const byCond = new Map<string, FieldDef[]>();
    for (const d of deps) { const k = JSON.stringify(d.showWhen); byCond.set(k, [...(byCond.get(k) ?? []), d]); }
    return [...byCond.values()].map((list) => {
      const when = list[0].showWhen!;
      const opts = when.in?.map((v) => x.options?.find((o) => o.value === v)?.label ?? v) ?? [];
      const cond = when.filled ? `با تعیین «${x.label}»` : `با انتخاب ${opts.map((o) => `«${o}»`).join(" یا ")}`;
      return <p key={`${x.id}-${list[0].id}-hint`} className="-mt-2 flex items-start gap-1.5 text-xs font-semibold leading-6 text-muted-foreground"><InfoCircle size={14} variant="Bold" className="mt-1 shrink-0 text-primary" /><span>{cond}، {list.map((d) => `«${d.label}»`).join("، ")} هم باز می‌شود.</span></p>;
    });
  };

  const profile = profileFields.filter((x) => !x.routes || x.routes.includes(route.id));
  const activeIn = (list: FieldDef[]) => list.filter((x) => f[x.id] != null).length;
  const advKeys = Object.keys(f).filter((k) => k.startsWith("adv:"));
  const total = Object.keys(f).length;
  const many = dynamicOptions.subtypes.length > 14;
  const subtypes = (f.subtypes as string[] | undefined) ?? [];
  const clear = () => Object.keys(f).forEach((k) => setFilter(k, undefined));

  const row = (x: FieldDef) => (
    <div key={x.id} className={cn(x.control === "switch" && "flex items-center justify-between gap-3")}>
      <p className={cn("text-[13px] font-bold text-ink/80", x.control !== "switch" && "mb-2")}>{x.label}</p>
      {x.id === "cities" ? <CityPicker route={route.id} provinces={criteria.provinces} />
        : <FieldControl field={x.id === "subtypes" && many ? { ...x, control: "multi-combobox" } : x} value={f[x.id]} onChange={(v) => setFilter(x.id, v)} options={dynamicOptions[x.id]} />}
    </div>
  );

  return (
    <div className={className}>
      <div className="flex items-center justify-between pb-1">
        <h2 className="flex items-center gap-2 text-lg font-black text-ink"><Setting4 size={20} variant="Bulk" className="text-primary" />فیلترهای بیشتر</h2>
        {total > 0 && <Button variant="ghost" size="xs" type="button" onClick={clear} className="font-bold text-muted-foreground hover:text-destructive"><Refresh2 size={14} />حذف ({faNumber(total)})</Button>}
      </div>

      <Accordion key={route.id} type="single" collapsible defaultValue={fields.some((x) => x.section === "amount") ? "amount" : "project"}>
        {advancedSections.map((s) => {
          const list = fields.filter((x) => x.section === s.id);
          if (!list.length) return null;
          return <Section key={s.id} id={s.id} title={sectionName[s.id] ?? s.name} count={activeIn(list)}>{list.flatMap((x) => [row(x), hintFor(x)])}</Section>;
        })}
        {route.usesProjectGroups && (
          <Section id="advisory" title="پرسش‌های تخصصی" count={advKeys.length}><AdvisoryQuestions subtypes={subtypes} /></Section>
        )}
        {profile.length > 0 && (
          <Section id="profile" title="درباره شما" count={activeIn(profile)}>
            <p className="text-xs leading-6 text-muted-foreground">یک‌بار وارد کنید؛ همراه جست‌وجو ذخیره می‌شود.</p>
            {profile.map(row)}
          </Section>
        )}
      </Accordion>
    </div>
  );
}
