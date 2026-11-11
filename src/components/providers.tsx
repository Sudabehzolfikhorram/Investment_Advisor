"use client";
import { Direction } from "radix-ui";
import { MotionConfig } from "motion/react";
import { Toaster } from "@/components/ui/sonner";
import { LoginDialog } from "@/components/auth/login-dialog";
import { SiteBackdrop } from "@/components/brand/site-backdrop";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Direction.Provider dir="rtl">
      <MotionConfig reducedMotion="user">
        <SiteBackdrop />
        {children}
        <LoginDialog />
        <Toaster position="bottom-center" />
      </MotionConfig>
    </Direction.Provider>
  );
}
