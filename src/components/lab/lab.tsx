"use client";
// صفحه موقت مرور ایده‌ها (دور ۱۹). به منو اضافه نشده و هیچ صفحه‌ای از سایت را تغییر نمی‌دهد.
import { Header, Footer } from "@/components/site/header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal } from "@/components/brand/reveal";
import { cn } from "@/lib/utils";
import { IdeaNotes, Spectrum, type IdeaNote } from "./shared";
import { SentenceIdea } from "./sentence";
import { MoneyFilmIdea } from "./money-film";
import { PortfolioIdea } from "./portfolio";
import { DuelIdea } from "./duel";

const brief: [string, string, string, string][] = [
  ["موضوع کار", "سایت «سرمایه‌گزین»: معرفی فرصت‌های سرمایه‌گذاری و رساندن سرمایه‌گذار به پروژه‌ی مناسب", "حافظه‌ی پروژه، مخزن کد", "قطعی"],
  ["نوع کار", "طراحی رابط و پیاده‌سازی در Next.js با shadcn", "مخزن کد", "قطعی"],
  ["مخاطب", "سرمایه‌گذار، پیمانکار، بهره‌بردار، خریدار و مستاجر، بعداً به بازآفرینی وصل می‌شود", "بریف ۱۰ نوامبر، فایل مسیرها", "قطعی"],
  ["هدف این مرحله", "ایده‌های تازه روی همین نسخه، به‌صورت نمونه‌ی قابل‌لمس", "پیام امروز شما", "قطعی"],
  ["ورودی‌های موجود", "کد دور ۱۸، ۲۵۴ پروژه‌ی نمونه، تصویرهای v18، فایل HTML مرجع", "مخزن، پوشه‌ی پروژه", "قطعی"],
  ["محدودیت‌ها", "فقط دسکتاپ، فارسی و راست‌به‌چپ، shadcn، وزیر، Iconsax، هر دور فقط همان بخش‌هایی که نام می‌برید", "حافظه‌ی پروژه", "قطعی"],
  ["خروجی مورد انتظار", "صفحه‌ی زنده‌ی ایده‌ها روی سایت، با مقایسه و پیشنهاد", "پیام امروز شما، «خروجی نهایی» را این صفحه خواندم", "حدس"],
  ["تصمیم‌های قبلی", "پالت دور ۱۸: سطح تیره زغالی، سبز فقط روی دکمه‌ی اصلی، نارنجی برای تاکیدهای کوچک، روکش عکس سیاه و خاکستری", "حافظه‌ی دور ۱۸", "قطعی"],
  ["کارهای انجام‌شده", "۱۸ دور بازخورد، آخرین دور: پالت تمیز، آمار روی نقشه، صفحه‌ی جذب سرمایه، پروفایل حرفه‌ای در فیلترها", "تاریخچه‌ی گیت، حافظه", "قطعی"],
];

const plan: [string, string, string, string][] = [
  ["فهم وضعیت و انتخاب اسکیل", "design-router", "اسکیل‌ها هم‌پوشانی دارند و این اسکیل برای هر قدم یکی را انتخاب می‌کند", "جدول بالا"],
  ["ایده‌پردازی", "product-brainstorming", "واگرایی با قیاس، وارونه‌کردن فرض و محدودیت افراطی", "چهار ایده روی یک طیف"],
  ["ساخت نمونه‌ها", "impeccable + persian-writing", "یک سیستم بصری برای همه‌ی نمونه‌ها تا مقایسه منصفانه باشد، متن فارسی طبیعی", "چهار نمونه‌ی زنده با داده‌ی سایت"],
  ["مقایسه", "design:design-critique", "نقد ساخت‌یافته بر اساس کاربرد، سلسله‌مراتب و سازگاری", "جدول مقایسه و پیشنهاد"],
];

const questions = [
  "دو منبع با هم نمی‌خوانند: بریف اول می‌گوید «هیچ فیلد یا فرایندی اضافه نشود»، ولی ایده‌ی «سبد سرمایه» و «این یا آن؟» روش تازه‌ای برای انتخاب اضافه می‌کنند. کدام قاعده برقرار است؟",
  "دو منبع درباره‌ی نارنجی: ۱۱ نوامبر «خیلی کم و فقط جای لازم» و دور ۱۷ «رنگ تاکید نارنجی است و از طیفش استفاده شود». نمونه‌ها با روش دور ۱۸ ساخته شده‌اند (نارنجی فقط برای نشانگر و تاکید کوچک). درست است؟",
  "دو منبع درباره‌ی سطح‌های تیره: تصمیم اولیه سبز تیره بود و دور ۱۸ زغالی با ته‌مایه‌ی آبی. نمونه‌ها با دور ۱۸ ساخته شده‌اند. درست است؟",
  "ایده‌ای که انتخاب می‌کنید جای کدام بخش فعلی بنشیند؟ مثلاً «در یک جمله» جای گام‌های «اطلاعات پایه» در صفحه‌ی پروژه‌ها، یا کنار آن به‌عنوان راه دوم؟",
];

const ideas: { id: string; name: string; lead: string; note: IdeaNote; node: React.ReactNode }[] = [
  {
    id: "sentence", name: "در یک جمله", lead: "همه‌ی اطلاعات پایه در یک جمله‌ی فارسی، هر جای خالی یک انتخاب‌گر کوچک است و نتیجه همان لحظه عوض می‌شود.",
    note: {
      idea: "به‌جای سه گام فرم، کاربر جمله‌ی خودش را کامل می‌کند: چقدر دارد، چه نقشی می‌خواهد، کجا و تا کی صبر می‌کند.",
      analogy: "فرم‌های گفت‌وگویی (مثل جست‌وجوی سفر که «از کجا به کجا» را در یک جمله می‌پرسد) و وارونه‌کردن فرض «فرم یعنی چند گام».",
      meets: "همان فیلدهای پایه‌ی نسخه‌ی مرجع (مسیر، استان، مبلغ، افق بازگشت) با کمترین کلیک، جمله برای هر مسیر عوض می‌شود.",
      bends: "هیچ، فقط چیدمان فرم عوض می‌شود. فیلدهای پیشرفته همچنان کنار نتایج می‌مانند.",
      risk: "جمله برای مسیرهایی با شرط‌های زیاد (مثل اجاره) طولانی می‌شود، جای‌های خالی باید واضح دیده شوند تا کاربر آن‌ها را متن ساده نپندارد.",
      test: "زمان رسیدن به اولین نتیجه در مقایسه با فرم فعلی، و اینکه کاربر بدون راهنما روی جای‌های خالی کلیک می‌کند یا نه.",
    },
    node: <SentenceIdea />,
  },
  {
    id: "film", name: "فیلم سرمایه", lead: "مسیر پول سرمایه‌گذار در طول زمان، فقط با داده‌ای که خود پروژه اعلام کرده است.",
    note: {
      idea: "در صفحه‌ی جزئیات، به‌جای چند عدد جدا، پول کاربر را روی خط زمان حرکت می‌دهیم: کی قفل است، کی اولین دریافت می‌آید و کی اصل پول برمی‌گردد.",
      analogy: "ردیاب پرواز و ماشین‌حساب وام: آدم‌ها زمان را بهتر از عدد می‌فهمند.",
      meets: "خواسته‌ی «جزئیات داستان‌گو و خوانا، نه متن روی هم»، همه‌ی داده‌ها از فیلدهای موجود است (اولین دریافت، قفل سرمایه، دوره‌ی بازگشت پایه و بدبینانه).",
      bends: "هیچ، داده‌ی تازه‌ای ساخته نمی‌شود. خط بین نقطه‌ها تقریبی است و همین را روی نمودار نوشته‌ایم.",
      risk: "کاربر ممکن است خط تقریبی را وعده‌ی سود بخواند، متن هشدار باید همیشه دیده شود. برای پروژه‌هایی که این داده را ندارند (حدود ۷۰ درصد) باید حالت خالی طراحی شود.",
      test: "پس از دیدن نمودار، آیا کاربر درست می‌گوید «پولم تا کی قفل است» و «کی برمی‌گردد»؟",
    },
    node: <MoneyFilmIdea />,
  },
  {
    id: "portfolio", name: "سبد سرمایه", lead: "به‌جای یک پروژه، کل سرمایه بین چند پروژه از حوزه‌ها و استان‌های مختلف تقسیم می‌شود.",
    note: {
      idea: "کاربر کل مبلغ و اولویتش را می‌گوید و سایت یک سبد پیشنهاد می‌دهد، هر پروژه را می‌شود با یک کلیک عوض کرد.",
      analogy: "سبدگردان‌های بانکی و اپ‌های سرمایه‌گذاری خرد، وارونه‌کردن فرض «سرمایه‌گذار دنبال یک پروژه است».",
      meets: "سرمایه‌گذار بزرگ‌تر را از دیدن ده‌ها کارت جدا بی‌نیاز می‌کند و پخش ریسک را نشان می‌دهد، فقط از حداقل ورود، نیاز مالی، دوره‌ی بازگشت و محل پروژه استفاده می‌کند.",
      bends: "قاعده‌ی «فرایند تازه اضافه نشود»، در نسخه‌ی مرجع چیزی به اسم سبد نیست.",
      risk: "مشارکت هم‌زمان در چند پروژه ممکن است از نظر قرارداد شدنی نباشد، پیش از ساخت باید با کارشناس حقوقی بررسی شود.",
      test: "آیا سرمایه‌گذارهای بالای ۱۰۰ میلیارد واقعاً چند پروژه را هم‌زمان بررسی می‌کنند؟ چند مصاحبه‌ی کوتاه کافی است.",
    },
    node: <PortfolioIdea />,
  },
  {
    id: "duel", name: "این یا آن؟", lead: "مثل معاینه‌ی چشم: «کدام واضح‌تر است، یک یا دو؟». کاربر فیلتر پر نمی‌کند، فقط بین دو پروژه انتخاب می‌کند.",
    note: {
      idea: "در پنج دور، دو پروژه که فقط در یک ویژگی فرق جدی دارند کنار هم می‌آیند، همان ویژگی واضح است و بقیه محو. از انتخاب‌ها، فیلترها ساخته می‌شود.",
      analogy: "معاینه‌ی چشم و آزمون سلیقه‌ی اپ‌های موسیقی، برای کاربری که هنوز نمی‌داند چه می‌خواهد.",
      meets: "سرمایه‌گذار تازه‌کار بدون شناختن اصطلاح‌هایی مثل «دوره‌ی بازگشت» به فیلترهای درست می‌رسد، فیلترهای نتیجه همان فیلترهای سایت است و قابل‌اصلاح.",
      bends: "روش ورود اطلاعات را عوض می‌کند و فیلترها را حدس می‌زند، نه اینکه کاربر صریح بگوید.",
      risk: "پنج دور برای کاربر حرفه‌ای کند است و حدس‌ها ممکن است اشتباه باشد، برای همین هر حدس قابل‌برداشتن است و باید راه فرم معمولی هم کنارش بماند.",
      test: "درصد کاربرانی که پنج دور را تمام می‌کنند و چند تا از حدس‌ها را برمی‌دارند.",
    },
    node: <DuelIdea />,
  },
];

const dots = (n: number) => <span className="inline-flex gap-1" aria-label={`${n} از ۳`}>{[0, 1, 2].map((i) => <span key={i} className={cn("size-2 rounded-full", i < n ? "bg-ink" : "bg-ink/12")} />)}</span>;
const compare: { k: string; v: (number | string)[] }[] = [
  { k: "برای سرمایه‌گذار تازه‌کار", v: [2, 3, 1, 3] },
  { k: "سرعت رسیدن به نتیجه", v: [3, 2, 2, 1] },
  { k: "شفافیت دلیل پیشنهاد", v: [2, 3, 2, 1] },
  { k: "وفاداری به نسخه‌ی مرجع", v: [3, 3, 1, 2] },
  { k: "هزینه‌ی ساخت در سایت اصلی", v: ["کم", "کم", "زیاد", "متوسط"] },
  { k: "بزرگ‌ترین ریسک", v: ["جمله‌ی طولانی در بعضی مسیرها", "خوانده‌شدن خط تقریبی به‌عنوان وعده", "شدنی‌بودن حقوقی", "کندی برای کاربر حرفه‌ای"] },
];

export function Lab() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[84rem] px-6 pb-10 pt-14">
        <section className="max-w-3xl">
          <h1 className="text-[2.6rem] font-black leading-[1.5] text-ink text-balance">چهار راه تازه برای اینکه سرمایه‌گذار پروژه‌اش را پیدا کند</h1>
          <p className="mt-4 text-[16px] font-medium leading-8 text-muted-foreground">این صفحه موقت است و فقط برای مرور ایده‌هاست، هیچ صفحه‌ای از سایت تغییر نکرده است. هر نمونه با داده‌ی همین سایت کار می‌کند، پس می‌توانید با آن بازی کنید. ایده‌ها از مطمئن به جسورانه چیده شده‌اند.</p>
          <nav className="mt-7 flex flex-wrap gap-2">
            {ideas.map((x) => <a key={x.id} href={`#${x.id}`} className="h-10 rounded-full border border-border bg-white px-4 text-[13.5px] font-bold leading-10 text-ink transition-colors hover:border-ink/30">{x.name}</a>)}
            <a href="#compare" className="h-10 rounded-full bg-ink px-4 text-[13.5px] font-bold leading-10 text-white">مقایسه و پیشنهاد</a>
          </nav>
        </section>

        <Accordion type="single" collapsible className="mt-10 rounded-[1.75rem] border border-border bg-white px-6">
          <AccordionItem value="brief" className="border-b-0">
            <AccordionTrigger className="py-5 text-[15px] font-extrabold text-ink hover:no-underline">وضعیت پروژه، برنامه‌ی کار و چند سؤال</AccordionTrigger>
            <AccordionContent className="space-y-8 pb-7">
              <Table head={["مورد", "مقدار", "منبع", "اطمینان"]} rows={brief} />
              <div>
                <p className="mb-3 text-[13px] font-bold text-muted-foreground">محیط: Claude Code بدون پلاگین ux-ui-agent-skills (مسیر «ب» در design-router)، برای همین هیچ عددی از gate یا ممیزی دسترس‌پذیری گزارش نشده است.</p>
                <Table head={["قدم", "اسکیل", "چرا", "خروجی"]} rows={plan} />
              </div>
              <div>
                <p className="mb-3 text-[15px] font-extrabold text-ink">سؤال‌هایی که جوابشان کار را عوض می‌کند</p>
                <ol className="space-y-2.5">
                  {questions.map((q, i) => <li key={i} className="flex gap-3 text-[14px] font-semibold leading-7 text-ink"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-[12px] font-black">{(i + 1).toLocaleString("fa-IR")}</span>{q}</li>)}
                </ol>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {ideas.map((x, i) => (
          <section key={x.id} id={x.id} className="scroll-mt-28 pt-20">
            <Reveal>
              <div className="mb-7 flex items-end justify-between gap-6">
                <div className="max-w-2xl">
                  <h2 className="text-[2rem] font-black text-ink">{x.name}</h2>
                  <p className="mt-2 text-[15.5px] font-medium leading-8 text-muted-foreground">{x.lead}</p>
                </div>
                <Spectrum at={i} />
              </div>
              <div className="grid grid-cols-[1fr_20rem] items-start gap-6">
                <div className="min-w-0">{x.node}</div>
                <IdeaNotes note={x.note} />
              </div>
            </Reveal>
          </section>
        ))}

        <section id="compare" className="scroll-mt-28 pt-24">
          <h2 className="text-[2rem] font-black text-ink">مقایسه و پیشنهاد</h2>
          <div className="mt-7 overflow-hidden rounded-[1.75rem] border border-border bg-white">
            <table className="w-full text-right">
              <thead><tr className="border-b border-border bg-muted/50">
                <th className="w-64 px-6 py-4 text-[13px] font-bold text-muted-foreground">معیار</th>
                {ideas.map((x) => <th key={x.id} className="px-6 py-4 text-[15px] font-black text-ink">{x.name}</th>)}
              </tr></thead>
              <tbody>
                {compare.map((r) => (
                  <tr key={r.k} className="border-b border-border last:border-0">
                    <td className="px-6 py-4 text-[14px] font-bold text-ink">{r.k}</td>
                    {r.v.map((v, j) => <td key={j} className="px-6 py-4 text-[13.5px] font-semibold leading-7 text-ink">{typeof v === "number" ? dots(v) : v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 grid grid-cols-[1fr_1fr] gap-6">
            <div className="rounded-[1.75rem] bg-pine p-8 text-white">
              <p className="text-[13px] font-bold text-white/60">پیشنهاد من</p>
              <p className="mt-3 text-[1.35rem] font-black leading-[1.9]">«در یک جمله» جای گام‌های اطلاعات پایه، و «فیلم سرمایه» در صفحه‌ی جزئیات پروژه.</p>
              <p className="mt-3 text-[14.5px] font-medium leading-8 text-white/75">هر دو فقط با داده و فیلدهای موجود کار می‌کنند، پس هیچ قاعده‌ای از بریف شکسته نمی‌شود، و دو جای اصلی سفر کاربر را بهتر می‌کنند: شروع جست‌وجو و تصمیم روی یک پروژه.</p>
            </div>
            <div className="rounded-[1.75rem] border border-border bg-white p-8">
              <p className="text-[13px] font-bold text-muted-foreground">بعد از آن</p>
              <p className="mt-3 text-[15px] font-semibold leading-8 text-ink">«این یا آن؟» به‌عنوان راه دوم برای کسی که می‌گوید «هنوز نمی‌دانم چه می‌خواهم»، کنار فرم و نه به‌جای آن. «سبد سرمایه» فقط بعد از اینکه کارشناس حقوقی تایید کند مشارکت هم‌زمان در چند پروژه شدنی است.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="w-full text-right">
        <thead><tr className="bg-muted/60">{head.map((h) => <th key={h} className="px-4 py-3 text-[12.5px] font-bold text-muted-foreground">{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-t border-border align-top">
              {r.map((c, j) => <td key={j} className={cn("px-4 py-3 text-[13.5px] leading-7", j === 0 ? "w-44 font-extrabold text-ink" : "font-semibold text-ink/85", c === "حدس" && "text-cobalt-deep")}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
