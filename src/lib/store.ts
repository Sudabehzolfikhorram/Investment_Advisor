"use client";
// وضعیت سمت کاربر (نمایشی): ورود، پروژه‌های ذخیره‌شده، شرایط ذخیره‌شده. در مرورگر نگه‌داری می‌شود.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FilterValue, SavedProfile, SearchCriteria } from "@/types";

export const emptyCriteria: SearchCriteria = { route: "investor", groups: [], provinces: [], amount: null, filters: {} };

type Pending = { type: "save-listing"; id: string } | { type: "save-criteria"; name?: string } | null;

interface State {
  user: { mobile: string } | null;
  saved: string[];
  profiles: SavedProfile[];
  criteria: SearchCriteria;
  /** آیا کاربر گام «اطلاعات پایه» را در صفحه پروژه‌ها گذرانده است */
  started: boolean;
  /** پروژه‌های انتخاب‌شده برای مقایسه (حداکثر سه) */
  compare: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  setStarted: (v: boolean) => void;
  /** شروع تازه از یک دسته اصلی یا گروه؛ گام اطلاعات پایه دوباره نمایش داده می‌شود */
  begin: (c: Partial<SearchCriteria>) => void;
  applyProfile: (id: string) => void;
  loginOpen: boolean;
  pending: Pending;
  setCriteria: (c: Partial<SearchCriteria>) => void;
  setFilter: (id: string, v: FilterValue) => void;
  resetFilters: () => void;
  openLogin: (pending?: Pending) => void;
  closeLogin: () => void;
  login: (mobile: string) => Pending;
  logout: () => void;
  toggleSaved: (id: string) => void;
  saveProfile: (name: string) => void;
  removeProfile: (id: string) => void;
  touchProfile: (id: string) => void;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      user: null, saved: [], profiles: [], criteria: emptyCriteria, started: false, loginOpen: false, pending: null, compare: [],
      toggleCompare: (id) => set((s) => ({ compare: s.compare.includes(id) ? s.compare.filter((x) => x !== id) : s.compare.length >= 3 ? s.compare : [...s.compare, id] })),
      clearCompare: () => set({ compare: [] }),
      setStarted: (started) => set({ started }),
      begin: (c) => set({ criteria: { ...emptyCriteria, ...c }, started: false }),
      applyProfile: (id) => set((s) => { const p = s.profiles.find((x) => x.id === id); return p ? { criteria: p.criteria, started: true, profiles: s.profiles.map((x) => (x.id === id ? { ...x, lastSeenAt: "2026-11-10" } : x)) } : {}; }),
      setCriteria: (c) => set((s) => ({ criteria: { ...s.criteria, ...c } })),
      setFilter: (id, v) =>
        set((s) => {
          const filters = { ...s.criteria.filters };
          const empty = v === undefined || v === "" || (Array.isArray(v) && v.length === 0) || v === false;
          if (empty) delete filters[id]; else filters[id] = v;
          return { criteria: { ...s.criteria, filters } };
        }),
      resetFilters: () => set((s) => ({ criteria: { ...s.criteria, groups: [], provinces: [], amount: null, filters: {} } })),
      openLogin: (pending = null) => set({ loginOpen: true, pending }),
      closeLogin: () => set({ loginOpen: false, pending: null }),
      login: (mobile) => {
        const pending = get().pending;
        set({ user: { mobile }, loginOpen: false, pending: null });
        if (pending?.type === "save-listing" && !get().saved.includes(pending.id)) set((s) => ({ saved: [...s.saved, pending.id] }));
        return pending;
      },
      logout: () => set({ user: null }),
      toggleSaved: (id) => set((s) => ({ saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id] })),
      saveProfile: (name) =>
        set((s) => ({
          profiles: [
            { id: String(Date.now()) + "-" + String(s.profiles.length + 1), name, criteria: s.criteria, createdAt: "2026-11-10", lastSeenAt: "2026-11-01" },
            ...s.profiles,
          ],
        })),
      removeProfile: (id) => set((s) => ({ profiles: s.profiles.filter((p) => p.id !== id) })),
      touchProfile: (id) => set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? { ...p, lastSeenAt: "2026-11-10" } : p)) })),
    }),
    { name: "hamsarmaye", partialize: (s) => ({ user: s.user, saved: s.saved, profiles: s.profiles, criteria: s.criteria, started: s.started }) },
  ),
);

/** از هیدریشن ناهمخوان جلوگیری می‌کند */
import { useEffect, useState } from "react";
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
