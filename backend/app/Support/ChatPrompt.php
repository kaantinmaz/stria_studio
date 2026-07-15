<?php

namespace App\Support;

use App\Models\Post;
use App\Models\Service;
use App\Models\Setting;
use Illuminate\Support\Str;

class ChatPrompt
{
    public function build(?string $site): string
    {
        $settings = Setting::forSite($site);
        $brand = $this->brand($site);
        $siteUrl = $site === null
            ? config('app.frontend_url')
            : config("microsites.$site.url");
        $serviceContext = $this->serviceContext($site);
        $pageMap = $this->pageMap($site, $siteUrl);
        $today = now()->format('d.m.Y');
        $phone = $this->value($settings->phone);
        $whatsapp = $this->value($settings->whatsapp);
        $address = $this->value($settings->address);
        $hours = $this->hours($settings->hours);

        return <<<PROMPT
Kimlik:
Sen {$brand} web sitesinin asistanısın.

Hizmet bağlamı:
{$serviceContext}

Site sayfa haritası (link verirken bunları kullan):
{$pageMap}

İletişim bilgileri:
- Telefon: {$phone}
- WhatsApp linki: {$whatsapp}
- Adres: {$address}
- Çalışma saatleri: {$hours}

SIKI KURALLAR:
- SADECE stüdyonun hizmetleri, randevu, bakım/iyileşme ve site içeriğiyle ilgili sorulara cevap ver; alakasız konularda kibarca reddet ve hizmetlere yönlendir.
- FİYAT SORULARINA ASLA rakam/aralık verme — hiçbir koşulda. Fiyat sorulursa kibarca "fiyat bilgisi kişiye özel değerlendirmeyle netleşir" de ve WhatsApp linkine yönlendir.
- Adres/telefon sorulursa YALNIZCA yukarıdaki kendi firma bilgilerini ver; başka firma/klinik önerme, isim verme.
- Tıbbi teşhis/tedavi önerisi verme; sağlık durumu sorularında uzmana/hekime danışılmasını söyle (site yasal uyarısıyla uyumlu).
- Kısa, samimi ve net cevaplar (2-5 cümle). Emin olmadığında iletişim sayfasına yönlendir.
- DİL: Varsayılan dilin Türkçe. Ancak kullanıcı başka bir dilde yazarsa VEYA seninle başka bir dilde (örn. İngilizce) konuşmanı isterse, o dilde akıcı şekilde cevap ver ve kullanıcı dili değiştirene kadar o dilde devam et. Tüm kurallar (fiyat yasağı, yalnız kendi firma bilgisi vb.) her dilde aynen geçerlidir.
- Kullanıcı ZATEN bu sitede geziniyor. Bir sayfaya yönlendirirken yukarıdaki sayfa haritasından İLGİLİ SAYFANIN TAM URL'sini ver; asla yalnızca ana sayfa linki verme. Örn. hizmetler sorulursa hizmetler sayfasının tam linkini ver.
- Cevaplarını HER DİLDE DÜZ METİN yaz: markdown başlığı, yıldızlı kalın/italik işareti veya madde imi ASLA kullanma (İngilizce cevaplarda da geçerli). En fazla 1-2 emoji.

Bugünün tarihi: {$today}
Site URL'si: {$siteUrl}
PROMPT;
    }

    private function brand(?string $site): string
    {
        return match ($site) {
            'mikroblading-ankara' => 'Mikroblading Ankara (bir Stria Studio markası)',
            'kas-tasarimi-ankara' => 'Kaş Tasarımı Ankara',
            default => 'Stria Studio (Ankara Çankaya kalıcı makyaj stüdyosu)',
        };
    }

    private function serviceContext(?string $site): string
    {
        if ($site === null) {
            $services = Service::active()
                ->get(['slug', 'name_tr', 'desc_tr', 'intro_tr'])
                ->map(function (Service $service): string {
                    $description = $this->shorten($service->desc_tr);
                    $introduction = $this->shorten($service->intro_tr);

                    return "- {$service->name_tr} ({$service->slug}): {$description} Tanıtım: {$introduction}";
                });

            return $services->isEmpty()
                ? '- Aktif hizmet bilgisi bulunmuyor.'
                : $services->implode("\n");
        }

        $summary = match ($site) {
            'mikroblading-ankara' => 'Mikroblading ve kıl tekniği kaş tasarımı; doğal kaş kıllarını taklit eden, kişiye özel planlanan yarı kalıcı kaş uygulamasıdır.',
            'kas-tasarimi-ankara' => 'Kıl tekniği kaş tasarımı; yüz oranları ve mevcut kaş yapısına göre kişiye özel planlanan doğal görünümlü kaş uygulamasıdır.',
        };

        $posts = Post::published()
            ->where('site', $site)
            ->orderByDesc('published_at')
            ->get(['title_tr', 'slug'])
            ->map(fn (Post $post): string => "- {$post->title_tr} (slug: {$post->slug})");

        $postList = $posts->isEmpty()
            ? '- Bu site için yayınlanmış yazı bulunmuyor.'
            : $posts->implode("\n");

        return "Hizmet özeti: {$summary}\nYayınlanmış site yazıları:\n{$postList}";
    }
    private function pageMap(?string $site, ?string $siteUrl): string
    {
        $base = rtrim((string) $siteUrl, '/');

        if ($site === null) {
            $lines = collect([
                "- Tüm hizmetler: {$base}/hizmetler",
                "- Galeri (öncesi/sonrası): {$base}/galeri",
                "- Hakkımızda: {$base}/hakkimizda",
                "- İletişim ve randevu: {$base}/iletisim",
                "- Sık sorulan sorular: {$base}/sss",
                "- Blog yazıları: {$base}/blog",
                "- Ankara'da kalıcı makyaj rehberi: {$base}/ankara-kalici-makyaj-yapan-yerler",
            ]);

            $lines = $lines->merge(Service::active()->get(['slug', 'name_tr'])->map(
                fn (Service $service): string => "- {$service->name_tr} detay sayfası: {$base}/hizmetler/{$service->slug}"
            ));

            return $lines->implode("\n");
        }

        $topic = $site === 'mikroblading-ankara'
            ? [
                "- Fiyat bilgisi sayfası: {$base}/mikroblading-fiyatlari",
                "- Nasıl yapılır: {$base}/mikroblading-nasil-yapilir",
                "- Öncesi hazırlık: {$base}/mikroblading-oncesi-hazirlik",
                "- Sonrası bakım: {$base}/mikroblading-sonrasi-bakim",
            ]
            : [
                "- Fiyat bilgisi sayfası: {$base}/kas-tasarimi-fiyatlari",
                "- Nasıl yapılır: {$base}/kas-tasarimi-nasil-yapilir",
                "- Bakım: {$base}/kas-tasarimi-bakimi",
                "- Kaş tasarımı nedir: {$base}/kas-tasarimi-nedir",
            ];

        return collect($topic)->merge([
            "- Galeri: {$base}/galeri",
            "- Hakkımızda: {$base}/hakkimizda",
            "- İletişim ve randevu: {$base}/iletisim",
            "- Sık sorulan sorular: {$base}/sss",
            "- Blog yazıları: {$base}/blog (tek yazı: {$base}/blog/<slug>)",
        ])->implode("\n");
    }

    private function shorten(?string $text): string
    {
        if (blank($text)) {
            return 'Bilgi belirtilmemiş.';
        }

        $plainText = preg_replace('/\s+/u', ' ', strip_tags($text));

        return Str::limit(trim($plainText ?? ''), 240);
    }

    private function value(?string $value): string
    {
        return filled($value) ? $value : 'Belirtilmemiş';
    }

    private function hours(?array $hours): string
    {
        if (empty($hours)) {
            return 'Belirtilmemiş';
        }

        return json_encode($hours, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
            ?: 'Belirtilmemiş';
    }
}
