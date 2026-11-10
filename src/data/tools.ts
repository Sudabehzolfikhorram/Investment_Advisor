// خدمات و فرم‌های مستقل نسخه مرجع. نام و توضیح هر مورد از همان نسخه آمده است.
export interface ToolDef { id: string; name: string; description: string; group: "plan" | "land" | "more" | "docs"; opener: string; root: string }

export const toolGroups: { id: ToolDef["group"]; name: string }[] = [
  { id: "plan", name: "طرح و ایده" },
  { id: "land", name: "زمین و سرمایه بین‌المللی" },
  { id: "more", name: "خدمات تکمیلی" },
  { id: "docs", name: "راهنما و پیش‌نویس‌ها" },
];

export const tools: ToolDef[] = [
  { id: "proposal", group: "plan", name: "معرفی طرح و نیاز مالی", description: "طرح خود را معرفی کنید و پیش‌نیازهای تأمین مالی یا همکاری را بشناسید.", opener: '[data-ext-open="proposal"]', root: "#ext-proposal" },
  { id: "ideas", group: "plan", name: "ایده‌های نو و طرح‌های پیشنهادی", description: "ایده شما، آغاز یک فرصت تازه.", opener: "[data-vivid-ideas]", root: "#vivid-ideas" },
  { id: "land-preparation", group: "land", name: "آماده‌سازی و توسعه زمین", description: "خدمات اجرایی، مالکیتی، حقوقی و حفاظت موردنیاز زمین یا ملک را انتخاب کنید.", opener: "#open-land-preparation", root: "#land-preparation" },
  { id: "foreign-investment", group: "land", name: "سرمایه‌گذاری بین‌المللی", description: "با سرمایه، اعتبار یا توان تخصصی بین‌المللی در توسعه پروژه‌ها نقش داشته باشید.", opener: "#open-foreign-investment", root: "#fi-service" },
  { id: "ma-notice", group: "more", name: "پرونده فرصت", description: "پرونده فرصت و خدمات تکمیلی.", opener: '[data-ma-open="notice"]', root: "#ma-tools" },
  { id: "ma-renewal", group: "more", name: "نوسازی و اسکان موقت", description: "برای نوسازی، محدوده مصوب، وضعیت ساکنان و نقدینگی اسکان موقت را بررسی کنید.", opener: '[data-ma-open="renewal"]', root: "#ma-tools" },
  { id: "ma-manager", group: "more", name: "اجاره‌داری حرفه‌ای", description: "مسیر مدیریت اجاره‌داری را جدا بررسی کنید.", opener: '[data-ma-open="manager"]', root: "#ma-tools" },
  { id: "ma-exchange", group: "more", name: "معاوضه ملک", description: "ملک خود را برای معاوضه معرفی کنید.", opener: '[data-ma-open="exchange"]', root: "#ma-tools" },
  { id: "ma-profile", group: "more", name: "پروفایل حرفه‌ای من", description: "اطلاعات حرفه‌ای ثابت خود را اختیاری ثبت کنید؛ فقط روی دستگاه شما ذخیره می‌شود.", opener: '[data-ma-open="profile"]', root: "#ma-tools" },
  { id: "charity", group: "more", name: "همراهی در کار خیر", description: "حوزه، نوع و اندازه همراهی خود را انتخاب کنید و دورنمای اثر آن را ببینید.", opener: "role:charity", root: '[data-panel="2"]|#results' },
  { id: "library", group: "docs", name: "راهنما و مستندات", description: "مدل‌های همکاری، مدارک موردنیاز و مراحل ورود را مرور کنید.", opener: '[data-ext-open="library"]', root: "#ext-library" },
  { id: "drafts", group: "docs", name: "منتخب‌ها و پیش‌نویس‌های من", description: "آنچه در این خدمات ذخیره کرده‌اید، روی همین دستگاه.", opener: '[data-ext-open="saved"]', root: "#ext-saved" },
];
export const toolById = (id: string) => tools.find((t) => t.id === id);
