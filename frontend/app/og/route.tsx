import { ImageResponse } from "next/og";

// Stable social/share image served at /og (referenced by OpenGraph metadata).
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #fdf6f5 0%, #f8dfe2 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 6, color: "#a83f54", textTransform: "uppercase" }}>
          Ankara · Çankaya
        </div>
        <div style={{ fontSize: 84, fontWeight: 600, color: "#4c1313", marginTop: 24, lineHeight: 1.05 }}>
          Stria Studio
        </div>
        <div style={{ fontSize: 38, color: "#74494a", marginTop: 24, maxWidth: 920 }}>
          Kalıcı makyaj, kaş ve kirpik uygulamalarında doğal dokunuşlar
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
