"use client";
// ایده ۱ «در یک جمله»: همه‌ی اطلاعات پایه در یک جمله‌ی فارسی؛ هر جای خالی یک انتخاب‌گر کوچک است و نتیجه زنده عوض می‌شود.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TickCircle } from "@/components/iconsax";
import { provinces } from "@/data/provinces";
import { convertAmount } from "@/data/routes";
import { listings } from "@/lib/listings";
import { rank } from "@/lib/match";
import { useStore } from "@/lib/store";
import type { RouteId, SearchCriteria } from "@/types";
import { cn, faNumber } from "@/lib/utils";
import { MiniResult } from "./shared";

const STOPS = [1, 2, 3, 5, 7, 10, 15, 20, 30, 40, 50, 75, 100, 150, 200, 300, 500];
const verbs: { id: RouteId; verb: string; wait: boolean }[] = [
  { id: "investor", verb: "در ساخت و توسعه‌ی پروژه شریک شوم", wait: true },
  { id: "contractor", verb: "اجرای پروژه را پیمانکاری کنم", wait: true },
  { id: "heritage", verb: "یک بنای تاریخی را احیا کنم", wait: true },
  { id: "buyer", verb: "زمین یا ملک بخرم", wait: false },
  { id: "lessee", verb: "ملکی برای کارم اجاره کنم", wait: false },
  { id: "fund", verb: "در یک صندوق سهم بخرم", wait: false },
];
const horizons: { v: number | null; label: string }[] = [
  { v: 3, label: "۳ سال" }, { v: 5, label: "۵ سال" }, { v: 7, label: "۷ سال" }, { v: 10, label: "۱۰ سال" }, { v: null, label: "هر قدر که لازم باشد" },
];

function Slot({ label, children, className }: { label: React.ReactNode; children: (close: () => void) => React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="plain" size="auto"
          className="mx-1 inline h-auto whitespace-normal rounded-xl border-b-[2.5px] border-dashed border-ink/30 bg-white/60 px-2.5 pb-0.5 align-baseline text-[0.8em] font-black leading-[1.7] text-ink transition-colors hover:border-coral hover:bg-white data-[state=open]:border-solid data-[state=open]:border-ink data-[state=open]:bg-white">
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center" sideOffset={10} className={cn("w-80 rounded-2xl p-3", className)}>{children(() => setOpen(false))}</PopoverContent>
    </Popover>
  );
}

function Option({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <Button type="button" variant="plain" size="auto" onClick={onClick}
      className={cn("flex h-11 w-full items-center justify-between rounded-xl px-3 text-[14px] font-bold", on ? "bg-ink text-white" : "text-ink hover:bg-muted")}>
      {children}{on && <TickCircle size={18} variant="Bold" />}
    </Button>
  );
}

export function SentenceIdea() {
  const router = useRouter();
  const [route, setRoute] = useState<RouteId>("investor");
  const [amount, setAmount] = useState(50);
  const [picked, setPicked] = useState<string[]>([]);
  const [horizon, setHorizon] = useState<number | null>(5);
  const v = verbs.find((x) => x.id === route)!;

  const criteria = useMemo<SearchCriteria>(() => ({
    route, groups: [], provinces: route === "fund" ? [] : picked,
    amount: convertAmount([1, amount], "investor", route),
    filters: v.wait && horizon ? { horizon } : {},
  }), [route, picked, amount, horizon, v.wait]);
  const ranked = useMemo(() => rank(listings, criteria), [criteria]);
  const fit = ranked.filter((r) => r.score >= 50);

  const go = () => {
    const s = useStore.getState();
    s.setCriteria(criteria); s.setStarted(true);
    router.push("/opportunities");
  };
  const where = picked.length === 0 ? "هر جای ایران" : picked.length <= 2 ? picked.join(" یا ") : `${picked.slice(0, 2).join("، ")} و ${faNumber(picked.length - 2)} استان دیگر`;

  return (
    <div className="rounded-[2rem] border border-border bg-[linear-gradient(180deg,#fff,#f7f9fc)] p-10">
      <p className="text-[2rem] font-bold leading-[2.35] text-ink/80 text-balance">
        من حدود
        <Slot label={`${faNumber(amount)} میلیارد تومان`}>
          {() => (
            <div className="space-y-4 p-1">
              <p className="text-[13px] font-bold text-muted-foreground">سرمایه‌ای که می‌توانید بگذارید</p>
              <p className="text-2xl font-black text-ink">{faNumber(amount)} <span className="text-sm font-bold text-muted-foreground">میلیارد تومان</span></p>
              <Slider dir="rtl" min={0} max={STOPS.length - 1} step={1} value={[STOPS.indexOf(amount)]} onValueChange={([i]) => setAmount(STOPS[i])} aria-label="مبلغ" />
              <div className="flex flex-wrap gap-1.5">
                {[10, 30, 50, 100, 300].map((x) => (
                  <Button key={x} type="button" variant="plain" size="auto" onClick={() => setAmount(x)} className={cn("h-8 rounded-full border px-3 text-[12.5px] font-bold", amount === x ? "border-ink bg-ink text-white" : "border-border text-ink hover:border-ink/30")}>{faNumber(x)} میلیارد</Button>
                ))}
              </div>
            </div>
          )}
        </Slot>
        سرمایه دارم و می‌خواهم
        <Slot label={v.verb}>
          {(close) => <div className="space-y-1">{verbs.map((x) => <Option key={x.id} on={x.id === route} onClick={() => { setRoute(x.id); close(); }}>{x.verb}</Option>)}</div>}
        </Slot>
        {route !== "fund" && <> در
          <span className="whitespace-nowrap"><Slot label={where} className="w-72 p-0">
            {() => (
              <Command dir="rtl" className="rounded-2xl">
                <CommandInput placeholder="جست‌وجوی استان" />
                <CommandList className="max-h-72">
                  <CommandEmpty>استانی پیدا نشد.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem onSelect={() => setPicked([])} className="justify-between rounded-xl font-bold">هر جای ایران{picked.length === 0 && <TickCircle size={17} variant="Bold" />}</CommandItem>
                    {provinces.map((p) => { const on = picked.includes(p); return (
                      <CommandItem key={p} value={p} onSelect={() => setPicked(on ? picked.filter((x) => x !== p) : [...picked, p])} className="justify-between rounded-xl font-semibold">
                        {p}{on && <TickCircle size={17} variant="Bold" />}
                      </CommandItem>); })}
                  </CommandGroup>
                </CommandList>
              </Command>
            )}
          </Slot></span>
        </>}
        {v.wait ? <>{route === "fund" ? "،" : ""} و برای برگشت پولم تا
          <Slot label={horizons.find((h) => h.v === horizon)!.label}>
            {(close) => <div className="space-y-1">{horizons.map((h) => <Option key={String(h.v)} on={h.v === horizon} onClick={() => { setHorizon(h.v); close(); }}>{h.label}</Option>)}</div>}
          </Slot>
          صبر می‌کنم.</> : "."}
      </p>

      <div className="mt-8 grid grid-cols-[15rem_1fr] items-start gap-8 border-t border-dashed border-border pt-8">
        <div>
          <div className="relative h-[4.5rem] overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p key={fit.length} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="text-[3.6rem] font-black leading-none text-ink tabular-nums">{faNumber(fit.length)}</motion.p>
            </AnimatePresence>
          </div>
          <p className="mt-1 text-[14px] font-bold leading-7 text-muted-foreground">پروژه با این جمله جور است</p>
          <Button type="button" onClick={go} className="mt-5 h-12 gap-2 rounded-full px-6 font-extrabold">دیدن همه نتیجه‌ها<ArrowLeft size={18} /></Button>
        </div>
        <div className="space-y-2.5">
          {fit.slice(0, 3).map((r) => <MiniResult key={r.listing.id} l={r.listing} score={r.score} />)}
          {fit.length === 0 && <p className="rounded-2xl border border-dashed border-border p-6 text-[14px] font-semibold leading-7 text-muted-foreground">با این جمله پروژه‌ای پیدا نشد. مبلغ را بیشتر کنید یا «هر جای ایران» را انتخاب کنید.</p>}
        </div>
      </div>
    </div>
  );
}
