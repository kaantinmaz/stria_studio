<?php

namespace App\Console\Commands;

use App\Models\InstagramPost;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

/**
 * Instagram Graph API üzerinden Business/Creator hesabının son gönderilerini
 * çeker, instagram_posts tablosuna yazar ve görselleri public disk'e indirir.
 *
 * Access token ve kullanıcı kimliği Meta uygulamasından alınır: Instagram'a
 * bağlı bir Business/Creator hesabı ve o hesap için üretilmiş uzun ömürlü bir
 * access token gerekir (INSTAGRAM_ACCESS_TOKEN / INSTAGRAM_USER_ID). Token veya
 * kullanıcı kimliği yoksa komut sessizce geçmek yerine açıklayıcı hatayla döner.
 *
 * Görseller neden yerel indiriliyor: Instagram CDN URL'leri imzalı ve süreli;
 * kısa süre sonra 403 verirler. Kalıcı gösterim için görseli bir kez indirip
 * public disk'te saklarız ve API'den kendi mutlak URL'imizle servis ederiz.
 */
class SyncInstagramPosts extends Command
{
    protected $signature = 'instagram:sync';

    protected $description = 'Instagram Graph API gönderilerini instagram_posts tablosuna senkronlar ve görselleri indirir';

    public function handle(): int
    {
        $token = config('services.instagram.token');
        $userId = config('services.instagram.user_id');

        if (blank($token) || blank($userId)) {
            $this->warn('INSTAGRAM_ACCESS_TOKEN veya INSTAGRAM_USER_ID tanımlı değil. .env dosyasına Meta uygulamanızın uzun ömürlü access token ve IG kullanıcı kimliğini ekleyin.');

            return Command::FAILURE;
        }

        $limit = (int) config('services.instagram.limit', 12);

        try {
            $response = Http::timeout(15)->get("https://graph.instagram.com/v23.0/{$userId}/media", [
                'fields' => 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
                'limit' => $limit,
                'access_token' => $token,
            ]);
        } catch (\Throwable $e) {
            $this->error('Instagram Graph API isteği başarısız: '.$e->getMessage());

            return Command::FAILURE;
        }

        if ($response->failed()) {
            $this->error('Instagram Graph API hatası (HTTP '.$response->status().'): '.$response->body());

            return Command::FAILURE;
        }

        $items = $response->json('data') ?? [];

        $seen = [];
        $synced = 0;

        foreach ($items as $item) {
            $igId = $item['id'] ?? null;
            if (blank($igId)) {
                continue;
            }

            $mediaType = $item['media_type'] ?? 'IMAGE';
            $sourceUrl = $mediaType === 'VIDEO' ? ($item['thumbnail_url'] ?? null) : ($item['media_url'] ?? null);

            if (blank($sourceUrl)) {
                $this->warn("Gönderi {$igId} için görsel kaynağı yok, atlanıyor.");

                continue;
            }

            $path = "instagram/{$igId}.jpg";
            $existing = InstagramPost::where('ig_id', $igId)->first();

            // Zaten indirdiğimiz ve dosyası duran görseli tekrar indirmeyiz.
            if (! ($existing && filled($existing->image) && Storage::disk('public')->exists($path))) {
                try {
                    $imageResponse = Http::timeout(20)->get($sourceUrl);
                } catch (\Throwable $e) {
                    $this->warn("Gönderi {$igId} görseli indirilemedi ({$e->getMessage()}), atlanıyor.");

                    continue;
                }

                if ($imageResponse->failed()) {
                    $this->warn("Gönderi {$igId} görseli indirilemedi (HTTP {$imageResponse->status()}), atlanıyor.");

                    continue;
                }

                Storage::disk('public')->put($path, $imageResponse->body());
            }

            InstagramPost::updateOrCreate(['ig_id' => $igId], [
                'permalink' => $item['permalink'] ?? '',
                'media_type' => $mediaType,
                'caption' => $item['caption'] ?? null,
                'image' => $path,
                // Graph timestamp'i UTC offset'iyle gelir (…+0000). Kolon
                // offset taşımadığı için uygulama saat dilimine çevrilmeden
                // yazılırsa okurken +03:00 varsayılıp an 3 saat kayar.
                // Beklenmedik şekilde hiç gelmezse (NOT NULL) şimdiki zaman.
                'posted_at' => filled($item['timestamp'] ?? null)
                    ? Carbon::parse($item['timestamp'])->timezone(config('app.timezone'))
                    : now(),
            ]);

            $seen[] = $igId;
            $synced++;
        }

        // Feed'de artık görünmeyen (Instagram'dan kaldırılmış) gönderileri sitede
        // bırakmayız: görsellerini ve satırlarını temizleriz. Boş listeyle silme
        // yapmayız - API kısmi/boş dönmüşse tüm kayıtları uçurmamak için.
        $deleted = 0;
        if (! empty($seen)) {
            foreach (InstagramPost::whereNotIn('ig_id', $seen)->get() as $stale) {
                if (filled($stale->image)) {
                    Storage::disk('public')->delete($stale->image);
                }
                $stale->delete();
                $deleted++;
            }
        }

        $this->info("Instagram senkronu tamam: {$synced} kayıt güncellendi, {$deleted} kayıt silindi.");

        return Command::SUCCESS;
    }
}
