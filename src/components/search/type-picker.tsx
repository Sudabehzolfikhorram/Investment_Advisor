"use client";
// انتخاب حوزه و نوع دقیق پروژه به شکل «فهرست و جزئیات»:
// سمت راست همه حوزه‌ها با شمار پروژه و شمار نوع‌های انتخاب‌شده، سمت چپ فقط نوع‌های حوزه‌ی در حال دیدن.
// با انتخاب چند حوزه، فهرست بلند نمی‌شود؛ خلاصه انتخاب‌ها پایین پنل می‌آید و جست‌وجو در همه نوع‌ها کار می‌کند.
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft2, CloseCircle, SearchNormal1 } from "@/components/iconsax";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { groupIcons } from "@/components/icons";
import { projectGroups } from "@/data/taxonomy";
import { cn, faNumber } from "@/lib/utils";

type Props = {
  groups: string[];
  types: string[];
  counts: Record<string, number>;
  onChange: (groups: string[], types: string[]) => void;
  /** ارتفاع دو ستون؛ در پنل بالای نتایج کوتاه‌تر است */
  height?: string;
  /** در پنل بالای نتایج، خلاصه انتخاب‌ها یک خط است (هر حوزه در فهرست خودش شمار نوع‌ها را دارد) */
  compact?: boolean;
};

const typeGroup = Object.fromEntries(projectGroups.flatMap((g) => g.subtypes.map((s) => [s.id, g.id])));

export function GroupTypePicker({ groups, types, counts, onChange, height = "h-[24.5rem]", compact }: Props) {
  const [focus, setFocus] = useState(() => groups[0] ?? projectGroups[0].id);
  const [q, setQ] = useState("");
  const query = q.trim();
  const g = projectGroups.find((x) => x.id === focus)!;

  const typesOf = (gid: string) => types.filter((t) => typeGroup[t] === gid);
  const toggleGroup = (gid: string) => {
    if (groups.includes(gid)) onChange(groups.filter((x) => x !== gid), types.filter((t) => typeGroup[t] !== gid));
    else onChange([...groups, gid], types);
  };
  // انتخاب یک نوع، حوزه‌اش را هم انتخاب می‌کند
  const toggleType = (tid: string) => {
    const gid = typeGroup[tid];
    const next = types.includes(tid) ? types.filter((x) => x !== tid) : [...types, tid];
    onChange(groups.includes(gid) ? groups : [...groups, gid], next);
  };
  const allOf = (gid: string) => onChange(groups.includes(gid) ? groups : [...groups, gid], types.filter((t) => typeGroup[t] !== gid));

  const matches = useMemo(() => (query
    ? projectGroups.map((x) => ({ g: x, subs: x.subtypes.filter((s) => s.name.includes(query) || s.examples?.includes(query) || x.name.includes(query)) })).filter((x) => x.subs.length)
    : []), [query]);
  const matchCount = (gid: string) => matches.find((m) => m.g.id === gid)?.subs.length ?? 0;

  const typeItem = (s: (typeof g.subtypes)[number]) => {
    const on = types.includes(s.id); const n = counts[`s:${s.id}`] ?? 0;
    return (
      <label key={s.id} className={cn("group/t flex cursor-pointer items-start gap-2.5 rounded-2xl border px-3 py-2 transition-colors", on ? "border-primary/50 bg-primary/[0.06]" : "border-transparent hover:bg-muted/70")}>
        <Checkbox checked={on} onCheckedChange={() => toggleType(s.id)} className="mt-1 bg-white" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className={cn("text-[13px] font-bold", on ? "text-primary" : "text-ink")}>{s.name}</span>
            {n > 0 && <span className="rounded-full bg-muted px-1.5 text-[10px] font-bold tabular-nums text-muted-foreground">{faNumber(n)}</span>}
          </span>
          {s.examples && <span className="mt-0.5 line-clamp-2 text-[11px] leading-5 text-muted-foreground" title={s.examples}>{s.examples}</span>}
        </span>
      </label>
    );
  };

  const picked = projectGroups.filter((x) => groups.includes(x.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-full border border-border bg-white px-4 transition-shadow focus-within:border-primary/50 focus-within:shadow-[0_0_0_4px_rgb(15_118_110/0.1)]">
        <SearchNormal1 size={16} className="shrink-0 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جست‌وجو در همه نوع‌ها، مثلاً «هتل» یا «مترو»" aria-label="جست‌وجوی نوع پروژه"
          className="h-11 rounded-none border-0 !bg-transparent px-0 text-[13px] shadow-none focus-visible:ring-0" />
        {q && <button type="button" onClick={() => setQ("")} aria-label="پاک کردن جست‌وجو" className="shrink-0 text-muted-foreground hover:text-ink"><CloseCircle size={16} variant="Bulk" /></button>}
      </div>

      <div className={cn("grid grid-cols-[17rem_minmax(0,1fr)] overflow-hidden rounded-3xl border border-border bg-white", height)}>
        {/* حوزه‌ها */}
        <ul className="thin-scroll space-y-0.5 overflow-y-auto border-l border-border bg-muted/40 p-2">
          {projectGroups.map((x) => {
            const I = groupIcons[x.id]; const on = groups.includes(x.id); const active = !query && focus === x.id; const nt = typesOf(x.id).length; const mc = matchCount(x.id);
            const dim = !!query && !mc;
            return (
              <li key={x.id} className={cn("relative flex items-center gap-2 rounded-2xl pr-2.5 transition-colors", active ? "bg-white shadow-[0_6px_18px_-12px_rgb(8_59_55/0.35)]" : "hover:bg-white/70", dim && "opacity-40")}>
                {active && <motion.span layoutId="type-focus" className="absolute inset-y-2 right-0 w-[3px] rounded-full bg-primary" />}
                <Checkbox checked={on} onCheckedChange={() => toggleGroup(x.id)} aria-label={`حوزه ${x.name}`} className="bg-white" />
                <button type="button" onClick={() => { setFocus(x.id); setQ(""); }} className="flex min-w-0 flex-1 items-center gap-2 py-1.5 pl-2 text-right">
                  <I size={16} variant="Bulk" className={cn("shrink-0", on ? "text-primary" : "text-ink/45")} />
                  <span className={cn("min-w-0 flex-1 truncate text-[13px]", on ? "font-extrabold text-ink" : "font-semibold text-ink/80")}>{x.name}</span>
                  {query ? <span className="shrink-0 text-[11px] font-bold text-primary">{mc ? faNumber(mc) : ""}</span>
                    : nt ? <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold text-primary">{faNumber(nt)} نوع</span>
                    : <span className="shrink-0 text-[11px] font-semibold text-muted-foreground tabular-nums">{counts[x.id] ? faNumber(counts[x.id]) : ""}</span>}
                  <ArrowLeft2 size={12} className={cn("shrink-0 text-muted-foreground transition-opacity", active ? "opacity-100" : "opacity-0")} />
                </button>
              </li>
            );
          })}
        </ul>

        {/* نوع‌ها */}
        <div className="thin-scroll overflow-y-auto p-3">
          <AnimatePresence mode="wait" initial={false}>
            {query ? (
              <motion.div key="q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-4">
                {!matches.length && <p className="py-16 text-center text-sm text-muted-foreground">نوعی با «{query}» پیدا نشد.</p>}
                {matches.map(({ g: x, subs }) => (
                  <div key={x.id}>
                    <p className="mb-1.5 px-1 text-[11px] font-extrabold text-muted-foreground">{x.name}</p>
                    <div className="grid grid-cols-2 gap-1">{subs.map((s) => typeItem(s))}</div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div key={g.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.18 }}>
                <div className="mb-2 flex items-center justify-between gap-3 px-1">
                  <p className="text-sm font-extrabold text-ink">{g.name}<span className="mr-2 text-[11px] font-semibold text-muted-foreground">{faNumber(g.subtypes.length)} نوع</span></p>
                  <label className={cn("flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-bold transition-colors", groups.includes(g.id) && !typesOf(g.id).length ? "border-primary bg-primary/[0.06] text-primary" : "border-border text-ink/70 hover:border-primary/40")}>
                    <Checkbox checked={groups.includes(g.id) && !typesOf(g.id).length} onCheckedChange={(c) => (c ? allOf(g.id) : toggleGroup(g.id))} className="bg-white" />
                    همه نوع‌های {g.name}
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-1">{g.subtypes.map((s) => typeItem(s))}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* خلاصه انتخاب‌ها: هر حوزه یک برچسب، نه یک فهرست بلند */}
      <div className="flex min-h-9 flex-wrap items-center gap-1.5">
        {compact && picked.length ? <>
          <span className="text-[12px] font-bold text-ink/75">{faNumber(picked.length)} حوزه{types.length ? `، ${faNumber(types.length)} نوع دقیق` : "، همه نوع‌ها"} انتخاب شده</span>
          <Button variant="ghost" size="sm" onClick={() => onChange([], [])} className="h-8 rounded-full px-3 text-[12px] font-bold text-muted-foreground">پاک کردن همه</Button>
        </> : picked.length ? <>
          <span className="ml-1 text-[12px] font-bold text-muted-foreground">انتخاب‌ها:</span>
          {picked.map((x) => { const ts = typesOf(x.id).map((t) => x.subtypes.find((s) => s.id === t)?.name);
            return (
              <span key={x.id} className="inline-flex max-w-full items-center gap-1 rounded-full bg-primary/10 py-1 pl-1.5 pr-3 text-[12px] font-bold text-primary">
                <button type="button" onClick={() => { setFocus(x.id); setQ(""); }} className="min-w-0 truncate" title={ts.join("، ")}>
                  {x.name}<span className="font-semibold text-primary/75">: {ts.length ? (ts.length > 2 ? `${ts.slice(0, 2).join("، ")} و ${faNumber(ts.length - 2)} نوع دیگر` : ts.join("، ")) : "همه نوع‌ها"}</span>
                </button>
                <button type="button" onClick={() => toggleGroup(x.id)} aria-label={`حذف ${x.name}`} className="shrink-0 rounded-full text-primary/60 hover:text-primary"><CloseCircle size={15} variant="Bulk" /></button>
              </span>
            ); })}
          <Button variant="ghost" size="sm" onClick={() => onChange([], [])} className="h-8 rounded-full px-3 text-[12px] font-bold text-muted-foreground">پاک کردن همه</Button>
        </> : <span className="text-[12px] font-semibold text-muted-foreground">هنوز حوزه‌ای انتخاب نشده؛ همه حوزه‌ها نمایش داده می‌شوند.</span>}
      </div>
    </div>
  );
}
