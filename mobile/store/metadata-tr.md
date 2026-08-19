# Stria Studio — App Store Connect Metadata

Bu belge Türkçe birincil, İngilizce ikincil yerelleştirme için hazırlanmıştır. Karakter sayıları, alan değerindeki satır sonları ve madde işaretleri dahil Unicode karakter sayısıdır; Markdown kod çitleri sayıya dahil değildir.

## Türkçe (Birincil)

### App Name (30)

```text
Stria Studio
```

Karakter sayısı: **12/30**

### Subtitle (30)

```text
Randevu ve sadakat bir arada
```

Karakter sayısı: **28/30**

### Promotional Text (170)

```text
Randevu talebini kolayca oluştur, durumunu takip et. Kampanyaları, duyuruları ve sadakat ilerlemeni sakin, sade bir deneyimde tek yerde gör.
```

Karakter sayısı: **140/170**

### Description (4000)

```text
Stria Studio, randevu ve stüdyo deneyimini tek bir yerde, sade ve güvenli bir akışla yönetmen için tasarlandı.

Uygulamadan uygun hizmeti, günü ve saati seçerek randevu talebi oluşturabilir; talebinin onay durumunu ve geçmiş randevularını takip edebilirsin.

Öne çıkanlar:
• Randevu talebi: Hizmet, uygun gün ve saat seç; istersen not ve geçerli kampanya ekle.
• Randevu takibi: Taleplerini ve randevularını “Talep Edildi”, “Onaylandı”, “İptal” ve “Gelmedi” durumlarıyla görüntüle. Uygun süre içindeki randevular için gelemeyeceğini uygulamadan bildir.
• Kampanya ve duyurular: Aktif fırsatları, fiyat bilgilerini, geçerlilik tarihlerini ve stüdyo duyurularını tek ekranda gör.
• Sadakat kartı: Tamamlanan işlemlerine göre ilerlemeni ve bir sonraki ödüle ne kadar kaldığını takip et.
• QR ile hesap açma: Stüdyoda gösterilen QR kodunu okutarak mevcut müşteri kaydını ve randevu geçmişini hesabınla eşleştir.
• Profil: Ad, telefon, e-posta ve şifre bilgilerini yönet; müşteri koduna ulaş; istersen hesabını uygulama içinden kalıcı olarak sil.
• Uygulama içi bildirimler: Yeni kampanya ve duyuruları bildirim ekranında gör; yeni içerik rozetini takip et.

Stria Studio’nun doğal ve kişiye özel güzellik yaklaşımı, randevu deneyimine sakin ve özenli bir dijital alan kazandırır.

Not: Randevu oluşturma bir taleptir; kesinleşen randevular uygulamada “Onaylandı” olarak gösterilir. QR ile kayıt için stüdyo tarafından oluşturulan geçerli bir QR kodu gerekir.
```

Karakter sayısı: **1454/4000**

### Keywords (100)

```text
randevu,güzellik,kalıcı makyaj,microblading,kaş,dipliner,eyeliner,dudak,sadakat,kampanya,Ankara
```

Karakter sayısı: **95/100**

Not: Virgüller arasında tekrar yoktur; App Name içindeki “Stria” ve “Studio” kelimeleri kullanılmamıştır.

### What's New in This Version (4000)

Sürüm: **1.0.0 — İlk sürüm**

```text
Stria Studio’nun ilk sürümü yayında.

• Uygun gün ve saatlerle randevu talebi oluşturma
• Randevu durumlarını ve geçmişini takip etme
• Kampanya, duyuru ve sadakat ilerlemesini görüntüleme
• QR ile hızlı hesap açma ve mevcut müşteri kaydıyla eşleşme
• Profil bilgilerini yönetme ve uygulama içi bildirimleri görüntüleme
```

Karakter sayısı: **319/4000**

## URL Alanları

`frontend/app` altında üç rota da doğrulanmıştır; hiçbir URL için yeni sayfa gerekmiyor.

### Support URL

```text
https://striastudio.com.tr/iletisim
```

Karakter sayısı: **35** — mevcut rota: `frontend/app/iletisim/page.tsx`

### Marketing URL

```text
https://striastudio.com.tr
```

Karakter sayısı: **26** — mevcut rota: `frontend/app/page.tsx`

### Privacy Policy URL

```text
https://striastudio.com.tr/gizlilik-politikasi
```

Karakter sayısı: **46** — mevcut rota: `frontend/app/gizlilik-politikasi/page.tsx`

### User Privacy Choices URL (isteğe bağlı öneri)

```text
https://striastudio.com.tr/gizlilik-politikasi
```

Karakter sayısı: **46** — mevcut politika, uygulama içi hesap silme yolunu da açıklıyor.

## Category

- Birincil: **Lifestyle (Yaşam Tarzı)**
- İkincil: **Health & Fitness (Sağlık ve Fitness)**

Gerekçe: Uygulamanın ana işi güzellik stüdyosu randevusu ve müşteri deneyimidir; bakım/iyileşme hakkında sınırlı bilgi verebilen asistan ikincil sağlık/esenlik bağlamını destekler. Uygulama tıbbi teşhis veya tedavi sunmaz.

## Age Rating

Önerilen beyanlarla beklenen global sonuç: **9+** (iOS 26 ve sonrası yeni derecelendirme sistemi). Nihai ve bölgesel değerleri App Store Connect hesaplar. Daha yüksek yaşa manuel geçersiz kılma önerilmez; “Made for Kids” seçilmemelidir.

### In-App Controls

- Parental Controls: **No**
- Age Assurance: **No**

### Capabilities

- Unrestricted Web Access: **No** — uygulama içinde serbest web tarayıcısı yoktur; yasal bağlantılar sistem tarayıcısında açılır.
- User-Generated Content: **No** — kullanıcı içeriği geniş bir kullanıcı kitlesine dağıtılmaz.
- Social Media: **No**
- Social Media Disabled for Users Under 13: **No / Not Applicable**
- Messaging and Chat: **No** — yapay zekâ asistanı vardır, fakat kullanıcılar birbirleriyle iletişim kuramaz.
- Advertising: **No** — üçüncü taraf veya ücretli reklam alanı yoktur; yalnız stüdyonun kendi kampanyaları gösterilir.

### Mature Themes

- Profanity or Crude Humor: **None**
- Horror/Fear Themes: **None**
- Alcohol, Tobacco, or Drug Use or References: **None**

### Medical or Wellness

- Medical or Treatment Information: **None** — asistan tıbbi teşhis veya tedavi önerisi vermeyecek şekilde sınırlandırılmıştır.
- Health or Wellness Topics: **Infrequent** — asistan yalnız stüdyo hizmetleri kapsamında bakım/iyileşme hakkında sınırlı bilgi verebilir.

### Sexuality or Nudity

- Mature or Suggestive Themes: **None**
- Sexual Content or Nudity: **None**
- Graphic Sexual Content and Nudity: **None**

### Violence

- Cartoon or Fantasy Violence: **None**
- Realistic Violence: **None**
- Prolonged Graphic or Sadistic Realistic Violence: **None**
- Guns or Other Weapons: **None**

### Chance-Based Activities

- Gambling: **No / None**
- Simulated Gambling: **None**
- Contests: **None**
- Loot Boxes: **No**

### Age Categories and Override

- Made for Kids: **No**
- Override to Higher Age Rating: **Not Applicable**
- Age Suitability URL: **Boş bırakılabilir**

## App Review Notes

### Test hesabı hazırlığı

Ana uygulama ekranları kimlik doğrulaması gerektirir. Gönderimden önce production'da kalıcı bir inceleme hesabı **OLUŞTURULMALI** (en kolay yol: uygulamadaki "Hesap oluştur" ile e-posta/şifre kaydı) ve aşağıdaki iki yer tutucu gerçek bilgilerle değiştirilmelidir. Hesap, inceleme bitene kadar silinmemeli. İncelemenin bütün akışı görebilmesi için hesabın stüdyo kaydına bağlanması (Filament panelinden müşteri kaydına `app_user` eşleştirmesi) ve en az bir gelecek randevu, bir geçmiş onaylı randevu, aktif kampanya ve aktif duyuru bulunması önerilir. QR, inceleme hesabının yerine kullanılamaz; stüdyo panelinden üretilen tek kullanımlık kod gerektirir.

### App Review Notes alanına girilecek metin (4000)

```text
Authentication is required to access the main app.

REVIEW ACCOUNT — REPLACE THE PLACEHOLDERS WITH A PRODUCTION TEST ACCOUNT BEFORE SUBMISSION:
Email: [APP_REVIEW_EMAIL — TO BE CREATED]
Password: [APP_REVIEW_PASSWORD — TO BE CREATED]

Review steps:
1. Launch the app. The first screen is the email/password sign-in screen; there is no phone-number or SMS/OTP sign-in. A Privacy Policy link is shown on both the sign-in and sign-up screens.
2. Sign in with the review account above.
3. Home shows the next appointment, active offers, announcements, loyalty progress and recent studio work when records are available.
4. Open "Randevu Al", select a service, day and available time, and submit an appointment request. Submission does not confirm the appointment; staff confirmation changes its status to "Onaylandı".
5. Open "Randevular" to review appointment history and statuses. "Gelemeyeceğim" is available only for Requested/Confirmed appointments more than 12 hours away.
6. Tap the bell to open in-app notifications. The app does not use push notifications.
7. Open "Profil" to edit account information, withdraw AI chat consent, or use the in-app account deletion flow.

AI chat consent (Guideline 5.1.2):
• The chat button opens an explicit consent screen on first use. It lists exactly what is sent (name, customer code, recent appointments, loyalty summary, typed messages), the recipient (Anthropic, which generates the reply), and the purpose (reply generation only). Email address and phone number are never sent.
• No request is made to the chat endpoint until the user taps "Kabul ediyorum". "Şimdi değil" closes the sheet.
• Consent can be withdrawn any time from Profil > "Yapay zekâ sohbeti" > "Sohbet onayını geri çek"; the consent screen is then shown again on the next chat open.

Account deletion (Guideline 5.1.1(v)):
• Profil > "Hesabımı Sil" performs a two-step confirmation and permanently deletes the app account and all its tokens.
• The linked studio customer record is anonymised in the same transaction: name becomes "Silinmiş Müşteri" and phone, email, Instagram, notes and uploaded photos are removed. Past appointment records (date, service, amount) are retained without any identifying field for accounting obligations. This is described in the privacy policy.

Alternative registration:
• "Hesap oluştur" supports manual registration with name, email, password and optional phone.
• "QR ile kayıt ol" is optional and requires camera permission plus a valid, single-use QR shown from the studio admin system. It is not required for review and should not be used in place of the credentials above.
• Camera frames are processed for QR scanning and are not uploaded; only the scanned pairing token is sent to the API.

The AI chat does not enable communication between users.
```

Karakter sayısı: **2806/4000** — yer tutucular gerçek kimlik bilgileriyle değiştirildiğinde yeniden sayılmalıdır.

## App Privacy — Nutrition Label

### Üst düzey cevaplar

- “Do you or your third-party partners collect data from this app?”: **Yes**
- Data Linked to You: **Yes** — aşağıdaki veriler hesap/müşteri kimliğiyle ilişkilidir.
- Data Used to Track You: **No**
- Tracking / ATT: **No** — reklam kimliği, cihaz kimliği, reklam SDK'sı, üçüncü taraflar arası reklam profillemesi veya veri broker'ına aktarım yoktur.

### Seçilecek veri tipleri ve amaçları

| App Store veri tipi | Kodda doğrulanan içerik | Amaç | Kullanıcıyla bağlantılı | Tracking |
|---|---|---|---|---|
| Contact Info → Name | Ad soyad; manuel kayıt, QR eşleşmesi ve profil | App Functionality; kişisel hesap ve müşteri kaydı | Yes | No |
| Contact Info → Email Address | E-posta; manuel kayıt, giriş ve kimlik bilgisi yönetimi | App Functionality; kimlik doğrulama ve hesap güvenliği | Yes | No |
| Contact Info → Phone Number | İsteğe bağlı telefon; manuel kayıt, QR eşleşmesi ve profil | App Functionality; müşteri kaydı ve gerektiğinde iletişim | Yes | No |
| Identifiers → User ID | Uygulama kullanıcı ID'si, müşteri kodu ve hesap bağlantısı | App Functionality; oturum, hesap eşleştirme ve doğru veriyi gösterme | Yes | No |
| Purchases → Purchase History | Seçilen hizmet, randevu tarihi/geçmişi/durumu, kampanya kullanımı ve sadakat ilerlemesi | App Functionality; randevu yönetimi ve sadakat kartı | Yes | No |
| User Content → Other User Content | İsteğe bağlı randevu notu ve yapay zekâ sohbet mesajları | App Functionality; randevu talebini işleme ve sohbet yanıtı üretme | Yes | No |
| Usage Data → Product Interaction | Bildirim listesinin görüldüğü zaman (`notifications_seen_at`) | App Functionality; yeni içerik rozetini sıfırlama | Yes | No |

### Üçüncü taraf ve işleme notları

- Yapay zekâ sohbeti kullanıldığında mesajlar; kullanıcının adı, müşteri kodu, son randevuları ve sadakat özetiyle birlikte yanıt üretimi için backend üzerinden **Anthropic** hizmetine iletilir. Amaç yalnız **App Functionality**'dir; tracking, reklam veya analitik değildir.
- E-posta ve telefon Anthropic'e gönderilmez.
- Şifre backend'de hash'lenerek saklanır; açık metin tutulmaz.
- QR kamera kareleri sunucuya yüklenmez. Cihazda okunan eşleştirme token'ı hesaba bağlanmak için API'ye gönderilir.
- Randevu fotoğrafları kullanıcı tarafından uygulamaya yüklenmez; stüdyo kaydından yalnız görüntülenir. Bu sürüm için `Photos or Videos` veri toplama beyanı gerekmez.
- Konum, kişiler, sağlık verisi, ödeme bilgisi, cihaz kimliği, reklam verisi, crash/performance analitiği veya browsing history toplanmaz.
- Hesap uygulama içinden silindiğinde uygulama hesabı, iletişim bilgileri ve token'lar silinir; işletme/randevu kayıtları kişisel hesaptan koparılarak anonimleştirilmiş biçimde yasal saklama süresi boyunca tutulabilir.

## English (Secondary)

### Name (30)

```text
Stria Studio
```

Character count: **12/30**

### Subtitle (30)

```text
Appointments, loyalty & more
```

Character count: **28/30**

### Promotional Text (170)

```text
Request an appointment and follow its status. View offers, announcements and loyalty progress together in a calm, simple experience.
```

Character count: **132/170**

### Description (4000)

```text
Stria Studio brings appointments and studio updates together in a calm, simple experience.

Choose a service, an available day and time, then send an appointment request. Follow its confirmation status and review your appointment history whenever you need.

Highlights:
• Appointment requests: Select a service, day and time; add a note or an eligible offer if you wish.
• Appointment tracking: View requests and appointments with Requested, Confirmed, Cancelled and No-show statuses. Report that you cannot attend when the cancellation window is available.
• Offers and announcements: See active offers, pricing, validity dates and studio updates in one place.
• Loyalty card: Follow progress based on completed visits and see how close you are to your next reward.
• QR account setup: Scan the QR code shown at the studio to link your existing customer record and appointment history.
• Profile: Manage your name, phone number, email and password; access your customer code; permanently delete your account in the app.
• In-app notifications: View new offers and announcements and keep track of the new-content badge.

Stria Studio complements its natural, personalized approach to beauty with a refined digital appointment experience.

Please note: Creating an appointment sends a request. Confirmed appointments appear as Confirmed in the app. QR registration requires a valid QR code generated by the studio.
```

Character count: **1413/4000**

### Keywords (100)

```text
booking,beauty,permanent makeup,microblading,brows,dipliner,eyeliner,lips,loyalty,offers,Ankara
```

Character count: **95/100**

Note: No keyword is repeated, and neither “Stria” nor “Studio” is used.
