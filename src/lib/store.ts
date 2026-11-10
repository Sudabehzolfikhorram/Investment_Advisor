"use client";
// وضعیت سمت کاربر (نمایشی): ورود، پروژه‌های ذخیره‌شده، شرایط ذخیره‌شده. در مرورگر نگه‌داری می‌شود.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FilterValue, SavedProfile, SearchCriteria } from "@/types";

export const emptyCriteria: SearchCriteria = { route: "investor", groups: [], provinces: [], amount: null, filters: {} };

type Pending = { type: "save-listing"; id: string } | { type: "save-criteria" } | null;

interface State {
  user: { mobile: string } | null;
  saved: string[];
  profiles: SavedProfile[];
  criteria: SearchCriteria;
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
      user: null, saved: [], profiles: [], criteria: emptyCriteria, loginOpen: false, pending: null,
      setCriteria: (c) => set((s) => ({ criteria: { ...s.criteria, ...c } })),
      setFilter: (id, v) =>
        set((s) => {
          const filters = { ...s.criteria.filters };
          const empty = v === undefined || v === "" || (Array.isArray(v) && v.length === 0) || v === false;
          if (empty) delete filters[id]; else filters[id] = v;
          return { criteria: { ...s.criteria, filters } };
        }),
      resetFilters: () => set((s) => ({ criteria: { ...s.criteria, filters: {} } })),
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
            { id: String(s.profiles.length + 1) + "-" + name, name, criteria: s.criteria, createdAt: "2026-11-10", lastSeenAt: "2026-11-01" },
            ...s.profiles,
          ],
        })),
      removeProfile: (id) => set((s) => ({ profiles: s.profiles.filter((p) => p.id !== id) })),
      touchProfile: (id) => set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? { ...p, lastSeenAt: "2026-11-10" } : p)) })),
    }),
    { name: "sarmayenama", partialize: (s) => ({ user: s.user, saved: s.saved, profiles: s.profiles, criteria: s.criteria }) },
  ),
);

/** از هیدریشن ناهمخوان جلوگیری می‌کند */
import { useEffect, useState } from "react";
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
