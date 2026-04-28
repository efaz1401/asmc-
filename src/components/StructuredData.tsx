import { SITE, SERVICES, FAQ } from "@/lib/site";

function Json({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "GeneralContractor"],
    "@id": `${SITE.url}#organization`,
    name: SITE.brand.en,
    alternateName: [SITE.brand.short, SITE.brand.ar],
    legalName: SITE.brand.en,
    url: SITE.url,
    logo: `${SITE.url}/favicon.svg`,
    image: `${SITE.url}/og.svg`,
    description: SITE.description.en,
    foundingDate: "2022",
    slogan: "Manpower Supply Company in Saudi Arabia",
    telephone: SITE.contact.phones,
    email: SITE.contact.email,
    taxID: SITE.contact.cr,
    address: {
      "@type": "PostalAddress",
      streetAddress: "9P9F+6Q",
      addressLocality: SITE.contact.address.city,
      addressRegion: "Eastern Province",
      addressCountry: "SA",
      postalCode: SITE.contact.address.postalCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.contact.address.lat,
      longitude: SITE.contact.address.lng,
    },
    areaServed: [
      { "@type": "Country", name: "Saudi Arabia" },
      { "@type": "City", name: "Riyadh" },
      { "@type": "City", name: "Jeddah" },
      { "@type": "City", name: "Dammam" },
      { "@type": "City", name: "Al Khobar" },
      { "@type": "City", name: "Al-Ahsa" },
      { "@type": "City", name: "Al Hofuf" },
      { "@type": "City", name: "Jubail" },
      { "@type": "City", name: "NEOM" },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "08:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "08:00",
        closes: "12:00",
      },
    ],
    sameAs: [SITE.social.facebook, SITE.social.linkedin, SITE.social.instagram],
    contactPoint: SITE.managers.map((m) => ({
      "@type": "ContactPoint",
      contactType: "sales",
      name: m.name,
      telephone: m.phone,
      email: SITE.contact.email,
      areaServed: "SA",
      availableLanguage: ["en", "ar"],
    })),
    knowsAbout: [
      "Manpower supply",
      "Skilled labor outsourcing",
      "Equipment rental",
      "Construction contracting",
      "MEP services",
      "Material supply",
    ],
    makesOffer: SERVICES.map((s) => ({
      "@type": "Offer",
      name: s.title.en,
      description: s.short.en,
      areaServed: "SA",
      url: `${SITE.url}/services/${s.slug}`,
    })),
  };
  return <Json data={data} />;
}

export function WebSiteSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}#website`,
    url: SITE.url,
    name: `${SITE.brand.short} — ${SITE.brand.en}`,
    inLanguage: ["en-SA", "ar-SA"],
    publisher: { "@id": `${SITE.url}#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  return <Json data={data} />;
}

export function ServiceSchema({
  slug,
}: {
  slug: (typeof SERVICES)[number]["slug"];
}) {
  const s = SERVICES.find((x) => x.slug === slug)!;
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.title.en,
    serviceType: s.title.en,
    description: s.description.en,
    provider: { "@id": `${SITE.url}#organization` },
    areaServed: { "@type": "Country", name: "Saudi Arabia" },
    url: `${SITE.url}/services/${s.slug}`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: s.title.en,
      itemListElement: s.bullets.map((b, i) => ({
        "@type": "Offer",
        position: i + 1,
        itemOffered: { "@type": "Service", name: b.en },
      })),
    },
  };
  return <Json data={data} />;
}

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; href: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE.url}${it.href}`,
    })),
  };
  return <Json data={data} />;
}

export function FAQSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q.en,
      acceptedAnswer: { "@type": "Answer", text: f.a.en },
    })),
  };
  return <Json data={data} />;
}
