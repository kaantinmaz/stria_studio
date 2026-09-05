<?php

namespace App\Support;

/**
 * Bir arama sorgusunun mevcut içerikle ne kadar örtüştüğünü tamamen kural
 * tabanlı (yapay zekâsız, deterministik) olarak sınıflandırır. Hizmet sayfası
 * eşleşmesi blog yazısı eşleşmesini her zaman ezer: hizmet niyeti taşıyan bir
 * sorgu için yeni yazı önermek yerine ilgili hizmet sayfasına yönlendiririz.
 */
final class QueryCoverage
{
    /**
     * Anlamsal ağırlığı olmayan durak sözcükler ve genel konum ekleri. Sorgu
     * örtüşmesini bunlar bozmasın diye token kümesinden düşülür.
     *
     * @var list<string>
     */
    private const STOPWORDS = [
        'ankara', 'cankaya', 'nedir', 'nasil', 'mi', 'mu', 'ne', 'kadar',
        've', 'ile', 'icin', 'arasindaki', 'fark', 'kac', 'gunde', 'sonrasi',
        'stria', 'studio',
    ];

    /**
     * Bilgi amaçlı niyet işaretleri. Bunlardan biri sorguda geçiyorsa sorgu
     * blog niyetlidir: hizmet adını içerse bile ("kaş pudralama sonrası
     * bakım") hedefi hizmet sayfası değil, bir yazıdır.
     *
     * @var list<string>
     */
    private const INFORMATIONAL = [
        'nedir', 'nasil', 'kac', 'gunde', 'gun', 'sure', 'sureci', 'surer',
        'sonrasi', 'sonrasinda', 'oncesi', 'bakim', 'iyilesme', 'iyilesir',
        'fark', 'farki', 'arasindaki', 'mi', 'mu', 'zararli', 'zararlari',
        'kalir', 'kalicligi', 'yil', 'sekilleri', 'tipine', 'kabuklanma',
        'degmemeli', 'dikkat', 'silinir', 'ne', 'onerileri',
    ];

    public function __construct(private ContentInventory $inventory) {}

    /**
     * @return array{status:'covered'|'service'|'new', target:?string, score:float}
     */
    public function classify(string $query): array
    {
        $normalized = self::normalize($query);
        $tokens = $this->meaningfulTokens($normalized);
        $markers = $this->markers($normalized);

        // Marka/gezinme sorgusu ("stria studio"): anlamlı token kalmaz. Bunu
        // ana sayfa karşılar; blog yazısı üretilmemeli.
        if ($tokens === []) {
            return ['status' => 'covered', 'target' => '/', 'score' => 1.0];
        }

        // Bilgi niyetli sorgular hizmet adını içerse bile yazı ister.
        if ($markers === []) {
            foreach ($this->inventory->services() as $service) {
                $needle = self::normalize($service['name']);
                if ($needle !== '' && str_contains($normalized, $needle)) {
                    return ['status' => 'service', 'target' => $service['url'], 'score' => 1.0];
                }

                foreach ($service['subservices'] as $sub) {
                    $subNeedle = self::normalize($sub['name']);
                    if ($subNeedle !== '' && str_contains($normalized, $subNeedle)) {
                        return ['status' => 'service', 'target' => $sub['url'], 'score' => 1.0];
                    }
                }
            }
        }

        $best = 0.0;
        $bestUrl = null;
        $bestMatched = 0;

        if ($tokens !== []) {
            $total = count($tokens);

            foreach ($this->inventory->posts() as $post) {
                $title = self::normalize($post['title']);

                // Bilgi niyetli sorgu, aynı niyeti taşımayan bir yazıyla
                // kapatılmış sayılmaz: "nedir" sorgusunu "kaç yıl kalıcı"
                // yazısı karşılamaz.
                if ($markers !== [] && ! $this->sharesMarker($markers, $title)) {
                    continue;
                }

                $haystack = $this->meaningfulTokens(
                    $title.' '.self::normalize($post['excerpt'])
                );

                $matched = 0;
                foreach ($tokens as $token) {
                    if (in_array($token, $haystack, true)) {
                        $matched++;
                    }
                }

                $ratio = $matched / $total;
                if ($ratio > $best) {
                    $best = $ratio;
                    $bestUrl = $post['url'];
                    $bestMatched = $matched;
                }
            }
        }

        // Tesadüfi tek token örtüşmesi fırsatı gizlemesin; ama sorgunun kendisi
        // tek anlamlı token'dan oluşuyorsa ("dipliner nedir" → [dipliner]) o tek
        // token yeterlidir, aksi halde böyle sorgular asla kapsanmış sayılmaz ve
        // her gün yeni bir "nedir" sayfası açılırdı.
        $needed = min(2, count($tokens));
        if ($best >= 0.7 && $bestMatched >= $needed && $needed > 0) {
            return ['status' => 'covered', 'target' => $bestUrl, 'score' => $best];
        }

        return ['status' => 'new', 'target' => null, 'score' => $best];
    }

    /**
     * Sorgunun anlamlı token'larının TAMAMINI başlığında taşıyan yayınlanmış
     * yazılar. `classify()` niyet işaretine bakar ("nedir" sorgusunu "kaç yıl
     * kalıcı" yazısı karşılamaz); burada ise varlık kümesi tam örtüşüyorsa
     * ("kaş pudralama + microblading") farklı soru kalıbı kullanılmış olsa da
     * aynı niyeti hedefleyen bir sayfa vardır: yeni sayfa açmak yamyamlıktır.
     *
     * @return list<array{slug:string,title:string,url:string}>
     */
    public function sameIntentPosts(string $query): array
    {
        // En az 3 anlamlı token: iki varlık/nitelik birlikte örtüşmeli. Aksi
        // halde "kaş pudralama nedir" gibi tek varlıklı sorgular, aynı varlığı
        // başka niyetle işleyen her yazıya takılırdı.
        $tokens = $this->meaningfulTokens(self::normalize($query));
        if (count($tokens) < 3) {
            return [];
        }

        $matches = [];
        foreach ($this->inventory->posts() as $post) {
            $titleTokens = explode(' ', self::normalize($post['title']));

            foreach ($tokens as $token) {
                if (! in_array($token, $titleTokens, true)) {
                    continue 2;
                }
            }

            $matches[] = [
                'slug' => $post['slug'],
                'title' => $post['title'],
                'url' => $post['url'],
            ];
        }

        return $matches;
    }

    /**
     * Küçük harfe indirger, Türkçe aksanları katlar, harf/rakam dışındaki her
     * kesintiyi tek boşluğa indirger ve kırpar.
     */
    public static function normalize(string $text): string
    {
        $folded = strtr($text, [
            'ç' => 'c', 'Ç' => 'c',
            'ğ' => 'g', 'Ğ' => 'g',
            'ı' => 'i', 'İ' => 'i',
            'ö' => 'o', 'Ö' => 'o',
            'ş' => 's', 'Ş' => 's',
            'ü' => 'u', 'Ü' => 'u',
        ]);

        $lowered = mb_strtolower($folded, 'UTF-8');
        $spaced = preg_replace('/[^a-z0-9]+/u', ' ', $lowered);

        return trim($spaced);
    }

    /**
     * Normalize edilmiş metni token'lara böler ve durak sözcükleri düşer.
     *
     * @return list<string>
     */
    private function meaningfulTokens(string $normalized): array
    {
        if ($normalized === '') {
            return [];
        }

        $tokens = [];
        foreach (explode(' ', $normalized) as $token) {
            if ($token === '' || in_array($token, self::STOPWORDS, true)) {
                continue;
            }
            $tokens[] = $token;
        }

        return $tokens;
    }

    /**
     * Sorgudaki bilgi amaçlı niyet işaretleri. Token bazlı bakılır; "gunes"
     * içindeki "gun" gibi yanlış eşleşmeleri önler.
     *
     * @return list<string>
     */
    private function markers(string $normalized): array
    {
        $found = [];
        foreach (explode(' ', $normalized) as $token) {
            if ($token !== '' && in_array($token, self::INFORMATIONAL, true)) {
                $found[] = $token;
            }
        }

        return array_values(array_unique($found));
    }

    /**
     * Yazı başlığı sorgunun niyet işaretlerinden en az birini taşıyor mu?
     *
     * @param  list<string>  $markers
     */
    private function sharesMarker(array $markers, string $normalizedTitle): bool
    {
        $titleTokens = explode(' ', $normalizedTitle);

        foreach ($markers as $marker) {
            if (in_array($marker, $titleTokens, true)) {
                return true;
            }
        }

        return false;
    }
}
