<?php

namespace App\Console\Commands;

use App\Models\Post;
use App\Support\IndexNow;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Bir blog yazısına kapak görseli bağlar. Görsel yerel bir dosyadan (--file)
 * ya da uzak bir URL'den (--url) alınır, `storage/app/public/covers` altına
 * `AdminPostController::downloadCover()` ile aynı adlandırmayla yazılır ve
 * yazının `cover_path` alanı güncellenir.
 */
class SetPostCover extends Command
{
    protected $signature = 'content:cover {slug : Yazının slug\'ı}
        {--file= : Yerel görsel dosyası yolu}
        {--url= : Uzak görsel URL\'si}';

    protected $description = 'Blog yazısına kapak görseli bağlar (yerel dosya veya URL)';

    private const MAX_BYTES = 5 * 1024 * 1024;

    public function handle(): int
    {
        $slug = (string) $this->argument('slug');
        $file = $this->option('file');
        $url = $this->option('url');

        if (($file === null) === ($url === null)) {
            $this->error('--file veya --url seçeneklerinden tam olarak birini verin.');

            return self::FAILURE;
        }

        $post = Post::whereNull('site')->where('slug', $slug)->first();

        if ($post === null) {
            $this->error("Ana sitede '{$slug}' slug'lı yazı bulunamadı.");

            return self::FAILURE;
        }

        $contents = $file !== null ? $this->readFile($file) : $this->fetchUrl($url);

        if ($contents === null) {
            return self::FAILURE;
        }

        if (strlen($contents) > self::MAX_BYTES) {
            $this->error('Görsel 5 MB sınırını aşıyor ('.round(strlen($contents) / 1048576, 2).' MB).');

            return self::FAILURE;
        }

        $extension = $this->extension($contents);

        if ($extension === null) {
            $this->error('Görsel JPG, PNG veya WebP olmalı.');

            return self::FAILURE;
        }

        $path = 'covers/'.$slug.'-'.now()->timestamp.'.'.$extension;

        try {
            if (! Storage::disk('public')->put($path, $contents)) {
                throw new \RuntimeException;
            }
        } catch (Throwable $exception) {
            $this->error('Görsel kaydedilemedi: '.$exception->getMessage());

            return self::FAILURE;
        }

        $previous = $post->cover_path;
        $post->cover_path = $path;
        $post->save();

        // Eski kapak artık hiçbir yazıda kullanılmıyorsa diskten silinir.
        if ($previous !== null && $previous !== $path && ! Post::where('cover_path', $previous)->exists()) {
            Storage::disk('public')->delete($previous);
            $this->line('Eski kapak silindi: '.$previous);
        }

        $this->info('Kapak bağlandı: '.Storage::disk('public')->url($path));

        if ($post->is_published) {
            IndexNow::submit(['https://'.config('services.indexnow.host').'/blog/'.$post->slug]);
            $this->line('IndexNow: '.(config('services.indexnow.key') ? 'ping gönderildi.' : 'atlandı — INDEXNOW_KEY yok.'));
        }

        $this->line('Not: Next.js ISR penceresi 300 sn.');

        return self::SUCCESS;
    }

    private function readFile(string $file): ?string
    {
        $path = is_file($file) ? $file : base_path($file);

        if (! is_file($path) || ! is_readable($path)) {
            $this->error("Dosya okunamadı: {$file}");

            return null;
        }

        return (string) file_get_contents($path);
    }

    private function fetchUrl(string $url): ?string
    {
        try {
            $response = Http::timeout(60)->get($url);
        } catch (Throwable $exception) {
            $this->error('Görsel indirilemedi: '.$exception->getMessage());

            return null;
        }

        if (! $response->successful()) {
            $this->error('Görsel indirilemedi, HTTP '.$response->status());

            return null;
        }

        return $response->body();
    }

    /**
     * Uzantı Content-Type'a değil gerçek imza baytlarına göre belirlenir; üretim
     * servisleri sık sık application/octet-stream döndürüyor.
     */
    private function extension(string $contents): ?string
    {
        $info = @getimagesizefromstring($contents);

        return match ($info['mime'] ?? null) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            default => null,
        };
    }
}
