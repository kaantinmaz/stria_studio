# Raw: Kıl tekniği kaş / cannibalization danışması (2026-07-16)

Kaynak: sahip ile sohbet, 2026-07-16.

## Sahibin sorusu
`/hizmetler/microblading` "microblading ankara"da yukarıda; ama Google Ads verisinde "kıl tekniği kaş", "kaş microblading" aramaları yüksek hacimli. Bu müşterileri kaçırmamak için ne yapılmalı?

## Verilen tavsiye (uygulandı)
Aynı arama niyeti → yeni sayfa AÇMA (cannibalization: aynı niyete iki sayfa açılırsa Google ikisini yarıştırır, genelde ikisi de düşer). Bunun yerine mevcut sayfa varyantlara genişletildi:
- seo_title_tr: `Microblading Ankara | Kıl Tekniği Kaş`
- intro_tr'ye tanım köprüsü: "Microblading — halk arasında kıl tekniği kaş olarak bilinir — …"
- SSS'ye ilk madde: "Kıl tekniği kaş nedir?" (üç varyantın aynı işlem olduğunu kuran cevap; FAQPage şemasına girer)
- keywords_tr: + `kaş microblading`, + `kıl tekniği kaş ankara`
- frontend `components/schema.ts`: Service şemasına `alternateName: ["Kıl Tekniği Kaş", "Kaş Microblading"]` (SERVICE_ALTERNATE_NAMES haritası)

## Sahibin talimatı
Prensibi wiki'ye kaydet; sitelerdeki mevcut çakışan sayfaları da denetle — birleştir ya da kaldır.

## Aynı gün yapılan denetim bulguları
Envanter: ana site 9 hizmet + 14 yeni kamuflaj alt sayfası + 7 blog; microbladingankara.com 18 topikal sayfa + 6 blog; kastasarimiankara.com 15 topikal sayfa + 9 blog.
1. **Gerçek çakışma:** mikroblading_ankara `/kas-pudralama-ankara` (title "Kaş Pudralama Ankara (Powder Brows)") ↔ ana site `/hizmetler/kas-pudralama` (title "Kaş Pudralama Ankara | Powder Brows") — aynı head query, iki domain, ikisi de transactional. Karar: mikrosit sayfası bilgilendirici açıya re-angle edildi ("nedir/farkı"), randevu için ana site hizmet sayfasına link.
2. **Kabul edilen (mimari) örtüşme:** mikrosit ana sayfaları ↔ ana site hizmet sayfaları (microblading, kaş tasarımı) — bilinçli mikrosit stratejisi (decisions/2026-07-09-microsite-architecture); sameAs ile entity birleştirme; SERP'te çift görünürlük hedefi.
3. **İzleme:** micro blog `mikroblading-nedir` başlığı "Kıl Tekniği Kaş Rehberi" ↔ ana hizmet sayfasının yeni "kıl tekniği kaş" hedefi — niyet farklı (rehber vs hizmet); GSC'de ana sayfanın "kıl tekniği kaş" pozisyonu stall olursa micro blog başlığı yumuşatılacak.
4. **İzleme:** catlakkamuflaj.com ↔ `/hizmetler/kamuflaj-makyaj/catlak-gizleme` — terim ayrımı: dış site "çatlak kamuflajı" (rehber), alt sayfa "çatlak gizleme ankara" (hizmet).
5. **Temiz:** kastasarimi blog-vs-sayfa çakışmaları 2026-07-12'de re-angle edilmişti (başlıklar doğrulandı); kamuflaj alt sayfaları birbirinden ayrık problemleri hedefliyor (leke/güneş/doğum lekesi ayrımı iç linklerle netleştirilmeli — düşük öncelik).
