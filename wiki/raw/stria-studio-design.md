# RAW: Stria Studio — Minimal Design (source of truth)

> Immutable source. Extracted from Claude Design project `1d397bde-e48d-42bc-be99-9f60def1dd0e` ("Stria Studio Web Tasarımı"), file `Stria Studio - Minimal.dc.html`, imported 2026-07-07. Re-fetch the literal `.dc.html` via DesignSync `get_file` if needed.

## Business
Stria Studio — permanent makeup & beauty studio, Çankaya, **Ankara**. Services: brows, eyes, lips, lashes. Bilingual site (**TR default / EN**). Single-page marketing.

## Design tokens
- Font: **Jost** (Google Fonts) weights 300/400/500/600. Headings 500, letter-spacing -.02em.
- Colors: bg `#FBF4F1` · text `#42302E` · link/accent `#C57C69` (hover `#B0654F`) · rose `#D89A8A` · soft-pink `#F3DED7` · about-section bg `#F5E6E0` · footer/dark `#42302E` · muted text `#8A6F6A`/`#7A605B` · card border `#F1E2DC`/`#EEDDD7` · selection bg `#F3DED7`.
- Reveal animation `striaUp`: opacity 0→1, translateY 24px→0, .85s cubic-bezier(.22,.61,.36,1); triggered by IntersectionObserver threshold .12, unobserve after.
- Nav: fixed; dark contact-bar (`#42302E`) + blurred main bar (`rgba(251,244,241,.88)` + backdrop-blur 14px, bottom border `rgba(66,48,46,.06)`).
- Hero image shape: `border-radius:200px 200px 32px 32px`, shadow `0 40px 90px -50px rgba(197,124,105,.7)`.
- `.hideSm` = hide on small screens.

## Contacts (placeholders — owner replaces)
- phone: `+90 500 000 00 00` → `tel:+905000000000`
- WhatsApp: `https://wa.me/905000000000`
- Instagram: `https://instagram.com/striastudio` (@striastudio)
- Hours: Mon–Sat / Pzt–Cmt · 10:00–19:00
- Address: Çankaya, Ankara (`[Mahalle] Cd. No: 00`)

## Image assets (CloudFront — download & self-host)
- hero: `https://d8j0ntlcm91z4.cloudfront.net/user_2wUG0WAc015VxNhu12CRKnKuQXo/hf_20260707_194622_2e979ef8-7c2d-498a-a82b-af5755e185d1.png`
- micro (microblading): `.../hf_20260707_194725_9cce6441-18bb-4677-8c57-86e25c21f460.png`
- powder (powder brows / about): `.../hf_20260707_194800_53bbd793-16be-4880-b056-6252cdc48138.png`
- eyeliner: `.../hf_20260707_194922_42662ce3-8887-4a20-b61f-4f8797c9f12d.png`
- dipliner: `.../hf_20260707_194957_e66dc8c6-c08d-4b90-b23f-fd5dd6f4c655.png`

Mapping: hero→hero image + gallery mg3; micro→svc1 + gallery mg1 + featured card; powder→svc2 + about + gallery mg4; eyeliner→svc3 + gallery mg5; dipliner→svc4 + gallery mg2. svc5–7, mg6 = empty (soft-pink placeholder).

## Services (7, bilingual: tag / name / desc)
1. Kaş/Brows · Microblading · TR "Kıl tekniğiyle çizilen, gerçek kaşlardan ayırt edilemeyen doğal ve ince detaylı kaşlar." / EN "Hair-stroke technique that mimics natural brow hairs for a soft, undetectable finish."
2. Kaş/Brows · Kaş Pudralama / Powder Brows · TR "Pudra dokusuyla dolgun, makyajlı bir kaş görünümü — yağlı ciltler için ideal." / EN "A soft, filled-in powdered look — ideal for oily skin and a made-up effect."
3. Göz/Eyes · Eyeliner · TR "Bakışlarınızı belirginleştiren, kalıcı ve simetrik eyeliner uygulaması." / EN "A defined, symmetrical permanent eyeliner that opens up the gaze."
4. Göz/Eyes · Dipliner / Lash-line Enhancement · TR "Kirpik diplerine uygulanan ince pigment ile daha yoğun ve uyanık bir bakış." / EN "Fine pigment along the lash line for fuller lashes and a wide-awake look."
5. Dudak/Lips · Dudak Renklendirme / Lip Blush · TR "Dudaklara doğal renk, tanım ve dolgunluk kazandıran kalıcı renklendirme." / EN "Restores natural colour, definition and fullness with a soft lip-blush tint."
6. Kaş/Brows · Kaş Laminasyon / Brow Lamination · TR "Kaş kıllarını şekillendirerek daha dolgun, bakımlı ve düzenli bir görünüm." / EN "Sets and lifts brow hairs for a fuller, groomed and lasting shape."
7. Kirpik/Lashes · Kirpik Lifting / Lash Lift · TR "Kendi kirpiklerinizi kıvırarak uzatan, doğal ve kalıcı bir kirpik bakımı." / EN "Lifts and curls your own lashes for a longer, natural, low-maintenance look."

## Trust stats (4)
- %100 / 100% — Steril, tek kullanımlık ekipman / Sterile, single-use equipment
- 5+ / 5+ — Yıllık uzmanlık ve deneyim / Years of expertise
- Kişiye / Bespoke — Her yüze özel tasarım ve ölçüm / Design mapped to each face
- Onaylı / Certified — Sağlık onaylı, kaliteli pigmentler / Health-approved premium pigments

## UI copy (TR / EN)
- nav: Hizmetler/Services · Galeri/Gallery · Hakkımızda/About · İletişim/Contact · CTA Randevu Al/Book Now · Ara/Call
- hero kicker: "Ankara · Kalıcı Makyaj & Güzellik Stüdyosu" / "Ankara · Permanent Makeup & Beauty Studio"
- hero title: "Sen, en doğal\nhalinle güzelsin" / "You, at your\nmost natural"
- hero text: TR "Kaş, kirpik ve kalıcı makyajda özenli, doğal ve tamamen sana özel dokunuşlar. Ankara Çankaya'da." / EN "Careful, natural and entirely bespoke touches for brows, lashes and permanent makeup. In Çankaya, Ankara."
- hero CTAs: "WhatsApp'tan Randevu"/"Book on WhatsApp" · "Hemen Ara"/"Call Now"
- hero features: [Steril tek kullanımlık ekipman / Her yüze özel tasarım / 5+ yıl uzmanlık] · EN [Sterile single-use tools / Bespoke to every face / 5+ years of expertise]
- featured card: label "Öne çıkan hizmet"/"Featured service", name Microblading, hint "Kıl tekniği · doğal kaş"/"Hair-stroke · natural brows"
- services kicker/title/text: "Hizmetlerimiz"/"Our Services" · "Sana özel dokunuşlar"/"Touches made for you" · TR "Kaştan dudağa, gözden kirpiğe — her uygulama yüz hatlarına göre planlanır. Fiyat ve süre için mesaj atman yeterli." / EN "From brows to lips, eyes to lashes — every treatment is mapped to your features. Just message us for pricing and timing." · priceNote "Detaylı bilgi randevuda"/"Details on booking"
- gallery kicker/title/text: "Galeri"/"Gallery" · "Öncesi & Sonrası"/"Before & After" · TR "Gerçek müşteri çalışmalarından bir seçki. Görselleri buraya yükleyebilirsin." / EN "A selection of real client work. You can upload your own images here."
- about kicker/title/text: "Neden Stria"/"Why Stria" · "Rahat, güvenli ve tamamen sana özel"/"Relaxed, safe and entirely yours" · TR "Her uygulamaya yüz analizi ve simetri ölçümüyle başlıyoruz. Steril ortam, kaliteli pigmentler ve doğallıktan ödün vermeyen bir anlayış — Stria'da güzellik abartısız ve sana ait kalıyor." / EN "Every treatment begins with facial analysis and symmetry mapping. A sterile space, premium pigments and an approach that never oversteps — at Stria, beauty stays understated and unmistakably yours."
- contact kicker/title/text: "İletişim"/"Contact" · "Hadi randevunu oluşturalım"/"Let's book your appointment" · TR "Sorular ve randevu için WhatsApp'tan yaz ya da bizi ara. En kısa sürede dönüş yapıyoruz." / EN "Message us on WhatsApp or call for questions and bookings. We reply as soon as we can." · mapPh "Harita · Çankaya, Ankara"/"Map · Çankaya, Ankara"
- info rows: Adres/Address=Çankaya, Ankara · Telefon/Phone=+90 500 000 00 00 · Instagram=@striastudio · Çalışma Saatleri/Hours=Pzt–Cmt·10:00–19:00 / Mon–Sat·10:00–19:00
- footer tag: TR "Ankara'da microblading, kalıcı makyaj ve kaş–kirpik bakımı." / EN "Microblading, permanent makeup and brow & lash care in Ankara." · © 2026 Stria Studio · Çankaya, Ankara

## Sources
Claude Design project 1d397bde-e48d-42bc-be99-9f60def1dd0e / `Stria Studio - Minimal.dc.html`.
