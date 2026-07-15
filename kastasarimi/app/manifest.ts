import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.brand} · ${site.studio}`,
    short_name: site.brand,
    description:
      "Ankara Çankaya'da kişiye özel, kalıcı kaş tasarımı. Kıl tekniği, altın oran ölçümü, steril uygulama.",
    start_url: "/",
    display: "browser",
    lang: "tr",
    background_color: "#fdf8f4",
    theme_color: "#fdf8f4",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
