// گروه‌ها و زیردسته‌های پروژه — از نسخه HTML مرجع، با ادغام موارد هم‌پوشان.
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
        "sources": [
          "residential"
        ],
        "includes": [
          "مسکونی — آپارتمان، مجتمع مسکونی، شهرک و ویلا"
        ],
        "image": "/images/types/residential.webp"
      },
      {
        "id": "office",
        "name": "اداری",
        "sources": [
          "office"
        ],
        "includes": [
          "اداری — ساختمان اداری، مجتمع دولتی و دفتر کار"
        ],
        "image": "/images/types/office.webp"
      },
      {
        "id": "commercial",
        "name": "تجاری",
        "sources": [
          "commercial"
        ],
        "includes": [
          "تجاری — مرکز خرید، بازار، فروشگاه و مجتمع تجاری"
        ],
        "image": "/images/types/commercial.webp"
      },
      {
        "id": "hospitality",
        "name": "هتل و گردشگری",
        "sources": [
          "hospitality"
        ],
        "includes": [
          "اقامتی و گردشگری — هتل، اقامتگاه، مجتمع تفریحی و بوم‌گردی"
        ],
        "image": "/images/types/hospitality.webp"
      },
      {
        "id": "education",
        "name": "آموزشی",
        "sources": [
          "education"
        ],
        "includes": [
          "آموزشی — مدرسه، دانشگاه و مرکز آموزشی"
        ],
        "image": "/images/types/education.webp"
      },
      {
        "id": "medical",
        "name": "درمانی",
        "sources": [
          "medical"
        ],
        "includes": [
          "درمانی — بیمارستان، درمانگاه و مرکز بهداشت"
        ],
        "image": "/images/types/medical.webp"
      },
      {
        "id": "cultural",
        "name": "فرهنگی و مذهبی",
        "sources": [
          "cultural"
        ],
        "includes": [
          "فرهنگی و مذهبی — کتابخانه، موزه، فرهنگ‌سرا و مسجد"
        ],
        "image": "/images/types/cultural.webp"
      },
      {
        "id": "sports",
        "name": "ورزشی",
        "sources": [
          "sports"
        ],
        "includes": [
          "ورزشی — ورزشگاه، سالن ورزشی و مجموعه تفریحی"
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
        "name": "راه و بزرگراه",
        "sources": [
          "roads"
        ],
        "includes": [
          "راه‌سازی و بزرگراه"
        ],
        "image": "/images/types/roads.webp"
      },
      {
        "id": "bridge-tunnel",
        "name": "پل و تونل",
        "sources": [
          "bridge",
          "tunnel"
        ],
        "includes": [
          "پل و تقاطع غیرهم‌سطح",
          "تونل"
        ],
        "image": "/images/types/bridge.webp"
      },
      {
        "id": "rail-metro",
        "name": "راه‌آهن و مترو",
        "sources": [
          "rail",
          "metro"
        ],
        "includes": [
          "راه‌آهن",
          "مترو و قطار شهری"
        ],
        "image": "/images/types/rail.webp"
      },
      {
        "id": "airport",
        "name": "فرودگاه",
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
        "sources": [
          "port"
        ],
        "includes": [
          "بندر و اسکله"
        ],
        "image": "/images/types/port.webp"
      },
      {
        "id": "terminal-parking",
        "name": "پایانه و پارکینگ",
        "sources": [
          "terminal",
          "parking"
        ],
        "includes": [
          "پایانه‌های مسافری و باری",
          "پارکینگ عمومی"
        ],
        "image": "/images/types/terminal.webp"
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
        "name": "سد و مخزن",
        "sources": [
          "dam"
        ],
        "includes": [
          "سد و مخزن ذخیره آب"
        ],
        "image": "/images/types/dam.webp"
      },
      {
        "id": "networks",
        "name": "شبکه آب و فاضلاب",
        "sources": [
          "waternetwork",
          "sewernetwork"
        ],
        "includes": [
          "شبکه انتقال و توزیع آب",
          "شبکه جمع‌آوری فاضلاب"
        ],
        "image": "/images/types/waternetwork.webp"
      },
      {
        "id": "treatment",
        "name": "تصفیه‌خانه آب و فاضلاب",
        "sources": [
          "watertreatment",
          "wastewater"
        ],
        "includes": [
          "تصفیه‌خانه آب",
          "تصفیه‌خانه فاضلاب"
        ],
        "image": "/images/types/watertreatment.webp"
      },
      {
        "id": "irrigation-flood",
        "name": "آبیاری، زهکشی و سیلاب",
        "sources": [
          "irrigationcanal",
          "flood"
        ],
        "includes": [
          "کانال‌های آبیاری و زهکشی",
          "سازه‌های کنترل سیلاب و آبخیزداری"
        ],
        "image": "/images/types/irrigationcanal.webp"
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
        "sources": [
          "powerplant"
        ],
        "includes": [
          "نیروگاه"
        ],
        "image": "/images/types/powerplant.webp"
      },
      {
        "id": "renewable",
        "name": "خورشیدی و بادی",
        "sources": [
          "renewable"
        ],
        "includes": [
          "تأسیسات انرژی خورشیدی و بادی"
        ],
        "image": "/images/types/renewable.webp"
      },
      {
        "id": "powergrid",
        "name": "انتقال و پست برق",
        "sources": [
          "powergrid"
        ],
        "includes": [
          "خطوط انتقال و پست برق"
        ],
        "image": "/images/types/powergrid.webp"
      },
      {
        "id": "gas-pipeline",
        "name": "گازرسانی و خطوط نفت و گاز",
        "sources": [
          "gas",
          "pipeline"
        ],
        "includes": [
          "شبکه گازرسانی",
          "خطوط انتقال نفت و گاز"
        ],
        "image": "/images/types/gas.webp"
      },
      {
        "id": "hvac",
        "name": "گرمایش و سرمایش مرکزی",
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
        "name": "شارژ خودرو برقی",
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
        "id": "factory-workshop",
        "name": "کارخانه و کارگاه تولیدی",
        "sources": [
          "factory",
          "workshop"
        ],
        "includes": [
          "کارخانه و واحد تولیدی",
          "کارگاه‌ها و مجموعه‌های تولیدی"
        ],
        "image": "/images/types/factory.webp"
      },
      {
        "id": "warehouse-cold",
        "name": "انبار، سیلو و سردخانه",
        "sources": [
          "warehouse",
          "coldstore"
        ],
        "includes": [
          "انبار و مرکز لجستیک",
          "سیلو و سردخانه"
        ],
        "image": "/images/types/warehouse.webp"
      },
      {
        "id": "refinery",
        "name": "پالایشگاه و پتروشیمی",
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
        "sources": [
          "industrialpark"
        ],
        "includes": [
          "شهرک صنعتی"
        ],
        "image": "/images/types/industrialpark.webp"
      },
      {
        "id": "mineral",
        "name": "فرآوری مواد معدنی",
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
        "name": "معابر، مبلمان و روشنایی شهری",
        "sources": [
          "streets",
          "furniture",
          "lighting"
        ],
        "includes": [
          "سامان‌دهی و بهسازی معابر",
          "مبلمان شهری",
          "روشنایی شهری"
        ],
        "image": "/images/types/streets.webp"
      },
      {
        "id": "parks",
        "name": "فضای سبز و بوستان",
        "sources": [
          "parks"
        ],
        "includes": [
          "فضای سبز و بوستان"
        ],
        "image": "/images/types/parks.webp"
      },
      {
        "id": "waste",
        "name": "مدیریت پسماند",
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
        "name": "آتش‌نشانی و امداد",
        "sources": [
          "fire"
        ],
        "includes": [
          "آتش‌نشانی و مراکز امدادی"
        ],
        "image": "/images/types/fire.webp"
      },
      {
        "id": "regeneration",
        "name": "بازآفرینی بافت فرسوده",
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
        "id": "fiber-telecom",
        "name": "فیبر نوری و دکل مخابراتی",
        "sources": [
          "fiber",
          "telecom"
        ],
        "includes": [
          "شبکه فیبر نوری",
          "دکل و سایت مخابراتی"
        ],
        "image": "/images/types/fiber.webp"
      },
      {
        "id": "datacenter",
        "name": "مرکز داده",
        "sources": [
          "datacenter"
        ],
        "includes": [
          "مرکز داده"
        ],
        "image": "/images/types/datacenter.webp"
      },
      {
        "id": "smart",
        "name": "شهر هوشمند و کنترل هوشمند",
        "sources": [
          "smartcity",
          "control"
        ],
        "includes": [
          "زیرساخت شهر هوشمند",
          "شبکه‌های ارتباطی و کنترل هوشمند"
        ],
        "image": "/images/types/smartcity.webp"
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
        "name": "آبیاری تحت فشار",
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
        "sources": [
          "greenhouse"
        ],
        "includes": [
          "گلخانه و مجتمع کشاورزی"
        ],
        "image": "/images/types/greenhouse.webp"
      },
      {
        "id": "livestock-fish",
        "name": "دامپروری و آبزی‌پروری",
        "sources": [
          "livestock",
          "fish"
        ],
        "includes": [
          "دامداری و دامپروری",
          "شیلات و آبزی‌پروری"
        ],
        "image": "/images/types/livestock.webp"
      },
      {
        "id": "ruralroad",
        "name": "راه روستایی",
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
        "name": "حفاظت منابع طبیعی",
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
        "name": "مرمت و حفاظت بنا",
        "sources": [
          "restoration",
          "protection"
        ],
        "includes": [
          "مرمت بناهای تاریخی",
          "مقاوم‌سازی و حفاظت اضطراری آثار"
        ],
        "image": "/images/types/restoration.webp"
      },
      {
        "id": "historichouse",
        "name": "احیا و تغییر کاربری بنای تاریخی",
        "sources": [
          "historichouse",
          "adaptive"
        ],
        "includes": [
          "احیای خانه‌های ارزشمند",
          "تغییر کاربری بناهای تاریخی"
        ],
        "image": "/images/types/historichouse.webp"
      },
      {
        "id": "historicfabric",
        "name": "بازآفرینی بافت تاریخی",
        "sources": [
          "historicfabric"
        ],
        "includes": [
          "بازآفرینی بافت تاریخی"
        ],
        "image": "/images/types/historicfabric.webp"
      },
      {
        "id": "tourism",
        "name": "گردشگری پیرامون آثار",
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
    "name": "زمین و مسکن",
    "fullNames": [
      "پروژه‌های توسعه زمین و املاک",
      "آماده‌سازی زمین و توسعه مسکن"
    ],
    "icon": "Map1",
    "image": "/images/types/lhintegrated.webp",
    "subtypes": [
      {
        "id": "study",
        "name": "مطالعات و طراحی",
        "sources": [
          "lhstudy"
        ],
        "includes": [
          "مطالعات و طراحی آماده‌سازی اراضی"
        ],
        "image": "/images/types/lhstudy.webp"
      },
      {
        "id": "preparation",
        "name": "آماده‌سازی و زیرساخت زمین",
        "sources": [
          "lhearth",
          "lhroads",
          "lhwater",
          "lhenergy",
          "lhintegrated"
        ],
        "includes": [
          "تسطیح و عملیات خاکی اراضی",
          "معابر و دسترسی‌های داخلی",
          "شبکه آب، فاضلاب و آب‌های سطحی",
          "شبکه برق، گاز و روشنایی",
          "آماده‌سازی یکپارچه اراضی مسکونی"
        ],
        "image": "/images/types/lhearth.webp"
      },
      {
        "id": "subdivision",
        "name": "تفکیک و قطعه‌بندی",
        "sources": [
          "subdivision",
          "lhplots"
        ],
        "includes": [
          "آماده‌سازی و تفکیک زمین",
          "قطعه‌بندی و تحویل زمین آماده ساخت"
        ],
        "image": "/images/types/lhplots.webp"
      },
      {
        "id": "township",
        "name": "شهرک‌سازی و توسعه اراضی",
        "sources": [
          "township",
          "newland"
        ],
        "includes": [
          "شهرک‌سازی",
          "توسعه اراضی جدید"
        ],
        "image": "/images/types/lhintegrated.webp"
      },
      {
        "id": "landhousing",
        "name": "توسعه زمین و ساخت مسکن",
        "sources": [
          "lhhousing",
          "lhcompletion"
        ],
        "includes": [
          "توسعه یکپارچه زمین و ساخت مسکن",
          "تکمیل آماده‌سازی و رفع موانع تحویل مسکن"
        ],
        "image": "/images/types/lhhousing.webp"
      },
      {
        "id": "renewal",
        "name": "نوسازی و توسعه مجدد",
        "sources": [
          "consolidation",
          "redevelop"
        ],
        "includes": [
          "نوسازی و تجمیع املاک",
          "تغییر کاربری و توسعه مجدد ملک"
        ],
        "image": "/images/types/regeneration.webp"
      },
      {
        "id": "mixeduse",
        "name": "مجتمع چندمنظوره",
        "sources": [
          "mixeduse"
        ],
        "includes": [
          "مجتمع‌های چندمنظوره مسکونی، تجاری و اداری"
        ],
        "image": "/images/types/commercial.webp"
      }
    ]
  }
];

export const subtypeBySource: Record<string, { group: string; subtype: string }> = {"residential":{"group":"building","subtype":"residential"},"office":{"group":"building","subtype":"office"},"commercial":{"group":"building","subtype":"commercial"},"hospitality":{"group":"building","subtype":"hospitality"},"education":{"group":"building","subtype":"education"},"medical":{"group":"building","subtype":"medical"},"cultural":{"group":"building","subtype":"cultural"},"sports":{"group":"building","subtype":"sports"},"roads":{"group":"transport","subtype":"roads"},"bridge":{"group":"transport","subtype":"bridge-tunnel"},"tunnel":{"group":"transport","subtype":"bridge-tunnel"},"rail":{"group":"transport","subtype":"rail-metro"},"metro":{"group":"transport","subtype":"rail-metro"},"airport":{"group":"transport","subtype":"airport"},"port":{"group":"transport","subtype":"port"},"terminal":{"group":"transport","subtype":"terminal-parking"},"parking":{"group":"transport","subtype":"terminal-parking"},"dam":{"group":"water","subtype":"dam"},"waternetwork":{"group":"water","subtype":"networks"},"sewernetwork":{"group":"water","subtype":"networks"},"watertreatment":{"group":"water","subtype":"treatment"},"wastewater":{"group":"water","subtype":"treatment"},"irrigationcanal":{"group":"water","subtype":"irrigation-flood"},"flood":{"group":"water","subtype":"irrigation-flood"},"powerplant":{"group":"energy","subtype":"powerplant"},"renewable":{"group":"energy","subtype":"renewable"},"powergrid":{"group":"energy","subtype":"powergrid"},"gas":{"group":"energy","subtype":"gas-pipeline"},"pipeline":{"group":"energy","subtype":"gas-pipeline"},"hvac":{"group":"energy","subtype":"hvac"},"ev":{"group":"energy","subtype":"ev"},"factory":{"group":"industry","subtype":"factory-workshop"},"workshop":{"group":"industry","subtype":"factory-workshop"},"warehouse":{"group":"industry","subtype":"warehouse-cold"},"coldstore":{"group":"industry","subtype":"warehouse-cold"},"refinery":{"group":"industry","subtype":"refinery"},"industrialpark":{"group":"industry","subtype":"industrialpark"},"mineral":{"group":"industry","subtype":"mineral"},"streets":{"group":"urban","subtype":"streets"},"furniture":{"group":"urban","subtype":"streets"},"lighting":{"group":"urban","subtype":"streets"},"parks":{"group":"urban","subtype":"parks"},"waste":{"group":"urban","subtype":"waste"},"cemetery":{"group":"urban","subtype":"cemetery"},"fire":{"group":"urban","subtype":"fire"},"regeneration":{"group":"urban","subtype":"regeneration"},"fiber":{"group":"digital","subtype":"fiber-telecom"},"telecom":{"group":"digital","subtype":"fiber-telecom"},"datacenter":{"group":"digital","subtype":"datacenter"},"smartcity":{"group":"digital","subtype":"smart"},"control":{"group":"digital","subtype":"smart"},"pressure":{"group":"agriculture","subtype":"pressure"},"greenhouse":{"group":"agriculture","subtype":"greenhouse"},"livestock":{"group":"agriculture","subtype":"livestock-fish"},"fish":{"group":"agriculture","subtype":"livestock-fish"},"ruralroad":{"group":"agriculture","subtype":"ruralroad"},"natural":{"group":"agriculture","subtype":"natural"},"restoration":{"group":"heritage","subtype":"restoration"},"protection":{"group":"heritage","subtype":"restoration"},"historichouse":{"group":"heritage","subtype":"historichouse"},"adaptive":{"group":"heritage","subtype":"historichouse"},"historicfabric":{"group":"heritage","subtype":"historicfabric"},"tourism":{"group":"heritage","subtype":"tourism"},"lhstudy":{"group":"land","subtype":"study"},"lhearth":{"group":"land","subtype":"preparation"},"lhroads":{"group":"land","subtype":"preparation"},"lhwater":{"group":"land","subtype":"preparation"},"lhenergy":{"group":"land","subtype":"preparation"},"lhintegrated":{"group":"land","subtype":"preparation"},"subdivision":{"group":"land","subtype":"subdivision"},"lhplots":{"group":"land","subtype":"subdivision"},"township":{"group":"land","subtype":"township"},"newland":{"group":"land","subtype":"township"},"lhhousing":{"group":"land","subtype":"landhousing"},"lhcompletion":{"group":"land","subtype":"landhousing"},"consolidation":{"group":"land","subtype":"renewal"},"redevelop":{"group":"land","subtype":"renewal"},"mixeduse":{"group":"land","subtype":"mixeduse"}};
