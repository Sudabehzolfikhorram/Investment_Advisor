import { Suspense } from "react";
import { Assistant } from "@/components/assistant/assistant";
export const metadata = { title: "دستیار | هم‌سرمایه" };
export default function AssistantPage() { return <Suspense><Assistant /></Suspense>; }
