"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { ArchiveTick, ArrowLeft, Login, Setting4, Trash, Notification } from "@/components/iconsax";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Header, Footer } from "@/components/site/header";
import { AlgoPattern, NodeMark } from "@/components/brand/algo-pattern";
import { ListingCard } from "@/components/listing/listing-card";
import { routeIcons } from "@/components/icons";
import { routes } from "@/data/routes";
import { projectGroups } from "@/data/taxonomy";
import { listings } from "@/lib/listings";
import { rank } from "@/lib/match";
import { useHydrated, useStore } from "@/lib/store";
import type { SavedProfile } from "@/types";
import { faNumber } from "@/lib/utils";

function ProfileCard({ p, i }: { p: SavedProfile; i: number }) {
  const router = useRouter();
  const { setCriteria, touchProfile, removeProfile } = useStore();
  const route = routes.find((r) => r.id === p.criteria.route)!;
  const I = routeIcons[route.id];
  const matches = rank(listings, p.criteria).filter((r) => r.score >= 50);
  const fresh = matches.filter((r) => r.listing.publishedAt > p.lastSeenAt).length;
  const chips = [
    ...p.criteria.groups.map((g) => projectGroups.find((x) => x.id === g)?.name ?? g),
    ...p.criteria.provinces,
    p.criteria.amount && route.amount ? `${faNumber(p.criteria.amount[0])} تا ${faNumber(p.criteria.amount[1])} ${route.amount.unit}` : null,
    Object.keys(p.criteria.filters).length ? `${faNumber(Object.keys(p.criteria.filters).length)} فیلتر پیشرفته` : null,
  ].filter(Boolean) as string[];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}><Card className="glass relative h-full gap-5 overflow-hidden rounded-[2rem] p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><I size={24} variant="Bulk" /></span>
          <div><h3 className="text-lg font-extrabold text-ink">{p.name}</h3><p className="text-xs font-semibold text-muted-foreground">{route.name}</p></div>
        </div>
        <Button variant="plain" size="auto" type="button" aria-label="حذف شرایط" onClick={() => removeProfile(p.id)} className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash size={17} /></Button>
      </div>
      <div className="flex flex-wrap gap-1.5">{chips.length ? chips.map((c) => <Badge key={c} variant="outline" className="border-black/[0.06] bg-white px-3 py-1 font-bold text-ink/80">{c}</Badge>) : <span className="text-xs text-muted-foreground">بدون محدودیت</span>}</div>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-dashed border-border pt-4">
        <span className="text-sm font-bold text-ink">{faNumber(matches.length)} پروژه متناسب
          {fresh > 0 && <span className="mr-2 inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-0.5 text-[11px] font-extrabold text-ink"><Notification size={12} variant="Bold" />{faNumber(fresh)} تازه</span>}</span>
        <Button variant="plain" size="auto" type="button" onClick={() => { setCriteria(p.criteria); touchProfile(p.id); router.push("/opportunities"); }} className="group inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-white hover:bg-deep">نمایش <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /></Button>
      </div>
    </Card></motion.div>
  );
}

export function Saved() {
  const hydrated = useHydrated();
  const { user, saved, profiles, openLogin } = useStore();
  const [tab, setTab] = useState<"projects" | "criteria">("projects");
  const items = listings.filter((l) => saved.includes(l.id));
  const tabs = [["projects", "پروژه‌های ذخیره‌شده", ArchiveTick, items.length], ["criteria", "شرایط ذخیره‌شده", Setting4, profiles.length]] as const;
  return (
    <>
      <Header />
      <main className="relative mx-auto min-h-[70dvh] max-w-7xl px-4 pt-10 sm:px-6">
        <AlgoPattern className="-top-20 left-0 h-80 w-[36rem] text-primary/[0.08]" fade="radial" scale={0.8} />
        <span className="inline-flex items-center gap-2 text-[13px] font-extrabold text-primary"><NodeMark />حساب شما</span>
        <h1 className="mt-2 text-3xl font-black text-ink sm:text-4xl">ذخیره‌شده‌ها</h1>

        {hydrated && !user ? (
          <Card className="glass mt-8 grid place-items-center gap-0 rounded-[2rem] px-6 py-20 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-primary/10 text-primary"><ArchiveTick size={30} variant="Bulk" /></span>
            <h2 className="mt-5 text-xl font-extrabold text-ink">برای دیدن ذخیره‌شده‌ها وارد شوید.</h2>
            <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">پروژه‌ها و شرایطی که ذخیره می‌کنید با شماره موبایل شما نگه داشته می‌شود.</p>
            <Button variant="plain" size="auto" type="button" onClick={() => openLogin()} className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 font-extrabold text-white hover:bg-deep"><Login size={18} />ورود با موبایل</Button>
          </Card>
        ) : hydrated && (
          <>
            <Tabs dir="rtl" value={tab} onValueChange={(v) => setTab(v as "projects" | "criteria")} className="mt-7 gap-7">
              <TabsList className="glass h-auto rounded-full p-1 group-data-[orientation=horizontal]/tabs:h-auto">
                {tabs.map(([k, label, I, n]) => (
                  <TabsTrigger key={k} value={k} className="group/t h-auto gap-2 rounded-full border-0 px-4 py-2.5 text-sm font-bold text-ink/70 data-[state=active]:bg-ink data-[state=active]:text-white sm:px-5">
                    <I size={17} variant="Bulk" />{label}<Badge className="h-5 min-w-5 bg-ink/10 px-1 text-[11px] text-ink group-data-[state=active]/t:bg-sand">{faNumber(n)}</Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="projects">
                {items.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)}</div>
                  : <Empty text="هنوز پروژه‌ای ذخیره نکرده‌اید." cta="دیدن پروژه‌ها" />}
              </TabsContent>
              <TabsContent value="criteria">
                {profiles.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{profiles.map((p, i) => <ProfileCard key={p.id} p={p} i={i} />)}</div>
                  : <Empty text="هنوز شرایطی ذخیره نکرده‌اید. در صفحه پروژه‌ها، شرایطتان را وارد و ذخیره کنید." cta="وارد کردن شرایط" />}
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
    <div className="grid place-items-center rounded-[2rem] border border-dashed border-primary/30 px-6 py-16 text-center">
      <p className="max-w-md text-sm font-semibold leading-7 text-muted-foreground">{text}</p>
      <Link href="/opportunities" className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-extrabold text-white hover:bg-deep">{cta}<ArrowLeft size={16} /></Link>
    </div>
  );
}
