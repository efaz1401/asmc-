import type { Metadata, Viewport } from "next";
import "./portal.css";

export const metadata: Metadata = {
  title: { default: "ASMC Portal", template: "%s · ASMC Portal" },
  description: "Internal employee portal for ASMC.",
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="portal-shell">{children}</div>;
}
