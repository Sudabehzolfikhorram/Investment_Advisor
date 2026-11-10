"use client";
// موتور خدمات: منطق، فیلدها و متن‌های نسخه مرجع بدون تغییر در یک قاب پنهان اجرا می‌شود
// و همین‌جا با اجزای shadcn بازنمایی می‌شود. هیچ فیلد یا قاعده‌ای بازنویسی یا حذف نشده است.
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, DocumentDownload, InfoCircle, Warning2 } from "@/components/iconsax";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowDown2 } from "@/components/iconsax";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { engineFrame } from "@/lib/engine-src";
import { cn, faNumber } from "@/lib/utils";

interface N {
  key: string; tag: string; cls: string[]; id: string; text?: string; kids: N[];
  attr: Record<string, string>; ds: Record<string, string>;
  value?: string; checked?: boolean; disabled?: boolean; open?: boolean;
  options?: { value: string; label: string; disabled: boolean; group?: string }[];
}

const SKIP_TAGS = new Set(["script", "style", "template", "noscript", "svg", "img", "picture", "br", "hr"]);
const SKIP_CLASS = ["friendly-home", "friendly-stage-back", "ext-foot", "ma-tabs", "close"];
const SKIP_DATA = ["extClose", "maClose", "friendlyHome", "lpHome", "fiHome", "vividClose", "fiClose"];
/** دکمه‌هایی که در نسخه مرجع بخش دیگری را باز می‌کردند، اینجا به صفحه همان بخش می‌روند */
const navTarget = (ds: Record<string, string>): string | null =>
  ds.maOpen ? `/tools/ma-${ds.maOpen}` : ds.extOpen === "catalog" || "extGuide" in ds || "extRole" in ds ? "/opportunities"
  : ds.extOpen === "saved" ? "/tools/drafts" : ds.extOpen ? `/tools/${ds.extOpen}` : null;

function snapshot(root: Element, refs: Map<string, Element>, prefix: string): N | null {
  const win = root.ownerDocument.defaultView!;
  const walk = (el: Element, key: string): N | null => {
    const tag = el.tagName.toLowerCase();
    const h = el as HTMLElement;
    if (SKIP_TAGS.has(tag) || h.hidden) return null;
    if (tag !== "option" && win.getComputedStyle(el).display === "none" && !(tag === "input" && (el as HTMLInputElement).type === "file")) return null;
    const cls = [...el.classList];
    if (cls.some((c) => SKIP_CLASS.includes(c))) return null;
    const ds = { ...h.dataset } as Record<string, string>;
    if (SKIP_DATA.some((k) => k in ds)) return null;
    const k = el.id ? `${prefix}#${el.id}` : key;
    refs.set(k, el);
    const attr: Record<string, string> = {};
    for (const a of ["required", "type", "placeholder", "min", "max", "step", "href", "aria-current", "aria-pressed", "aria-selected", "accept", "colspan", "inputmode", "maxlength", "rows"]) { const v = el.getAttribute(a); if (v != null) attr[a] = v; }
    if (/teal|primary/.test(h.style?.borderColor ?? "")) attr["aria-current"] = "step";
    const n: N = { key: k, tag, cls, id: el.id, kids: [], attr, ds };
    if (tag === "select") {
      const s = el as HTMLSelectElement;
      n.value = s.value; n.disabled = s.disabled; if (s.multiple) attr.multiple = "1";
      n.options = [...s.options].map((o) => ({ value: o.value, label: o.text, disabled: o.disabled, group: o.parentElement?.tagName === "OPTGROUP" ? (o.parentElement as HTMLOptGroupElement).label : undefined }));
      if (s.multiple) n.value = [...s.selectedOptions].map((o) => o.value).join("\u0001");
      return n;
    }
    if (tag === "input" || tag === "textarea") { const i = el as HTMLInputElement; n.value = i.value; n.checked = i.checked; n.disabled = i.disabled; if (i.name) attr.name = i.name; return n; }
    if (tag === "button") n.disabled = (el as HTMLButtonElement).disabled;
    if (tag === "details") n.open = (el as HTMLDetailsElement).open;
    let i = 0;
    for (const c of el.childNodes) {
      if (c.nodeType === 3) { const t = c.textContent ?? ""; if (t.trim()) n.kids.push({ key: `${k}/t${i++}`, tag: "#text", cls: [], id: "", kids: [], attr: {}, ds: {}, text: t.replace(/\s+/g, " ").replace(/\s*[—–]\s*/g, "، ").replace(/\s+·\s+/g, "، ") }); }
      else if (c.nodeType === 1) { const child = walk(c as Element, `${k}/${i++}`); if (child) n.kids.push(child); }
    }
    return n;
  };
  return walk(root, prefix);
}

const textOf = (n: N): string => (n.tag === "#text" ? n.text ?? "" : n.kids.map(textOf).join(""));
const has = (n: N, c: string) => n.cls.includes(c);
const find = (n: N, pred: (x: N) => boolean): N | undefined => { if (pred(n)) return n; for (const k of n.kids) { const r = find(k, pred); if (r) return r; } };
const controlsIn = (n: N): N[] => (isControl(n) ? [n] : n.kids.flatMap(controlsIn));
const isCheck = (n: N) => n.tag === "label" && (() => { const c = controlsIn(n); return c.length === 1 && (c[0].attr.type === "checkbox" || c[0].attr.type === "radio"); })();
/** برچسب فیلد: واژه «اختیاری» و ستاره متن برداشته می‌شود و ضروری بودن جدا برمی‌گردد */
function fieldLabel(raw: string, c: N) {
  const optional = /اختیاری/.test(raw) || /اختیاری|خالی بگذارید/.test(c.attr.placeholder ?? "");
  const text = raw.replace(/[\s،,(]*اختیاری\)?/g, "").replace(/\s*\*\s*/g, "").trim();
  const required = !optional && (c.attr.required != null || /\*/.test(raw) || (c.tag === "select" && !c.attr.multiple && !!c.options?.some((o) => !o.value)));
  return { text, required };
}
const isControl = (n: N) => n.tag === "input" || n.tag === "select" || n.tag === "textarea";
const clean = (s: string) => s.replace(/^\s*[←→↓↑]\s*/u, "").replace(/\s*[←→↓↑×]\s*$/u, "").replace(/\s*[—–]\s*/g, "، ").trim();

export function LegacyTool({ opener, root }: { opener: string; root: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const refs = useRef(new Map<string, Element>());
  const [tree, setTree] = useState<N | null>(null);
  const [dialogs, setDialogs] = useState<N[]>([]);
  const router = useRouter();

  const sync = useCallback(() => {
    const doc = frame.current?.contentDocument; if (!doc) return;
    // چند ریشه با «|» جدا می‌شوند (مثلاً فرم و نتیجه مسیر خیریه)
    const els = root.split("|").map((sel) => doc.querySelector(sel)).filter(Boolean) as Element[]; if (!els.length) return;
    const map = new Map<string, Element>();
    const kids = els.map((el, i) => snapshot(el, map, `r${i}`)).filter(Boolean) as N[];
    setTree(kids.length === 1 ? kids[0] : { key: "roots", tag: "div", cls: [], id: "", kids, attr: {}, ds: {} });
    setDialogs([...doc.querySelectorAll("dialog[open]")].map((d, i) => snapshot(d, map, `d${i}`)).filter(Boolean) as N[]);
    refs.current = map;
  }, [root]);

  useEffect(() => {
    const f = frame.current; if (!f) return;
    let obs: MutationObserver | undefined, t = 0;
    const start = () => {
      const doc = f.contentDocument; if (!doc?.body || !doc.querySelector(root.split("|")[0])) return;
      // دانلود و پیام‌های نسخه مرجع به صفحه اصلی منتقل می‌شوند
      const w = f.contentWindow as unknown as Record<string, unknown>;
      w.toast = (m: string) => toast(clean(String(m)));
      w.download = (name: string, data: unknown, html = false) => {
        const body = html ? String(data).replace("</style>", "body{font-family:Vazirmatn,Vazir,Tahoma,sans-serif!important;color:#0b1f1d}h1,h3,h4{color:#0f766e}.ext-note{border-radius:14px}</style>") : JSON.stringify(data, null, 2);
        const url = URL.createObjectURL(new Blob([body], { type: html ? "text/html;charset=utf-8" : "application/json;charset=utf-8" }));
        const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000); toast("فایل روی دستگاه شما ذخیره شد.");
      };
      if (opener.startsWith("role:")) {
        // مسیرهایی که در نسخه مرجع داخل همان فرم اصلی‌اند: انتخاب نقش و رفتن به مرحله شرایط
        const r = doc.querySelector(`input[name=role][value="${opener.slice(5)}"]`) as HTMLInputElement | null;
        if (r) { r.checked = true; r.dispatchEvent(new Event("input", { bubbles: true })); r.dispatchEvent(new Event("change", { bubbles: true })); }
        (doc.querySelector('[data-panel="0"] [data-next]') as HTMLElement | null)?.click();
      } else (doc.querySelector(opener) as HTMLElement | null)?.click();
      sync();
      obs = new MutationObserver(() => { window.clearTimeout(t); t = window.setTimeout(sync, 16); });
      obs.observe(doc.body, { subtree: true, childList: true, attributes: true, characterData: true });
    };
    if (f.contentDocument?.readyState === "complete" && f.contentDocument.querySelector(root.split("|")[0])) start(); else f.addEventListener("load", start, { once: true });
    return () => { obs?.disconnect(); window.clearTimeout(t); f.removeEventListener("load", start); };
  }, [opener, root, sync]);

  const fire = (key: string, type: "input" | "change" | "click", set?: (el: HTMLInputElement) => void) => {
    const el = refs.current.get(key) as HTMLInputElement | undefined; if (!el) return;
    set?.(el);
    if (type === "click") el.click(); else { const W = el.ownerDocument.defaultView as unknown as { Event: typeof Event }; el.dispatchEvent(new W.Event("input", { bubbles: true })); if (type === "change") el.dispatchEvent(new W.Event("change", { bubbles: true })); }
    sync();
  };

  const control = (n: N, label?: string) => {
    if (n.tag === "select" && n.attr.multiple) {
      const on = (n.value ?? "").split("\u0001");
      return <div key={n.key} className="flex flex-wrap gap-2">{n.options!.filter((o) => o.value).map((o) => { const active = on.includes(o.value);
        return <Button key={o.value} type="button" variant="plain" size="auto" aria-pressed={active} onClick={() => fire(n.key, "change", (el) => { const s = el as unknown as HTMLSelectElement; [...s.options].find((x) => x.value === o.value)!.selected = !active; })}
          className={cn("h-10 rounded-full border px-4 text-[13px] font-bold", active ? "border-primary bg-primary text-white" : "border-border bg-white text-ink/75 hover:border-primary/40")}>{o.label}</Button>; })}</div>;
    }
    if (n.tag === "select") {
      const placeholder = n.options!.find((o) => !o.value)?.label ?? "انتخاب کنید";
      return (
        <Select key={n.key} dir="rtl" value={n.value || undefined} disabled={n.disabled} onValueChange={(v) => fire(n.key, "change", (el) => { el.value = v; })}>
          <SelectTrigger aria-label={label} className="h-12 w-full min-w-0 rounded-2xl bg-white px-4 text-sm font-bold text-ink shadow-none data-[size=default]:h-12 data-[placeholder]:font-semibold data-[placeholder]:text-muted-foreground [&>span]:truncate"><SelectValue placeholder={placeholder} /></SelectTrigger>
          <SelectContent className="max-h-80 max-w-[min(44rem,90vw)] rounded-2xl">{n.options!.filter((o) => o.value).map((o) => <SelectItem key={o.value} value={o.value} disabled={o.disabled} className="rounded-xl py-2.5 leading-6">{clean(o.label)}</SelectItem>)}</SelectContent>
        </Select>
      );
    }
    if (n.tag === "textarea") return <Textarea key={n.key} value={n.value ?? ""} placeholder={n.attr.placeholder} aria-label={label} rows={Number(n.attr.rows ?? 3)} onChange={(e) => fire(n.key, "input", (el) => { el.value = e.target.value; })} onBlur={() => fire(n.key, "change")} className="min-h-24 rounded-2xl bg-white px-4 py-3 text-sm font-semibold leading-7 shadow-none" />;
    const type = n.attr.type ?? "text";
    if (type === "checkbox" || type === "radio") return <Checkbox key={n.key} checked={!!n.checked} disabled={n.disabled} aria-label={label} onCheckedChange={() => fire(n.key, "click")} className={cn("size-5 border-ink/25 bg-white", type === "radio" ? "rounded-full" : "rounded-md")} />;
    if (type === "file") return <FileField key={n.key} accept={n.attr.accept} label={label} onFiles={(files) => fire(n.key, "change", (el) => { const W = el.ownerDocument.defaultView as unknown as { DataTransfer: typeof DataTransfer }; const dt = new W.DataTransfer(); for (const f of files) dt.items.add(f); el.files = dt.files; })} />;
    if (type === "hidden") return null;
    return <Input key={n.key} type={type === "number" ? "text" : type} inputMode={type === "number" ? "decimal" : undefined} dir={type === "number" || type === "tel" || type === "email" || type === "url" ? "ltr" : undefined} value={n.value ?? ""} disabled={n.disabled} placeholder={n.attr.placeholder} aria-label={label}
      onChange={(e) => fire(n.key, "input", (el) => { el.value = e.target.value; })} onBlur={() => fire(n.key, "change")} className={cn("h-12 rounded-2xl bg-white px-4 text-sm font-bold shadow-none placeholder:font-normal", (type === "number" || type === "tel") && "text-right")} />;
  };

  // سه گزینه تیک‌زدنی یا بیشتر کنار هم، به‌جای فهرست باز در یک دراپ‌داون چندانتخابی می‌آیند
  const kids = (n: N) => {
    const checks = n.kids.filter(isCheck);
    if (checks.length < 3) return n.kids.map((k) => render(k));
    const first = n.kids.indexOf(checks[0]);
    return n.kids.map((k, i) => i === first ? <MultiDrop key={`${n.key}/multi`} items={checks.map((l) => { const c = controlsIn(l)[0]; const strong = find(l, (x) => x.tag === "strong"); const small = find(l, (x) => x.tag === "small");
      return { key: c.key, checked: !!c.checked, disabled: !!c.disabled, title: clean(strong ? textOf(strong) : textOf(l)), hint: small ? clean(textOf(small)) : undefined }; })} single={checks.every((l) => controlsIn(l)[0].attr.type === "radio")} onToggle={(key) => fire(key, "click")} /> : isCheck(k) ? null : render(k));
  };
  const inline = (n: N): React.ReactNode => n.kids.map((k) =>
    k.tag === "#text" ? <Fragment key={k.key}>{k.text}</Fragment>
    : k.tag === "strong" || k.tag === "b" ? <strong key={k.key} className="font-extrabold text-ink">{inline(k)}</strong>
    : k.tag === "a" ? <a key={k.key} href={k.attr.href} target="_blank" rel="noreferrer" className="font-bold text-primary underline-offset-4 hover:underline">{inline(k)}</a>
    : k.tag === "small" ? <small key={k.key} className="block text-xs font-normal leading-6 text-muted-foreground">{inline(k)}</small>
    : find(k, (x) => isControl(x) || x.tag === "button") ? render(k) : <span key={k.key}>{inline(k)}</span>);

  function render(n: N): React.ReactNode {
    if (n.tag === "#text") return <Fragment key={n.key}>{n.text}</Fragment>;
    if (isControl(n)) return control(n);
    if (n.tag !== "label" && has(n, "field") && find(n, isControl)) return render({ ...n, tag: "label" });
    const text = clean(textOf(n));
    switch (n.tag) {
      case "h1": case "h2": return has(n, "sr-only") ? null : <h2 key={n.key} className="text-2xl font-black leading-[1.5] text-ink">{text}</h2>;
      case "h3": case "legend": return <h3 key={n.key} className="col-span-full mt-2 text-lg font-extrabold text-ink">{text}</h3>;
      case "h4": case "h5": return <h4 key={n.key} className="col-span-full text-[15px] font-extrabold text-ink">{text}</h4>;
      case "p": return text ? <p key={n.key} className={cn("col-span-full text-sm leading-7 text-ink/75", has(n, "ext-desc") && "text-muted-foreground", has(n, "ext-step-label") && "text-[13px] font-extrabold text-primary", (has(n, "error") || has(n, "fi-error")) && "rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 font-bold text-destructive", (has(n, "ext-note") || has(n, "source-note") || has(n, "ext-status") || has(n, "field-note") || has(n, "results-note")) && "rounded-2xl bg-muted px-4 py-3 font-semibold", has(n, "ext-empty") && "col-span-full rounded-2xl border border-dashed border-border px-4 py-8 text-center")}>{inline(n)}</p> : null;
      case "ul": case "ol": return <ul key={n.key} className="space-y-2">{n.kids.filter((k) => k.tag === "li").map((li, i) => {
        const interactive = !!find(li, (x) => x.tag === "button" || isControl(x));
        return <li key={li.key} className={cn("flex gap-2.5 text-sm leading-7 text-ink/80", interactive && "items-center rounded-2xl border border-border bg-white px-4 py-2")}>
          {!interactive && (n.tag === "ol" ? <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-extrabold text-primary">{faNumber(i + 1)}</span> : <span className="mt-3 size-1.5 shrink-0 rounded-full bg-primary" />)}
          <div className={cn("min-w-0 flex-1", interactive && "flex items-center justify-between gap-3")}>{interactive ? kids(li) : inline(li)}</div></li>; })}</ul>;
      case "dl": return <dl key={n.key} className="grid grid-cols-2 gap-3 xl:grid-cols-3">{n.kids.map((row) => row.tag === "div" ? (
        <div key={row.key} className="rounded-2xl border border-border bg-white px-4 py-3">{row.kids.map((c) => c.tag === "dt" ? <dt key={c.key} className="text-xs font-semibold text-muted-foreground">{clean(textOf(c))}</dt> : <dd key={c.key} className="mt-1 text-sm font-extrabold leading-7 text-ink">{inline(c)}</dd>)}</div>) : render(row))}</dl>;
      case "dt": return <dt key={n.key} className="text-xs font-semibold text-muted-foreground">{text}</dt>;
      case "dd": return <dd key={n.key} className="text-sm font-extrabold leading-7 text-ink">{inline(n)}</dd>;
      case "table": return <div key={n.key} className="overflow-x-auto rounded-2xl border border-border bg-white"><table className="w-full text-sm">{n.kids.map((sec) => <tbody key={sec.key}>{(sec.tag === "tr" ? [sec] : sec.kids).map((tr) => <tr key={tr.key} className="border-b border-border last:border-0">{tr.kids.map((c) => c.tag === "th" ? <th key={c.key} colSpan={Number(c.attr.colspan ?? 1)} className="bg-muted/60 px-4 py-3 text-right text-[13px] font-extrabold text-ink">{inline(c)}</th> : <td key={c.key} colSpan={Number(c.attr.colspan ?? 1)} className="px-4 py-3 align-top leading-7 text-ink/80">{find(c, (x) => x.tag === "button" || x.tag === "ul") ? kids(c) : inline(c)}</td>)}</tr>)}</tbody>)}</table></div>;
      case "a": return <a key={n.key} href={n.attr.href} target="_blank" rel="noreferrer" className={cn("font-bold text-primary underline-offset-4 hover:underline", (has(n, "fi-source") || has(n, "ext-link")) && "inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-[13px] no-underline hover:border-primary")}>{text}</a>;
      case "strong": case "b": return <strong key={n.key} className="block font-extrabold text-ink">{text}</strong>;
      case "small": return <small key={n.key} className="block text-xs leading-6 text-muted-foreground">{text}</small>;
      case "span": case "em": case "i": case "time": case "output": return find(n, (x) => isControl(x) || x.tag === "button") ? <span key={n.key} className="flex items-center gap-2">{kids(n)}</span> : text ? <span key={n.key} className={cn(has(n, "ext-badge") || has(n, "fi-status") ? "inline-block w-fit rounded-full bg-primary/10 px-3 py-1 text-[12px] font-extrabold text-primary" : undefined)}>{inline(n)}</span> : null;
      case "button": {
        const to = navTarget(n.ds);
        const press = n.attr["aria-pressed"] === "true" || n.attr["aria-current"] != null || n.attr["aria-selected"] === "true";
        const rich = n.kids.some((k) => k.tag === "strong");
        if (rich || has(n, "fi-family")) return (
          <Button key={n.key} type="button" variant="plain" size="auto" disabled={n.disabled} aria-pressed={press} onClick={() => (to ? router.push(to) : fire(n.key, "click"))}
            className={cn("h-auto flex-col items-start gap-1 whitespace-normal rounded-2xl border p-4 text-right", press ? "border-primary bg-primary/[0.06] ring-1 ring-primary" : "border-border bg-white hover:border-primary/40")}>
            {n.kids.map((k) => k.tag === "strong" ? <strong key={k.key} className="text-[15px] font-extrabold text-ink">{clean(textOf(k))}</strong> : <span key={k.key} className="text-[13px] font-normal leading-6 text-muted-foreground">{clean(textOf(k))}</span>)}
          </Button>);
        const primary = has(n, "primary") || has(n, "jll-button");
        const isDownload = /دانلود|دریافت فایل|خروجی/.test(text);
        return (
          <Button key={n.key} type="button" disabled={n.disabled} aria-pressed={press || undefined} variant={primary ? "default" : has(n, "text-btn") ? "ghost" : "outline"} onClick={() => (to ? router.push(to) : fire(n.key, "click"))}
            className={cn("h-11 w-fit gap-2 rounded-full px-5 text-sm font-extrabold shadow-none", primary && "h-12 px-6", !primary && !has(n, "text-btn") && "bg-white hover:border-primary hover:text-primary", has(n, "text-btn") && "text-ink/70", press && "border-primary bg-primary text-white hover:bg-primary hover:text-white", text.length <= 2 && "size-9 px-0")}>
            {isDownload && <DocumentDownload size={18} variant="Bulk" />}{text}{primary && !isDownload && <ArrowLeft size={17} />}
          </Button>);
      }
      case "label": {
        const c = find(n, isControl);
        if (c && controlsIn(n).length === 1 && (c.attr.type === "checkbox" || c.attr.type === "radio")) {
          const rest = n.kids.filter((k) => k !== c);
          return (
            <label key={n.key} className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border bg-white p-3.5 transition-colors", c.checked ? "border-primary bg-primary/[0.05] ring-1 ring-primary" : "border-border hover:border-primary/40", has(n, "full") && "col-span-full")}>
              <span className="mt-0.5">{control(c, clean(textOf(n)))}</span>
              <span className="min-w-0 text-sm font-bold leading-6 text-ink [&_strong]:block">{rest.map((r) => r.tag === "#text" ? <Fragment key={r.key}>{r.text}</Fragment> : <Fragment key={r.key}>{inline({ ...r, kids: r.kids.length ? r.kids : [r] })}</Fragment>)}</span>
            </label>);
        }
        if (c && controlsIn(n).length > 1) {
          const lab = n.kids.find((k) => (k.tag === "span" || k.tag === "legend" || k.tag === "#text") && !find(k, isControl));
          return <div key={n.key} className="col-span-full flex min-w-0 flex-col gap-2">{lab && <span className="text-[13px] font-bold text-ink">{clean(textOf(lab))}</span>}{kids({ ...n, kids: n.kids.filter((k) => k !== lab) })}</div>;
        }
        if (c) {
          const lab = n.kids.find((k) => (k.tag === "span" || k.tag === "#text" || k.tag === "label" || k.tag === "strong") && !find(k, isControl) && textOf(k).trim());
          const { text: labText, required } = fieldLabel(lab ? clean(textOf(lab)) : "", c);
          return (
            <div key={n.key} className={cn("flex min-w-0 flex-col gap-2", (has(n, "full") || c.tag === "textarea") && "col-span-full")}>
              <span className="text-[13px] font-bold text-ink">{labText}{required && <span className="mr-1 text-destructive" aria-label="ضروری">*</span>}</span>
              {control(c, labText)}
              {n.kids.filter((k) => k !== lab && k !== c).map((k) => k.tag === "small" || k.tag === "#text" ? <small key={k.key} className="text-xs leading-6 text-muted-foreground">{clean(textOf(k))}</small> : render(k))}
            </div>);
        }
        return <div key={n.key} className="text-sm font-bold text-ink">{kids(n)}</div>;
      }
      case "details": {
        const sum = n.kids.find((k) => k.tag === "summary");
        return (
          <Accordion key={n.key} type="single" collapsible value={n.open ? "x" : ""} onValueChange={(v) => { const el = refs.current.get(n.key) as HTMLDetailsElement | undefined; if (el) { el.open = v === "x"; sync(); } }} className="rounded-2xl border border-border bg-white px-5">
            <AccordionItem value="x" className="border-0"><AccordionTrigger className="py-4 text-right text-[15px] font-extrabold text-ink hover:no-underline">{sum ? clean(textOf(sum)) : "جزئیات"}</AccordionTrigger>
              <AccordionContent className="space-y-4 pb-5">{n.kids.filter((k) => k !== sum).map((k) => render(k))}</AccordionContent></AccordionItem>
          </Accordion>);
      }
      case "nav": if (has(n, "ext-flow") || has(n, "fi-stepbar")) return <Steps key={n.key} items={n.kids} />; return <div key={n.key} className="flex flex-wrap gap-2">{kids(n)}</div>;
      case "form": case "fieldset": case "section": case "main": case "header": case "footer": case "div": case "article": case "aside": case "dialog": {
        if (!n.kids.length) return null;
        if (has(n, "fi-stepbar") || has(n, "ext-flow")) return <Steps key={n.key} items={n.kids} />;
        if (has(n, "ext-head") || has(n, "dialog-top")) { const h = find(n, (x) => x.tag === "h2" || x.tag === "h3"); const eb = find(n, (x) => has(x, "eyebrow")); return n.cls.includes("dialog-top") ? <Fragment key={n.key}>{h && <DialogTitle className="text-xl font-black leading-8 text-ink">{clean(textOf(h))}</DialogTitle>}</Fragment> : <Head key={n.key} eyebrow={eb ? clean(textOf(eb)) : ""} title={h ? clean(textOf(h)) : ""} />; }
        if (has(n, "eyebrow")) return <span key={n.key} className="text-[13px] font-extrabold text-primary">{text}</span>;
        const allText = n.kids.every((k) => k.tag === "#text" || k.tag === "strong" || k.tag === "small" || k.tag === "a" || k.tag === "span" || k.tag === "b") && !find(n, (x) => isControl(x) || x.tag === "button");
        const note = has(n, "ext-note") || has(n, "fi-plain-note") || has(n, "fi-assumption") || has(n, "vivid-privacy-note") || has(n, "vivid-mini-note") || has(n, "source-note") || has(n, "ext-status") || has(n, "field-note");
        if (note) { const warn = has(n, "warn"); return <div key={n.key} className={cn("col-span-full flex gap-3 rounded-2xl px-4 py-3.5 text-sm leading-7", warn ? "bg-amber-50 text-amber-900" : "bg-muted text-ink/80")}>{warn ? <Warning2 size={20} variant="Bulk" className="mt-1 shrink-0" /> : <InfoCircle size={20} variant="Bulk" className="mt-1 shrink-0 text-primary" />}<div className="min-w-0 flex-1 space-y-2">{allText ? inline(n) : kids(n)}</div></div>; }
        if (has(n, "error") || has(n, "fi-error")) return text ? <p key={n.key} role="alert" className="col-span-full flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-bold text-destructive"><Warning2 size={18} variant="Bulk" />{text}</p> : null;
        if (allText) return text ? <div key={n.key} className={cn("text-sm leading-7 text-ink/80", n.attr["aria-current"] && "font-extrabold text-primary")}>{inline(n)}</div> : null;
        const fields = n.kids.filter((k) => k.tag === "label" || has(k, "field")).length;
        const grid = has(n, "form-grid") || has(n, "fi-grid") || has(n, "lp-service-grid") || has(n, "ma-checks") || has(n, "fi-checks") || has(n, "ext-evidence") || has(n, "ext-mini-grid") || has(n, "fi-families") || has(n, "fi-three-parts") || (fields >= 2 && fields >= n.kids.length - 1);
        const cards = has(n, "ext-card-grid") || has(n, "fi-provider-grid") || has(n, "cards") || has(n, "ext-source-list");
        const card = has(n, "ext-card") || has(n, "fi-provider") || has(n, "fi-case") || has(n, "ext-source") || has(n, "lp-service-output") || has(n, "dialog-section") || has(n, "lp-package") || has(n, "fi-definition") || has(n, "vivid-idea-result") || has(n, "compare-scroll");
        const multi = n.kids.filter(isCheck).length >= 3;
        return <div key={n.key} className={cn(multi && "col-span-full",
          has(n, "ext-actions") || has(n, "lp-order-actions") || has(n, "ma-context-links") || has(n, "fi-library-filter") || has(n, "ma-source-links") ? "flex flex-wrap items-center gap-2.5" : grid && !multi ? cn("grid grid-cols-2 gap-4", (has(n, "fi-families") || has(n, "fi-three-parts")) && "grid-cols-3") : cards ? "grid grid-cols-2 gap-4" : "flex min-w-0 flex-col gap-4",
          card && "rounded-3xl border border-border bg-white p-5", has(n, "full") && "col-span-full", has(n, "ext-actions") && "pt-1", has(n, "lp-services") && "col-span-full")}>{kids(n)}</div>;
      }
      default: return n.kids.length ? <div key={n.key} className="flex flex-col gap-3">{kids(n)}</div> : null;
    }
  }

  return (
    <>
      <iframe ref={frame} {...engineFrame()} title="موتور خدمات" aria-hidden tabIndex={-1} className="pointer-events-none fixed -left-[200vw] top-0 h-[900px] w-[1280px] opacity-0" />
      {tree ? <div className="flex flex-col gap-5">{tree.kids.map((k) => render(k))}</div>
        : <div className="space-y-4">{[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-muted" />)}</div>}
      {dialogs.map((d) => (
        <Dialog key={d.key} open onOpenChange={(o) => { if (!o) { (refs.current.get(d.key) as HTMLDialogElement | undefined)?.close(); sync(); } }}>
          <DialogContent dir="rtl" className="thin-scroll max-h-[88dvh] overflow-y-auto rounded-[2rem] p-7 sm:max-w-4xl" aria-describedby={undefined}>
            {!find(d, (x) => has(x, "dialog-top")) && <DialogTitle className="sr-only">جزئیات</DialogTitle>}
            <div className="flex flex-col gap-4">{d.kids.map((k) => render(k))}</div>
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
}

function Head({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div>{eyebrow && <span className="text-[13px] font-extrabold text-primary">{eyebrow}</span>}<h1 className="mt-1 text-3xl font-black leading-[1.5] text-ink">{title}</h1></div>;
}

function Steps({ items }: { items: N[] }) {
  const flat = items.filter((i) => i.tag !== "#text");
  return (
    <ol className="flex items-stretch gap-2">
      {flat.map((s, i) => { const on = s.attr["aria-current"] != null; const small = s.kids.find((k) => k.tag === "small"); const label = clean(s.kids.filter((k) => k !== small).map(textOf).join("")).replace(/^[۰-۹0-9]+[.\s]*/u, "");
        return <li key={s.key} className={cn("flex flex-1 items-center gap-3 rounded-2xl border px-4 py-3", on ? "border-primary bg-primary/[0.06]" : "border-border bg-white")}>
          <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-sm font-black", on ? "bg-primary text-white" : "bg-muted text-ink/60")}>{faNumber(i + 1)}</span>
          <span className="min-w-0"><span className={cn("block truncate text-sm font-extrabold", on ? "text-ink" : "text-ink/60")}>{label}</span>{small && <span className="block truncate text-xs text-muted-foreground">{clean(textOf(small))}</span>}</span></li>; })}
    </ol>
  );
}

function FileField({ accept, label, onFiles }: { accept?: string; label?: string; onFiles: (f: File[]) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [names, setNames] = useState<string[]>([]);
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-ink/20 bg-white p-3">
      <input ref={ref} type="file" multiple accept={accept} aria-label={label} className="sr-only" onChange={(e) => { const f = [...(e.target.files ?? [])]; setNames(f.map((x) => x.name)); onFiles(f); }} />
      <Button type="button" variant="outline" onClick={() => ref.current?.click()} className="h-10 gap-2 rounded-full bg-white px-4 text-[13px] font-extrabold shadow-none hover:border-primary hover:text-primary"><DocumentDownload size={17} variant="Bulk" className="rotate-180" />انتخاب فایل</Button>
      <span className="min-w-0 truncate text-[13px] font-semibold text-muted-foreground" dir="auto">{names.length ? names.join("، ") : "فایلی انتخاب نشده است"}</span>
    </div>
  );
}

function MultiDrop({ items, onToggle, single }: { items: { key: string; checked: boolean; disabled: boolean; title: string; hint?: string }[]; onToggle: (key: string) => void; single?: boolean }) {
  const [open, setOpen] = useState(false);
  const on = items.filter((i) => i.checked);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" aria-expanded={open} className="h-auto min-h-12 w-full justify-between gap-3 whitespace-normal rounded-2xl bg-white px-4 py-2 text-right shadow-none hover:bg-white">
          <span className={cn("flex min-w-0 flex-wrap gap-1.5 text-sm", on.length ? "font-bold text-ink" : "font-semibold text-muted-foreground")}>
            {on.length ? on.map((i) => <span key={i.key} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[12px] font-extrabold text-primary">{i.title}</span>) : "انتخاب کنید"}
          </span>
          <span className="flex shrink-0 items-center gap-2 text-xs font-bold text-muted-foreground">{!single && on.length > 0 && `${faNumber(on.length)} از ${faNumber(items.length)}`}<ArrowDown2 size={16} className={cn("transition-transform", open && "rotate-180")} /></span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="thin-scroll max-h-80 w-(--radix-popover-trigger-width) overflow-y-auto rounded-2xl p-1.5">
        {items.map((i) => (
          <label key={i.key} className={cn("flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-primary/5", i.checked && "bg-primary/[0.06]")}>
            <Checkbox role={single ? "radio" : undefined} checked={i.checked} disabled={i.disabled} onCheckedChange={() => { if (single && i.checked) return; onToggle(i.key); if (single) setOpen(false); }} className={cn("mt-0.5 size-5 border-ink/25 bg-white", single ? "rounded-full" : "rounded-md")} />
            <span className="min-w-0"><span className="block text-sm font-bold leading-6 text-ink">{i.title}</span>{i.hint && <span className="block text-xs leading-5 text-muted-foreground">{i.hint}</span>}</span>
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}
