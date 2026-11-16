"use client";
// فیلتر پیشرفته کنار نتایج. همه فیلدهای اختیاری از data/fields.ts خوانده می‌شوند.
// بخش‌ها تک‌بازشو هستند تا فهرست کوتاه بماند و اسکرول کم شود. مبلغ و محدوده بالای صفحه‌اند.
import { useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CloseCircle, Danger, InfoCircle, Refresh2, Save2, TickCircle } from "@/components/iconsax";
import { advancedFields, advancedSections, profileFields } from "@/data/fields";
import { routes, routeSubcategories } from "@/data/routes";
import { projectGroups } from "@/data/taxonomy";
import { advisories } from "@/data/advisories";
import { listings } from "@/lib/listings";
import { useStore } from "@/lib/store";
import type { FieldDef, FieldOption, FilterValue, RouteId } from "@/types";
import { cn, faNumber } from "@/lib/utils";
import { Dropdown, FieldControl } from "./controls";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { hasQuickFilters } from "./quick-filters";
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

/** آیکون راهنما کنار عنوان، متن راهنما با هاور یا فوکوس دیده می‌شود (به‌جای خط توضیح زیر فیلد) */
export function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* span نه button: داخل دکمه آکاردئون می‌نشیند و دکمه تودرتو مجاز نیست */}
        <span role="img" tabIndex={0} aria-label={text} onClick={(e) => e.stopPropagation()} className="inline-grid size-5 shrink-0 cursor-help place-items-center rounded-full text-ink/35 outline-none transition-colors hover:text-cobalt focus-visible:text-cobalt"><InfoCircle size={15} variant="Bold" /></span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-64 text-right text-[12px] font-semibold leading-6">{text}</TooltipContent>
    </Tooltip>
  );
}

function Section({ id, title, count, info, children }: { id: string; title: string; count: number; info?: string; children: React.ReactNode }) {
  return (
    // بخش باز با زمینه آبی کم‌رنگ و عنوان آبی مشخص می‌شود، شمار فیلترهای انتخاب‌شده هر بخش کنار عنوانش
    <AccordionItem value={id} className="group/sec -mx-2 rounded-2xl border-border px-2 transition-colors data-[state=open]:border-transparent data-[state=open]:bg-cobalt-50 data-[state=open]:ring-1 data-[state=open]:ring-cobalt/15 data-[state=open]:[&_[data-slot=slider-track]]:bg-cobalt/15 [&+&]:mt-1">
      <AccordionTrigger className="items-center rounded-xl py-4 text-right text-[15px] font-extrabold text-ink hover:no-underline focus-visible:ring-2 focus-visible:ring-cobalt/40 data-[state=open]:text-cobalt-deep">
        <span className="flex items-center gap-2">{title}{info && <InfoTip text={info} />}{count > 0 && <Badge className="h-5 min-w-5 bg-cobalt px-1.5 text-[11px] font-bold text-white">{faNumber(count)} انتخاب</Badge>}</span>
      </AccordionTrigger>
      <AccordionContent className="space-y-7 px-0.5 pb-6 pt-1">{children}</AccordionContent>
    </AccordionItem>
  );
}

/** پرسش‌های تخصصی نوع پروژه (از نسخه مرجع)، فقط برای نوع‌های انتخاب‌شده نمایش داده می‌شود */
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
            <p className="rounded-2xl bg-muted p-3 text-[13px] font-semibold leading-6 text-ink/80"><b className="text-primary-ink">{names[st]}: </b>{a.context}</p>
            {a.questions.map((q) => { const key = `adv:${st}:${q.id}`; const v = criteria.filters[key] as string | undefined;
              return (
                <div key={q.id}>
                  <p className="mb-2 text-[13px] font-bold leading-6 text-ink/80">{q.label}</p>
                  <Dropdown options={q.options} value={v} onChange={(x) => setFilter(key, x)} />
                  {v && q.block.includes(v) && <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold leading-5 text-destructive"><Danger size={15} variant="Bold" className="mt-0.5 shrink-0" />{q.actions[v] ?? "با این پاسخ، ابتدا باید این مانع برطرف شود."}</p>}
                  {v && !q.block.includes(v) && (q.review.includes(v) || q.actions[v]) && <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold leading-5 text-ink/70"><InfoCircle size={15} variant="Bold" className="mt-0.5 shrink-0 text-primary-ink" />{q.actions[v] ?? "این مورد را کارشناس باید بررسی کند."}</p>}
                </div>
              ); })}
          </div>
        ); })}
    </>
  );
}

/** بج ذخیره جست‌وجو کنار «حذف همه» در سرِ فیلترها (جای نوار پیشنهاد ذخیره بالای نتایج) */
/** ذخیره جست‌وجو فقط با آیکون، متن کامل در راهنمای شناور و برچسب دسترسی */
function SaveBadge({ onSave, saved }: { onSave: () => void; saved?: boolean }) {
  if (saved) return <span role="img" aria-label="این جست‌وجو ذخیره شده" title="این جست‌وجو ذخیره شده" className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary-ink"><TickCircle size={17} variant="Bold" /></span>;
  return (
    <Button type="button" variant="plain" size="auto" onClick={onSave} aria-label="ذخیره جست‌وجو" title="ذخیره جست‌وجو: دفعه بعد با یک کلیک برمی‌گردید و پروژه‌های تازه‌اش را می‌بینید."
      className="grid size-8 shrink-0 place-items-center rounded-full bg-cobalt-soft text-cobalt-deep ring-1 ring-cobalt/20 transition-colors hover:bg-cobalt hover:text-white">
      <Save2 size={17} variant="Bulk" />
    </Button>
  );
}

export function AdvancedFilter({ className, quick, profileCard, onSave, saved }: { className?: string; quick?: React.ReactNode; profileCard?: React.ReactNode; onSave?: () => void; saved?: boolean }) {
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
  // فیلدهای وابسته‌ای که هنوز بسته‌اند، زیر فیلد والد یک خط راهنما می‌گیرند
  const waiting = advancedFields.filter((x) => x.showWhen && inRoute(x, route.id) && !visible(x, route.id, f));
  // راهنمای فیلدهای وابسته: به‌جای خط زیر فیلد، در آیکون راهنمای کنار عنوان می‌آید
  const hintFor = (x: FieldDef) => {
    const deps = waiting.filter((d) => d.showWhen!.field === x.id); if (!deps.length) return null;
    const byCond = new Map<string, FieldDef[]>();
    for (const d of deps) { const k = JSON.stringify(d.showWhen); byCond.set(k, [...(byCond.get(k) ?? []), d]); }
    return [...byCond.values()].map((list) => {
      const when = list[0].showWhen!;
      const opts = when.in?.map((v) => x.options?.find((o) => o.value === v)?.label ?? v) ?? [];
      const cond = when.filled ? `با تعیین «${x.label}»` : `با انتخاب ${opts.map((o) => `«${o}»`).join(" یا ")}`;
      return `${cond}، ${list.map((d) => `«${d.label}»`).join("، ")} هم باز می‌شود.`;
    }).join(" ");
  };
  // مقدار اسلایدر و بازه در انتهای ردیف عنوان، با × پاک می‌شود (ردیف جدای «حذف» برداشته شد)
  // فقط عدد (یا درصد با ٪) تا عنوان یک‌خطی بماند، واحد کامل در راهنمای هاور پیل می‌آید
  const num = (n: number, x: FieldDef) => (x.unit === "درصد" ? `${faNumber(n)}٪` : faNumber(n));
  const valueOf = (x: FieldDef) => {
    const v = f[x.id];
    if (x.control === "slider" && typeof v === "number") return num(v, x);
    if (x.control === "range" && Array.isArray(v) && typeof v[0] === "number") return `${num(v[0] as number, x)}–${num(v[1] as number, x)}`;
    return null;
  };
  const fullValue = (x: FieldDef) => { const v = f[x.id]; return typeof v === "number" ? `${faNumber(v)} ${x.unit ?? ""}`.trim() : Array.isArray(v) && typeof v[0] === "number" ? `${faNumber(v[0] as number)} تا ${faNumber(v[1] as number)} ${x.unit ?? ""}`.trim() : undefined; };

  const profile = profileFields.filter((x) => !x.routes || x.routes.includes(route.id));
  const activeIn = (list: FieldDef[]) => list.filter((x) => f[x.id] != null).length;
  const advKeys = Object.keys(f).filter((k) => k.startsWith("adv:"));
  const total = Object.keys(f).length;
  const many = dynamicOptions.subtypes.length > 14;
  const subtypes = (f.subtypes as string[] | undefined) ?? [];
  const clear = () => Object.keys(f).forEach((k) => setFilter(k, undefined));

  const row = (x: FieldDef) => {
    const hint = hintFor(x); const val = valueOf(x); const slide = x.control === "slider" || x.control === "range";
    return (
      <div key={x.id} className={cn(x.control === "switch" && "flex items-center justify-between gap-3")}>
        <div className={cn("flex min-h-6 items-center gap-1.5", x.control !== "switch" && (slide ? "mb-3.5" : "mb-2.5"))}>
          <p title={x.label} className={cn("text-[13.5px] font-bold leading-6 text-ink/85", x.control !== "switch" && "min-w-0 truncate")}>{x.label}</p>
          {hint && <InfoTip text={hint} />}
          {slide && (val
            ? <span title={fullValue(x)} className="mr-auto inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-cobalt-soft pr-2.5 pl-1 text-[12px] font-extrabold tabular-nums text-cobalt-deep">{val}
                <button type="button" aria-label={`پاک کردن ${x.label}`} onClick={() => setFilter(x.id, undefined)} className="grid size-4 place-items-center rounded-full text-cobalt-deep/60 hover:bg-cobalt hover:text-white"><CloseCircle size={14} variant="Bold" /></button></span>
            : <span className="mr-auto shrink-0 text-[12px] font-semibold text-muted-foreground">همه</span>)}
        </div>
        {x.id === "cities" ? <CityPicker route={route.id} provinces={criteria.provinces} />
          : <FieldControl bare field={x.id === "subtypes" && many ? { ...x, control: "multi-combobox" } : x} value={f[x.id]} onChange={(v) => setFilter(x.id, v)} options={dynamicOptions[x.id]} />}
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={150}>
    <div className={className}>
      <div className="flex items-center gap-1.5 pb-1">
        <h2 className="shrink-0 text-[16px] font-black text-ink">فیلترهای بیشتر</h2>
        <span className="mr-auto flex items-center gap-1">
          {onSave && <SaveBadge onSave={onSave} saved={saved} />}
          {total > 0 && <Button variant="ghost" size="xs" type="button" onClick={clear} className="h-7 gap-1 px-2 text-[11.5px] font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Refresh2 size={13} />حذف همه</Button>}
        </span>
      </div>

      <Accordion key={route.id} type="single" collapsible defaultValue={fields.some((x) => x.section === "amount") ? "amount" : "project"}>
        {advancedSections.map((s) => {
          const list = fields.filter((x) => x.section === s.id);
          if (!list.length) return null;
          return <Section key={s.id} id={s.id} title={sectionName[s.id] ?? s.name} count={activeIn(list)}>{list.map(row)}</Section>;
        })}
        {route.usesProjectGroups && (
          <Section id="advisory" title="پرسش‌های تخصصی" count={advKeys.length}><AdvisoryQuestions subtypes={subtypes} /></Section>
        )}
        {(profile.length > 0 || profileCard) && (
          <Section id="profile" title="درباره شما" count={activeIn(profile)} info="یک‌بار وارد کنید، همراه جست‌وجو ذخیره می‌شود.">
            {profile.map(row)}
            {/* پروفایل حرفه‌ای (ساخت سریع) آخرین مورد «درباره شما» */}
            {profileCard}
          </Section>
        )}
        {/* فیلترهای سریع: آخرین بخش فیلترهای اختیاری */}
        {quick && hasQuickFilters(route.id) && (
          <Section id="quick" title="فیلترهای سریع" count={0} info="با یک کلیک یک شرط رایج اضافه می‌شود، عدد کنار هر کدام، شمار پروژه‌هایی است که پس از زدنش می‌ماند.">{quick}</Section>
        )}
      </Accordion>
    </div>
    </TooltipProvider>
  );
}
