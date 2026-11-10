"use client";
// کنترل‌های ورودی ساده و کم‌کلیک؛ هم در فرم پایه و هم در فیلتر پیشرفته استفاده می‌شوند.
import { useState } from "react";
import { TickCircle, ArrowDown2 } from "@/components/iconsax";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import type { FieldDef, FieldOption, FilterValue } from "@/types";
import { cn, faNumber } from "@/lib/utils";

export function Chip({ active, children, onClick, className }: { active?: boolean; children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick}
      className={cn("inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "border-primary bg-primary text-white shadow-[0_8px_20px_-10px_var(--primary)]" : "border-border bg-white/70 text-ink/75 hover:border-primary/40 hover:text-primary", className)}>
      {children}
    </button>
  );
}

export function Chips({ options, value, onChange, multi }: { options: FieldOption[]; value: string | string[] | undefined; onChange: (v: string | string[] | undefined) => void; multi?: boolean }) {
  const arr = multi ? ((value as string[]) ?? []) : [];
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = multi ? arr.includes(o.value) : value === o.value;
        return <Chip key={o.value} active={on} onClick={() => onChange(multi ? (on ? arr.filter((x) => x !== o.value) : [...arr, o.value]) : on ? undefined : o.value)}>{o.label}</Chip>;
      })}
    </div>
  );
}

export function Segmented({ options, value, onChange }: { options: FieldOption[]; value: string | undefined; onChange: (v: string | undefined) => void }) {
  return (
    <div className="grid auto-cols-fr grid-flow-col rounded-full bg-muted p-1">
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(value === o.value ? undefined : o.value)}
          className={cn("rounded-full px-2 py-1.5 text-[13px] font-semibold transition-all", value === o.value ? "bg-white text-primary shadow-sm" : "text-ink/60 hover:text-ink")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function RangeField({ min, max, step = 1, unit, value, onChange, presets }: { min: number; max: number; step?: number; unit?: string; value: [number, number] | undefined; onChange: (v: [number, number]) => void; presets?: [number, number][] }) {
  const v = value ?? [min, max];
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between text-sm">
        <span className="font-extrabold text-ink">از {faNumber(v[0])} تا {faNumber(v[1])}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      <Slider dir="rtl" min={min} max={max} step={step} value={v} onValueChange={(x) => onChange([x[0], x[1]] as [number, number])} />
      {presets && (
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => <Chip key={p.join("-")} active={v[0] === p[0] && v[1] === p[1]} onClick={() => onChange(p)}>{p[0] === min ? `تا ${faNumber(p[1])}` : p[1] === max ? `بیش از ${faNumber(p[0])}` : `${faNumber(p[0])} تا ${faNumber(p[1])}`}</Chip>)}
        </div>
      )}
    </div>
  );
}

export function SliderField({ min = 0, max = 100, step = 1, unit, value, onChange }: { min?: number; max?: number; step?: number; unit?: string; value: number | undefined; onChange: (v: number | undefined) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className={cn("font-extrabold", value == null ? "text-muted-foreground" : "text-ink")}>{value == null ? "انتخاب نشده" : `${faNumber(value)} ${unit ?? ""}`}</span>
        {value != null && <button type="button" onClick={() => onChange(undefined)} className="text-xs text-muted-foreground hover:text-destructive">حذف</button>}
      </div>
      <Slider dir="rtl" min={min} max={max} step={step} value={[value ?? min]} onValueChange={(x) => onChange(x[0])} className={cn(value == null && "opacity-50")} />
    </div>
  );
}

export function MultiCombobox({ options, value, onChange, placeholder, empty = "موردی پیدا نشد" }: { options: FieldOption[]; value: string[]; onChange: (v: string[]) => void; placeholder: string; empty?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="flex min-h-11 w-full items-center justify-between gap-2 rounded-2xl border border-border bg-white/70 px-3.5 py-2 text-right text-sm">
          <span className={cn("flex flex-wrap gap-1.5", !value.length && "text-muted-foreground")}>
            {value.length ? value.map((v) => <span key={v} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">{options.find((o) => o.value === v)?.label ?? v}</span>) : placeholder}
          </span>
          <ArrowDown2 size={16} className="shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-60 rounded-2xl p-0">
        <ComboList options={options} value={value} onChange={onChange} placeholder="جست‌وجو…" empty={empty} />
      </PopoverContent>
    </Popover>
  );
}

export function ComboList({ options, value, onChange, placeholder, empty }: { options: FieldOption[]; value: string[]; onChange: (v: string[]) => void; placeholder: string; empty: string }) {
  return (
    <Command className="rounded-2xl">
      <CommandInput placeholder={placeholder} />
      <CommandList className="max-h-64">
        <CommandEmpty>{empty}</CommandEmpty>
        <CommandGroup>
          {options.map((o) => {
            const on = value.includes(o.value);
            return (
              <CommandItem key={o.value} value={o.label} onSelect={() => onChange(on ? value.filter((x) => x !== o.value) : [...value, o.value])} className="flex items-center justify-between rounded-xl">
                <span className={cn(on && "font-bold text-primary")}>{o.label}</span>
                {on && <TickCircle size={18} variant="Bold" className="text-primary" />}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

/** رندر عمومی یک فیلد بر اساس طرح‌واره data/fields.ts */
export function FieldControl({ field, value, onChange, options }: { field: FieldDef; value: FilterValue; onChange: (v: FilterValue) => void; options?: FieldOption[] }) {
  const opts = options ?? field.options ?? [];
  switch (field.control) {
    case "chips": return <Chips options={opts} value={value as string} onChange={onChange} />;
    case "multi-chips": return <Chips multi options={opts} value={value as string[]} onChange={onChange} />;
    case "segmented": return <Segmented options={opts} value={value as string} onChange={onChange} />;
    case "multi-combobox": return <MultiCombobox options={opts} value={(value as string[]) ?? []} onChange={onChange} placeholder="انتخاب کنید" />;
    case "range": return <RangeField min={field.min ?? 0} max={field.max ?? 100} step={field.step} unit={field.unit} value={value as [number, number]} onChange={onChange} />;
    case "slider": return <SliderField min={field.min} max={field.max} step={field.step} unit={field.unit} value={value as number} onChange={onChange} />;
    case "switch": return <Switch dir="rtl" checked={value === true} onCheckedChange={(c) => onChange(c || undefined)} />;
    case "textarea": return <textarea value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value || undefined)} rows={2} className="w-full rounded-2xl border border-border bg-white/70 px-3.5 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />;
    default: return <Input value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value || undefined)} className="h-11 rounded-2xl bg-white/70" />;
  }
}
