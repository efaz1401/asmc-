import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import { OrganizationSchema, WebSiteSchema } from "@/components/StructuredData";
import { BackgroundFX } from "@/components/BackgroundFX";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const arabic = Noto_Naskh_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.brand.short} — Manpower Supply Company in Saudi Arabia`,
    template: `%s — ${SITE.brand.short} | Manpower Supply Saudi Arabia`,
  },
  description: SITE.description.en,
  keywords: [...SITE.keywords],
  applicationName: SITE.brand.short,
  authors: [{ name: SITE.brand.en, url: SITE.url }],
  creator: SITE.brand.en,
  publisher: SITE.brand.en,
  category: "Business Services",
  alternates: {
    canonical: "/",
    languages: {
      "en-SA": "/",
      "ar-SA": "/ar",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE.brand.short,
    url: SITE.url,
    title: `${SITE.brand.short} — Manpower Supply Company in Saudi Arabia`,
    description: SITE.description.en,
    locale: "en_SA",
    alternateLocale: ["ar_SA"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.brand.short} — Manpower Supply Company in Saudi Arabia`,
    description: SITE.description.en,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  other: {
    "geo.region": "SA-04",
    "geo.placename": "Al Hofuf, Al-Ahsa, Eastern Province",
    "geo.position": `${SITE.contact.address.lat};${SITE.contact.address.lng}`,
    ICBM: `${SITE.contact.address.lat}, ${SITE.contact.address.lng}`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${sans.variable} ${display.variable} ${mono.variable} ${arabic.variable}`}
      suppressHydrationWarning
    >
      <body>
        <BackgroundFX />
        <div className="page-shell">{children}</div>
        <OrganizationSchema />
        <WebSiteSchema />
      </body>
    </html>
  );
}
