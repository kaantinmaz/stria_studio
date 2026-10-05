# Google Ads 25.000 ₺/ay kurulumu — 2026-10-05

**Durum:** Hesapta kuruldu, tüm kampanyalar **Duraklatıldı**. Yayına alma owner onayı + ödeme doğrulaması bekliyor.
**Hesap:** Google Ads `8409180162` (kaantinmaz@gmail.com). Kurulum öncesi hesapta hiç kampanya yoktu (eski C1–C7 paketleri hiç içe aktarılmamıştı).
**Paket:** `marketing/2026-10-05-google-ads-25k/` ← `marketing/scripts/specs/25k-c1…c5.json` (`build_package.py`, hata yok).

## Owner girdisi
- Yalnız Google, aylık **25.000 ₺**; %80 kaş laminasyon + dudak renklendirme + kamuflaj (alt hizmetleriyle), %20 diğer hizmetler; rakip aramaları serbest; PMax harita isteniyor; yalnız Ankara. Strateji serbest → dönüşüm odaklı.
- Bu karar [[decisions/2026-09-26-meta-google-butce-stratejisi]]'deki Google bölüşümünün yerine geçer; microblading ve pudralama artık reklamda (%20 kovasında).

## Kurulan yapı
| Kampanya | ₺/gün | İçerik |
|---|---|---|
| Stria \| Search \| Kaş Laminasyon | 200 | 1 grup, 18 kelime, 3 RSA |
| Stria \| Search \| Dudak Renklendirme | 210 | 1 grup, 20 kelime, 3 RSA |
| Stria \| Search \| Kamuflaj | 248 | 14 grup, 126 kelime, 42 RSA |
| Stria \| Search \| Diğer Hizmetler | 64 | 9 grup (marka, kirpik lifting, altın oran, eyeliner, dipliner, pudralama, microblading, kaş tasarımı, rakip) 112 kelime, 27 RSA |
| Stria \| PMax \| Harita & Yerel | 100 | **Kurulmadı** — aşağıda engel |

- Teklif: **Dönüşümleri en üst düzeye çıkar**. Konum: Ankara (il), **Varlık (Presence)**. Dil: Türkçe. Ağ: yalnız Google Arama. Geniş eşleme kapalı.
- Kampanya negatifleri: 292 (Search). Rakip grubu: `yasemin terzioğlu`, `aura velvet pmu`, `nills beauty`, `ergül keskin kalıcı makyaj` (metinde rakip adı yok).
- Dönüşüm işlemleri (GA4 `Stria` 550151317'den içe aktarım): `whatsapp_click` (Kişi), `call_click` + reklamdan arama (Telefon). Hepsi birincil.
- Hesap düzeyi öğeler: arama `0507 732 30 26` (Pzt–Cum + Cmt 10–19), 6 site bağlantısı, 6 açıklama metni; kampanya düzeyi `Hizmetler` snippet'i (4 kampanya). Hesapta kalmış iki ABD numaralı arama öğesi kaldırıldı.

## Bulgular / engeller
- **Vitiligo kelimeleri** "Health in personalized advertising" politikasına takıldı; istisna talebiyle eklendi, inceleme sonucu bekleniyor.
- **GBP:** hesaba bağlanan İşletme Profili (kaantinmaz@gmail.com) Stria değil — Kocaeli'deki iki başka işletme. Yanlış yer öğesi + bağlantı **kaldırıldı**. Stria'nın Ankara profili bağlanmadan PMax harita (mağaza ziyareti) kurulamaz.
- **Ödeme yöntemi doğrulanmamış** ("Reklamlarınız yayınlanmıyor").
- Görsel/logo öğesi eklenmedi (PMax ile birlikte; hazır kesimler `frontend/public/images` + `frontend/app/icon.png`'den üretilebilir).

## Revizyon (2026-10-05, owner ikinci mesaj)
- **Eyeliner + Dipliner reklamda yok:** iki reklam grubu hesapta duraklatıldı; 4 Search kampanyasına `eyeliner`/`dipliner` phrase negatif; Diğer Hizmetler snippet'i bu ikisi olmadan yeniden kuruldu; PMax spec'inden 3 tema çıktı.
- **Kamuflaj – Göz Altı Morluk reklamda yok:** grup duraklatıldı; Kamuflaj + Diğer Hizmetler'e `göz altı`/`morluk` negatif.
- Spec'ler (`25k-c1…c5`) + paket yeniden üretildi; bu terimler pakette yalnızca negatif satırlarında.
- **Görüntülü remarketing (owner isteği "AdSense"):** doğru ürün Google Ads **Görüntülü Reklam Ağı** kampanyası (AdSense yayıncı tarafı). Görseller: `marketing/2026-10-05-google-display/` (14 reklam görseli 1.91:1 / 1:1 / 4:5 + 2 logo, HTML→Chrome render, metin kaplaması ≤%18; köşe direktifleri her görselde). GA4 kitlesi **"Ads - Site ziyaretcileri (kamuflaj haric)"** — 30 gün, `page_location` "kamuflaj" içerenler **kalıcı hariç** (sağlık kişiselleştirme politikası).
- **Kampanya kuruldu:** `Stria | Display | Yeniden Pazarlama` (ID 24315882465) 40 ₺/gün, Ankara Presence, Maks. dönüşüm, **Duraklatıldı**. Hedef: GA4 ziyaretçi kitlesi + özel segment "Ankara kalıcı makyaj arayanlar" (12 arama terimi + rakip siteler yaseminterzioglu.com, nillsbeauty.com, ergulkeskin.com.tr). **Optimize hedefleme kapalı** (kitle Google tarafından genişletilmesin). 1 duyarlı görüntülü reklam: 12 görsel (dikey 4:5'ler 9:16'ya kırpıldığı için kullanılmadı), 2 logo, 5 başlık, 4 açıklama.
- **Bütçe dengesi:** Diğer Hizmetler 64 → 44 ₺. Hedef toplam 822 ₺/gün = Laminasyon 200 + Dudak 210 + Kamuflaj 248 + Diğer 44 + Display 40 + PMax 80 (GBP bağlanınca).

## Hizmet bazlı retargeting: Google Ads → Google Display + Meta (2026-10-05, owner üçüncü mesaj)
- **Hedef:** Google Ads tıklamasıyla bir hizmet sayfasına gelip dönüşüm yapmayan (whatsapp_click / call_click yok) kişiye o hizmetin görselleriyle hem Google Görüntülü'de hem Meta'da çıkmak.
- **Google tarafı (kuruldu):** GA4'te 6 kitle `Ads - Google Ads <Hizmet> (donusumsuz)` — Laminasyon, Dudak, Kirpik Lifting, Pudralama, Microblading, Kas Tasarimi. Tanım: `page_view` + `page_location` içerir `<slug>` VE `gclid=`; **kalıcı hariç**: `whatsapp_click` VEYA `call_click`; üyelik 30 gün. Kamuflaj/eyeliner/dipliner için kitle bilinçli YOK. GA4→Ads senkronu gecikmeli: kitleler kurulum anında Ads segment aramasında görünmedi → Display kampanyasında hizmet başına reklam grubu (hizmetin `land-/sq-` görselleri) senkron sonrası kurulacak.
- **Meta tarafı (kod hazır, deploy edilmedi):** `frontend/lib/metaPixel.ts` + `components/MetaPixel.tsx`; `NEXT_PUBLIC_META_PIXEL_ID` boşsa tamamen kapalı. Yalnız çerez onayından sonra yüklenir (GA ile aynı `stria-cookie-consent`; `CookieConsent` `stria-consent-accepted` olayı yayar). Google Ads gelişi `gclid/gbraid/wbraid` veya `utm_source=google&utm_medium=cpc` → `localStorage['stria-ad-src']={src:'google_ads',ts}` 30 gün (kimlik saklanmaz). Olaylar: `PageView`, hizmet sayfasında `ViewContent{content_name:slug}`, Google Ads bayrağı varsa `GoogleAdsServiceView{service:slug}`, WhatsApp/telefon tıklamasında `Contact` (mevcut `Analytics.tsx` dinleyicisinden). `/hizmetler/kamuflaj-makyaj*` yolunda Meta'ya HİÇBİR şey gitmez. Smoke (headless Chrome): onaysız 0 istek; onaylı laminasyon+gclid → PageView/ViewContent/GoogleAdsServiceView; kamuflaj → 0; pixel ID yok → script yok. `npm run build` geçti.
- **Meta kitle kurgusu (owner girişi bekliyor):** hizmet başına Custom Audience = `GoogleAdsServiceView` olayı, `service` = slug, 30 gün; **hariç**: `Contact` olayı 30 gün. Reklam seti başına ilgili hizmetin görselleri.

İlgili: `marketing/brand.md` "Paid media", [[decisions/2026-09-26-meta-google-butce-stratejisi]].
