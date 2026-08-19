# Stria Studio App Store Screenshot Seti

Bu klasördeki her HTML dosyası tek başına, sabit `1290 × 2796 px` tuval olarak açılır. Uygulama arayüzleri 393 × 852 pt iPhone mantığıyla kurulmuş ve CSS cihaz çerçevesinin içinde ölçeklenmiştir.

## Dosya eşlemesi

| Dosya | Ekran | Marketing başlığı |
| --- | --- | --- |
| `01-anasayfa.html` | Ana Sayfa | Güzelliğin hep / seninle. |
| `02-randevu-al.html` | Randevu Al | Randevun, / senin ritminde. |
| `03-randevular.html` | Randevular | Her randevu / kontrolünde. |
| `04-profil.html` | Profil | Her şey sana / göre düzenli. |
| `05-bildirimler.html` | Bildirimler | Hiçbir anı / kaçırma. |

`shared.css` tüm tuval, cihaz, uygulama bileşeni ve tema stillerini içerir. Renk değişkenleri `mobile/lib/theme.ts` ile aynıdır. Fotoğraflar `frontend/public/images/`, logo ise `mobile/assets/logo.png` içinden göreli `file://` yollarıyla yüklenir.

## Hedef boyutlar

- App Store 6.9 inç: `1290 × 2796 px` — ana çıktı.
- App Store 6.5 inç: `1242 × 2688 px` — ana çıktının bu boyuta downscale edilmiş kopyası.

6.5 inç türevinde kırpma yapılmamalı; 1290 × 2796 görselin tamamı 1242 × 2688 alana ölçeklenmelidir.

## Render

HTML dosyasını doğrudan `file:///.../mobile/store/screenshots/01-anasayfa.html` biçiminde açın. Kullanılan headless Chrome sürücüsünde şu ayarları uygulayın:

```text
viewport: 1290 × 2796
deviceScaleFactor: 1
fullPage: false
format: PNG
```

Bu depoda üretilmiş çıktılar `render/` altındadır:

```text
render/0X-<ekran>-1290x2796.png        # 6.9" — App Store Connect ana set
render/6_5/0X-<ekran>-1242x2688.png    # 6.5" — downscale kopya
```

Yeniden üretmek için (doğrulanmış akış):

```js
await page.setViewport({ width: 1290, height: 2796, deviceScaleFactor: 1 });
await page.goto('file:///ABSOLUTE_PATH/mobile/store/screenshots/01-anasayfa.html', { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'render/01-anasayfa-1290x2796.png', type: 'png', clip: { x: 0, y: 0, width: 1290, height: 2796 } });
```

`clip` şart: bazı sürücüler viewport screenshot'ını önizleme boyutunda küçültüp döndürür. Çıktı 1290 × 2796 ve ~700 KB–1.2 MB olmalı; belirgin daha küçükse render ölçeklenmiş demektir.

6.5" seti:

```bash
cd render && for f in *-1290x2796.png; do
  sips -z 2688 1242 -s format png "$f" --out "6_5/${f%-1290x2796.png}-1242x2688.png"
done
```

Google Fonts erişilemiyorsa CSS otomatik olarak `'Outfit', 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif` zincirine döner. Projeye Node/npm paketi veya build adımı eklenmesi gerekmez.
