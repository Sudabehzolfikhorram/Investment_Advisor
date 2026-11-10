export type RouteId =
  | "investor" | "fund" | "contractor" | "buyer"
  | "lessee" | "heritage" | "charity" | "operator";

export interface ProjectSubtype {
  id: string;
  name: string;
  /** شناسه زیردسته‌های نسخه مرجع که در این مورد ادغام شده‌اند */
  sources: string[];
  /** نام کامل همان زیردسته‌ها */
  includes: string[];
  image: string | null;
}

export interface ProjectGroup {
  id: string;
  name: string;
  fullNames: string[];
  icon: string;
  image?: string;
  subtypes: ProjectSubtype[];
}

export interface Expert { name: string; mobile: string }

export interface Opportunity {
  id: string;
  kind: "project";
  title: string;
  group: string;
  subtype: string;
  image: string;
  province: string;
  city: string;
  routes: string[];
  stage: string;
  phase: string;
  model: string;
  /** حداقل سرمایه ورود — میلیارد تومان */
  minCapital: number | null;
  /** نیاز مالی طرح — میلیارد تومان */
  budget?: number;
  executionMonths?: number;
  paybackYears: number | null;
  paybackDownsideYears: number | null;
  lockupMonths: number | null;
  firstIncomeMonths: number | null;
  income: string;
  durationYears: number | null;
  risk: string;
  legalStatus: string;
  finance: string;
  repay: string;
  ownership: string | null;
  caution: string;
  checks?: string[];
  steps: string[];
  metric: { label: string; unit: string; value: number } | null;
  /** کارشناس پروژه؛ اگر نباشد فایل راهنما نمایش داده می‌شود */
  expert: Expert | null;
  guideFileUrl: string | null;
  publishedAt: string;
}

export interface Fund {
  id: string; title: string; kind: string; type: string;
  minimumMillion: number; forecast: number | null; payout: string; risk: string;
  bank: { exists: boolean | null; verified: boolean; principal: boolean | null; profit: boolean | null; [key: string]: unknown };
  durationMonths: number | null; exit: string; assetSector?: string;
}

export interface SaleItem {
  id: string; category: string; title: string; usage?: string; area?: number; landArea?: number;
  price: number | null; province: string; city: string; neighborhood: string | null;
  buildingType?: string; subject?: string; scrapType?: string; quantity?: string | null;
}

export type FieldControl =
  | "cards" | "chips" | "multi-chips" | "multi-combobox" | "range"
  | "slider" | "segmented" | "switch" | "text" | "textarea";

export interface FieldOption { value: string; label: string }

export interface FieldDef {
  id: string;
  label: string;
  control: FieldControl;
  placement: "base" | "advanced" | "profile";
  section?: "amount" | "risk" | "project" | "location" | "contract";
  routes?: RouteId[];
  required?: boolean;
  options?: FieldOption[];
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  showWhen?: { field: string; in?: string[]; filled?: boolean };
}

export type FilterValue = string | number | boolean | string[] | [number, number] | undefined;

/** شرایط واردشده توسط کاربر؛ همان چیزی که به‌عنوان «شرایط ذخیره‌شده» نگه داشته می‌شود */
export interface SearchCriteria {
  route: RouteId;
  groups: string[];
  provinces: string[];
  /** بازه مبلغ با واحد مسیر انتخابی */
  amount: [number, number] | null;
  /** مقادیر فیلتر پیشرفته بر اساس شناسه فیلد */
  filters: Record<string, FilterValue>;
}

export interface SavedProfile {
  id: string;
  name: string;
  criteria: SearchCriteria;
  createdAt: string;
  lastSeenAt: string;
}

export interface MatchReason { label: string; status: "met" | "unmet" | "unknown" }

/** مدل نمایشی مشترک برای پروژه، صندوق و مورد فروش */
export interface Listing {
  id: string;
  kind: "project" | "fund" | "sale";
  title: string;
  image: string;
  province: string | null;
  city: string | null;
  routes: string[];
  group: string | null;
  subtype: string | null;
  tags: string[];
  /** مبلغ برای تطبیق، با واحد مسیر */
  amount: number | null;
  amountLabel: string;
  amountUnit: string;
  stats: { label: string; value: string }[];
  risk: string;
  publishedAt: string;
  raw: Opportunity | Fund | SaleItem;
}

export interface MatchResult { listing: Listing; score: number; reasons: MatchReason[] }
