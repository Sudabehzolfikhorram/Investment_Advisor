// عکس‌ها از پوشه public می‌آیند؛ فقط پیشوند مسیر انتشار اضافه می‌شود.
export const withBase = (src: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${src}`;
export default function imageLoader({ src, width }: { src: string; width: number }) {
  return `${withBase(src)}?w=${width}`;
}
