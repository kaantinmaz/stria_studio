<?php

namespace App\Support;

use App\Models\Post;
use App\Models\Service;
use Illuminate\Support\Str;

/**
 * Ana sitenin yayınlanmış blog yazılarını ve aktif hizmetlerini, promptlara
 * enjekte edilebilecek ve link doğrulamasında kullanılabilecek hâle getirir.
 * Bu komutlar tek atımlıktır; önbellek tutulmaz.
 */
final class ContentInventory
{
    /**
     * @return list<array{slug:string,title:string,excerpt:string,url:string}>
     */
    public function posts(): array
    {
        return Post::published()
            ->whereNull('site')
            ->orderByDesc('published_at')
            ->get(['slug', 'title_tr', 'excerpt_tr'])
            ->map(fn (Post $post): array => [
                'slug' => (string) $post->slug,
                'title' => (string) $post->title_tr,
                'excerpt' => (string) Str::limit((string) $post->excerpt_tr, 160),
                'url' => '/blog/'.$post->slug,
            ])
            ->all();
    }

    /**
     * @return list<array{slug:string,name:string,desc:string,url:string,subservices:list<array{slug:string,name:string,url:string}>}>
     */
    public function services(): array
    {
        return Service::active()
            ->get(['slug', 'name_tr', 'desc_tr', 'subservices_tr'])
            ->map(function (Service $service): array {
                $subservices = [];

                foreach ((array) ($service->subservices_tr ?? []) as $sub) {
                    if (! is_array($sub) || empty($sub['slug'])) {
                        continue;
                    }

                    $subservices[] = [
                        'slug' => (string) $sub['slug'],
                        'name' => (string) ($sub['name'] ?? $sub['slug']),
                        'url' => '/hizmetler/'.$service->slug.'/'.$sub['slug'],
                    ];
                }

                return [
                    'slug' => (string) $service->slug,
                    'name' => (string) $service->name_tr,
                    'desc' => (string) $service->desc_tr,
                    'url' => '/hizmetler/'.$service->slug,
                    'subservices' => $subservices,
                ];
            })
            ->all();
    }

    /**
     * Linklenebilir tüm iç yollar: statik sayfalar, yazılar, hizmetler ve alt hizmetler.
     *
     * @return list<string>
     */
    public function allowedUrls(): array
    {
        $urls = (array) config('content.post.static_links', []);

        foreach ($this->posts() as $post) {
            $urls[] = $post['url'];
        }

        foreach ($this->services() as $service) {
            $urls[] = $service['url'];

            foreach ($service['subservices'] as $sub) {
                $urls[] = $sub['url'];
            }
        }

        return array_values(array_unique($urls));
    }

    /**
     * Prompt'a gömmek için her hizmet ve yazıyı URL'siyle listeleyen Markdown bloğu.
     */
    public function promptMarkdown(): string
    {
        $lines = ['### Hizmet sayfaları'];

        foreach ($this->services() as $service) {
            $lines[] = sprintf('- %s — %s — %s', $service['url'], $service['name'], $this->short($service['desc']));

            foreach ($service['subservices'] as $sub) {
                $lines[] = sprintf('- %s — %s (%s alt hizmeti)', $sub['url'], $sub['name'], $service['name']);
            }
        }

        $lines[] = '';
        $lines[] = '### Mevcut blog yazıları';

        $posts = $this->posts();

        if ($posts === []) {
            $lines[] = '- (henüz yayınlanmış yazı yok)';
        }

        foreach ($posts as $post) {
            $lines[] = sprintf('- %s — %s — %s', $post['url'], $post['title'], $this->short($post['excerpt']));
        }

        return implode("\n", $lines);
    }

    private function short(string $text): string
    {
        return Str::limit(trim(preg_replace('/\s+/', ' ', $text) ?? $text), 120);
    }
}
