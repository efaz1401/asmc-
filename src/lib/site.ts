export const SITE = {
  url: "https://asmc.com.sa",
  brand: {
    en: "Adel Saad Al-Matar Contracting Est.",
    ar: "مؤسسة عادل سعد المطر للمقاولات",
    short: "ASMC",
    tagline: {
      en: "Manpower & Equipment Solutions",
      ar: "حلول القوى العاملة والمعدات",
    },
  },
  description: {
    en: "Adel Saad Al-Matar Contracting Est. (ASMC) is a leading manpower supply company in Saudi Arabia, providing skilled engineers, technicians, drivers, plumbers, electricians and reliable equipment rental for construction, industrial and commercial projects across the Kingdom.",
    ar: "مؤسسة عادل سعد المطر للمقاولات هي شركة رائدة في توريد العمالة في المملكة العربية السعودية، تقدم المهندسين والفنيين والسائقين والسباكين والكهربائيين وخدمات تأجير المعدات الموثوقة لقطاعات البناء والصناعة والتجارة.",
  },
  keywords: [
    "manpower supply company in Saudi Arabia",
    "manpower supply Saudi Arabia",
    "manpower supply Riyadh",
    "manpower supply Al Hofuf",
    "manpower supply Eastern Province",
    "best manpower supply company in Saudi Arabia",
    "skilled labor supply Saudi Arabia",
    "manpower agency Saudi Arabia",
    "manpower outsourcing KSA",
    "construction manpower Saudi Arabia",
    "equipment rental Saudi Arabia",
    "heavy equipment rental KSA",
    "engineers and technicians supply Saudi Arabia",
    "manpower contracting company KSA",
    "Adel Saad Al-Matar Contracting",
    "ASMC",
    "asmc.com.sa",
    "manpower supply Al-Ahsa",
    "manpower supply Dammam",
    "manpower supply Jeddah",
    "تأجير العمالة في السعودية",
    "شركة توريد عمالة في السعودية",
    "مؤسسة عادل سعد المطر للمقاولات",
  ],
  contact: {
    address: {
      en: "9P9F+6Q, Al Hofuf, Al-Ahsa, Eastern Province, Saudi Arabia",
      ar: "٩P٩F+٦Q، الهفوف، الأحساء، المنطقة الشرقية، المملكة العربية السعودية",
      city: "Al Hofuf",
      region: "Eastern Province",
      country: "SA",
      postalCode: "36361",
      lat: 25.3833,
      lng: 49.5833,
    },
    phones: ["+966 54 955 6517", "+966 59 080 7169"],
    phonesIntl: ["+966549556517", "+966590807169"],
    email: "contact@asmc.com.sa",
    hours: {
      weekdays: "Sunday – Thursday · 8:00 AM – 5:00 PM",
      saturday: "Saturday · 8:00 AM – 12:00 PM",
      friday: "Friday · Closed",
    },
    cr: "2250007423",
  },
  managers: [
    { name: "Mohammad Shahid Ullah", role: "Marketing Manager", phone: "+966 54 955 6517" },
    { name: "Mohammad Tajul Islam", role: "Marketing Manager", phone: "+966 59 080 7169" },
  ],
  social: {
    facebook: "https://facebook.com/",
    linkedin: "https://linkedin.com/",
    instagram: "https://instagram.com/",
  },
  stats: [
    { value: "3+", label: { en: "Years of Service", ar: "سنوات الخبرة" } },
    { value: "500+", label: { en: "Skilled Workers", ar: "عامل ماهر" } },
    { value: "60+", label: { en: "Projects Delivered", ar: "مشروع منجز" } },
    { value: "24/7", label: { en: "Equipment Support", ar: "دعم المعدات" } },
  ],
} as const;

export type ServiceSlug =
  | "manpower-supply"
  | "equipment-rental"
  | "construction"
  | "material-supply"
  | "contracting";

export const SERVICES: {
  slug: ServiceSlug;
  number: string;
  title: { en: string; ar: string };
  short: { en: string; ar: string };
  description: { en: string; ar: string };
  bullets: { en: string; ar: string }[];
  keywords: string[];
}[] = [
  {
    slug: "manpower-supply",
    number: "01",
    title: { en: "Manpower Supply", ar: "توريد العمالة" },
    short: {
      en: "Skilled engineers, technicians and labor for every industry across Saudi Arabia.",
      ar: "مهندسون وفنيون وعمالة ماهرة لجميع القطاعات في المملكة العربية السعودية.",
    },
    description: {
      en: "We supply pre-vetted, fully documented manpower on long-term, short-term and project-based contracts to construction, industrial, oil & gas, MEP and facility-management clients across the Kingdom of Saudi Arabia. Our pool includes civil, mechanical and electrical engineers, HVAC technicians, welders, scaffolders, riggers, heavy-equipment operators, drivers, plumbers, electricians, masons, carpenters, helpers and admin support.",
      ar: "نقوم بتوريد العمالة المؤهلة والموثقة بالكامل بعقود طويلة وقصيرة الأمد ومشاريع لقطاعات البناء والصناعة والنفط والغاز والميكانيكا والكهرباء وإدارة المرافق في جميع أنحاء المملكة العربية السعودية.",
    },
    bullets: [
      { en: "Civil, mechanical & electrical engineers", ar: "مهندسون مدنيون وميكانيكيون وكهربائيون" },
      { en: "HVAC, MEP & maintenance technicians", ar: "فنيو التكييف والكهروميكانيك والصيانة" },
      { en: "Heavy-equipment operators & drivers", ar: "مشغلو المعدات الثقيلة والسائقون" },
      { en: "Plumbers, electricians, welders, masons", ar: "سباكون وكهربائيون وحدادون وبناؤون" },
      { en: "Saudi-compliant Iqama, medical & insurance", ar: "إقامة سعودية مطابقة وتأمين طبي" },
      { en: "On-site supervision and replacements", ar: "إشراف موقعي واستبدال فوري" },
    ],
    keywords: [
      "manpower supply company in Saudi Arabia",
      "skilled labor supply KSA",
      "manpower contracting Saudi Arabia",
    ],
  },
  {
    slug: "equipment-rental",
    number: "02",
    title: { en: "Equipment Rental", ar: "تأجير المعدات" },
    short: {
      en: "Heavy machinery, construction tools and safety equipment with 24/7 support.",
      ar: "آلات ثقيلة ومعدات بناء وسلامة مع دعم على مدار الساعة.",
    },
    description: {
      en: "Daily, weekly, monthly and project-based rental of heavy equipment, lifting gear, power tools, generators and safety packages — fully maintained and delivered to your site anywhere in Saudi Arabia. Operators, fuel and 24/7 breakdown support included on request.",
      ar: "تأجير يومي وأسبوعي وشهري ومشاريعي للمعدات الثقيلة وأدوات الرفع والمولدات وحزم السلامة — مع التوصيل والصيانة الكاملة على مدار الساعة.",
    },
    bullets: [
      { en: "Loaders, excavators, bulldozers, cranes", ar: "لوادر وحفارات وبلدوزرات وروافع" },
      { en: "Forklifts, scissor and boom lifts", ar: "روافع شوكية ومقصية وذراعية" },
      { en: "Generators, compressors, welding sets", ar: "مولدات وضواغط ومعدات لحام" },
      { en: "Scaffolding, formwork, safety gear", ar: "سقالات وقوالب صب ومعدات سلامة" },
      { en: "Operators, fuel and transport included", ar: "تشغيل ووقود ونقل ضمن العقد" },
      { en: "24/7 breakdown response", ar: "استجابة الأعطال على مدار الساعة" },
    ],
    keywords: ["equipment rental Saudi Arabia", "heavy machinery rental KSA"],
  },
  {
    slug: "construction",
    number: "03",
    title: { en: "Construction", ar: "البناء والإنشاء" },
    short: {
      en: "Full-cycle construction from planning to handover with experienced site teams.",
      ar: "خدمات بناء متكاملة من التخطيط حتى التسليم بفرق ذات خبرة عالية.",
    },
    description: {
      en: "Civil, structural and finishing works delivered by certified site teams. We manage scope, schedule, safety and quality from planning and procurement through commissioning — for residential, commercial, industrial and infrastructure projects.",
      ar: "أعمال مدنية وإنشائية وتشطيبية ينفذها فرق موقعية معتمدة. نتولى إدارة النطاق والجدول الزمني والسلامة والجودة من التخطيط والتوريد وحتى التسليم النهائي.",
    },
    bullets: [
      { en: "Project & construction management", ar: "إدارة المشاريع والإنشاءات" },
      { en: "Civil & structural works", ar: "الأعمال المدنية والإنشائية" },
      { en: "MEP installation & commissioning", ar: "تركيب وتشغيل الميكانيكا والكهرباء" },
      { en: "QA/QC and HSE compliance", ar: "ضمان الجودة وتطبيق السلامة" },
      { en: "Finishing, fit-out & joinery", ar: "تشطيبات ونجارة وتجهيز داخلي" },
      { en: "Renovation & retrofit", ar: "تجديد وإعادة تأهيل" },
    ],
    keywords: ["construction company Saudi Arabia", "MEP contractor KSA"],
  },
  {
    slug: "material-supply",
    number: "04",
    title: { en: "Material Supply", ar: "توريد المواد" },
    short: {
      en: "Construction materials, safety supplies, tools and hardware sourced from trusted manufacturers.",
      ar: "مواد بناء ومعدات سلامة وأدوات من مصنعين موثوقين.",
    },
    description: {
      en: "Bulk and project-based supply of certified construction materials, PPE, hardware and consumables — sourced through long-standing relationships with regional manufacturers and global distributors. Logistics, storage and just-in-time delivery handled end-to-end.",
      ar: "توريد مواد البناء المعتمدة ومعدات الحماية الشخصية والأدوات والمستهلكات بالجملة وبحسب المشروع — من خلال شراكات راسخة مع المصنعين والموزعين.",
    },
    bullets: [
      { en: "Cement, steel, blocks, aggregates", ar: "إسمنت وحديد وبلوك وحصى" },
      { en: "Electrical, plumbing & MEP supplies", ar: "مستلزمات كهربائية وسباكة وميكانيكا" },
      { en: "PPE & site safety packages", ar: "حزم معدات الحماية الشخصية" },
      { en: "Tools, hardware & consumables", ar: "أدوات ومعدات ومستهلكات" },
      { en: "Just-in-time logistics & storage", ar: "خدمات لوجستية وتخزين فوري" },
      { en: "Bulk and project pricing", ar: "تسعير بالجملة وبحسب المشروع" },
    ],
    keywords: ["building materials supplier Saudi Arabia", "PPE supplier KSA"],
  },
  {
    slug: "contracting",
    number: "05",
    title: { en: "Contracting Services", ar: "خدمات المقاولات" },
    short: {
      en: "Comprehensive contracting tailored to project scope, timeline and budget.",
      ar: "خدمات مقاولات شاملة مصممة وفق نطاق المشروع والجدول والميزانية.",
    },
    description: {
      en: "Single-source contracting that combines manpower, equipment, materials and on-site management under one accountable team. Designed for owners and main contractors who need predictable cost, schedule and quality with transparent reporting.",
      ar: "مقاولات من مصدر واحد تجمع العمالة والمعدات والمواد وإدارة الموقع تحت فريق واحد مسؤول، مع تقارير شفافة وتكلفة وجدول وجودة قابلة للتنبؤ.",
    },
    bullets: [
      { en: "Lump-sum and unit-rate contracting", ar: "تعاقد بسعر إجمالي أو بالوحدة" },
      { en: "Resource planning & mobilization", ar: "تخطيط الموارد والتعبئة" },
      { en: "Subcontract management", ar: "إدارة المقاولين من الباطن" },
      { en: "Cost control & reporting", ar: "ضبط التكلفة والتقارير" },
      { en: "Quality and HSE governance", ar: "حوكمة الجودة والسلامة" },
      { en: "On-time, on-budget delivery", ar: "تسليم في الوقت والميزانية" },
    ],
    keywords: ["contracting company Saudi Arabia"],
  },
];

export const INDUSTRIES = [
  { en: "Construction", ar: "البناء" },
  { en: "Oil & Gas", ar: "النفط والغاز" },
  { en: "Industrial & Manufacturing", ar: "الصناعة والتصنيع" },
  { en: "Infrastructure", ar: "البنية التحتية" },
  { en: "Power & Utilities", ar: "الطاقة والمرافق" },
  { en: "Facilities Management", ar: "إدارة المرافق" },
  { en: "Hospitality", ar: "الضيافة" },
  { en: "Logistics & Warehousing", ar: "اللوجستيات والمستودعات" },
  { en: "Retail & Commercial", ar: "التجزئة والتجاري" },
] as const;

export const REGIONS = [
  "Riyadh",
  "Jeddah",
  "Dammam",
  "Al Khobar",
  "Al-Ahsa",
  "Al Hofuf",
  "Jubail",
  "Yanbu",
  "Mecca",
  "Medina",
  "Tabuk",
  "Abha",
  "NEOM",
] as const;

export const VALUES = [
  {
    n: "01",
    title: { en: "Compliance first", ar: "الامتثال أولاً" },
    body: {
      en: "Every worker arrives with valid Iqama, medical clearance and insurance. Saudi labour-law compliant from day one.",
      ar: "كل عامل يصل بإقامة سارية وفحص طبي وتأمين، متوافق مع نظام العمل السعودي.",
    },
  },
  {
    n: "02",
    title: { en: "Speed of mobilisation", ar: "سرعة التعبئة" },
    body: {
      en: "Crews mobilised within 48–72 hours from our Eastern-Province base. Replacements within 24 hours.",
      ar: "تعبئة الفرق خلال 48 إلى 72 ساعة من قاعدتنا في المنطقة الشرقية. واستبدال خلال 24 ساعة.",
    },
  },
  {
    n: "03",
    title: { en: "Safety as standard", ar: "السلامة معيار أساسي" },
    body: {
      en: "HSE-trained workforce, PPE issued on every deployment and incident-rate tracking on every site.",
      ar: "كوادر مدربة على السلامة، ومعدات حماية شخصية في كل انتشار، ومتابعة معدل الحوادث في كل موقع.",
    },
  },
  {
    n: "04",
    title: { en: "Transparent pricing", ar: "تسعير شفاف" },
    body: {
      en: "Clear day-rates, monthly rates and project quotes. No surprise extras, no hidden fees.",
      ar: "أسعار يومية وشهرية وعروض مشاريع واضحة. بدون تكاليف مفاجئة أو رسوم خفية.",
    },
  },
] as const;

export const PROCESS = [
  {
    n: "01",
    title: { en: "Discovery", ar: "الاستكشاف" },
    body: {
      en: "We map your scope, timeline, site conditions and the trades you need.",
      ar: "نحدد النطاق والجدول الزمني وظروف الموقع والتخصصات المطلوبة.",
    },
  },
  {
    n: "02",
    title: { en: "Resource plan", ar: "خطة الموارد" },
    body: {
      en: "We propose crew composition, equipment list, materials and pricing.",
      ar: "نقدم تركيبة الفريق وقائمة المعدات والمواد والتسعير.",
    },
  },
  {
    n: "03",
    title: { en: "Mobilisation", ar: "التعبئة" },
    body: {
      en: "Documented crews and certified equipment delivered to your site.",
      ar: "نقوم بتعبئة الفرق الموثقة والمعدات المعتمدة إلى موقعك.",
    },
  },
  {
    n: "04",
    title: { en: "Execute & report", ar: "التنفيذ والتقارير" },
    body: {
      en: "On-site supervision, weekly reporting and live replacement support.",
      ar: "إشراف موقعي وتقارير أسبوعية ودعم استبدال فوري.",
    },
  },
] as const;

export const FAQ = [
  {
    q: { en: "What makes ASMC a leading manpower supply company in Saudi Arabia?", ar: "ما الذي يجعل ASMC شركة رائدة في توريد العمالة بالسعودية؟" },
    a: {
      en: "ASMC combines a fully documented Saudi-compliant workforce, fast 48–72 hour mobilisation from the Eastern Province and a single-source model that bundles manpower, equipment and materials under one accountable team — with 500+ skilled workers and 60+ projects delivered.",
      ar: "تجمع ASMC بين قوة عاملة موثقة بالكامل مطابقة لنظام العمل السعودي، وتعبئة سريعة خلال 48 إلى 72 ساعة من المنطقة الشرقية، ونموذج توريد متكامل من فريق واحد مسؤول.",
    },
  },
  {
    q: { en: "Which regions do you cover?", ar: "ما المناطق التي تغطونها؟" },
    a: {
      en: "We serve all major regions of the Kingdom of Saudi Arabia — Riyadh, Jeddah, the Eastern Province (Dammam, Al Khobar, Al-Ahsa, Al Hofuf, Jubail), Mecca, Medina, Tabuk, Abha and NEOM.",
      ar: "نغطي جميع مناطق المملكة الرئيسية: الرياض وجدة والمنطقة الشرقية (الدمام والخبر والأحساء والهفوف والجبيل) ومكة والمدينة وتبوك وأبها ونيوم.",
    },
  },
  {
    q: { en: "What trades and roles can you supply?", ar: "ما التخصصات التي توفرونها؟" },
    a: {
      en: "Civil, mechanical and electrical engineers; HVAC and MEP technicians; heavy-equipment operators; drivers; plumbers; electricians; welders; scaffolders; masons; carpenters; helpers and admin support.",
      ar: "مهندسون مدنيون وميكانيكيون وكهربائيون؛ فنيو تكييف وميكانيكا وكهرباء؛ مشغلو معدات ثقيلة؛ سائقون؛ سباكون؛ كهربائيون؛ لحامون؛ سقالات؛ بناؤون؛ نجارون؛ مساعدون.",
    },
  },
  {
    q: { en: "How fast can you mobilise a crew?", ar: "كم تستغرق التعبئة؟" },
    a: {
      en: "Standard crews mobilise within 48–72 hours of contract signature. Specialist trades and large project ramp-ups are scheduled in stages with the client.",
      ar: "تتم تعبئة الفرق القياسية خلال 48 إلى 72 ساعة من توقيع العقد. ويتم جدولة التخصصات النوعية والمشاريع الكبيرة على مراحل بالاتفاق مع العميل.",
    },
  },
  {
    q: { en: "Do you supply equipment and materials too?", ar: "هل توفرون المعدات والمواد أيضاً؟" },
    a: {
      en: "Yes. ASMC offers single-source contracting that bundles manpower, heavy equipment rental and certified materials supply — eliminating coordination overhead for owners and main contractors.",
      ar: "نعم. توفر ASMC عقوداً من مصدر واحد تجمع بين العمالة وتأجير المعدات الثقيلة وتوريد المواد المعتمدة، مما يقلل الأعباء التنسيقية على الملاك والمقاولين الرئيسيين.",
    },
  },
];
