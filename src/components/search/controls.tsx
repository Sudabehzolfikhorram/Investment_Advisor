"use client";
// کنترل‌های ورودی ساده و کم‌کلیک؛ همه بر پایه کامپوننت‌های shadcn/ui.
import { useState } from "react";
import { TickCircle, ArrowDown2 } from "@/components/iconsax";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import type { FieldDef, FieldOption, FilterValue } from "@/types";
import { cn, faNumber } from "@/lib/utils";

export const amountPresets = (min: number, max: number): [number, number][] => {
  const a = Math.round(max * 0.04) || 1, b = Math.round(max * 0.1), c = Math.round(max * 0.3);
  return [[min, a], [a, b], [b, c], [c, max]];
};

const pill = "h-auto min-w-0 rounded-full border border-border bg-white px-3.5 py-1.5 text-[13px] font-semibold text-ink/75 shadow-none transition-all duration-200 hover:border-primary/40 hover:bg-white hover:text-primary data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-white data-[state=on]:shadow-[0_8px_20px_-10px_var(--primary)]";

export function Chip({ active, children, onClick, className }: { active?: boolean; children: React.ReactNode; onClick?: () => void; className?: string }) {
  return <Toggle pressed={!!active} onPressedChange={() => onClick?.()} className={cn(pill, "gap-1.5", className)}>{children}</Toggle>;
}

/** چندانتخابی: دکمه‌های کنار هم */
export function Chips({ options, value, onChange }: { options: FieldOption[]; value: string[] | undefined; onChange: (v: string[]) => void }) {
  return (
    <ToggleGroup type="multiple" spacing={2} value={value ?? []} onValueChange={onChange} className="w-full flex-wrap">
      {options.map((o) => <ToggleGroupItem key={o.value} value={o.value} className={pill}>{o.label}</ToggleGroupItem>)}
    </ToggleGroup>
  );
}

/** تک‌انتخابی کوتاه (تا چهار گزینه) */
export function Segmented({ options, value, onChange }: { options: FieldOption[]; value: string | undefined; onChange: (v: string | undefined) => void }) {
  return (
    <ToggleGroup type="single" spacing={1} value={value ?? ""} onValueChange={(v) => onChange(v || undefined)} className="grid w-full auto-cols-fr grid-flow-col rounded-full bg-muted p-1">
      {options.map((o) => <ToggleGroupItem key={o.value} value={o.value} className="h-auto min-w-0 whitespace-nowrap rounded-full px-2 py-1.5 text-[13px] font-semibold text-ink/70 hover:bg-transparent hover:text-ink data-[state=on]:bg-white data-[state=on]:text-primary data-[state=on]:shadow-sm">{o.label}</ToggleGroupItem>)}
    </ToggleGroup>
  );
}

/** تک‌انتخابی بلند: دراپ‌داون */
export function Dropdown({ options, value, onChange, placeholder = "انتخاب کنید" }: { options: FieldOption[]; value: string | undefined; onChange: (v: string | undefined) => void; placeholder?: string }) {
  return (
    <Select dir="rtl" value={value ?? ""} onValueChange={(v) => onChange(v === "__none" ? undefined : v)}>
      <SelectTrigger className="h-11 w-full rounded-2xl bg-white px-3.5 font-semibold data-[size=default]:h-11"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent className="rounded-2xl">
        {value && <SelectItem value="__none" className="rounded-xl text-muted-foreground">بدون انتخاب</SelectItem>}
        {options.map((o) => <SelectItem key={o.value} value={o.value} className="rounded-xl">{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
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
      <div className="flex h-6 items-center justify-between text-sm">
        <span className={cn("font-extrabold", value == null ? "text-muted-foreground" : "text-ink")}>{value == null ? "انتخاب نشده" : `${faNumber(value)} ${unit ?? ""}`}</span>
        {value != null && <Button type="button" variant="ghost" size="xs" onClick={() => onChange(undefined)} className="text-muted-foreground hover:text-destructive">حذف</Button>}
      </div>
      <Slider dir="rtl" min={min} max={max} step={step} value={[value ?? min]} onValueChange={(x) => onChange(x[0])} className={cn(value == null && "opacity-50")} />
    </div>
  );
}

// group: عنوان گروه در فهرست (مثل نام استان برای شهرها)؛ short: متن کوتاه برچسب انتخاب‌شده
export type ComboOption = FieldOption & { group?: string; short?: string };
export function MultiCombobox({ options, value, onChange, placeholder, empty = "موردی پیدا نشد", disabled, label, search = "جست‌وجو…" }: { options: ComboOption[]; value: string[]; onChange: (v: string[]) => void; placeholder: string; empty?: string; disabled?: boolean; label?: string; search?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" aria-expanded={open} aria-label={label} disabled={disabled} className="h-auto min-h-12 w-full justify-between gap-2 whitespace-normal rounded-2xl bg-white px-3.5 py-2 text-right font-normal shadow-none disabled:border-dashed disabled:bg-muted/40 disabled:opacity-100">
          <span className={cn("flex flex-wrap gap-1.5", !value.length && "text-muted-foreground")}>
            {value.length ? value.map((v) => { const o = options.find((x) => x.value === v); return <Badge key={v} variant="secondary" className="bg-primary/10 px-2.5 font-bold text-primary">{o?.short ?? o?.label ?? v}</Badge>; }) : placeholder}
          </span>
          <ArrowDown2 size={16} className="shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-60 rounded-2xl p-0">
        <ComboList options={options} value={value} onChange={onChange} placeholder={search} empty={empty} />
      </PopoverContent>
    </Popover>
  );
}

export function ComboList({ options, value, onChange, placeholder, empty, className }: { options: ComboOption[]; value: string[]; onChange: (v: string[]) => void; placeholder: string; empty: string; className?: string }) {
  const groups = [...new Set(options.map((o) => o.group ?? ""))];
  return (
    <Command className={cn("rounded-2xl", className)}>
      <CommandInput placeholder={placeholder} />
      <CommandList className="max-h-64">
        <CommandEmpty>{empty}</CommandEmpty>
        {groups.map((g) => (
          <CommandGroup key={g} heading={g || undefined} className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-extrabold [&_[cmdk-group-heading]]:text-pine-deep">
            {options.filter((o) => (o.group ?? "") === g).map((o) => {
              const on = value.includes(o.value);
              return (
                <CommandItem key={o.value} value={`${o.label} ${g}`} onSelect={() => onChange(on ? value.filter((x) => x !== o.value) : [...value, o.value])} className="flex items-center justify-between rounded-xl">
                  <span className={cn(on && "font-bold text-primary")}>{o.label}</span>
                  {on && <TickCircle size={18} variant="Bold" className="text-primary" />}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  );
}

/** رندر عمومی یک فیلد بر اساس طرح‌واره data/fields.ts */
export function FieldControl({ field, value, onChange, options }: { field: FieldDef; value: FilterValue; onChange: (v: FilterValue) => void; options?: FieldOption[] }) {
  const opts = options ?? field.options ?? [];
  switch (field.control) {
    // گزینه‌های زیاد یا بلند در نوار باریک روی هم می‌افتند؛ در آن حالت دراپ‌داون می‌شوند
    case "chips":
    case "segmented": return opts.length > 3 || opts.reduce((n, o) => n + o.label.length, 0) > 24 ? <Dropdown options={opts} value={value as string} onChange={onChange} /> : <Segmented options={opts} value={value as string} onChange={onChange} />;
    case "multi-chips": return opts.length > 8 ? <MultiCombobox options={opts} value={(value as string[]) ?? []} onChange={onChange} placeholder="انتخاب کنید" /> : <Chips options={opts} value={value as string[]} onChange={onChange} />;
    case "multi-combobox": return <MultiCombobox options={opts} value={(value as string[]) ?? []} onChange={onChange} placeholder="انتخاب کنید" />;
    case "range": return <RangeField min={field.min ?? 0} max={field.max ?? 100} step={field.step} unit={field.unit} value={value as [number, number]} onChange={onChange} />;
    case "slider": return <SliderField min={field.min} max={field.max} step={field.step} unit={field.unit} value={value as number} onChange={onChange} />;
    case "switch": return <Switch dir="rtl" checked={value === true} onCheckedChange={(c) => onChange(c || undefined)} />;
    case "textarea": return <Textarea value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value || undefined)} rows={2} className="rounded-2xl bg-white" />;
    default: return <Input value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value || undefined)} className="h-11 rounded-2xl bg-white" />;
  }
}
