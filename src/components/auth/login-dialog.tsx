"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArchiveTick, Lock1, Mobile, Notification, ShieldTick, UserEdit } from "@/components/iconsax";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignaturePhoto } from "@/components/listing/signature-photo";
import { useStore } from "@/lib/store";
import { cn, faDigits } from "@/lib/utils";

const toEn = (s: string) => s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/\D/g, "");

const perks = [
  { I: ArchiveTick, t: "پروژه‌ها و جست‌وجوهایتان می‌مانند", d: "هر بار که برگردید، همان‌جا که بودید ادامه می‌دهید." },
  { I: UserEdit, t: "اطلاعات را یک بار وارد می‌کنید", d: "فرم‌های خدمات با اطلاعات ذخیره‌شده شما پر می‌شوند." },
  { I: Notification, t: "پروژه‌های تازه را زودتر می‌بینید", d: "پروژه‌های جدیدی که به شرایط شما می‌خورند جدا نشان داده می‌شوند." },
];

/** ورود ساده: موبایل و کد یکبار مصرف؛ هر کد پنج‌رقمی پذیرفته می‌شود. */
export function LoginDialog() {
  const { loginOpen, closeLogin, login, pending, saveProfile } = useStore();
  const [step, setStep] = useState<"mobile" | "code">("mobile");
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const [offer, setOffer] = useState(false);
  const reason = pending?.type === "save-listing" ? "برای ذخیره این پروژه" : pending?.type === "save-criteria" ? "برای ذخیره این جست‌وجو" : "برای دسترسی به ذخیره‌شده‌ها";
  const validMobile = /^09\d{9}$/.test(mobile);
  const router = useRouter();

  const finish = () => {
    const done = login(mobile);
    if (done?.type === "save-criteria") { saveProfile(done.name || "جست‌وجوی من"); toast.success("جست‌وجو ذخیره شد.", { description: "دفعه بعد از «جست‌وجوهای من» ادامه دهید." }); }
    else if (done?.type === "save-listing") toast.success("پروژه ذخیره شد.");
    else toast.success("خوش آمدید.");
    // بعد از ورود: پیشنهاد ذخیره اطلاعات، تا دفعه بعد لازم نباشد دوباره وارد شود
    let saved = false; try { saved = localStorage.getItem("hs-profile-offer") === "done"; } catch {}
    if (!saved) window.setTimeout(() => setOffer(true), 900);
    setStep("mobile"); setCode(""); setMobile("");
  };

  return (
    <>
      <Dialog open={loginOpen} onOpenChange={(o) => { if (!o) { closeLogin(); setStep("mobile"); setCode(""); } }}>
        <DialogContent className="grid grid-cols-[17rem_1fr] gap-0 overflow-hidden rounded-[2rem] bg-white p-0 sm:max-w-[46rem]">
          <SignaturePhoto src="/images/hero/office.jpg" alt="" sizes="300px" className="h-full min-h-[27rem]">
            <div className="absolute inset-x-0 bottom-0 space-y-4 p-6">
              {perks.map(({ I, t }) => (
                <p key={t} className="flex items-center gap-3 text-[13px] font-bold leading-6 text-white">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur"><I size={17} variant="Bulk" /></span>{t}
                </p>
              ))}
            </div>
          </SignaturePhoto>
          <div className="flex flex-col p-8 pt-10">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">{step === "mobile" ? <Mobile size={24} variant="Bulk" /> : <ShieldTick size={24} variant="Bulk" />}</span>
            <DialogTitle className="mt-5 text-right text-[22px] font-black leading-9 text-ink">{step === "mobile" ? "ورود با شماره موبایل" : "کد تأیید را وارد کنید"}</DialogTitle>
            <DialogDescription className="mt-1 text-right text-[13px] leading-7 text-muted-foreground">
              {step === "mobile" ? `${reason} فقط شماره موبایل لازم است؛ نام و رمز نمی‌خواهیم.` : `کد پنج‌رقمی به ${faDigits(mobile)} فرستاده شد.`}
            </DialogDescription>
            <form className="mt-7 space-y-3.5" onSubmit={(e) => { e.preventDefault(); if (step === "mobile") { if (validMobile) setStep("code"); } else if (code.length === 5) finish(); }}>
              {step === "mobile" ? (
                <label className="block">
                  <span className="mb-2 block text-[13px] font-bold text-ink">شماره موبایل</span>
                  <Input autoFocus dir="ltr" inputMode="numeric" placeholder="09xx xxx xxxx" value={mobile} onChange={(e) => setMobile(toEn(e.target.value).slice(0, 11))} className="h-13 rounded-2xl bg-white text-center text-lg font-bold tracking-widest shadow-none" aria-label="شماره موبایل" />
                </label>
              ) : <CodeBoxes value={code} onChange={setCode} />}
              <Button type="submit" disabled={step === "mobile" ? !validMobile : code.length !== 5} className="h-12 w-full rounded-2xl text-base font-bold">
                {step === "mobile" ? "دریافت کد" : "ورود"}
              </Button>
              {step === "code" && <Button variant="plain" size="auto" type="button" onClick={() => setStep("mobile")} className="w-full text-center text-sm font-semibold text-muted-foreground hover:text-primary">ویرایش شماره</Button>}
            </form>
            <p className="mt-auto flex items-center gap-2 pt-6 text-xs font-semibold text-muted-foreground"><Lock1 size={15} variant="Bulk" className="shrink-0 text-primary" />شماره شما فقط برای ورود استفاده می‌شود.</p>
          </div>
        </DialogContent>
      </Dialog>
      <SaveInfoDialog open={offer} onOpenChange={setOffer} onSave={() => {
        try { localStorage.setItem("hs-profile-offer", "done"); sessionStorage.setItem("hs-saved-tab", "profile"); } catch {}
        setOffer(false); window.dispatchEvent(new Event("hs-saved-tab")); router.push("/saved");
      }} />
    </>
  );
}

/** پنج خانه کد؛ یک ورودی واقعی روی خانه‌ها قرار دارد تا تایپ، چسباندن و پاک کردن طبیعی بماند */
function CodeBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [focus, setFocus] = useState(true);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div className="relative" dir="ltr">
      <div className="grid grid-cols-5 gap-2.5" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={cn("grid h-14 place-items-center rounded-2xl border bg-white text-2xl font-black text-ink transition-colors",
            focus && i === Math.min(value.length, 4) ? "border-primary ring-[3px] ring-primary/15" : value[i] ? "border-pine/25" : "border-border")}>{value[i] ? faDigits(value[i]) : ""}</span>
        ))}
      </div>
      <Input ref={ref} inputMode="numeric" autoComplete="one-time-code" value={value} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        onChange={(e) => onChange(toEn(e.target.value).slice(0, 5))} aria-label="کد تأیید"
        className="absolute inset-0 h-full w-full cursor-text border-0 bg-transparent text-transparent caret-transparent opacity-0 shadow-none focus-visible:ring-0" />
    </div>
  );
}

/** پیشنهاد بعد از ورود: اطلاعات را یک بار ذخیره کنید تا هر بار از اول وارد نکنید */
function SaveInfoDialog({ open, onOpenChange, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; onSave: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-[2rem] bg-white p-0 sm:max-w-[34rem] [&_[data-slot=dialog-close-x]]:bg-white/90">
        <div className="relative">
          <SignaturePhoto src="/images/hero/towers.jpg" alt="" sizes="560px" mark={false} className="h-36" />
          <span className="absolute bottom-0 right-8 grid size-16 translate-y-1/2 place-items-center rounded-[1.25rem] bg-white text-primary shadow-[0_18px_40px_-18px_rgb(8_59_55/0.5)]"><UserEdit size={30} variant="Bulk" /></span>
        </div>
        <div className="px-8 pb-8 pt-12">
          <DialogTitle className="text-right text-[22px] font-black leading-9 text-ink">اطلاعاتتان را یک بار ذخیره کنید</DialogTitle>
          <DialogDescription className="mt-1 text-right text-[13.5px] leading-7 text-muted-foreground">با چند پرسش کوتاه، اطلاعات حرفه‌ای شما ذخیره می‌شود و دفعه بعد لازم نیست از اول وارد کنید.</DialogDescription>
          <ul className="mt-6 space-y-3">
            {perks.slice(1).concat({ I: Lock1, t: "فقط روی همین دستگاه می‌ماند", d: "هر وقت خواستید از «ذخیره‌شده‌ها» ویرایش یا پاکش کنید." }).map(({ I, t, d }) => (
              <li key={t} className="flex items-start gap-3.5 rounded-2xl border border-border bg-[#f8faf9] p-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><I size={20} variant="Bulk" /></span>
                <span className="min-w-0"><b className="block text-sm font-extrabold leading-6 text-ink">{t}</b><span className="text-[12.5px] leading-6 text-muted-foreground">{d}</span></span>
              </li>
            ))}
          </ul>
          <div className="mt-7 flex items-center gap-3">
            <Button type="button" onClick={onSave} className="h-12 flex-1 gap-2 rounded-2xl text-base font-bold"><UserEdit size={19} variant="Bulk" />ذخیره اطلاعات</Button>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-12 rounded-2xl px-6 font-bold text-muted-foreground">بعداً</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
