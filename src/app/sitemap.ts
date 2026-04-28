import type { MetadataRoute } from "next";
import { SITE, SERVICES } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const now = new Date();
  const staticPaths = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/services", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/industries", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.7, changeFrequency: "yearly" as const },
    { path: "/careers", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/ar", priority: 0.9, changeFrequency: "weekly" as const },
  ];
  const services = SERVICES.map((s) => ({
    path: `/services/${s.slug}`,
    priority: 0.8,
    changeFrequency: "monthly" as const,
  }));
  return [...staticPaths, ...services].map(({ path, priority, changeFrequency }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
    alternates: {
      languages: {
        "en-SA": `${base}${path === "/ar" ? "/" : path}`,
        "ar-SA": path === "/" ? `${base}/ar` : `${base}/ar${path === "/ar" ? "" : ""}`,
      },
    },
  }));
}
