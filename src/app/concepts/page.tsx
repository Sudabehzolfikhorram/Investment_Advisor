import type { Metadata } from "next";
import { ConceptsIndex } from "@/components/concepts/index-view";

export const metadata: Metadata = { title: "مقایسه کانسپت‌های لندینگ | سرمایه‌نما" };

export default function Page() {
  return <ConceptsIndex />;
}
