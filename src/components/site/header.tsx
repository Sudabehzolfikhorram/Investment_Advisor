"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArchiveTick, Login, MagicStar, ProfileCircle } from "@/components/iconsax";
import { Logo } from "@/components/brand/algo-pattern";
import { Button } from "@/components/ui/button";
import { useHydrated, useStore } from "@/lib/store";
import { cn, faDigits, faNumber } from "@/lib/utils";

const links = [
  { href: "/opportunities", label: "پروژه‌ها" },
  { href: "/assistant", label: "دستیار", icon: MagicStar },
  { href: "/saved", label: "ذخیره‌شده‌ها", icon: ArchiveTick },
];

export function Header({ overlay = false }: { overlay?: boolean }) {
  const path = usePathname();
  const hydrated = useHydrated();
  const { user, saved, openLogin, logout } = useStore();
  return (
    <header className={cn("z-40 w-full", overlay ? "absolute inset-x-0 top-0" : "sticky top-0")}>
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <nav className={cn("flex h-16 items-center justify-between gap-4 rounded-full px-3 pr-5", overlay ? "glass-dark text-white" : "glass")}>
          <Link href="/" aria-label="صفحه نخست"><Logo light={overlay} /></Link>
          <ul className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={cn("flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors", overlay ? "text-white/85 hover:bg-white/10 hover:text-white" : "text-ink/70 hover:bg-primary/5 hover:text-primary", path.startsWith(l.href) && (overlay ? "bg-white/15 text-white" : "bg-primary/10 text-primary"))}>
                  {l.icon && <l.icon size={17} variant="Bulk" />}{l.label}
                  {l.href === "/saved" && hydrated && saved.length > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-sand px-1 text-[11px] font-bold text-ink">{faNumber(saved.length)}</span>}
                </Link>
              </li>
            ))}
          </ul>
          {hydrated && user ? (
            <button onClick={logout} title="خروج" className={cn("flex h-10 items-center gap-2 rounded-full px-4 text-sm font-bold", overlay ? "bg-white text-ink" : "bg-ink text-white")}>
              <ProfileCircle size={20} variant="Bulk" /><span dir="ltr">{faDigits(user.mobile)}</span>
            </button>
          ) : (
            <Button onClick={() => openLogin()} className={cn("h-10 rounded-full px-5 font-bold", overlay ? "bg-white text-ink hover:bg-white/90" : "bg-ink text-white hover:bg-ink/90")}>
              <Login size={18} /> ورود
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto mt-24 max-w-7xl px-4 pb-10 sm:px-6">
      <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
        <Logo />
        <p>همه پروژه‌ها، مبالغ و دوره‌ها نمونه و فرضی‌اند و تعهد پرداخت یا تضمین سود نیستند.</p>
        <nav className="flex gap-5 md:hidden">{links.map((l) => <Link key={l.href} href={l.href} className="font-semibold text-ink/70">{l.label}</Link>)}</nav>
      </div>
    </footer>
  );
}
