// فایل راهنمای اقدام: یک HTML مستقل که هم در صفحه راهنما پیش‌نمایش می‌شود و هم دانلود می‌شود.
// برای پروژه‌هایی است که کارشناس اختصاصی ندارند (مطابق نسخه مرجع که خروجی راهنما را HTML می‌دهد).
import { advisories } from "@/data/advisories";
import { routeSteps } from "@/data/routes";
import type { RouteId } from "@/types";
import { dossier, factGroups } from "./facts";
import type { Listing, Opportunity } from "@/types";
import { faNumber } from "./utils";

import { docShell, esc } from "./doc-template";
import { splitPending } from "./facts";

const css = `
section{padding:26px 0;border-bottom:1px dashed #e4e9e8}section:last-child{border:0}
.doc-body section h2{margin:0 0 14px}.doc-body .card h3{margin:0 0 8px;font-size:13px;color:#0f766e;font-weight:800}
.doc-body h2 b{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;background:#0b1f1d;color:#fff;font-size:14px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.card{border:1px solid #e4e9e8;border-radius:18px;padding:16px 18px}
.card h3{margin:0 0 8px;font-size:13px;color:#0f766e;font-weight:800}.row{display:flex;justify-content:space-between;gap:12px;padding:5px 0;border-top:1px solid #f2f4f4;font-size:13px}.row:first-of-type{border:0}
.row span{color:#667473;white-space:nowrap}.row strong{text-align:left;font-weight:800}
.flow{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:10px;align-items:stretch}.flow .arrow{align-self:center;color:#0f766e;font-size:22px;font-weight:900}
.flow .card p{margin:0;font-weight:700;line-height:1.9}
.note{padding:16px 20px;border-radius:18px;background:#faf5ea;border:1px solid #ecdcb9;font-weight:700}
ul.check{list-style:none;margin:12px 0 0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:10px}
input[type=checkbox]{position:absolute;opacity:0;pointer-events:none}label{cursor:pointer}
ul.check li{border:1px solid #e4e9e8;border-radius:14px;font-size:13.5px;font-weight:600;line-height:1.9;transition:.2s}ul.check li:hover,ol.steps li:hover{border-color:#0f766e}
ul.check label{display:flex;align-items:flex-start;gap:10px;padding:10px 14px}
ul.check i{flex:none;margin-top:5px;width:17px;height:17px;border:2px solid #0f766e;border-radius:5px;background:#fff center/11px no-repeat}
ul.check li:has(input:checked){border-color:#0f766e;background:#f3f9f8}
ul.check li:has(input:checked) i{background-color:#0f766e;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none' stroke='white' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2.5 6.5l2.3 2.3 4.7-5.3'/%3E%3C/svg%3E")}
label:has(input:focus-visible){outline:2px solid #0f766e;outline-offset:2px;border-radius:14px}
ol.steps{list-style:none;margin:0;padding:0;counter-reset:s}ol.steps li{counter-increment:s;position:relative;margin-bottom:10px;border:1px solid #e4e9e8;border-radius:16px;font-weight:700;transition:.2s}
ol.steps label{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 56px 12px 14px}
ol.steps li:before{content:counter(s,persian);position:absolute;right:14px;top:11px;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#e7f1f0;color:#0f766e;font-weight:900}
.mine{display:grid;grid-template-columns:1fr 1fr;gap:0 28px;border:1px solid #e4e9e8;border-radius:18px;padding:10px 18px;background:#f7faf9}.mine .row{border-top:0;border-bottom:1px solid #eaf0ee;padding:8px 0}
.ans{margin-top:4px;display:inline-block;padding:2px 14px;border-radius:99px;background:#e7f1f0;color:#0b1f1d;font-size:13.5px;font-weight:700}.ans b{color:#0f766e}
ol.steps em{flex:none;font-style:normal;font-size:12px;font-weight:800;padding:2px 12px;border-radius:99px;background:#f2f4f4;color:#667473;white-space:nowrap}ol.steps em:after{content:"بررسی نشده"}
ol.steps li:has(input:checked){border-color:#0f766e;background:#f3f9f8}ol.steps li:has(input:checked) em{background:#0f766e;color:#fff}ol.steps li:has(input:checked) em:after{content:"بررسی شد"}
.q{padding:10px 0;border-top:1px solid #f2f4f4}.q:first-child{border:0}.q p{margin:0;font-weight:800}.q small{display:block;color:#667473;font-size:12.5px}
@media(max-width:640px){.grid,.flow,ul.check,.mine{grid-template-columns:1fr}.flow .arrow{transform:rotate(-90deg);justify-self:center}}
`;

/** آنچه کاربر خودش پر کرده و در فایل راهنما می‌آید (مطابق نسخه مرجع: شرایط، پاسخ پرسش‌ها، تیک گام‌ها و نوع پیگیری) */
export interface GuideContext { mine?: [string, string][]; answers?: Record<string, string>; checked?: string[]; kind?: string }
export const followUpKinds = [
  { value: "documents", label: "درخواست بررسی اسناد و شرایط" },
  { value: "visit", label: "بررسی امکان بازدید" },
  { value: "interest", label: "اعلام علاقه‌مندی به همکاری" },
];

export function guideHtml(l: Listing, ctx: GuideContext = {}): string {
  const o = l.kind === "project" ? (l.raw as Opportunity) : null;
  const adv = o ? advisories[o.subtype] : undefined;
  const groups = factGroups(l);
  let n = 0;
  const sec = (title: string, body: string) => `<section><h2><b>${faNumber(++n)}</b>${title}</h2>${body}</section>`;
  const parts: string[] = [];

  const rowsHtml = (rows: [string, string][], label = "ثبت نشده") => { const { known, pending } = splitPending(rows);
    return known.map(([k, v]) => `<div class="row"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join("") + (pending.length ? `<p class="pending"><b>${label}:</b> ${pending.map(esc).join("، ")}</p>` : ""); };
  parts.push(sec("پروژه در یک نگاه", `<div class="grid">${groups.map((g) => `<div class="card"><h3>${g.title}</h3>${rowsHtml(g.items)}</div>`).join("")}</div>`));

  const kind = followUpKinds.find((k) => k.value === ctx.kind)?.label;
  const mine: [string, string][] = [...(kind ? [["نوع پیگیری", kind] as [string, string]] : []), ...(ctx.mine ?? [])];
  if (mine.length) parts.push(sec("شرایط شما", `<div class="mine">${mine.map(([k, v]) => `<div class="row"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join("")}</div>`));

  {
    const t = l.raw as { finance?: string; repay?: string; ownership?: string | null; caution?: string };
    const flow = [["پول از کجا می‌آید", t.finance], ["چطور برمی‌گردد", t.repay], ["مالکیت و سهم", t.ownership]].filter((x) => x[1]) as [string, string][];
    if (flow.length) parts.push(sec("مسیر پول", `<div class="flow" style="grid-template-columns:${flow.map(() => "1fr").join(" auto ")}">${flow.map(([t, d], i) => `${i ? '<div class="arrow">←</div>' : ""}<div class="card"><h3>${t}</h3><p>${esc(d)}</p></div>`).join("")}</div>`));
    if (!o && t.caution) parts.push(sec("پیش از اقدام بدانید", `<div class="note">${esc(t.caution)}</div>`));
  }
  if (o) {
    const flow: [string, string][] = [];
    if (flow.length) parts.push(sec("مسیر پول", `<div class="flow" style="grid-template-columns:${flow.map(() => "1fr").join(" auto ")}">${flow.map(([t, d], i) => `${i ? '<div class="arrow">←</div>' : ""}<div class="card"><h3>${t}</h3><p>${esc(d)}</p></div>`).join("")}</div>`));
    const checks = [...new Set([...(o.checks ?? []), ...(adv?.baseChecks ?? [])])];
    if (o.caution || checks.length) parts.push(sec("پیش از اقدام بدانید", `${o.caution ? `<div class="note">${esc(o.caution)}</div>` : ""}${checks.length ? `<ul class="check">${checks.map((c) => `<li><label><input type="checkbox" data-k="${esc(c)}"${ctx.checked?.includes(c) ? " checked" : ""}><i></i>${esc(c)}</label></li>`).join("")}</ul>` : ""}`));
    if (adv?.questions.length) parts.push(sec("پرسش‌هایی که باید پاسخشان را آماده کنید", `${adv.context ? `<p style="margin:0 0 8px;color:#667473">${esc(adv.context)}</p>` : ""}${adv.questions.map((q) => { const a = ctx.answers?.[q.id]; const opt = q.options.find((x) => x.value === a);
      return `<div class="q"><p>${esc(q.label)}</p>${opt ? `<div class="ans"><b>پاسخ شما:</b> ${esc(opt.label)}</div>${q.actions[a!] ? `<small>${esc(q.actions[a!])}</small>` : ""}` : `<small>${q.options.map((x) => esc(x.label)).join(" / ")}</small>`}</div>`; }).join("")}`));
  }
  parts.push(sec("پرونده کامل", dossier(l).map((d) => `<div class="card" style="margin-bottom:10px"><h3>${esc(d.title)}</h3>${d.note ? `<p style="margin:0 0 6px;color:#667473;font-size:12px">${esc(d.note)}</p>` : ""}${rowsHtml(d.rows, "هنوز ثبت نشده و با دریافت اسناد کامل می‌شود")}${(d.notes ?? []).map(([k, v]) => `<p style="margin:8px 0 0;font-size:12px"><b>${esc(k)}: </b>${esc(v)}</p>`).join("")}</div>`).join("")));
  {
    const fundSteps = l.kind === "fund" ? (l.raw as { steps?: string[] }).steps : undefined;
    const steps = o?.steps.length ? o.steps : fundSteps?.length ? fundSteps : routeSteps[l.routes[0] as RouteId] ?? [];
    if (steps.length) parts.push(sec("گام‌های اقدام", `<ol class="steps">${steps.map((s) => `<li><label><input type="checkbox" data-k="${esc(s)}"${ctx.checked?.includes(s) ? " checked" : ""}><span>${esc(s)}</span><em></em></label></li>`).join("")}</ol>`));
  }

  return docShell({ kind: "راهنمای اقدام", title: l.title, meta: [l.city ? `${l.province}، ${l.city}` : "", ...l.tags, l.id].filter(Boolean) as string[], body: parts.join(""), css });
}

export const hasGuide = (l: Listing) => !(l.kind === "project" && (l.raw as Opportunity).expert);
