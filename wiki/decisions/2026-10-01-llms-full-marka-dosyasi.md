# Decision: `/llms-full.txt` marka dosyası + gerçek ölçek verisi

**Date:** 2026-10-01
**Status:** Prod'da (2026-10-01). Ölçek bölümü `SCALE_MIN_SESSIONS = 100` eşiğine kadar gizli (prod: 3 müşteri / 5 seans; owner kararı).

## Bağlam

Kaynak: Oğuzhan Temiz'in özetlediği SEJ/AnswerShare testi (sponsorlu, bağımsız değil). Bulgu: AI asistanları bir markayı önerip önermemeye **eldeki bağlama** göre karar veriyor; payda (yıl, müşteri sayısı), yorumlar, şikâyet + yanıt ve bilginin sınırları yoksa birkaç zayıf sinyal fazla ağırlık alıyor. Bizdeki somut örnek: placeholder adresin AI cevabında güvenilmezlik uyarısına dönüşmesi ([[issues/2026-08-10-striastudio-organik-gorunurluk-teshisi]]).

## Karar

- **`/llms-full.txt`** (`frontend/app/llms-full.txt/route.ts`, ISR 300 sn): Kimlik · Ölçek · Hizmetler (API'den tam metin: intro, adımlar, faydalar, bakım, alt hizmetler, SSS) · Uzmanlık · Çalışma örnekleri · Müşteri yorumları · Olumsuz yorumlar ve şikâyetler · Uygulama ilkeleri · Rehber yazılar · Kaynaklar · Bilginin sınırları.
- **Uydurma yok.** Her cümle API verisinden, mevcut site metninden ya da `lib/llms.ts` sabitlerinden gelir. Veri yoksa doldurulmaz, "Bilginin sınırları" bölümünde açıkça yazılır (kuruluş yılı, fiyat listesi, açık adres).
- **Ölçek = canlı randevu kayıtları** (owner kararı): `GET /api/studio-facts` → `completed_sessions`, `customers_served`, `records_since`. "Tamamlanan" proje konvansiyonu: `status='confirmed' AND starts_at < now()` (Loyalty ile aynı). Yalnızca toplamlar; sistem öncesi işler dahil değil, bu dosyada yazıyor. `completed_sessions = 0` ise bölüm "yayınlanmıyor" der.
- **Şikâyetler:** `lib/llms.ts` `REPUTATION` (owner beyanı, `checkedAt` 2026-10-01, liste boş). Yeni şikâyet çıkınca kaynak + tarih + özet + yanıtla buraya eklenir; amaç gizlemek değil bağlamla sunmak. ≤3 yıldızlı site yorumları bu bölümde otomatik listelenir.
- **Placeholder sızmaz:** `isPlaceholder()` (`[` içeren değer) açık adresi, posta kodu da ancak gerçek açık adresle birlikte basılır.
- **`/llms.txt`**: dosyaya link + hizmet listesi artık API'den (10 hizmet; eskiden sabit 7, kamuflaj/kaş tasarımı/altın oran eksikti). API boşsa eski 7 satır yedek.
- **Instagram tek hesap:** `@striabeautystudio` (owner). Veri migration'ı `2026_10_01_000000_fix_instagram_handle_to_striabeautystudio` (settings + links), seeder'lar, `SETTINGS_FALLBACK`, i18n güncellendi. Eski durum: handle `@striakamuflaj`, URL `/striastudio` → entity karışıklığı.

## Bilinçli yapılmayanlar

- **AI crawler'a ayrı içerik sunan edge worker yok.** CDN katmanımız yok; UA'ya göre farklı içerik Google'ın "AI için ayrı içerik" uyarısına ve cloaking riskine girer. Dosya herkese aynı.
- Ölçek sayıları sayfada görsel blok olarak gösterilmedi (prod sayıları henüz görülmedi; küçük sayı kamusal sayfada ters sinyal olabilir). Karar owner'ın.

## Owner action

- Admin > Ayarlar: gerçek açık adres + posta kodu (girilince dosya kendiliğinden basar).
- Google İşletme Profili + `reviews:sync-google` → yorum bölümü dolar.
- Kamuflaj `desc_tr` (DB) "medikal pigmentlerle" diyor; reklam politikası aynı ifadeyi "örtücü pigment" olarak düzeltmişti (`marketing/brand.md`, 2026-08-17 politika sıkılaştırması). Klinik olmadığımız beyanıyla çelişiyor.

## Doğrulama

Lokal Laravel + `next dev`: `/llms-full.txt` 200 `text/plain`, 12 bölüm; Instagram yeni handle; placeholder adres/posta kodu basılmıyor; ölçek cümlesi lokal veriyle. `tsc` temiz. Backend suite 250/250 (yeni `StudioFactsApiTest`: geçmiş onaylı sayılır; gelecek/talep/iptal/gelmedi hariç; aynı müşteri iki seans → 2/1; boş → 0/0/null).
