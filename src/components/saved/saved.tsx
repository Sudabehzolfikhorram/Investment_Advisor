"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LegacyTool, type ToolSection } from "@/components/tools/engine";

// بخش‌های فرم «اطلاعات حرفه‌ای من»؛ فیلدها همان فیلدهای نسخه مرجع‌اند و فقط دسته‌بندی شده‌اند
const profileSections: ToolSection[] = [
  { title: "معرفی و نقش حرفه‌ای", fields: ["name", "entity", "roles"] },
  { title: "حوزه و توان اجرایی", fields: ["province", "specialty", "capacity", "capital"] },
  { title: "گواهینامه یا صلاحیت مرتبط", fields: ["certificate", "certificateNo", "issuer", "expiry", "validity"], optional: true },
  { title: "سوابق و تجربه", fields: ["references"] },
];
import { toolById } from "@/data/tools";
import { motion } from "motion/react";
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
import type { SavedProfile } from "@/types";
import { faNumber } from "@/lib/utils";

function ProfileCard({ p, i }: { p: SavedProfile; i: number }) {
  const router = useRouter();
  const { applyProfile, removeProfile } = useStore();
  const route = routes.find((r) => r.id === p.criteria.route)!;
  const I = routeIcons[route.id];
  const matches = rank(listings, p.criteria).filter((r) => r.score >= 50);
  const fresh = matches.filter((r) => r.listing.publishedAt > p.lastSeenAt).length;
  const chips = describeCriteria(p.criteria).map((c) => c.label);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}><Card className="surface relative h-full gap-5 overflow-hidden rounded-[2rem] p-6 shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-muted text-ink"><I size={24} variant="Bulk" /></span>
          <div><h3 className="text-lg font-extrabold text-ink">{p.name}</h3><p className="text-xs font-semibold text-muted-foreground">{route.name}</p></div>
        </div>
        <Button variant="plain" size="auto" type="button" aria-label="حذف جست‌وجو" onClick={() => removeProfile(p.id)} className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash size={17} /></Button>
      </div>
      <div className="flex flex-wrap gap-1.5">{chips.length ? chips.map((c) => <Badge key={c} variant="outline" className="border-black/[0.06] bg-white px-3 py-1 font-bold text-ink/80">{c}</Badge>) : <span className="text-xs text-muted-foreground">بدون فیلتر</span>}</div>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-dashed border-border pt-4">
        <span className="text-sm font-bold text-ink">{faNumber(matches.length)} پروژه متناسب
          {fresh > 0 && <span className="mr-2 inline-flex items-center gap-1 rounded-full bg-cobalt px-2.5 py-0.5 text-[11px] font-extrabold text-white"><Notification size={12} variant="Bold" />{faNumber(fresh)} تازه</span>}</span>
        <Button variant="plain" size="auto" type="button" onClick={() => { applyProfile(p.id); router.push("/opportunities"); }} className="group inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-white hover:bg-deep">نمایش <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /></Button>
      </div>
    </Card></motion.div>
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
  const tabs = [["projects", "پروژه‌های موردعلاقه", Lovely, items.length], ["criteria", "فیلترهای من", Setting4, profiles.length], ["profile", "پروفایل حرفه‌ای", UserEdit, null]] as const;
  const profileTool = toolById("ma-profile")!;
  return (
    <>
      <Header />
      <main className="relative mx-auto min-h-[70dvh] max-w-7xl px-4 pt-10 sm:px-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 text-[13px] font-extrabold text-ink/55"><NodeMark className="text-primary" />حساب شما</span>
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
            <Button variant="plain" size="auto" type="button" onClick={() => openLogin()} className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 font-extrabold text-white hover:bg-deep"><Login size={18} />ورود با موبایل</Button>
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
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"><AddSearchButton variant="tile" />{profiles.map((p, i) => <ProfileCard key={p.id} p={p} i={i} />)}</div>
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
      <Link href="/opportunities" className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-extrabold text-white hover:bg-deep">{cta}<ArrowLeft size={16} /></Link>
    </div>
  );
}
