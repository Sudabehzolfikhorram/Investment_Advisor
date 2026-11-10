// در ساخت تک‌فایلی، نسخه مرجع درون همان فایل جاسازی می‌شود.
import html from "../../public/engine/advisor.html?raw";
export const engineFrame = (): { src?: string; srcDoc?: string } => ({ srcDoc: html });
