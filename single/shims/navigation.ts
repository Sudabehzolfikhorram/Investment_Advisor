// جایگزین next/navigation برای نسخه تک‌فایلی: مسیرها در hash نگه داشته می‌شوند.
import { useSyncExternalStore } from "react";

const read = () => window.location.hash.slice(1) || "/";
const subscribe = (cb: () => void) => { window.addEventListener("hashchange", cb); return () => window.removeEventListener("hashchange", cb); };
export const useHash = () => useSyncExternalStore(subscribe, read, () => "/");
export const usePathname = () => useHash().split("?")[0];
export const useSearchParams = () => new URLSearchParams(useHash().split("?")[1] ?? "");
const router = { push: (href: string) => { window.location.hash = href; }, replace: (href: string) => { window.location.replace(`#${href}`); }, back: () => window.history.back() };
export const useRouter = () => router;
export const notFound = () => { throw new Error("not found"); };
