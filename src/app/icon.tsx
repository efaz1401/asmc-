import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#f4f1ea",
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: 1,
          fontFamily: "ui-sans-serif, system-ui",
          borderRadius: 14,
        }}
      >
        A
      </div>
    ),
    size,
  );
}
