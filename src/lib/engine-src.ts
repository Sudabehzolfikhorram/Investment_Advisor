// نشانی قاب موتور خدمات (نسخه مرجع). در ساخت تک‌فایلی با محتوای درون‌خطی جایگزین می‌شود.
import { withBase } from "./image-loader";
export const engineFrame = (): { src?: string; srcDoc?: string } => ({ src: withBase("/engine/advisor.html") });
