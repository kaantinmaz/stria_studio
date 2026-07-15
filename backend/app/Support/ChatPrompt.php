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
- Kısa, samimi ve net Türkçe cevaplar (2-5 cümle). Emin olmadığında iletişim sayfasına yönlendir.
- Cevaplarını DÜZ METİN yaz: markdown başlığı, yıldızlı kalın/italik işareti veya madde imi KULLANMA. En fazla 1-2 emoji.

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
                ->get(['name_tr', 'desc_tr', 'intro_tr'])
                ->map(function (Service $service): string {
                    $description = $this->shorten($service->desc_tr);
                    $introduction = $this->shorten($service->intro_tr);

                    return "- {$service->name_tr}: {$description} Tanıtım: {$introduction}";
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
