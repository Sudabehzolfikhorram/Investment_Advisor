// فایل راهنمای اقدام: یک HTML مستقل که هم در صفحه راهنما پیش‌نمایش می‌شود و هم دانلود می‌شود.
// برای پروژه‌هایی است که کارشناس اختصاصی ندارند (مطابق نسخه مرجع که خروجی راهنما را HTML می‌دهد).
import { advisories } from "@/data/advisories";
import { site } from "@/data/site";
import { routeSteps } from "@/data/routes";
import type { RouteId } from "@/types";
import { dossier, factGroups } from "./facts";
import type { Listing, Opportunity } from "@/types";
import { faNumber } from "./utils";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const mark = `<svg viewBox="60 70 1090 350" width="62" height="20" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"><path d="M168 248H232C302 248 332 292 360 342C386 386 414 393 440 390C466 387 490 372 502 357L703 92V395"/><path d="M585 250H703M703 395C703 300 742 250 900 250H1042"/><circle cx="120" cy="250" r="50" fill="currentColor" stroke="none"/><circle cx="1087" cy="250" r="44"/></svg>`;

const css = `
@import url("https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css");
*{box-sizing:border-box}body{margin:0;background:#f3f5f5;color:#0b1f1d;font:15px/2 Vazirmatn,Tahoma,Arial,sans-serif}
.sheet{max-width:860px;margin:32px auto;background:#fff;border:1px solid #e4e9e8;border-radius:28px;overflow:hidden}
header{padding:36px 44px 30px;border-bottom:1px solid #e4e9e8;background:linear-gradient(135deg,#fff 55%,#eef6f4)}
.brand{display:flex;align-items:center;justify-content:space-between;color:#0f766e;font-weight:800;font-size:14px}
.kicker{margin:26px 0 4px;font-size:13px;font-weight:800;color:#0f766e}h1{margin:0;font-size:30px;line-height:1.5;font-weight:900}
.meta{margin-top:10px;display:flex;flex-wrap:wrap;gap:8px}.pill{padding:2px 14px;border-radius:99px;background:#f2f4f4;font-size:12.5px;font-weight:700}
main{padding:8px 44px 36px}section{padding:26px 0;border-bottom:1px dashed #e4e9e8}section:last-child{border:0}
h2{display:flex;align-items:center;gap:12px;margin:0 0 14px;font-size:19px;font-weight:900}
h2 b{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;background:#0b1f1d;color:#fff;font-size:14px}
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
footer{padding:20px 44px;background:#f7f9f9;border-top:1px solid #e4e9e8;font-size:12.5px;color:#667473}
@media print{body{background:#fff}.sheet{margin:0;border:0;border-radius:0;max-width:none}section{break-inside:avoid}}
@media(max-width:640px){.grid,.flow,ul.check,.mine{grid-template-columns:1fr}.flow .arrow{transform:rotate(-90deg);justify-self:center}header,main,footer{padding-inline:22px}}
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

  parts.push(sec("پروژه در یک نگاه", `<div class="grid">${groups.map((g) => `<div class="card"><h3>${g.title}</h3>${g.items.map(([k, v]) => `<div class="row"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join("")}</div>`).join("")}</div>`));

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
  parts.push(sec("پرونده کامل", dossier(l).map((d) => `<div class="card" style="margin-bottom:10px"><h3>${esc(d.title)}</h3>${d.note ? `<p style="margin:0 0 6px;color:#667473;font-size:12px">${esc(d.note)}</p>` : ""}${d.rows.map(([k, v]) => `<div class="row"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join("")}${(d.notes ?? []).map(([k, v]) => `<p style="margin:8px 0 0;font-size:12px"><b>${esc(k)}: </b>${esc(v)}</p>`).join("")}</div>`).join("")));
  {
    const fundSteps = l.kind === "fund" ? (l.raw as { steps?: string[] }).steps : undefined;
    const steps = o?.steps.length ? o.steps : fundSteps?.length ? fundSteps : routeSteps[l.routes[0] as RouteId] ?? [];
    if (steps.length) parts.push(sec("گام‌های اقدام", `<ol class="steps">${steps.map((s) => `<li><label><input type="checkbox" data-k="${esc(s)}"${ctx.checked?.includes(s) ? " checked" : ""}><span>${esc(s)}</span><em></em></label></li>`).join("")}</ol>`));
  }

  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>راهنمای اقدام | ${esc(l.title)}</title><style>${css}</style></head><body><div class="sheet"><header><div class="brand"><span>${site.name}</span>${mark}</div><p class="kicker">راهنمای اقدام</p><h1>${esc(l.title)}</h1><div class="meta">${[l.city ? `${l.province}، ${l.city}` : "", ...l.tags, l.id].filter(Boolean).map((t) => `<span class="pill">${esc(t as string)}</span>`).join("")}</div></header><main>${parts.join("")}</main><footer>این راهنما برای آماده شدن پیش از اقدام است و تعهد پرداخت یا تضمین سود نیست.</footer></div></body></html>`;
}

export const hasGuide = (l: Listing) => !(l.kind === "project" && (l.raw as Opportunity).expert);
