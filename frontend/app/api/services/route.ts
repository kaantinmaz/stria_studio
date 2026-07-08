import { NextResponse } from "next/server";
import { SERVICES } from "@/lib/i18n";

// GET /api/services — public, read-only list of services.
// Source of truth is lib/i18n SERVICES (static site content), so this stays DRY.
export function GET() {
  return NextResponse.json({
    data: SERVICES.map((s) => ({
      slug: s.slug,
      name_tr: s.name.tr,
      name_en: s.name.en,
      tag_tr: s.tag.tr,
      tag_en: s.tag.en,
      desc_tr: s.desc.tr,
      desc_en: s.desc.en,
      image: s.img,
      url: `/hizmetler/${s.slug}`,
    })),
  });
}
