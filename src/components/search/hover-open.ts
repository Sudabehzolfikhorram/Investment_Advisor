"use client";
// منویی که هم با کلیک و هم با بردن نشانگر روی آیکون باز می‌شود، با کمی مکث پیش از بسته شدن تا رسیدن به منو راحت باشد
import { useCallback, useEffect, useRef, useState } from "react";

export function useHoverOpen(delay = 160) {
  const [open, setOpen] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => { if (t.current) clearTimeout(t.current); t.current = null; };
  const enter = useCallback(() => { clear(); setOpen(true); }, []);
  const leave = useCallback(() => { clear(); t.current = setTimeout(() => setOpen(false), delay); }, [delay]);
  useEffect(() => clear, []);
  return {
    open,
    onOpenChange: (o: boolean) => { clear(); setOpen(o); },
    hover: { onPointerEnter: (e: React.PointerEvent) => { if (e.pointerType === "mouse") enter(); }, onPointerLeave: (e: React.PointerEvent) => { if (e.pointerType === "mouse") leave(); } },
  };
}
