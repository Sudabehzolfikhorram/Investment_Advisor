// گروه‌ها و زیردسته‌های پروژه: از نسخه HTML مرجع، بدون ادغام؛ همه گروه‌ها و زیردسته‌ها مطابق مرجع.
// sources = شناسه زیردسته‌های اصلی که در این مورد ادغام شده‌اند؛ includes = نام کامل آن‌ها (هیچ موردی حذف نشده).
import type { ProjectGroup } from "@/types";

export const projectGroups: ProjectGroup[] = [
  {
    "id": "building",
    "name": "ساختمان",
    "fullNames": [
      "پروژه‌های ساختمانی"
    ],
    "icon": "Buildings",
    "image": "/images/types/residential.webp",
    "subtypes": [
      {
        "id": "residential",
        "name": "مسکونی",
        "examples": "آپارتمان، مجتمع مسکونی، شهرک و ویلا",
        "sources": [
          "residential"
        ],
        "includes": [
          "مسکونی: آپارتمان، مجتمع مسکونی، شهرک و ویلا"
        ],
        "image": "/images/types/residential.webp"
      },
      {
        "id": "office",
        "name": "اداری",
        "examples": "ساختمان اداری، مجتمع دولتی و دفتر کار",
        "sources": [
          "office"
        ],
        "includes": [
          "اداری: ساختمان اداری، مجتمع دولتی و دفتر کار"
        ],
        "image": "/images/types/office.webp"
      },
      {
        "id": "commercial",
        "name": "تجاری",
        "examples": "مرکز خرید، بازار، فروشگاه و مجتمع تجاری",
        "sources": [
          "commercial"
        ],
        "includes": [
          "تجاری: مرکز خرید، بازار، فروشگاه و مجتمع تجاری"
        ],
        "image": "/images/types/commercial.webp"
      },
      {
        "id": "hospitality",
        "name": "اقامتی و گردشگری",
        "examples": "هتل، اقامتگاه، مجتمع تفریحی و بوم‌گردی",
        "sources": [
          "hospitality"
        ],
        "includes": [
          "اقامتی و گردشگری: هتل، اقامتگاه، مجتمع تفریحی و بوم‌گردی"
        ],
        "image": "/images/types/hospitality.webp"
      },
      {
        "id": "education",
        "name": "آموزشی",
        "examples": "مدرسه، دانشگاه و مرکز آموزشی",
        "sources": [
          "education"
        ],
        "includes": [
          "آموزشی: مدرسه، دانشگاه و مرکز آموزشی"
        ],
        "image": "/images/types/education.webp"
      },
      {
        "id": "medical",
        "name": "درمانی",
        "examples": "بیمارستان، درمانگاه و مرکز بهداشت",
        "sources": [
          "medical"
        ],
        "includes": [
          "درمانی: بیمارستان، درمانگاه و مرکز بهداشت"
        ],
        "image": "/images/types/medical.webp"
      },
      {
        "id": "cultural",
        "name": "فرهنگی و مذهبی",
        "examples": "کتابخانه، موزه، فرهنگ‌سرا و مسجد",
        "sources": [
          "cultural"
        ],
        "includes": [
          "فرهنگی و مذهبی: کتابخانه، موزه، فرهنگ‌سرا و مسجد"
        ],
        "image": "/images/types/cultural.webp"
      },
      {
        "id": "sports",
        "name": "ورزشی",
        "examples": "ورزشگاه، سالن ورزشی و مجموعه تفریحی",
        "sources": [
          "sports"
        ],
        "includes": [
          "ورزشی: ورزشگاه، سالن ورزشی و مجموعه تفریحی"
        ],
        "image": "/images/types/sports.webp"
      }
    ]
  },
  {
    "id": "transport",
    "name": "حمل‌ونقل",
    "fullNames": [
      "پروژه‌های حمل‌ونقل"
    ],
    "icon": "Routing",
    "image": "/images/types/metro.webp",
    "subtypes": [
      {
        "id": "roads",
        "name": "راه‌سازی و بزرگراه",
        "examples": "",
        "sources": [
          "roads"
        ],
        "includes": [
          "راه‌سازی و بزرگراه"
        ],
        "image": "/images/types/roads.webp"
      },
      {
        "id": "bridge",
        "name": "پل و تقاطع غیرهم‌سطح",
        "examples": "",
        "sources": [
          "bridge"
        ],
        "includes": [
          "پل و تقاطع غیرهم‌سطح"
        ],
        "image": "/images/types/bridge.webp"
      },
      {
        "id": "tunnel",
        "name": "تونل",
        "examples": "",
        "sources": [
          "tunnel"
        ],
        "includes": [
          "تونل"
        ],
        "image": "/images/types/tunnel.webp"
      },
      {
        "id": "rail",
        "name": "راه‌آهن",
        "examples": "",
        "sources": [
          "rail"
        ],
        "includes": [
          "راه‌آهن"
        ],
        "image": "/images/types/rail.webp"
      },
      {
        "id": "metro",
        "name": "مترو و قطار شهری",
        "examples": "",
        "sources": [
          "metro"
        ],
        "includes": [
          "مترو و قطار شهری"
        ],
        "image": "/images/types/metro.webp"
      },
      {
        "id": "airport",
        "name": "فرودگاه",
        "examples": "",
        "sources": [
          "airport"
        ],
        "includes": [
          "فرودگاه"
        ],
        "image": "/images/types/airport.webp"
      },
      {
        "id": "port",
        "name": "بندر و اسکله",
        "examples": "",
        "sources": [
          "port"
        ],
        "includes": [
          "بندر و اسکله"
        ],
        "image": "/images/types/port.webp"
      },
      {
        "id": "terminal",
        "name": "پایانه‌های مسافری و باری",
        "examples": "",
        "sources": [
          "terminal"
        ],
        "includes": [
          "پایانه‌های مسافری و باری"
        ],
        "image": "/images/types/terminal.webp"
      },
      {
        "id": "parking",
        "name": "پارکینگ عمومی",
        "examples": "",
        "sources": [
          "parking"
        ],
        "includes": [
          "پارکینگ عمومی"
        ],
        "image": "/images/types/parking.webp"
      }
    ]
  },
  {
    "id": "water",
    "name": "آب و فاضلاب",
    "fullNames": [
      "پروژه‌های آب و فاضلاب"
    ],
    "icon": "Drop",
    "image": "/images/types/dam.webp",
    "subtypes": [
      {
        "id": "dam",
        "name": "سد و مخزن ذخیره آب",
        "examples": "",
        "sources": [
          "dam"
        ],
        "includes": [
          "سد و مخزن ذخیره آب"
        ],
        "image": "/images/types/dam.webp"
      },
      {
        "id": "waternetwork",
        "name": "شبکه انتقال و توزیع آب",
        "examples": "",
        "sources": [
          "waternetwork"
        ],
        "includes": [
          "شبکه انتقال و توزیع آب"
        ],
        "image": "/images/types/waternetwork.webp"
      },
      {
        "id": "watertreatment",
        "name": "تصفیه‌خانه آب",
        "examples": "",
        "sources": [
          "watertreatment"
        ],
        "includes": [
          "تصفیه‌خانه آب"
        ],
        "image": "/images/types/watertreatment.webp"
      },
      {
        "id": "sewernetwork",
        "name": "شبکه جمع‌آوری فاضلاب",
        "examples": "",
        "sources": [
          "sewernetwork"
        ],
        "includes": [
          "شبکه جمع‌آوری فاضلاب"
        ],
        "image": "/images/types/sewernetwork.webp"
      },
      {
        "id": "wastewater",
        "name": "تصفیه‌خانه فاضلاب",
        "examples": "",
        "sources": [
          "wastewater"
        ],
        "includes": [
          "تصفیه‌خانه فاضلاب"
        ],
        "image": "/images/types/wastewater.webp"
      },
      {
        "id": "irrigationcanal",
        "name": "کانال‌های آبیاری و زهکشی",
        "examples": "",
        "sources": [
          "irrigationcanal"
        ],
        "includes": [
          "کانال‌های آبیاری و زهکشی"
        ],
        "image": "/images/types/irrigationcanal.webp"
      },
      {
        "id": "flood",
        "name": "سازه‌های کنترل سیلاب و آبخیزداری",
        "examples": "",
        "sources": [
          "flood"
        ],
        "includes": [
          "سازه‌های کنترل سیلاب و آبخیزداری"
        ],
        "image": "/images/types/flood.webp"
      }
    ]
  },
  {
    "id": "energy",
    "name": "انرژی",
    "fullNames": [
      "پروژه‌های انرژی و تأسیسات"
    ],
    "icon": "Flash",
    "image": "/images/types/powerplant.webp",
    "subtypes": [
      {
        "id": "powerplant",
        "name": "نیروگاه",
        "examples": "",
        "sources": [
          "powerplant"
        ],
        "includes": [
          "نیروگاه"
        ],
        "image": "/images/types/powerplant.webp"
      },
      {
        "id": "powergrid",
        "name": "خطوط انتقال و پست برق",
        "examples": "",
        "sources": [
          "powergrid"
        ],
        "includes": [
          "خطوط انتقال و پست برق"
        ],
        "image": "/images/types/powergrid.webp"
      },
      {
        "id": "gas",
        "name": "شبکه گازرسانی",
        "examples": "",
        "sources": [
          "gas"
        ],
        "includes": [
          "شبکه گازرسانی"
        ],
        "image": "/images/types/gas.webp"
      },
      {
        "id": "pipeline",
        "name": "خطوط انتقال نفت و گاز",
        "examples": "",
        "sources": [
          "pipeline"
        ],
        "includes": [
          "خطوط انتقال نفت و گاز"
        ],
        "image": "/images/types/pipeline.webp"
      },
      {
        "id": "renewable",
        "name": "تأسیسات انرژی خورشیدی و بادی",
        "examples": "",
        "sources": [
          "renewable"
        ],
        "includes": [
          "تأسیسات انرژی خورشیدی و بادی"
        ],
        "image": "/images/types/renewable.webp"
      },
      {
        "id": "hvac",
        "name": "شبکه‌های گرمایش و سرمایش مرکزی",
        "examples": "",
        "sources": [
          "hvac"
        ],
        "includes": [
          "شبکه‌های گرمایش و سرمایش مرکزی"
        ],
        "image": "/images/types/hvac.webp"
      },
      {
        "id": "ev",
        "name": "زیرساخت‌های شارژ خودروهای برقی",
        "examples": "",
        "sources": [
          "ev"
        ],
        "includes": [
          "زیرساخت‌های شارژ خودروهای برقی"
        ],
        "image": "/images/types/ev.webp"
      }
    ]
  },
  {
    "id": "industry",
    "name": "صنعت و لجستیک",
    "fullNames": [
      "پروژه‌های صنعتی"
    ],
    "icon": "Box",
    "image": "/images/types/factory.webp",
    "subtypes": [
      {
        "id": "factory",
        "name": "کارخانه و واحد تولیدی",
        "examples": "",
        "sources": [
          "factory"
        ],
        "includes": [
          "کارخانه و واحد تولیدی"
        ],
        "image": "/images/types/factory.webp"
      },
      {
        "id": "warehouse",
        "name": "انبار و مرکز لجستیک",
        "examples": "",
        "sources": [
          "warehouse"
        ],
        "includes": [
          "انبار و مرکز لجستیک"
        ],
        "image": "/images/types/warehouse.webp"
      },
      {
        "id": "refinery",
        "name": "پالایشگاه و پتروشیمی",
        "examples": "",
        "sources": [
          "refinery"
        ],
        "includes": [
          "پالایشگاه و پتروشیمی"
        ],
        "image": "/images/types/refinery.webp"
      },
      {
        "id": "industrialpark",
        "name": "شهرک صنعتی",
        "examples": "",
        "sources": [
          "industrialpark"
        ],
        "includes": [
          "شهرک صنعتی"
        ],
        "image": "/images/types/industrialpark.webp"
      },
      {
        "id": "coldstore",
        "name": "سیلو و سردخانه",
        "examples": "",
        "sources": [
          "coldstore"
        ],
        "includes": [
          "سیلو و سردخانه"
        ],
        "image": "/images/types/coldstore.webp"
      },
      {
        "id": "workshop",
        "name": "کارگاه‌ها و مجموعه‌های تولیدی",
        "examples": "",
        "sources": [
          "workshop"
        ],
        "includes": [
          "کارگاه‌ها و مجموعه‌های تولیدی"
        ],
        "image": "/images/types/workshop.webp"
      },
      {
        "id": "mineral",
        "name": "تأسیسات فرآوری مواد معدنی",
        "examples": "",
        "sources": [
          "mineral"
        ],
        "includes": [
          "تأسیسات فرآوری مواد معدنی"
        ],
        "image": "/images/types/mineral.webp"
      }
    ]
  },
  {
    "id": "urban",
    "name": "شهری و خدمات عمومی",
    "fullNames": [
      "پروژه‌های شهری و خدمات عمومی"
    ],
    "icon": "Tree",
    "image": "/images/types/parks.webp",
    "subtypes": [
      {
        "id": "streets",
        "name": "سامان‌دهی و بهسازی معابر",
        "examples": "",
        "sources": [
          "streets"
        ],
        "includes": [
          "سامان‌دهی و بهسازی معابر"
        ],
        "image": "/images/types/streets.webp"
      },
      {
        "id": "parks",
        "name": "فضای سبز و بوستان",
        "examples": "",
        "sources": [
          "parks"
        ],
        "includes": [
          "فضای سبز و بوستان"
        ],
        "image": "/images/types/parks.webp"
      },
      {
        "id": "furniture",
        "name": "مبلمان شهری",
        "examples": "",
        "sources": [
          "furniture"
        ],
        "includes": [
          "مبلمان شهری"
        ],
        "image": "/images/types/furniture.webp"
      },
      {
        "id": "waste",
        "name": "مدیریت و دفع پسماند",
        "examples": "",
        "sources": [
          "waste"
        ],
        "includes": [
          "مدیریت و دفع پسماند"
        ],
        "image": "/images/types/waste.webp"
      },
      {
        "id": "cemetery",
        "name": "آرامستان",
        "examples": "",
        "sources": [
          "cemetery"
        ],
        "includes": [
          "آرامستان"
        ],
        "image": "/images/types/cemetery.webp"
      },
      {
        "id": "fire",
        "name": "آتش‌نشانی و مراکز امدادی",
        "examples": "",
        "sources": [
          "fire"
        ],
        "includes": [
          "آتش‌نشانی و مراکز امدادی"
        ],
        "image": "/images/types/fire.webp"
      },
      {
        "id": "lighting",
        "name": "روشنایی شهری",
        "examples": "",
        "sources": [
          "lighting"
        ],
        "includes": [
          "روشنایی شهری"
        ],
        "image": "/images/types/lighting.webp"
      },
      {
        "id": "regeneration",
        "name": "بازآفرینی بافت فرسوده",
        "examples": "",
        "sources": [
          "regeneration"
        ],
        "includes": [
          "بازآفرینی بافت فرسوده"
        ],
        "image": "/images/types/regeneration.webp"
      }
    ]
  },
  {
    "id": "digital",
    "name": "ارتباطات و دیجیتال",
    "fullNames": [
      "پروژه‌های مخابراتی و زیرساخت دیجیتال"
    ],
    "icon": "Cpu",
    "image": "/images/types/fiber.webp",
    "subtypes": [
      {
        "id": "fiber",
        "name": "شبکه فیبر نوری",
        "examples": "",
        "sources": [
          "fiber"
        ],
        "includes": [
          "شبکه فیبر نوری"
        ],
        "image": "/images/types/fiber.webp"
      },
      {
        "id": "telecom",
        "name": "دکل و سایت مخابراتی",
        "examples": "",
        "sources": [
          "telecom"
        ],
        "includes": [
          "دکل و سایت مخابراتی"
        ],
        "image": "/images/types/telecom.webp"
      },
      {
        "id": "datacenter",
        "name": "مرکز داده",
        "examples": "",
        "sources": [
          "datacenter"
        ],
        "includes": [
          "مرکز داده"
        ],
        "image": "/images/types/datacenter.webp"
      },
      {
        "id": "smartcity",
        "name": "زیرساخت شهر هوشمند",
        "examples": "",
        "sources": [
          "smartcity"
        ],
        "includes": [
          "زیرساخت شهر هوشمند"
        ],
        "image": "/images/types/smartcity.webp"
      },
      {
        "id": "control",
        "name": "شبکه‌های ارتباطی و کنترل هوشمند",
        "examples": "",
        "sources": [
          "control"
        ],
        "includes": [
          "شبکه‌های ارتباطی و کنترل هوشمند"
        ],
        "image": "/images/types/control.webp"
      }
    ]
  },
  {
    "id": "agriculture",
    "name": "کشاورزی و منابع طبیعی",
    "fullNames": [
      "پروژه‌های کشاورزی و منابع طبیعی"
    ],
    "icon": "Sun1",
    "image": "/images/types/greenhouse.webp",
    "subtypes": [
      {
        "id": "pressure",
        "name": "شبکه آبیاری تحت فشار",
        "examples": "",
        "sources": [
          "pressure"
        ],
        "includes": [
          "شبکه آبیاری تحت فشار"
        ],
        "image": "/images/types/pressure.webp"
      },
      {
        "id": "greenhouse",
        "name": "گلخانه و مجتمع کشاورزی",
        "examples": "",
        "sources": [
          "greenhouse"
        ],
        "includes": [
          "گلخانه و مجتمع کشاورزی"
        ],
        "image": "/images/types/greenhouse.webp"
      },
      {
        "id": "livestock",
        "name": "دامداری و دامپروری",
        "examples": "",
        "sources": [
          "livestock"
        ],
        "includes": [
          "دامداری و دامپروری"
        ],
        "image": "/images/types/livestock.webp"
      },
      {
        "id": "fish",
        "name": "شیلات و آبزی‌پروری",
        "examples": "",
        "sources": [
          "fish"
        ],
        "includes": [
          "شیلات و آبزی‌پروری"
        ],
        "image": "/images/types/fish.webp"
      },
      {
        "id": "ruralroad",
        "name": "راه‌های روستایی و کشاورزی",
        "examples": "",
        "sources": [
          "ruralroad"
        ],
        "includes": [
          "راه‌های روستایی و کشاورزی"
        ],
        "image": "/images/types/ruralroad.webp"
      },
      {
        "id": "natural",
        "name": "تثبیت خاک، جنگل‌کاری و حفاظت منابع طبیعی",
        "examples": "",
        "sources": [
          "natural"
        ],
        "includes": [
          "تثبیت خاک، جنگل‌کاری و حفاظت منابع طبیعی"
        ],
        "image": "/images/types/natural.webp"
      }
    ]
  },
  {
    "id": "heritage",
    "name": "میراث فرهنگی",
    "fullNames": [
      "پروژه‌های مرمت و میراث فرهنگی"
    ],
    "icon": "Courthouse",
    "image": "/images/types/restoration.webp",
    "subtypes": [
      {
        "id": "restoration",
        "name": "مرمت بناهای تاریخی",
        "examples": "",
        "sources": [
          "restoration"
        ],
        "includes": [
          "مرمت بناهای تاریخی"
        ],
        "image": "/images/types/restoration.webp"
      },
      {
        "id": "historichouse",
        "name": "احیای خانه‌های ارزشمند",
        "examples": "",
        "sources": [
          "historichouse"
        ],
        "includes": [
          "احیای خانه‌های ارزشمند"
        ],
        "image": "/images/types/historichouse.webp"
      },
      {
        "id": "historicfabric",
        "name": "بازآفرینی بافت تاریخی",
        "examples": "",
        "sources": [
          "historicfabric"
        ],
        "includes": [
          "بازآفرینی بافت تاریخی"
        ],
        "image": "/images/types/historicfabric.webp"
      },
      {
        "id": "adaptive",
        "name": "تغییر کاربری بناهای تاریخی",
        "examples": "",
        "sources": [
          "adaptive"
        ],
        "includes": [
          "تغییر کاربری بناهای تاریخی"
        ],
        "image": "/images/types/adaptive.webp"
      },
      {
        "id": "protection",
        "name": "مقاوم‌سازی و حفاظت اضطراری آثار",
        "examples": "",
        "sources": [
          "protection"
        ],
        "includes": [
          "مقاوم‌سازی و حفاظت اضطراری آثار"
        ],
        "image": "/images/types/protection.webp"
      },
      {
        "id": "tourism",
        "name": "توسعه زیرساخت‌های گردشگری پیرامون آثار تاریخی",
        "examples": "",
        "sources": [
          "tourism"
        ],
        "includes": [
          "توسعه زیرساخت‌های گردشگری پیرامون آثار تاریخی"
        ],
        "image": "/images/types/tourism.webp"
      }
    ]
  },
  {
    "id": "land",
    "name": "توسعه زمین و املاک",
    "fullNames": [
      "پروژه‌های توسعه زمین و املاک"
    ],
    "icon": "Map1",
    "image": "/images/types/lhintegrated.webp",
    "subtypes": [
      {
        "id": "subdivision",
        "name": "آماده‌سازی و تفکیک زمین",
        "examples": "",
        "sources": [
          "subdivision"
        ],
        "includes": [
          "آماده‌سازی و تفکیک زمین"
        ],
        "image": "/images/types/lhplots.webp"
      },
      {
        "id": "township",
        "name": "شهرک‌سازی",
        "examples": "",
        "sources": [
          "township"
        ],
        "includes": [
          "شهرک‌سازی"
        ],
        "image": "/images/types/lhintegrated.webp"
      },
      {
        "id": "newland",
        "name": "توسعه اراضی جدید",
        "examples": "",
        "sources": [
          "newland"
        ],
        "includes": [
          "توسعه اراضی جدید"
        ],
        "image": "/images/types/lhintegrated.webp"
      },
      {
        "id": "consolidation",
        "name": "نوسازی و تجمیع املاک",
        "examples": "",
        "sources": [
          "consolidation"
        ],
        "includes": [
          "نوسازی و تجمیع املاک"
        ],
        "image": "/images/types/regeneration.webp"
      },
      {
        "id": "redevelop",
        "name": "تغییر کاربری و توسعه مجدد ملک",
        "examples": "",
        "sources": [
          "redevelop"
        ],
        "includes": [
          "تغییر کاربری و توسعه مجدد ملک"
        ],
        "image": "/images/types/regeneration.webp"
      },
      {
        "id": "mixeduse",
        "name": "مجتمع‌های چندمنظوره مسکونی، تجاری و اداری",
        "examples": "",
        "sources": [
          "mixeduse"
        ],
        "includes": [
          "مجتمع‌های چندمنظوره مسکونی، تجاری و اداری"
        ],
        "image": "/images/types/commercial.webp"
      }
    ]
  },
  {
    "id": "landhousing",
    "name": "آماده‌سازی زمین و مسکن",
    "fullNames": [
      "آماده‌سازی زمین و توسعه مسکن"
    ],
    "icon": "Home2",
    "image": "/images/types/lhhousing.webp",
    "subtypes": [
      {
        "id": "lhstudy",
        "name": "مطالعات و طراحی آماده‌سازی اراضی",
        "examples": "",
        "sources": [
          "lhstudy"
        ],
        "includes": [
          "مطالعات و طراحی آماده‌سازی اراضی"
        ],
        "image": "/images/types/lhstudy.webp"
      },
      {
        "id": "lhearth",
        "name": "تسطیح و عملیات خاکی اراضی",
        "examples": "",
        "sources": [
          "lhearth"
        ],
        "includes": [
          "تسطیح و عملیات خاکی اراضی"
        ],
        "image": "/images/types/lhearth.webp"
      },
      {
        "id": "lhroads",
        "name": "معابر و دسترسی‌های داخلی",
        "examples": "",
        "sources": [
          "lhroads"
        ],
        "includes": [
          "معابر و دسترسی‌های داخلی"
        ],
        "image": "/images/types/lhroads.webp"
      },
      {
        "id": "lhwater",
        "name": "شبکه آب، فاضلاب و آب‌های سطحی",
        "examples": "",
        "sources": [
          "lhwater"
        ],
        "includes": [
          "شبکه آب، فاضلاب و آب‌های سطحی"
        ],
        "image": "/images/types/lhwater.webp"
      },
      {
        "id": "lhenergy",
        "name": "شبکه برق، گاز و روشنایی",
        "examples": "",
        "sources": [
          "lhenergy"
        ],
        "includes": [
          "شبکه برق، گاز و روشنایی"
        ],
        "image": "/images/types/lhenergy.webp"
      },
      {
        "id": "lhplots",
        "name": "قطعه‌بندی و تحویل زمین آماده ساخت",
        "examples": "",
        "sources": [
          "lhplots"
        ],
        "includes": [
          "قطعه‌بندی و تحویل زمین آماده ساخت"
        ],
        "image": "/images/types/lhplots.webp"
      },
      {
        "id": "lhintegrated",
        "name": "آماده‌سازی یکپارچه اراضی مسکونی",
        "examples": "",
        "sources": [
          "lhintegrated"
        ],
        "includes": [
          "آماده‌سازی یکپارچه اراضی مسکونی"
        ],
        "image": "/images/types/lhintegrated.webp"
      },
      {
        "id": "lhhousing",
        "name": "توسعه یکپارچه زمین و ساخت مسکن",
        "examples": "",
        "sources": [
          "lhhousing"
        ],
        "includes": [
          "توسعه یکپارچه زمین و ساخت مسکن"
        ],
        "image": "/images/types/lhhousing.webp"
      },
      {
        "id": "lhcompletion",
        "name": "تکمیل آماده‌سازی و رفع موانع تحویل مسکن",
        "examples": "",
        "sources": [
          "lhcompletion"
        ],
        "includes": [
          "تکمیل آماده‌سازی و رفع موانع تحویل مسکن"
        ],
        "image": "/images/types/lhcompletion.webp"
      }
    ]
  }
];

export const subtypeBySource: Record<string, { group: string; subtype: string }> = {"residential":{"group":"building","subtype":"residential"},"office":{"group":"building","subtype":"office"},"commercial":{"group":"building","subtype":"commercial"},"hospitality":{"group":"building","subtype":"hospitality"},"education":{"group":"building","subtype":"education"},"medical":{"group":"building","subtype":"medical"},"cultural":{"group":"building","subtype":"cultural"},"sports":{"group":"building","subtype":"sports"},"roads":{"group":"transport","subtype":"roads"},"bridge":{"group":"transport","subtype":"bridge"},"tunnel":{"group":"transport","subtype":"tunnel"},"rail":{"group":"transport","subtype":"rail"},"metro":{"group":"transport","subtype":"metro"},"airport":{"group":"transport","subtype":"airport"},"port":{"group":"transport","subtype":"port"},"terminal":{"group":"transport","subtype":"terminal"},"parking":{"group":"transport","subtype":"parking"},"dam":{"group":"water","subtype":"dam"},"waternetwork":{"group":"water","subtype":"waternetwork"},"watertreatment":{"group":"water","subtype":"watertreatment"},"sewernetwork":{"group":"water","subtype":"sewernetwork"},"wastewater":{"group":"water","subtype":"wastewater"},"irrigationcanal":{"group":"water","subtype":"irrigationcanal"},"flood":{"group":"water","subtype":"flood"},"powerplant":{"group":"energy","subtype":"powerplant"},"powergrid":{"group":"energy","subtype":"powergrid"},"gas":{"group":"energy","subtype":"gas"},"pipeline":{"group":"energy","subtype":"pipeline"},"renewable":{"group":"energy","subtype":"renewable"},"hvac":{"group":"energy","subtype":"hvac"},"ev":{"group":"energy","subtype":"ev"},"factory":{"group":"industry","subtype":"factory"},"warehouse":{"group":"industry","subtype":"warehouse"},"refinery":{"group":"industry","subtype":"refinery"},"industrialpark":{"group":"industry","subtype":"industrialpark"},"coldstore":{"group":"industry","subtype":"coldstore"},"workshop":{"group":"industry","subtype":"workshop"},"mineral":{"group":"industry","subtype":"mineral"},"streets":{"group":"urban","subtype":"streets"},"parks":{"group":"urban","subtype":"parks"},"furniture":{"group":"urban","subtype":"furniture"},"waste":{"group":"urban","subtype":"waste"},"cemetery":{"group":"urban","subtype":"cemetery"},"fire":{"group":"urban","subtype":"fire"},"lighting":{"group":"urban","subtype":"lighting"},"regeneration":{"group":"urban","subtype":"regeneration"},"fiber":{"group":"digital","subtype":"fiber"},"telecom":{"group":"digital","subtype":"telecom"},"datacenter":{"group":"digital","subtype":"datacenter"},"smartcity":{"group":"digital","subtype":"smartcity"},"control":{"group":"digital","subtype":"control"},"pressure":{"group":"agriculture","subtype":"pressure"},"greenhouse":{"group":"agriculture","subtype":"greenhouse"},"livestock":{"group":"agriculture","subtype":"livestock"},"fish":{"group":"agriculture","subtype":"fish"},"ruralroad":{"group":"agriculture","subtype":"ruralroad"},"natural":{"group":"agriculture","subtype":"natural"},"restoration":{"group":"heritage","subtype":"restoration"},"historichouse":{"group":"heritage","subtype":"historichouse"},"historicfabric":{"group":"heritage","subtype":"historicfabric"},"adaptive":{"group":"heritage","subtype":"adaptive"},"protection":{"group":"heritage","subtype":"protection"},"tourism":{"group":"heritage","subtype":"tourism"},"subdivision":{"group":"land","subtype":"subdivision"},"township":{"group":"land","subtype":"township"},"newland":{"group":"land","subtype":"newland"},"consolidation":{"group":"land","subtype":"consolidation"},"redevelop":{"group":"land","subtype":"redevelop"},"mixeduse":{"group":"land","subtype":"mixeduse"},"lhstudy":{"group":"landhousing","subtype":"lhstudy"},"lhearth":{"group":"landhousing","subtype":"lhearth"},"lhroads":{"group":"landhousing","subtype":"lhroads"},"lhwater":{"group":"landhousing","subtype":"lhwater"},"lhenergy":{"group":"landhousing","subtype":"lhenergy"},"lhplots":{"group":"landhousing","subtype":"lhplots"},"lhintegrated":{"group":"landhousing","subtype":"lhintegrated"},"lhhousing":{"group":"landhousing","subtype":"lhhousing"},"lhcompletion":{"group":"landhousing","subtype":"lhcompletion"}};
