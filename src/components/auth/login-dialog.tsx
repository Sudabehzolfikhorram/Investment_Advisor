"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Mobile, ShieldTick } from "@/components/iconsax";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlgoPattern } from "@/components/brand/algo-pattern";
import { useStore } from "@/lib/store";
import { faDigits } from "@/lib/utils";

const toEn = (s: string) => s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/\D/g, "");

/** ورود ساده: موبایل + کد یکبار مصرف. نمایشی است؛ هر کد پنج‌رقمی پذیرفته می‌شود. */
export function LoginDialog() {
  const { loginOpen, closeLogin, login, pending, saveProfile } = useStore();
  const [step, setStep] = useState<"mobile" | "code">("mobile");
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const reason = pending?.type === "save-listing" ? "برای ذخیره این پروژه" : pending?.type === "save-criteria" ? "برای ذخیره شرایط شما" : "برای دسترسی به ذخیره‌شده‌ها";
  const validMobile = /^09\d{9}$/.test(mobile);

  const finish = () => {
    const done = login(mobile);
    if (done?.type === "save-criteria") { saveProfile("شرایط من"); toast.success("شرایط شما ذخیره شد. دفعه بعد لازم نیست دوباره وارد کنید."); }
    else if (done?.type === "save-listing") toast.success("پروژه در ذخیره‌شده‌ها قرار گرفت.");
    else toast.success("خوش آمدید.");
    setStep("mobile"); setCode(""); setMobile("");
  };

  return (
    <Dialog open={loginOpen} onOpenChange={(o) => { if (!o) { closeLogin(); setStep("mobile"); setCode(""); } }}>
      <DialogContent className="overflow-hidden rounded-3xl border-white/70 bg-white/90 p-0 backdrop-blur-2xl sm:max-w-md">
        <div className="relative overflow-hidden bg-deep px-7 pb-7 pt-9 text-white">
          <AlgoPattern className="inset-0 size-full text-white/20" fade="left" scale={0.6} />
          <span className="relative grid size-12 place-items-center rounded-2xl bg-white/15">{step === "mobile" ? <Mobile size={24} variant="Bulk" /> : <ShieldTick size={24} variant="Bulk" />}</span>
          <DialogHeader className="relative mt-4 text-right">
            <DialogTitle className="text-xl font-extrabold">{step === "mobile" ? "ورود با شماره موبایل" : "کد تأیید را وارد کنید"}</DialogTitle>
            <DialogDescription className="text-white/75">
              {step === "mobile" ? `${reason} فقط شماره موبایل لازم است. نام و رمز نمی‌خواهیم.` : `کد پنج‌رقمی به ${faDigits(mobile)} فرستاده شد.`}
            </DialogDescription>
          </DialogHeader>
        </div>
        <form className="space-y-4 p-7" onSubmit={(e) => { e.preventDefault(); if (step === "mobile") { if (validMobile) setStep("code"); } else if (code.length === 5) finish(); }}>
          {step === "mobile" ? (
            <Input autoFocus dir="ltr" inputMode="numeric" placeholder="09xx xxx xxxx" value={mobile} onChange={(e) => setMobile(toEn(e.target.value).slice(0, 11))} className="h-13 rounded-2xl text-center text-lg font-bold tracking-widest" aria-label="شماره موبایل" />
          ) : (
            <Input autoFocus dir="ltr" inputMode="numeric" placeholder="— — — — —" value={code} onChange={(e) => setCode(toEn(e.target.value).slice(0, 5))} className="h-13 rounded-2xl text-center text-2xl font-extrabold tracking-[0.6em]" aria-label="کد تأیید" />
          )}
          <Button type="submit" disabled={step === "mobile" ? !validMobile : code.length !== 5} className="h-12 w-full rounded-2xl text-base font-bold">
            {step === "mobile" ? "دریافت کد" : "ورود"}
          </Button>
          {step === "code" && <Button variant="plain" size="auto" type="button" onClick={() => setStep("mobile")} className="w-full text-center text-sm text-muted-foreground hover:text-primary">ویرایش شماره</Button>}
          <p className="text-center text-xs text-muted-foreground">نسخه نمایشی: هر کد پنج‌رقمی پذیرفته می‌شود.</p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
