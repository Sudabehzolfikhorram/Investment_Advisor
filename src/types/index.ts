export type RouteId =
  | "investor" | "fund" | "contractor" | "buyer"
  | "lessee" | "heritage" | "charity" | "operator";

export type Risk = "low" | "medium" | "high" | "unknown";
export type Income = "any" | "periodic" | "end";

export interface ProjectSubtype {
  id: string;
  name: string;
  fullName: string;
  examples?: string;
  /** شاخص ظرفیت این نوع پروژه، مثل «زیربنای مسکونی» */
  metric?: string;
  unit?: string;
}

export interface ProjectGroup {
  id: string;
  name: string;
  fullName: string;
  subtypes: ProjectSubtype[];
}

export interface Expert {
  name: string;
  mobile: string;
}

export interface Opportunity {
  id: string;
  kind: "project";
  title: string;
  group: string;
  subtype: string | null;
  province: string;
  city: string;
  routes: string[];
  stage: string;
  model: string;
  /** میلیارد تومان */
  minCapital: number | null;
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
  steps: string[];
  /** کارشناس پروژه؛ اگر نباشد guideFileUrl نمایش داده می‌شود */
  expert: Expert | null;
  guideFileUrl: string | null;
  /** برای نشان «جدید» در پروفایل‌های ذخیره‌شده */
  publishedAt: string;
  /** IRR پیش‌بینی (درصد)؛ در داده نمونه موجود نیست */
  irr?: number | null;
  imageUrl?: string;
}

export interface Fund {
  id: string;
  title: string;
  kind: string;
  type: string;
  /** میلیون تومان */
  minimumMillion: number;
  forecast: number | null;
  payout: string;
  risk: string;
  bank: { exists: boolean | null; verified: boolean; principal: boolean | null; profit: boolean | null; [key: string]: unknown };
  durationMonths: number | null;
  exit: string;
  assetSector?: string;
}

export interface SaleItem {
  id: string;
  category: string;
  title: string;
  usage?: string;
  area?: number;
  landArea?: number;
  price: number | null;
  province: string;
  city: string;
  neighborhood: string | null;
  buildingType?: string;
  subject?: string;
  scrapType?: string;
  quantity?: string | null;
}

/** نوع کامپوننت ورودی هر فیلد؛ انتخاب کامپوننت UI در مرحله دیزاین انجام می‌شود */
export type FieldControl =
  | "cards"        // کارت انتخابی تک‌گزینه‌ای
  | "chips"        // چیپ تک‌انتخابی
  | "multi-chips"  // چیپ چندانتخابی
  | "multi-combobox" // چندانتخابی با جست‌وجو
  | "range"        // اسلایدر بازه‌ای (حداقل/حداکثر)
  | "slider"       // اسلایدر تک‌مقداری
  | "segmented"    // دکمه چندحالته
  | "switch"
  | "text"
  | "textarea";

export interface FieldOption { value: string; label: string }

export interface FieldDef {
  id: string;
  label: string;
  control: FieldControl;
  /** base = قبل از نتایج، advanced = فیلتر پیشرفته کنار نتایج، profile = در حساب کاربر */
  placement: "base" | "advanced" | "profile";
  /** گروه نمایش در پنل فیلتر پیشرفته */
  section?: "amount" | "risk" | "project" | "location" | "contract";
  /** مسیرهایی که این فیلد در آن‌ها نمایش داده می‌شود؛ خالی = همه */
  routes?: RouteId[];
  required?: boolean;
  options?: FieldOption[];
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  /** فقط وقتی فیلد دیگری مقدار مشخصی دارد نمایش داده شود */
  showWhen?: { field: string; in?: string[]; filled?: boolean };
}

/** شرایط واردشده توسط کاربر؛ همان چیزی که به‌عنوان «پروفایل جست‌وجو» ذخیره می‌شود */
export interface SearchCriteria {
  route: RouteId;
  groups: string[];
  subtypes: string[];
  provinces: string[];
  cities: string[];
  amount: [number, number] | null;
  [fieldId: string]: unknown;
}

export interface SavedProfile {
  id: string;
  name: string;
  criteria: SearchCriteria;
  createdAt: string;
  lastSeenAt: string;
}

export interface MatchReason {
  field: string;
  label: string;
  status: "met" | "unmet" | "unknown";
}

export interface MatchResult {
  opportunity: Opportunity;
  /** ۰ تا ۱۰۰ */
  score: number;
  reasons: MatchReason[];
}
