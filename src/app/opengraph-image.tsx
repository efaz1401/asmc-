import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.brand.short} — Manpower Supply Company in Saudi Arabia`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          color: "#f4f1ea",
          padding: 80,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "ui-sans-serif, system-ui",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#8a857a",
          }}
        >
          <span>ASMC · Adel Saad Al-Matar Contracting</span>
          <span>asmc.com.sa</span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 96,
            lineHeight: 1.0,
            letterSpacing: -2,
          }}
        >
          <span>Manpower supply</span>
          <span>
            <span style={{ fontStyle: "italic", color: "#8a857a" }}>&amp;</span> equipment
          </span>
          <span>across Saudi Arabia.</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#8a857a",
          }}
        >
          <span>Al Hofuf · KSA</span>
          <span>+966 54 955 6517</span>
        </div>
      </div>
    ),
    size,
  );
}
