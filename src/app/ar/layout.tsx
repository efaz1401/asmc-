import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "ASMC — شركة توريد العمالة والمعدات في المملكة العربية السعودية",
  description: SITE.description.ar,
  alternates: {
    canonical: "/ar",
    languages: { "en-SA": "/", "ar-SA": "/ar", "x-default": "/" },
  },
  openGraph: {
    locale: "ar_SA",
    title: "ASMC — شركة توريد العمالة والمعدات في السعودية",
    description: SITE.description.ar,
  },
};

export default function ArLayout({ children }: { children: React.ReactNode }) {
  return <div dir="rtl" lang="ar" className="font-arabic">{children}</div>;
}
