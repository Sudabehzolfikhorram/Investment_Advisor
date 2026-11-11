// قالب یکسان همه فایل‌های راهنما که دانلود می‌شوند: سربرگ، پانویس و سبک نوشتار.
// هم راهنمای اقدام پروژه‌ها و هم خروجی HTML خدمات با همین قالب ساخته می‌شوند.
import { site } from "@/data/site";
import { scrub } from "./scrub";

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const mark = `<svg viewBox="150 60 800 380" width="22" height="22" fill="none" stroke="currentColor" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"><path d="M232 248C302 248 332 292 360 342C386 386 414 393 440 390C466 387 490 372 502 357L703 92V395M585 250H703M703 395C703 300 742 250 880 250"/></svg>`;
const node = `<svg viewBox="60 70 1090 350" width="62" height="20" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"><path d="M168 248H232C302 248 332 292 360 342C386 386 414 393 440 390C466 387 490 372 502 357L703 92V395"/><path d="M585 250H703M703 395C703 300 742 250 900 250H1042"/><circle cx="120" cy="250" r="50" fill="currentColor" stroke="none"/><circle cx="1087" cy="250" r="44"/></svg>`;

const fontImport = `@import url("https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css");`;
export const docCss = `
*{box-sizing:border-box}html,body{margin:0;padding:0}
body{background:#f3f5f5!important;color:#083b37;font:15px/2 Vazirmatn,Tahoma,Arial,sans-serif;direction:rtl}
.sheet{max-width:860px;margin:32px auto;background:#fff;border:1px solid #e4e9e8;border-radius:28px;overflow:hidden}
.doc-head{position:relative;padding:28px 44px 30px;border-bottom:1px solid #e4e9e8;background:linear-gradient(135deg,#fff 55%,#eef6f4)}
.doc-head:after{content:"";position:absolute;inset:0 0 auto;height:4px;background:linear-gradient(to left,#0f766e,#5aa79f 60%,transparent)}
.doc-brand{display:flex;align-items:center;justify-content:space-between;gap:16px}
.doc-logo{display:flex;align-items:center;gap:10px;font-weight:900;font-size:16px;color:#083b37}
.doc-logo i{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;background:#0f766e;color:#fff;font-style:normal}
.doc-logo small{display:block;font-size:11.5px;font-weight:600;color:#667473;line-height:1.6}
.doc-stamp{text-align:left;font-size:12px;color:#667473;line-height:1.8}.doc-stamp b{display:block;color:#0f766e;font-size:12.5px}
.doc-kicker{display:flex;align-items:center;gap:8px;margin:26px 0 4px;font-size:13px;font-weight:800;color:#0f766e}
.doc-head h1{margin:0;font-size:29px;line-height:1.55;font-weight:900;color:#083b37}.doc-body h1,.doc-body h2,.doc-body h3{color:#083b37;background:none}
.doc-meta{margin-top:12px;display:flex;flex-wrap:wrap;gap:8px}.pill{padding:2px 14px;border-radius:99px;background:#f2f4f4;font-size:12.5px;font-weight:700}
.doc-body{padding:8px 44px 36px}
.doc-foot{display:flex;justify-content:space-between;gap:24px;padding:22px 44px;background:#dcecea;color:#3d5552;font-size:12px;line-height:1.9}
.doc-foot b{color:#083b37;font-size:13px}.doc-foot .doc-foot-end{text-align:left;white-space:nowrap}
/* نوشتار عمومی داخل سند */
.doc-body h2{display:flex;align-items:center;gap:12px;margin:26px 0 12px;font-size:19px;font-weight:900}
.doc-body h3{margin:20px 0 8px;font-size:15.5px;font-weight:900;color:#083b37}
.doc-body h4{margin:14px 0 6px;font-size:14px;font-weight:800;color:#0f766e}
.doc-body p{margin:8px 0;line-height:2}.doc-body p,.doc-body li,.doc-body td,.doc-body dd{color:#083b37}.doc-body a{color:#0f766e;font-weight:700}
.doc-body ul:not(.check),.doc-body ol:not(.steps){margin:8px 0;padding:0 22px 0 0}.doc-body li{margin:3px 0}
.doc-body table{width:100%;border-collapse:separate;border-spacing:0;margin:12px 0;font-size:13.5px;border:1px solid #e4e9e8;border-radius:16px;overflow:hidden}
.doc-body th,.doc-body td{padding:10px 14px;text-align:right;vertical-align:top;border-bottom:1px solid #eef2f1}
.doc-body th{background:#f2f6f5;font-weight:800;width:34%}.doc-body tr:last-child th,.doc-body tr:last-child td{border-bottom:0}
.doc-body dl{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}.doc-body dl>div{border:1px solid #e4e9e8;border-radius:14px;padding:10px 14px}
.doc-body dt{font-size:12px;color:#667473}.doc-body dd{margin:0;font-weight:800}
.doc-body .ext-note,.doc-body .notice,.doc-body .note{padding:14px 18px;border-radius:16px;background:#f3f9f8;border:1px solid #dcecea;font-weight:700}
.pending{margin-top:10px;padding:10px 14px;border:1px dashed #d5dedd;border-radius:14px;font-size:12.5px;color:#667473;line-height:1.9}.pending b{color:#083b37}
@media print{body{background:#fff}.sheet{margin:0;border:0;border-radius:0;max-width:none}section{break-inside:avoid}.doc-foot{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
@media(max-width:640px){.doc-head,.doc-body,.doc-foot{padding-inline:22px}.doc-foot{flex-direction:column}.doc-body dl{grid-template-columns:1fr}}
`;

const today = () => { try { return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { day: "numeric", month: "long", year: "numeric" }).format(new Date()); } catch { return ""; } };

/** سند کامل با سربرگ و پانویس ثابت */
// sourceCss پیش از سبک قالب می‌آید (قالب بر آن غالب است)؛ css بعد از قالب (برای اجزای خاص همان سند)
export function docShell({ kind, title, meta = [], body, css = "", sourceCss = "", note }: { kind: string; title: string; meta?: string[]; body: string; css?: string; sourceCss?: string; note?: string }) {
  const date = today();
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(kind)} | ${esc(title)}</title><style>${fontImport}${sourceCss.replace(/@import[^;]+;/g, "")}${docCss}${css}</style></head><body><div class="sheet">
<header class="doc-head"><div class="doc-brand"><span class="doc-logo"><i>${mark}</i><span>${esc(site.name)}<small>${esc(site.tagline)}</small></span></span><span class="doc-stamp"><b>${esc(kind)}</b>${date ? `تاریخ تهیه: ${date}` : ""}</span></div>
<p class="doc-kicker">${node}${esc(kind)}</p><h1>${esc(title)}</h1>${meta.length ? `<div class="doc-meta">${meta.map((t) => `<span class="pill">${esc(t)}</span>`).join("")}</div>` : ""}</header>
<main class="doc-body">${body}</main>
<footer class="doc-foot"><span><b>${esc(site.name)}</b><br>${esc(note ?? "این راهنما برای آماده شدن پیش از اقدام است و تعهد پرداخت یا تضمین سود نیست.")}</span><span class="doc-foot-end">این فایل روی دستگاه شما ساخته شده<br>و اطلاعاتی از آن ارسال نشده است.</span></footer>
</div></body></html>`;
}

/** خروجی HTML خدمات نسخه مرجع را در همین قالب می‌گذارد؛ متن و داده‌های سند دست نمی‌خورد */
export function wrapLegacyDoc(raw: string, fallbackTitle: string) {
  const doc = new DOMParser().parseFromString(raw, "text/html");
  doc.querySelectorAll("script, .letterhead, .letterhead-foot, header.letterhead").forEach((e) => e.remove());
  // اشاره به فرضی بودن داده‌ها در فایل هم نمی‌آید
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) if (/فرضی|آموزشی/.test(n.textContent ?? "")) n.textContent = scrub(n.textContent ?? "");
  const styles = [...doc.querySelectorAll("style")].map((s) => s.textContent ?? "").join("\n");
  doc.querySelectorAll("style").forEach((s) => s.remove());
  const h1 = doc.body.querySelector("h1");
  const title = (h1?.textContent || doc.title || fallbackTitle).trim();
  h1?.remove();
  // خط پایانی نسخه مرجع (نسخه و راهنمای چاپ) با پانویس یکسان جایگزین می‌شود
  doc.querySelectorAll(".ext-foot").forEach((e) => e.remove());
  const body = doc.body.innerHTML.replace(/\s*[—–]\s*/g, "، ");
  return docShell({ kind: "راهنمای خدمت", title, body, sourceCss: styles.replace(/(^|\})\s*(html|body)\s*\{[^}]*\}/g, "$1") });
}
