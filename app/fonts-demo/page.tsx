import type { Metadata } from "next";
import {
  Cairo,
  IBM_Plex_Sans_Arabic,
  Noto_Naskh_Arabic,
  Almarai,
  Mada,
} from "next/font/google";
import Link from "next/link";

export const metadata: Metadata = {
  title: "عرض مقارنة الخطوط العربية | Sabq",
  description:
    "نموذج بصري لمقارنة خطوط عربية مناسبة للمشاريع الإعلامية والصحفية (عناوين ونصوص)",
};

const cairo = Cairo({ subsets: ["arabic"], weight: ["400", "600", "800"] });
const ibm = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "600", "700"] });
const naskh = Noto_Naskh_Arabic({ subsets: ["arabic"], weight: ["400", "600", "700"] });
const almarai = Almarai({ subsets: ["arabic"], weight: ["300", "400", "700", "800"] });
const mada = Mada({ subsets: ["arabic"], weight: ["300", "400", "700"] });

type FontCard = {
  key: string;
  name: string;
  license: string;
  sourceLabel: string;
  sourceUrl?: string;
  className?: string;
  inlineFont?: string; // لاستخدام خطوط غير محملة مباشرة (Dubai/GE SS Two)
  features: string[];
  note?: string;
};

const CARDS: FontCard[] = [
  {
    key: "cairo",
    name: "Cairo",
    license: "مجاني (SIL OFL)",
    sourceLabel: "Google Fonts",
    sourceUrl: "https://fonts.google.com/specimen/Cairo?subset=arabic",
    className: cairo.className,
    features: [
      "هندسي واضح متعدد الأوزان؛ مناسب لعناوين البورتالات الصحفية",
      "قابلية قراءة ممتازة على الشاشات مختلفة الكثافة",
    ],
  },
  {
    key: "ibm",
    name: "IBM Plex Sans Arabic",
    license: "مجاني (SIL OFL)",
    sourceLabel: "Google Fonts",
    sourceUrl: "https://fonts.google.com/specimen/IBM+Plex+Sans+Arabic",
    className: ibm.className,
    features: [
      "طابع مؤسسي حديث؛ ممتاز لواجهات المنتجات الإخبارية الرقمية",
      "توازن أوزان جيد للعناوين والنصوص",
    ],
  },
  {
    key: "naskh",
    name: "Noto Naskh Arabic",
    license: "مجاني (SIL OFL)",
    sourceLabel: "Google Fonts",
    sourceUrl: "https://fonts.google.com/noto/specimen/Noto+Naskh+Arabic",
    className: naskh.className,
    features: [
      "نسخي كلاسيكي مريح للنصوص الطويلة والمقالات",
      "ملائم للمطبوعات بفضل توازن تفاصيل الحروف",
    ],
  },
  {
    key: "almarai",
    name: "Almarai",
    license: "مجاني (SIL OFL)",
    sourceLabel: "Google Fonts",
    sourceUrl: "https://fonts.google.com/specimen/Almarai",
    className: almarai.className,
    features: [
      "حديث ومتوازن؛ واضح في العناوين والنصوص القصيرة",
      "ملائم للواجهات الخفيفة وتطبيقات الأخبار السريعة",
    ],
  },
  {
    key: "mada",
    name: "Mada",
    license: "مجاني (SIL OFL)",
    sourceLabel: "Google Fonts",
    sourceUrl: "https://fonts.google.com/specimen/Mada",
    className: mada.className,
    features: [
      "Sans عربي عملي؛ جيد للعناوين الفرعية والملخصات",
      "تناسق ممتاز في الأحجام الصغيرة للشاشات الكثيفة",
    ],
  },
  {
    key: "dubai",
    name: "Dubai",
    license: "مجاني (ترخيص دبي)",
    sourceLabel: "Dubai Font — Official",
    sourceUrl: "https://dubaifont.com/",
    inlineFont: "Dubai, system-ui, sans-serif",
    features: [
      "هوية عصرية متوازنة؛ مناسب للعناوين والمجلات الرقمية",
      "أوزان متعددة تمنح مرونة هرمية في التصميم",
    ],
    note: "لعرض الخط بدقة، قم بتضمينه عبر @font-face أو تثبيته على النظام",
  },
  {
    key: "gess",
    name: "GE SS Two",
    license: "مدفوع (ترخيص تجاري)",
    sourceLabel: "مزوّد خطوط (مثل MyFonts/Fonts.com)",
    inlineFont: "'GE SS Two', 'GE SS', 'Geeza Pro', system-ui, sans-serif",
    features: [
      "واسع الانتشار في الهوية المؤسسية والبث التلفزيوني بالخليج",
      "مناسب للعناوين الرئيسية والواجهات التسويقية",
    ],
    note: "يتطلب شراء الترخيص وتضمين الملفات ليظهر بدقة",
  },
];

function DemoParagraph() {
  return (
    <p className="text-[16px] leading-[1.9] text-gray-900">
      تشهد المنصات الإخبارية سباقًا متسارعًا نحو تحسين تجربة المستخدم عبر تبنّي
      معايير أداء أكثر صرامة، بما في ذلك زمن التحميل الأولي، وثبات التخطيط المرئي،
      وإمكانية الوصول. وتعمل غرف الأخبار على تحديث خطوط الطباعة الرقمية بما يوازن
      بين الهوية البصرية ووضوح القراءة، مع اعتماد نظم شبكية مرنة، وضبط التباعد
      والهوامش، والاستفادة من التخزين المؤقت وشبكات التوزيع. هذا التحديث يمنح
      القرّاء تجربة أكثر انسيابية في متابعة المحتوى اليومي والتحليلات المعمّقة.
    </p>
  );
}

export default function FontsDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className={`text-2xl font-bold text-gray-900 ${ibm.className}`}>مقارنة خطوط عربية للمشاريع الإعلامية</h1>
          <p className="text-sm text-gray-600 mt-1">
            عناوين 42px و28px + فقرة نصية (~400 حرف). جرّب وقرر خط العناوين وخط النصوص.
          </p>
        </header>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {CARDS.map((f) => {
            const style = f.inlineFont ? ({ fontFamily: f.inlineFont } as React.CSSProperties) : undefined;
            return (
              <section
                key={f.key}
                className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm ${f.className || ""}`}
                style={style}
              >
                <div className="text-[14px] font-semibold text-gray-900">{f.name} — {f.license}</div>
                <div className="text-[12px] text-gray-500 flex gap-2 flex-wrap mb-2">
                  <span>المصدر:</span>
                  {f.sourceUrl ? (
                    <Link className="text-blue-600 hover:underline" href={f.sourceUrl} target="_blank">
                      {f.sourceLabel}
                    </Link>
                  ) : (
                    <span>{f.sourceLabel}</span>
                  )}
                </div>
                <ul className="text-[13px] text-gray-700 list-disc pr-4 mb-2">
                  {f.features.map((feat, i) => (
                    <li key={i}>{feat}</li>
                  ))}
                </ul>
                {f.note && <div className="text-[12px] text-amber-600 mb-2">تنبيه: {f.note}</div>}

                <div className="text-[42px] leading-[1.2] tracking-[.1px] mt-2 mb-2">
                  عاجل: إصلاحات جوهرية في البنية التحتية الرقمية
                </div>
                <div className="text-[28px] leading-[1.35] mb-3">
                  تطوير منصة الأخبار لتجربة قراءة أسرع وأكثر ثباتًا
                </div>
                <DemoParagraph />
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}


