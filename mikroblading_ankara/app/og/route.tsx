import { ImageResponse } from "next/og";

// Stable social/share image served at /og (referenced by OpenGraph + JSON-LD).
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
          background: "linear-gradient(135deg, #fbf4f1 0%, #f3ded7 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 6, color: "#b26a4f", textTransform: "uppercase" }}>
          Ankara · Çankaya · Stria Studio
        </div>
        <div style={{ fontSize: 82, fontWeight: 600, color: "#42302e", marginTop: 24, lineHeight: 1.05 }}>
          Mikroblading Ankara
        </div>
        <div style={{ fontSize: 38, color: "#7a605b", marginTop: 24, maxWidth: 900 }}>
          Kıl tekniğiyle doğal, kalıcı kaş tasarımı
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
