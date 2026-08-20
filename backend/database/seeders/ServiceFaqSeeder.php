<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

/**
 * Hizmet sayfalarının "Sıkça Sorulan Sorular" bölümünün tek kaynağı.
 *
 * Sorular Search Console'daki gerçek aramalara göre yazılır (bkz.
 * marketing-research/gsc-sorgular-2026-08.csv); soru metni arama ifadesini
 * birebir karşılar, cevaplar blog yazılarındaki sürelerle tutarlıdır.
 *
 * ServiceSeeder bu diziyi okur. Ayrıca `db:seed --class=ServiceFaqSeeder`
 * YALNIZCA `faq_tr` kolonunu günceller — panelden düzenlenmiş intro, benefits,
 * process, SEO ve galeri alanlarına dokunmaz; prod'da tercih edilen yol budur.
 *
 * KURAL: fiyat yazılmaz, fiyat/randevu soruları WhatsApp'a yönlendirilir.
 */
class ServiceFaqSeeder extends Seeder
{
    public const FAQ = [
        'microblading' => [
            ['q' => 'Kıl tekniği kaş nedir?', 'a' => "Kıl tekniği kaş, microblading işleminin halk arasındaki adıdır. Özel bir uçla cildin üst katmanına gerçek kıl görünümünde ince çizgiler işlenir; kaşlar doğal ve dolgun görünür. Yani kaş microblading, kıl tekniği kaş ve microblading aynı uygulamadır."],
            ['q' => "Microblading Ankara'da ne kadar kalıcı?", 'a' => 'Cilt tipine bağlı olarak 12–18 ay kalıcıdır. Yıllık rötuşla görünüm korunur.'],
            ['q' => 'Microblading kaç günde iyileşir?', 'a' => 'Yüzeysel iyileşme 7–10 günde tamamlanır; ince kabuklar bu dönemde kendiliğinden dökülür. Rengin oturması ve nihai sonucun görülmesi ise yaklaşık 4 hafta sürer. İlk 7–10 gün kaşlar ıslatılmaz; sauna, havuz ve doğrudan güneşten uzak durulur.'],
            ['q' => 'Microblading ile kaş laminasyonu arasındaki fark nedir?', 'a' => 'Microblading pigmentle kıl kıl çizgi işler ve 12–18 ay kalır. Kaş laminasyonu pigment kullanmaz; kendi kıllarınızı yukarı doğru sabitleyerek yaklaşık 6 hafta süren dolgun bir görünüm verir. Boşluklu ve seyrek kaşta microblading, gür ama dağınık kaşta laminasyon tercih edilir.'],
            ['q' => 'İşlem acıtır mı?', 'a' => 'Uygulamadan önce anestezik krem sürülür; çoğu kişi yalnızca hafif bir kaşınma hisseder.'],
            ['q' => 'Kimler microblading yaptıramaz?', 'a' => 'Hamileler, emzirenler, kan sulandırıcı kullananlar ve bazı cilt hastalığı olanlar uygun değildir; ön görüşmede değerlendirilir.'],
            ['q' => "Ankara'da microblading nerede yaptırılır?", 'a' => "Stria Studio Ankara Çankaya'da hizmet verir. Uygulamadan önce ön görüşmede yüz analizi ve kaş ölçümü yapılır, tasarım onayınızla başlanır. Güncel fiyat ve randevu için WhatsApp'tan yazabilirsiniz."],
        ],

        'kas-pudralama' => [
            ['q' => 'Kaş pudralama nedir?', 'a' => 'Kaş pudralama (powder brows), noktalama tekniğiyle pigment uygulanarak kaşlara pudra makyajı etkisi veren yarı kalıcı bir işlemdir. Kıl çizgisi yerine yumuşak ve dolgun bir gölge bırakır; yağlı ile karma ciltlerde microblading’e göre daha uzun ömürlüdür.'],
            ['q' => 'Kaş pudralama kaç günde iyileşir?', 'a' => 'Yüzeysel iyileşme 7–10 günde tamamlanır, kabuklar bu dönemde kendiliğinden dökülür. Rengin oturması ve gerçek sonucun görülmesi yaklaşık 4 hafta sürer; pigment ilk oturumda %30–40 açılır, bu beklenen bir durumdur.'],
            ['q' => 'Kaş pudralama sonrası bakım nasıl yapılır?', 'a' => 'İlk 7–10 gün kaşları kuru tutun, verilen kremi ince bir tabaka hâlinde uygulayın ve kabukları kurcalamayın. Bu süre boyunca sauna, hamam, havuz, deniz ve doğrudan güneşten uzak durun; kaş bölgesine makyaj ürünü sürmeyin, yüzüstü yatmaktan kaçının.'],
            ['q' => 'Kaş pudralama sonrası kaç gün sonra banyo yapılır?', 'a' => 'Duş almak için gün saymanız gerekmez; kritik olan yalnızca kaş bölgesidir. İlk 7–10 gün kaşlarınızı doğrudan suya tutmayın, uzun ve buharlı sıcak duşlardan kaçının, yüzünüzü yıkarken kaş çevresinden dolaşın. Havuz ve denize giriş için 14 gün beklenir.'],
            ['q' => 'Kaş pudralamada nelere dikkat edilmeli?', 'a' => 'Uygulamadan önceki 24 saat kafein ve alkol alınmaz, kan sulandırıcı ilaçlar doktor onayıyla planlanır, kaş bölgesine peeling ve retinol uygulanmaz. Uygulamadan sonra ilk 10 gündeki ıslatmama, kurcalamama ve güneşten koruma kuralı sonucun kalitesini belirler.'],
            ['q' => 'Kaş pudralama ne kadar kalıcı?', 'a' => 'Ortalama 1,5–2 yıl kalıcıdır; yağlı ciltte biraz daha kısa sürebilir.'],
            ['q' => "Microblading'den farkı nedir?", 'a' => 'Microblading kıl kıl çizgiler yapar; pudralama pudra makyajı gibi dolgun bir gölge bırakır. Yağlı ciltlerde pudralama daha iyi tutar.'],
            ['q' => 'İşlem sonrası kaşlar çok koyu mu olur?', 'a' => 'İlk günlerde renk koyu görünür, 7–10 günde gerçek tonuna açılır.'],
        ],

        'eyeliner' => [
            ['q' => 'Kalıcı eyeliner ne kadar süre kalır?', 'a' => 'Kalıcı eyeliner genellikle 1–3 yıl içinde kademeli olarak açılır. Cildin yenilenme hızı ve yağ dengesi, pigment tonu, çizginin kalınlığı, güneş maruziyeti ve göz çevresinde kullanılan aktif bakım ürünleri bu süreyi değiştirir; ince uygulamalar daha erken açılır. Kaç yıl kalacağı kişiye göre değiştiği için garanti bir süre verilmez.'],
            ['q' => 'Kalıcı eyeliner sonrası iyileşme ne kadar sürer?', 'a' => 'Hafif şişlik ilk 24–48 saatte geçer, yüzeysel iyileşme 7–10 gün sürer. İlk günlerde çizgi olduğundan kalın ve koyu görünür; renk 4 hafta içinde gerçek tonuna oturur.'],
            ['q' => 'Kalıcı eyeliner ile dipliner arasındaki fark nedir?', 'a' => 'Kalıcı eyeliner kirpik hattının üzerinde görünür bir çizgi oluşturur. Dipliner ise yalnızca kirpik diplerine uygulanır, çizgi yapmaz; kirpikleri daha sık gösterir ve makyaj yapılmamış gibi durur. İkisi de aynı pigment tekniğiyle uygulanır ve genellikle 1–3 yıl kalıcıdır.'],
            ['q' => 'Kalıcı eyeliner yaptırdım, pişmanım — ne yapabilirim?', 'a' => 'İlk 7–10 gün çizgi olduğundan kalın ve koyu görünür; iyileşince incelir ve açılır, bu yüzden nihai sonucu 4. haftadan önce değerlendirmeyin. Şekil veya ton yine de rahatsız ediyorsa rötuşla form düzeltme, açık tonla yumuşatma ya da lazerle silme seçenekleri ön görüşmede konuşulur.'],
            ['q' => 'Lens kullanıyorum, sorun olur mu?', 'a' => 'İşlem sırasında lensler çıkarılır; iyileşene kadar birkaç gün gözlük önerilir.'],
            ['q' => 'Doğal görünür mü?', 'a' => 'İsteğe göre kirpik dibinde ince ve doğal ya da belirgin çizgi yapılabilir.'],
        ],

        'dipliner' => [
            ['q' => 'Dipliner nedir, ne demek?', 'a' => 'Dipliner (kirpik dibi renklendirme), kirpik köklerinin arasına ince ince pigment uygulanan yarı kalıcı bir göz uygulamasıdır. Görünür bir eyeliner çizgisi oluşturmaz; kirpik dibindeki boşlukları doldurarak kirpikleri daha sık ve gür gösterir. Halk arasında "kirpik dibi makyaj" olarak da bilinir.'],
            ['q' => 'Dipliner ve eyeliner arasındaki fark nedir?', 'a' => 'Dipliner kirpik diplerinde kalır ve makyaj yapılmamış gibi doğal durur; eyeliner kirpik hattının üzerinde görünür bir çizgi çizer. Belirginlik dışında ikisi de aynı pigment tekniğiyle uygulanır ve genellikle 1–3 yıl kalıcıdır. Doğal bir yoğunluk isteyen dipliner, tanımlı bir hat isteyen eyeliner tercih eder.'],
            ['q' => 'Kalıcı dipliner ne kadar kalır?', 'a' => 'Genellikle 1–3 yıl kalıcıdır. İnce bir uygulama olduğu için zamanla keskin bir sınır bırakmadan doğal biçimde açılır; kirpik dibindeki yoğunluk azaldığında rötuşla tazelenir.'],
            ['q' => 'Kalıcı dipliner zararlı mı?', 'a' => 'Steril ve tek kullanımlık iğneyle, sertifikalı pigmentle ve göz kapağı anatomisine hâkim bir uygulayıcı tarafından yapıldığında güvenlidir. Risk hijyen ihlali, uygunsuz pigment ve yanlış derinlikten doğar. Hamilelik, emzirme, aktif göz enfeksiyonu ve kan sulandırıcı kullanımı beklemeyi gerektirir; alerji ve göz sağlığı geçmişi ön görüşmede değerlendirilir.'],
            ['q' => 'Dipliner modelleri nelerdir?', 'a' => 'Uygulama yoğunluğa göre değişir: yalnızca kirpik köklerini dolduran en doğal ince dipliner, diplerden başlayıp yukarı doğru hafifçe yumuşayan gölgeli dipliner ve dış köşede belli belirsiz bir uzantı bırakan kedi gözü etkisi. Hangisinin uygun olduğu göz şekli ve kapak yapısına göre belirlenir.'],
            ['q' => 'Acıtır mı?', 'a' => 'Anestezik krem sayesinde çoğu kişi yalnızca hafif bir his duyar.'],
        ],

        'dudak-renklendirme' => [
            ['q' => 'Dudak renklendirme nedir, lip blush ne demek?', 'a' => 'Lip blush, dudak renklendirmenin uluslararası adıdır. Dudağın kendi tonunu canlandıran, sınırları yumuşak bırakan hafif bir pigment uygulamasıdır; ruj etkisinden çok "yıkanmış renk" görünümü verir. Solgun dudakları canlandırmak ve sınır belirsizliğini toparlamak için tercih edilir.'],
            ['q' => 'Dudak renklendirme kaç günde iyileşir?', 'a' => 'Yüzeysel iyileşme 7–10 gün sürer. İlk gün renk canlı ve dudak hafif şiş görünür; 2–3. günde yüzey kurudukça renk daha yoğun algılanır, ardından ince ince soyularak açılır. Nihai ton 4. haftada oturur.'],
            ['q' => 'Dudak renklendirme sonrası bakım nasıl yapılır?', 'a' => 'İlk 7–10 gün dudakları nemli tutun, verilen merhemi ince tabaka hâlinde sık sık uygulayın ve soyulan derileri çekmeyin. Asitli, tuzlu ve çok sıcak yiyeceklerden kaçının, içeceklerinizi pipetle için, bu dönemde ruj sürmeyin. Sauna ve buhardan uzak durun; havuz ile denize giriş için 21 gün beklenir.'],
            ['q' => 'Dudak renklendirme dudağı şişirir mi?', 'a' => 'Dolgu değildir; renk ve tanım verir. Hafif dolgunluk hissi görsel etkiden gelir.'],
            ['q' => 'Dudak renklendirme ne kadar kalıcı?', 'a' => '1–2 yıl kalıcıdır; renk zamanla doğal şekilde açılır.'],
            ['q' => 'Uçuk geçmişim var, yaptırabilir miyim?', 'a' => 'İşlem uçuğu tetikleyebilir; öncesinde doktor önerisiyle koruyucu tedavi gerekir.'],
        ],

        'kas-laminasyon' => [
            ['q' => 'Kaş laminasyonu ne kadar kalıcı?', 'a' => 'Kalıcı değildir; etkisi yaklaşık 6 hafta sürer, sonra kıllar kendi doğal yönüne döner. Süre kaş kılının büyüme döngüsüne bağlı olduğu için kişiye göre birkaç hafta değişebilir.'],
            ['q' => 'Kaş laminasyonu ve microblading farkı nedir?', 'a' => 'Microblading pigmentle kalıcı kaş çizer ve 12–18 ay kalır; laminasyon kendi kıllarınızı şekillendirir, pigment ve iğne kullanılmaz, yaklaşık 6 hafta sürer. Kaşta boşluk varsa microblading, kıl yeterli ama dağınıksa laminasyon doğru seçimdir.'],
            ['q' => 'Kaşlara zarar verir mi?', 'a' => 'Doğru sürede ve besleyici bakımla uygulandığında zarar vermez. Kullandığımız My Lamination ürünleri vegan olup toksin, paraben ve sülfat içermez; formül kılı şekillendirirken vitamin ve mineral desteğiyle besler.'],
            ['q' => 'Kaş laminasyonunda hangi ürünleri kullanıyorsunuz?', 'a' => 'Uygulamada My Lamination solüsyon ve bakım ürünleri kullanılır; vegan formüllü, toksin, paraben ve sülfat içermeyen bu ürünler kılı şekillendirirken vitamin ve mineralle besler.'],
            ['q' => 'Kaş laminasyonunu kim uyguluyor?', 'a' => 'Uygulamayı Stria Studio kurucusu Nilsu Kamişli yapar; My Lamination workshopunu tamamlamış sertifikalı bir uygulayıcıdır.'],
            ['q' => 'My Lamination ürünleri neden tercih ediliyor?', 'a' => 'Vegan ve hayvan deneysiz formülleri toksin, paraben ile sülfat içermez; kılı şekillendirirken vitamin ve mineral desteğiyle besler, bu sayede işlem sonrası kuruluk ve kırılma riski azalır.'],
        ],

        'kirpik-lifting' => [
            ['q' => 'Kirpik lifting nedir?', 'a' => 'Kirpik lifting, kendi kirpiklerinizi kökten uca kıvırıp yukarı doğru sabitleyen bir uygulamadır. Takma kirpik veya kaynak kullanılmaz; kirpikler silikon kalıp üzerinde şekillendirilir, istenirse boyayla renk koyulaştırılır. Kirpik laminasyonu ve kirpik perması da aynı işlemin farklı adlarıdır.'],
            ['q' => 'Kirpik lifting ne kadar kalıcı?', 'a' => 'Kirpik büyüme döngüsüne göre 6–8 hafta kalıcıdır. Kirpikler yenilendikçe etki kendiliğinden azalır; sökme veya düzeltme işlemi gerekmez.'],
            ['q' => 'Kirpik lifting zararlı mı, kirpikleri döker mi?', 'a' => 'Doğru sürede ve besleyici solüsyonla uygulandığında kirpik dökülmesine yol açmaz. Dökülme riski, solüsyonun kalıpta gereğinden uzun bekletilmesinden ve ara vermeden tekrarlanan uygulamalardan doğar; bu nedenle seanslar arasında en az 6 hafta bırakılır. Kullandığımız My Lamination solüsyonları vitamin ve mineral desteği içerir; toksin, paraben ve sülfat içermez.'],
            ['q' => 'Kirpik lifting alerji yapar mı?', 'a' => 'Solüsyona ya da boyaya karşı nadiren hassasiyet gelişebilir. Alerji öyküsü olanlarda uygulamadan 24–48 saat önce kol içine test yapılır; işlem sırasında ürün silikon kalıpla izole edilir ve göz içine temas etmez. Gözde kaşıntı, kızarıklık veya şişlik varsa uygulama yapılmaz.'],
            ['q' => 'Kirpik lifting sonrası nelere dikkat edilmeli, yüz nasıl yıkanır?', 'a' => 'İlk 24–48 saat en kritik dönemdir: kirpikleri su, buhar ve sürtünmeden koruyun. Bu sürede yüzünüzü göz çevresinden kaçınarak yıkayın, duşta yüzünüzü sudan uzak tutun, sauna ve hamama girmeyin, yüzüstü yatmayın, maskara ile makyaj temizleyici kullanmayın. İki günün sonunda normal rutininize dönebilirsiniz; günde iki kez kirpik serumu sonucu uzatır.'],
            ['q' => 'Kirpik lifting mi ipek kirpik mi?', 'a' => 'Kirpik lifting kendi kirpiğinizi kıvırır, günlük bakım istemez ve 6–8 haftada kendiliğinden düzelir. İpek kirpik tel tel kaynak yapar, daha dramatik uzunluk verir ama 2–3 haftada bir dolum gerektirir ve kendi kirpiğinize yük bindirir. Kirpiği yeterince uzun ama düz olanlar için lifting, uzunluk ve hacim isteyenler için ipek kirpik uygundur.'],
            ['q' => 'Kirpik liftingde hangi ürünleri kullanıyorsunuz?', 'a' => 'Uygulamada My Lamination solüsyon ve bakım ürünleri kullanılır; vegan formüllü, toksin, paraben ve sülfat içermeyen bu ürünler kirpiği şekillendirirken vitamin ve mineralle besler.'],
            ['q' => 'Kirpik liftingi kim uyguluyor?', 'a' => 'Uygulamayı Stria Studio kurucusu Nilsu Kamişli yapar; My Lamination workshopunu tamamlamış sertifikalı bir uygulayıcıdır.'],
            ['q' => 'Kirpik lifting ile kirpik laminasyonu aynı şey mi?', 'a' => 'Evet, aynı uygulamanın iki adıdır. Kirpik laminasyonu adı, işlemin besleyici bakım adımını vurgulamak için kullanılır.'],
        ],

        'kas-tasarimi' => [
            ['q' => 'Yüz şekline göre kaş modeli nasıl seçilir?', 'a' => 'Kaş modeli yüz formuna göre belirlenir: yuvarlak yüzde kavis belirginleştirilerek yüz uzatılır, kare yüzde yumuşak kavis sert hatları dengeler, uzun yüzde daha düz ve yatay bir kaş yüzü kısaltır, kalp yüzde ince kavisli kaş çene hattını dengeler; oval yüz çoğu modele uyum sağlar. Ölçüm göz iç köşesi, burun kanadı ve dış köşe hizası referans alınarak yapılır.'],
            ['q' => 'Kaş şekilleri nelerdir?', 'a' => 'En sık kullanılan kaş şekilleri düz (yatay) kaş, yumuşak kavisli kaş, keskin kavisli (açılı) kaş, yuvarlak kaş ve yükselen kaştır. Her biri bakışın ifadesini değiştirir: keskin kavis daha iddialı, düz kaş daha genç ve doğal bir ifade verir. Doğru şekil moda akımına göre değil, yüz oranlarınıza göre seçilir.'],
            ['q' => 'Seyrek kaşlar nasıl şekillendirilir?', 'a' => 'Önce mevcut kıl yönü ve boşluklar haritalanır. Boşluk azsa kaş tasarımı ve laminasyonla dolgunluk kazandırılır; kalıcı çözüm gerekiyorsa microblading veya kaş pudralama ile boşluklar doldurulur. Kıl kaybının nedeni — tiroit, ilaç kullanımı veya yıllarca aşırı alma — uygulamadan önce mutlaka sorulur.'],
            ['q' => 'Kaş tasarımı acıtır mı?', 'a' => 'İşlem sırasında hafif bir batma hissi olabilir; anestezik krem kullanıldığı için çoğu kişi rahatsızlık duymaz.'],
            ['q' => 'Kaş tasarımı ne kadar kalıcı?', 'a' => 'Kalıcı kaş tasarımı 12–18 ay kalır; kıl alma ve şekillendirme ise kıllar uzadıkça 3–4 haftada bir tekrarlanır.'],
            ['q' => 'Rötuş fiyata dahil mi?', 'a' => "4–6 hafta içindeki ilk rötuş uygulamaya dahildir. Güncel fiyat bilgisi için WhatsApp'tan yazabilirsiniz."],
        ],

        'altin-oran-kas-alim' => [
            ['q' => 'Altın oran kaş tasarımı nedir?', 'a' => 'Altın oran kaş tasarımı, kaşın başlangıç, kavis ve bitiş noktalarının yüz oranlarına göre altın oran referans alınarak belirlenmesidir. Kaş, moda bir şablona değil sizin göz aralığınıza, burun kanadınıza ve yüz uzunluğunuza göre konumlandırılır; sonuç simetrik ve yüze doğal biçimde oturan bir formdur.'],
            ['q' => 'Altın oran kaş alım kalıcı makyaj mıdır?', 'a' => 'Hayır. Bu uygulamada pigment uygulanmaz ve iğne kullanılmaz; yalnızca mevcut kaş kıllarınız iplik ve cımbızla şekillendirilir. Kalıcı bir renk bırakmaz.'],
            ['q' => 'Microblading veya kaş tasarımından farkı nedir?', 'a' => 'Microblading ve kalıcı kaş tasarımı pigmentle çizilen, 12-18 ay kalan işlemlerdir. Altın oran kaş alım ise kalıcı değildir; sadece mevcut kaşınızı şekillendirir ve kıllar uzadıkça tekrar gerekir.'],
            ['q' => 'Altın oran ölçümü nedir?', 'a' => 'Yüz hatlarınız ve kaş oranlarınız altın oran referans alınarak ölçülür; kaşın başlangıç, kavis ve bitiş noktaları yüzünüze en uyumlu şekilde belirlenir.'],
            ['q' => 'Ne sıklıkla tekrarlanmalı?', 'a' => 'Kıllar yeniden uzadıkça şekil bozulur; genellikle 3-4 haftada bir tekrar önerilir.'],
            ['q' => 'Uygulama acıtır mı?', 'a' => 'İplik ve cımbız sırasında kısa süreli hafif bir his olabilir; işlem yaklaşık 30 dakika sürer ve his genelde hemen geçer.'],
        ],
    ];

    public function run(): void
    {
        foreach (self::FAQ as $slug => $faq) {
            $service = Service::where('slug', $slug)->first();

            if ($service === null) {
                $this->command?->warn("Hizmet bulunamadı, atlandı: {$slug}");

                continue;
            }

            $service->faq_tr = $faq;
            $service->save();
        }
    }
}
