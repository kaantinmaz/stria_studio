import { site } from "@/lib/site";

export function StudioMap() {
  const { lat, lng } = site.geo;
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  return (
    <section className="px-[clamp(18px,5vw,56px)] pb-[clamp(64px,8vw,120px)]">
      <div className="mx-auto max-w-[1160px] overflow-hidden rounded-[28px] border border-line">
        <iframe
          title="Stria Studio · Çankaya, Ankara"
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-[380px] w-full border-0"
        />
      </div>
    </section>
  );
}
