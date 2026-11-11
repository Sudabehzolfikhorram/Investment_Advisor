import { Suspense } from "react";
import { Assistant } from "@/components/assistant/assistant";
export const metadata = { title: "دستیار | سرمایه‌نما" };
export default function AssistantPage() { return <Suspense><Assistant /></Suspense>; }
