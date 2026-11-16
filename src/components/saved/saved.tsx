"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LegacyTool, type ToolSection } from "@/components/tools/engine";

// بخش‌های فرم «اطلاعات حرفه‌ای من»، فیلدها همان فیلدهای نسخه مرجع‌اند و فقط دسته‌بندی شده‌اند
const profileSections: ToolSection[] = [
  { title: "معرفی و نقش حرفه‌ای", fields: ["name", "entity", "roles"] },
  { title: "حوزه و توان اجرایی", fields: ["province", "specialty", "capacity", "capital"] },
  { title: "گواهینامه یا صلاحیت مرتبط", fields: ["certificate", "certificateNo", "issuer", "expiry", "validity"], optional: true },
  { title: "سوابق و تجربه", fields: ["references"] },
];
import { toolById } from "@/data/tools";
import { ArchiveTick, ArrowLeft, Convertshape2, Login, Lovely, Setting4, Trash, Notification, UserEdit } from "@/components/iconsax";
import Image from "next/image";
import { CompareTray } from "@/components/compare/tray";
import { hasAnyCriteria } from "@/lib/criteria";
import { AddSearchButton } from "./add-search";
import { ProProfileCard } from "@/components/search/pro-profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Header, Footer } from "@/components/site/header";
import { NodeMark } from "@/components/brand/algo-pattern";
import { ListingCard } from "@/components/listing/listing-card";
import { routeIcons } from "@/components/icons";
import { routes } from "@/data/routes";
import { describeCriteria } from "@/lib/criteria";
import { listings } from "@/lib/listings";
import { matchListing, rank } from "@/lib/match";
import { useHydrated, useStore } from "@/lib/store";
import { cn, faNumber } from "@/lib/utils";

/** فیلترهای من: فهرست فیلترها در راست (با + برای افزودن)، پروژه‌های فیلتر انتخاب‌شده همین‌جا در چپ */
function CriteriaBoard() {
  const router = useRouter();
  const { profiles, applyProfile, removeProfile } = useStore();
  const [sel, setSel] = useState<string | null>(null);
  const cur = profiles.find((p) => p.id === sel) ?? profiles[0];
  const [limit, setLimit] = useState(6);
  const data = useMemo(() => Object.fromEntries(profiles.map((p) => { const m = rank(listings, p.criteria).filter((r) => r.score >= 50); return [p.id, { m, fresh: m.filter((r) => r.listing.publishedAt > p.lastSeenAt).length }]; })), [profiles]);
  useEffect(() => setLimit(6), [cur?.id]);
  const d = cur ? data[cur.id] : null;
  return (
    <div className="grid grid-cols-[22rem_minmax(0,1fr)] items-start gap-6">
      <aside className="surface sticky top-24 rounded-[1.75rem] p-3">
        <div className="flex items-center justify-between gap-3 px-2 pb-3 pt-1.5">
          <p className="text-[15px] font-black text-ink">فیلترهای من <span className="text-[12.5px] font-bold text-muted-foreground">{faNumber(profiles.length)}</span></p>
          <AddSearchButton variant="plus" />
        </div>
        {profiles.length ? (
          <ul className="space-y-1.5">
            {profiles.map((p) => { const route = routes.find((r) => r.id === p.criteria.route)!; const I = routeIcons[route.id]; const on = p.id === cur?.id; const chips = describeCriteria(p.criteria).map((c) => c.label);
              return (
                <li key={p.id}>
                  <button type="button" onClick={() => setSel(p.id)} aria-pressed={on}
                    className={cn("flex w-full items-center gap-3 rounded-2xl p-3 text-right transition-colors", on ? "bg-cobalt-soft/70 ring-1 ring-cobalt/25" : "hover:bg-ink/[0.03]")}>
                    <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", on ? "bg-cobalt text-white" : "bg-muted text-ink/70")}><I size={19} variant="Bulk" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-extrabold text-ink">{p.name}</span>
                      <span className="block truncate text-[11.5px] font-semibold text-muted-foreground">{chips.length ? chips.join(" · ") : route.name}</span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-[12px] font-black tabular-nums text-ink/70">{faNumber(data[p.id].m.length)}</span>
                      {data[p.id].fresh > 0 && <span className="rounded-full bg-cobalt px-1.5 text-[10.5px] font-extrabold text-white">{faNumber(data[p.id].fresh)} تازه</span>}
                    </span>
                  </button>
                </li>
              ); })}
          </ul>
        ) : <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-[13px] font-semibold leading-7 text-muted-foreground">هنوز فیلتری ندارید. با + مسیر، حوزه، استان و بودجه را بگویید تا پروژه‌هایش همین‌جا بیاید.</p>}
      </aside>

      {cur && d ? (
        <section className="min-w-0">
          <div className="surface flex items-center gap-4 rounded-[1.75rem] p-5">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-lg font-black text-ink">{cur.name}{d.fresh > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-cobalt px-2.5 py-0.5 text-[11px] font-extrabold text-white"><Notification size={12} variant="Bold" />{faNumber(d.fresh)} تازه</span>}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="outline" className="border-black/[0.06] bg-white px-3 py-1 font-bold text-ink/80">{routes.find((r) => r.id === cur.criteria.route)?.name}</Badge>
                {describeCriteria(cur.criteria).map((c) => <Badge key={c.key} variant="outline" className="border-cobalt/20 bg-cobalt-soft/60 px-3 py-1 font-bold text-cobalt-deep">{c.label}</Badge>)}
              </div>
            </div>
            <Button variant="plain" size="auto" type="button" aria-label="حذف این فیلتر" title="حذف این فیلتر" onClick={() => { removeProfile(cur.id); setSel(null); }} className="grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash size={18} /></Button>
            <Button type="button" onClick={() => { applyProfile(cur.id); router.push("/opportunities"); }} className="h-11 shrink-0 gap-2 rounded-full px-5 font-extrabold">در صفحه پروژه‌ها<ArrowLeft size={16} /></Button>
          </div>
          <p className="mb-4 mt-6 text-[14px] font-extrabold text-ink">{faNumber(d.m.length)} پروژه متناسب با این فیلتر</p>
          {d.m.length ? (
            <>
              <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">{d.m.slice(0, limit).map((r, i) => <ListingCard key={r.listing.id} listing={r.listing} score={r.score} reasons={r.reasons} index={i} comparable />)}</div>
              {d.m.length > limit && <div className="mt-6 flex justify-center"><Button variant="outline" onClick={() => setLimit((n) => n + 6)} className="h-11 rounded-full bg-white px-6 font-bold shadow-none hover:border-ink/25 hover:text-ink">نمایش بیشتر ({faNumber(d.m.length - limit)})</Button></div>}
            </>
          ) : <Empty text="فعلاً پروژه‌ای با این فیلتر نیست، پروژه‌های تازه‌اش همین‌جا نشان داده می‌شود." cta="دیدن همه پروژه‌ها" />}
        </section>
      ) : (
        <div className="grid min-h-[20rem] place-items-center rounded-[2rem] border border-dashed border-border p-6 text-center">
          <span><span className="block text-[15px] font-extrabold text-ink">فیلتر تازه بسازید</span><span className="mt-1 block text-[13px] leading-7 text-muted-foreground">با دکمه + یک فیلتر بسازید و ذخیره کنید، پروژه‌هایش همین‌جا می‌آید.</span><span className="mt-4 inline-block"><AddSearchButton /></span></span>
        </div>
      )}
    </div>
  );
}

export function Saved() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { user, saved, profiles, openLogin, criteria, started, setCompare } = useStore();
  type Tab = "projects" | "criteria" | "profile";
  const [tab, setTab] = useState<Tab>("projects");
  // بعد از ورود، پیشنهاد «ذخیره اطلاعات» مستقیم به برگه اطلاعات حرفه‌ای می‌آورد
  useEffect(() => {
    const read = () => { try { const t = sessionStorage.getItem("hs-saved-tab"); if (t) { setTab(t as Tab); sessionStorage.removeItem("hs-saved-tab"); } } catch {} };
    read(); window.addEventListener("hs-saved-tab", read); return () => window.removeEventListener("hs-saved-tab", read);
  }, []);
  const items = listings.filter((l) => saved.includes(l.id));
  // تطابق هر پروژه ذخیره‌شده با شرایط فعلی شما، تا ترتیب علاقه‌مندی‌ها به تصمیم نزدیک‌تر باشد
  const fits = started && hasAnyCriteria(criteria);
  const scored = items.map((l) => ({ l, score: fits ? matchListing(l, criteria).score : undefined })).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const projects = items.filter((l) => l.kind === "project");
  const fresh = profiles.reduce((n, p) => n + rank(listings, p.criteria).filter((r) => r.score >= 50 && r.listing.publishedAt > p.lastSeenAt).length, 0);
  const tabs = [["projects", "پروژه‌های موردعلاقه", Lovely, items.length], ["criteria", "فیلترهای ذخیره‌شده", Setting4, profiles.length], ["profile", "پروفایل حرفه‌ای", UserEdit, null]] as const;
  const profileTool = toolById("ma-profile")!;
  return (
    <>
      <Header />
      <main className="focus-blur relative mx-auto min-h-[70dvh] max-w-7xl px-4 pt-10 sm:px-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 text-[13px] font-extrabold text-ink/55"><NodeMark className="text-primary-ink" />حساب شما</span>
            <h1 className="mt-2 text-3xl font-black text-ink sm:text-4xl">علاقه‌مندی‌ها</h1>
            <p className="mt-2 text-[15px] text-muted-foreground">پروژه‌هایی که نشان کرده‌اید و فیلترهایی که پروژه‌های تازه‌شان را دنبال می‌کنید.</p>
          </div>
          <AddSearchButton />
        </div>

        {hydrated && !user ? (
          <Card className="surface mt-8 grid place-items-center gap-0 rounded-[2rem] px-6 py-20 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-muted text-ink"><ArchiveTick size={30} variant="Bulk" /></span>
            <h2 className="mt-5 text-xl font-extrabold text-ink">برای دیدن علاقه‌مندی‌ها وارد شوید.</h2>
            <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">پروژه‌ها و جست‌وجوهایی که ذخیره می‌کنید با شماره موبایل شما نگه داشته می‌شود.</p>
            <Button variant="plain" size="auto" type="button" onClick={() => openLogin()} className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 font-extrabold text-white hover:bg-teal-700"><Login size={18} />ورود با موبایل</Button>
          </Card>
        ) : hydrated && (
          <>
            <Tabs dir="rtl" value={tab} onValueChange={(v) => setTab(v as Tab)} className="mt-7 gap-7">
              <div className="flex items-center justify-between gap-4">
              <TabsList className="surface h-auto bg-white rounded-full p-1 group-data-[orientation=horizontal]/tabs:h-auto">
                {tabs.map(([k, label, I, n]) => (
                  <TabsTrigger key={k} value={k} className="group/t h-auto gap-2 rounded-full border-0 px-4 py-2.5 text-sm font-bold text-ink/70 data-[state=active]:bg-cobalt data-[state=active]:text-white sm:px-5">
                    <I size={17} variant="Bulk" />{label}{n != null && <Badge className="h-5 min-w-5 bg-ink/10 px-1 text-[11px] text-ink group-data-[state=active]/t:bg-white">{faNumber(n)}</Badge>}
                    {k === "criteria" && fresh > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-cobalt-soft px-2 py-0.5 text-[10.5px] font-extrabold text-cobalt-deep group-data-[state=active]/t:bg-white">{faNumber(fresh)} تازه</span>}
                  </TabsTrigger>
                ))}
              </TabsList>
              </div>
              <TabsContent value="projects">
                {items.length ? <>
                  {/* از علاقه‌مندی به تصمیم: کنار هم گذاشتن پروژه‌های نشان‌شده با یک کلیک */}
                  {projects.length >= 2 && (
                    <div className="surface mb-6 flex items-center gap-4 rounded-[1.75rem] p-4 pr-5">
                      <span className="flex shrink-0 -space-x-3 space-x-reverse">
                        {projects.slice(0, 4).map((l, i) => <span key={l.id} className="relative size-11 overflow-hidden rounded-xl ring-2 ring-white" style={{ zIndex: 4 - i }}><Image src={l.image} alt="" fill sizes="44px" className="object-cover" /></span>)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-extrabold text-ink">از علاقه‌مندی به تصمیم</p>
                        <p className="text-[13px] font-semibold leading-6 text-muted-foreground">{projects.length > 4 ? `${faNumber(4)} پروژه اول را کنار هم ببینید، یا روی «مقایسه» هر کارت بزنید تا خودتان انتخاب کنید.` : `${faNumber(projects.length)} پروژه نشان‌شده را کنار هم ببینید و از دستیار درباره‌شان بپرسید.`}</p>
                      </div>
                      <Button type="button" onClick={() => { setCompare(scored.filter((x) => x.l.kind === "project").slice(0, 4).map((x) => x.l.id)); router.push("/compare"); }} className="h-11 shrink-0 gap-2 rounded-full px-5 font-extrabold"><Convertshape2 size={18} />مقایسه {faNumber(Math.min(projects.length, 4))} پروژه</Button>
                    </div>
                  )}
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{scored.map(({ l, score }, i) => <ListingCard key={l.id} listing={l} index={i} score={score} comparable />)}</div>
                  <CompareTray />
                </> : <Empty text="هنوز پروژه‌ای ذخیره نکرده‌اید." cta="دیدن پروژه‌ها" />}
              </TabsContent>
              <TabsContent value="criteria">
                <CriteriaBoard />
              </TabsContent>
              <TabsContent value="profile">
                <div className="grid grid-cols-[1fr_19rem] items-start gap-7">
                  <Card className="surface block gap-0 rounded-[2rem] p-8 shadow-none">{tab === "profile" && <LegacyTool opener={profileTool.opener} root={profileTool.root} sections={profileSections} />}</Card>
                  <Card className="surface sticky top-24 gap-4 rounded-[1.75rem] p-6 shadow-none">
                    <h2 className="text-base font-extrabold text-ink">بعد از ثبت پروفایل</h2>
                    <ol className="space-y-3.5">
                      {[["یک‌بار ثبت می‌کنید", "نقش، استان، تخصص و سرمایه‌ی قابل تخصیص روی همین دستگاه می‌ماند."],
                        ["در فیلترها می‌بینید", "بالای فرم شروع و ستون فیلترهای صفحه پروژه‌ها، نقش، استان و سرمایه‌تان جدا جدا روی نتایج روشن یا خاموش می‌شود."],
                        ["پروژه‌های متناسب را دنبال می‌کنید", "همان شرایط را به‌عنوان جست‌وجو ذخیره کنید تا پروژه‌های تازه‌اش اینجا بیاید."]].map(([t, d], i) => (
                        <li key={t} className="flex gap-3">
                          <span className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-[12px] font-black text-ink">{faNumber(i + 1)}</span>
                          <span><span className="block text-[13px] font-extrabold text-ink">{t}</span><span className="block text-[12px] leading-6 text-muted-foreground">{d}</span></span>
                        </li>
                      ))}
                    </ol>
                    <ProProfileCard onApplied={() => router.push("/opportunities")} />
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

function Empty({ text, cta }: { text: string; cta: string }) {
  return (
    <div className="grid place-items-center rounded-[2rem] border border-dashed border-border px-6 py-16 text-center">
      <p className="max-w-md text-sm font-semibold leading-7 text-muted-foreground">{text}</p>
      <Link href="/opportunities" className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-extrabold text-white hover:bg-teal-700">{cta}<ArrowLeft size={16} /></Link>
    </div>
  );
}
