<?php

namespace App\Support;

use App\Models\Post;

/**
 * Üretilen içeriği CLI'ye verilecek JSON Schema'ları ve modelin çıktısını
 * kabul etmeden önce koşulması gereken sunucu tarafı doğrulamalarıyla korur.
 * İhlal mesajları Türkçedir; boş liste = geçerli.
 */
final class ContentGuard
{
    public function __construct(private ContentInventory $inventory) {}

    /**
     * @return array<string, mixed>
     */
    public static function postSchema(): array
    {
        return [
            'type' => 'object',
            'additionalProperties' => false,
            'required' => ['slug', 'title_tr', 'excerpt_tr', 'body_tr', 'meta_title_tr', 'meta_desc_tr', 'category', 'tags'],
            'properties' => [
                'slug' => ['type' => 'string'],
                'title_tr' => ['type' => 'string'],
                'excerpt_tr' => ['type' => 'string'],
                'body_tr' => ['type' => 'string'],
                'meta_title_tr' => ['type' => 'string'],
                'meta_desc_tr' => ['type' => 'string'],
                'category' => ['type' => 'string'],
                'tags' => [
                    'type' => 'array',
                    'minItems' => 3,
                    'maxItems' => 6,
                    'items' => ['type' => 'string'],
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function serviceCopySchema(): array
    {
        return [
            'type' => 'object',
            'additionalProperties' => false,
            'required' => ['desc_tr', 'intro_tr', 'aftercare_tr', 'benefits_tr', 'process_tr', 'faq_tr', 'keywords_tr', 'seo_title_tr', 'seo_desc_tr'],
            'properties' => [
                'desc_tr' => ['type' => 'string'],
                'intro_tr' => ['type' => 'string'],
                'aftercare_tr' => ['type' => 'string'],
                'benefits_tr' => [
                    'type' => 'array',
                    'minItems' => 3,
                    'maxItems' => 8,
                    'items' => ['type' => 'string'],
                ],
                'process_tr' => [
                    'type' => 'array',
                    'minItems' => 3,
                    'maxItems' => 8,
                    'items' => ['type' => 'string'],
                ],
                'faq_tr' => [
                    'type' => 'array',
                    'minItems' => 3,
                    'maxItems' => 8,
                    'items' => [
                        'type' => 'object',
                        'additionalProperties' => false,
                        'required' => ['q', 'a'],
                        'properties' => [
                            'q' => ['type' => 'string'],
                            'a' => ['type' => 'string'],
                        ],
                    ],
                ],
                'keywords_tr' => [
                    'type' => 'array',
                    'minItems' => 4,
                    'maxItems' => 12,
                    'items' => ['type' => 'string'],
                ],
                'seo_title_tr' => ['type' => 'string'],
                'seo_desc_tr' => ['type' => 'string'],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $post
     * @return list<string>
     */
    public function postViolations(array $post, ?string $allowSlug = null): array
    {
        $errors = [];

        $slug = is_string($post['slug'] ?? null) ? $post['slug'] : '';
        $title = is_string($post['title_tr'] ?? null) ? $post['title_tr'] : '';
        $excerpt = is_string($post['excerpt_tr'] ?? null) ? $post['excerpt_tr'] : '';
        $body = is_string($post['body_tr'] ?? null) ? $post['body_tr'] : '';
        $metaTitle = is_string($post['meta_title_tr'] ?? null) ? $post['meta_title_tr'] : '';
        $metaDesc = is_string($post['meta_desc_tr'] ?? null) ? $post['meta_desc_tr'] : '';
        $category = is_string($post['category'] ?? null) ? $post['category'] : '';
        $tags = is_array($post['tags'] ?? null) ? $post['tags'] : [];

        $metaTitleMax = (int) config('content.post.meta_title_max');
        $metaDescMin = (int) config('content.post.meta_desc_min');
        $metaDescMax = (int) config('content.post.meta_desc_max');
        $excerptMax = (int) config('content.post.excerpt_max');
        $minWords = (int) config('content.post.min_words');
        $maxWords = (int) config('content.post.max_words');
        $minH2 = (int) config('content.post.min_h2');
        $minServiceLinks = (int) config('content.post.min_service_links');
        $minPostLinks = (int) config('content.post.min_post_links');

        // (a) slug
        if (! preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
            $errors[] = 'slug yalnızca küçük harf, rakam ve tire içermeli: '.($slug === '' ? '(boş)' : $slug);
        } elseif (mb_strlen($slug) > 190) {
            $errors[] = 'slug 190 karakteri aşamaz.';
        } else {
            $exists = Post::query()
                ->where('slug', $slug)
                ->whereNull('site')
                ->when($allowSlug !== null, fn ($q) => $q->where('slug', '!=', $allowSlug))
                ->exists();

            if ($exists) {
                $errors[] = 'slug zaten başka bir yazıda kullanılıyor: '.$slug;
            }
        }

        // (b) başlık/meta/özet uzunlukları
        if (trim($title) === '') {
            $errors[] = 'title_tr boş olamaz.';
        } elseif (mb_strlen($title) > 90) {
            $errors[] = 'title_tr 90 karakteri aşamaz ('.mb_strlen($title).').';
        }

        if (mb_strlen($metaTitle) > $metaTitleMax) {
            $errors[] = "meta_title_tr {$metaTitleMax} karakteri aşamaz (".mb_strlen($metaTitle).').';
        }

        $metaDescLen = mb_strlen($metaDesc);
        if ($metaDescLen < $metaDescMin || $metaDescLen > $metaDescMax) {
            $errors[] = "meta_desc_tr {$metaDescMin}-{$metaDescMax} karakter olmalı ({$metaDescLen}).";
        }

        if (trim($excerpt) === '') {
            $errors[] = 'excerpt_tr boş olamaz.';
        } elseif (mb_strlen($excerpt) > $excerptMax) {
            $errors[] = "excerpt_tr {$excerptMax} karakteri aşamaz (".mb_strlen($excerpt).').';
        }

        // (c) kelime sayısı + h2 sayısı
        $wordCount = $this->wordCount($body);
        if ($wordCount < $minWords || $wordCount > $maxWords) {
            $errors[] = "Gövde kelime sayısı {$minWords}-{$maxWords} olmalı ({$wordCount}).";
        }

        $h2Count = preg_match_all('/<h2\b/i', $body);
        if ($h2Count < $minH2) {
            $errors[] = "Gövdede en az {$minH2} adet <h2> olmalı ({$h2Count}).";
        }

        // (d) etiket beyaz listesi + tehlikeli içerik
        $errors = array_merge($errors, $this->tagViolations($body));

        // (e) linkler
        $errors = array_merge($errors, $this->linkViolations($body, $slug, $minServiceLinks, $minPostLinks));

        // (f) yasaklı ifadeler
        $haystack = $title.' '.$excerpt.' '.$metaTitle.' '.$metaDesc.' '.$this->stripTags($body);
        $errors = array_merge($errors, $this->forbiddenViolations($haystack));

        // (g) tags + category
        if (count($tags) < 3 || count($tags) > 6) {
            $errors[] = 'tags 3-6 arası olmalı ('.count($tags).').';
        }
        foreach ($tags as $tag) {
            if (! is_string($tag) || trim($tag) === '') {
                $errors[] = 'tags boş etiket içeremez.';
                break;
            }
        }
        if (trim($category) === '') {
            $errors[] = 'category boş olamaz.';
        }

        return $errors;
    }

    /**
     * @param  array<string, mixed>  $copy
     * @return list<string>
     */
    public function serviceCopyViolations(array $copy): array
    {
        $errors = [];

        $desc = is_string($copy['desc_tr'] ?? null) ? $copy['desc_tr'] : '';
        $intro = is_string($copy['intro_tr'] ?? null) ? $copy['intro_tr'] : '';
        $aftercare = is_string($copy['aftercare_tr'] ?? null) ? $copy['aftercare_tr'] : '';
        $benefits = is_array($copy['benefits_tr'] ?? null) ? $copy['benefits_tr'] : [];
        $process = is_array($copy['process_tr'] ?? null) ? $copy['process_tr'] : [];
        $faq = is_array($copy['faq_tr'] ?? null) ? $copy['faq_tr'] : [];
        $keywords = is_array($copy['keywords_tr'] ?? null) ? $copy['keywords_tr'] : [];
        $seoTitle = is_string($copy['seo_title_tr'] ?? null) ? $copy['seo_title_tr'] : '';
        $seoDesc = is_string($copy['seo_desc_tr'] ?? null) ? $copy['seo_desc_tr'] : '';

        $metaTitleMax = (int) config('content.post.meta_title_max');
        $metaDescMin = (int) config('content.post.meta_desc_min');
        $metaDescMax = (int) config('content.post.meta_desc_max');

        // Düz metin alanlar — HTML/etiket olmamalı.
        foreach (['desc_tr' => $desc, 'intro_tr' => $intro, 'aftercare_tr' => $aftercare] as $field => $value) {
            if (preg_match('/<[a-z\/!][^>]*>/i', $value)) {
                $errors[] = "{$field} düz metin olmalı; HTML/etiket içeremez.";
            }
        }

        $descLen = mb_strlen($desc);
        if ($descLen < 80 || $descLen > 320) {
            $errors[] = "desc_tr 80-320 karakter olmalı ({$descLen}).";
        }

        if (mb_strlen($intro) < 200) {
            $errors[] = 'intro_tr en az 200 karakter olmalı ('.mb_strlen($intro).').';
        }

        if (trim($aftercare) === '') {
            $errors[] = 'aftercare_tr boş olamaz.';
        }

        if (count($benefits) < 3 || count($benefits) > 8) {
            $errors[] = 'benefits_tr 3-8 madde olmalı ('.count($benefits).').';
        }
        if (count($process) < 3 || count($process) > 8) {
            $errors[] = 'process_tr 3-8 madde olmalı ('.count($process).').';
        }

        if (count($faq) < 3 || count($faq) > 8) {
            $errors[] = 'faq_tr 3-8 madde olmalı ('.count($faq).').';
        }
        foreach ($faq as $i => $item) {
            $q = is_array($item) && is_string($item['q'] ?? null) ? trim($item['q']) : '';
            $a = is_array($item) && is_string($item['a'] ?? null) ? trim($item['a']) : '';
            if ($q === '' || $a === '') {
                $errors[] = 'faq_tr['.$i.'] q ve a alanları dolu olmalı.';
            }
        }

        if (count($keywords) < 4 || count($keywords) > 12) {
            $errors[] = 'keywords_tr 4-12 madde olmalı ('.count($keywords).').';
        }

        if (mb_strlen($seoTitle) > $metaTitleMax) {
            $errors[] = "seo_title_tr {$metaTitleMax} karakteri aşamaz (".mb_strlen($seoTitle).').';
        }

        $seoDescLen = mb_strlen($seoDesc);
        if ($seoDescLen < $metaDescMin || $seoDescLen > $metaDescMax) {
            $errors[] = "seo_desc_tr {$metaDescMin}-{$metaDescMax} karakter olmalı ({$seoDescLen}).";
        }

        // Yasaklı ifade taraması — tüm string alanlar.
        $strings = [$desc, $intro, $aftercare, $seoTitle, $seoDesc];
        foreach ($benefits as $b) {
            if (is_string($b)) {
                $strings[] = $b;
            }
        }
        foreach ($process as $p) {
            if (is_string($p)) {
                $strings[] = $p;
            }
        }
        foreach ($keywords as $k) {
            if (is_string($k)) {
                $strings[] = $k;
            }
        }
        foreach ($faq as $item) {
            if (is_array($item)) {
                $strings[] = is_string($item['q'] ?? null) ? $item['q'] : '';
                $strings[] = is_string($item['a'] ?? null) ? $item['a'] : '';
            }
        }

        $errors = array_merge($errors, $this->forbiddenViolations(implode(' ', $strings)));

        return $errors;
    }

    /**
     * @return list<string>
     */
    private function tagViolations(string $body): array
    {
        $errors = [];
        $allowed = (array) config('content.post.allowed_tags');

        $bad = [];
        if (preg_match_all('/<\/?\s*([a-zA-Z][a-zA-Z0-9]*)/', $body, $matches)) {
            foreach ($matches[1] as $tag) {
                $tag = strtolower($tag);
                if (! in_array($tag, $allowed, true)) {
                    $bad[$tag] = true;
                }
            }
        }
        if ($bad !== []) {
            $errors[] = 'İzin verilmeyen HTML etiketleri: '.implode(', ', array_keys($bad));
        }

        foreach (['script', 'iframe', 'style', 'link', 'form'] as $dangerous) {
            if (preg_match('/<\s*'.$dangerous.'\b/i', $body)) {
                $errors[] = "Tehlikeli etiket yasak: <{$dangerous}>.";
            }
        }

        if (preg_match('/\son[a-z]+\s*=/i', $body)) {
            $errors[] = 'Satır içi olay öznitelikleri (on*=) yasak.';
        }

        if (preg_match('/href\s*=\s*["\']?\s*javascript:/i', $body)) {
            $errors[] = 'javascript: href yasak.';
        }

        return $errors;
    }

    /**
     * @return list<string>
     */
    private function linkViolations(string $body, string $ownSlug, int $minServiceLinks, int $minPostLinks): array
    {
        $errors = [];
        $allowed = $this->inventory->allowedUrls();

        $serviceLinks = [];
        $postLinks = [];

        if (preg_match_all('/href\s*=\s*(["\'])(.*?)\1/i', $body, $matches)) {
            foreach ($matches[2] as $href) {
                $href = trim(html_entity_decode($href, ENT_QUOTES | ENT_HTML5));
                if ($href === '') {
                    continue;
                }

                // Sondaki #anchor'a izin ver.
                $base = preg_replace('/#.*$/', '', $href);

                if (! in_array($base, $allowed, true)) {
                    $errors[] = 'İzin verilmeyen/harici link: '.$href;

                    continue;
                }

                if (str_starts_with($base, '/hizmetler/')) {
                    $serviceLinks[$base] = true;
                } elseif (str_starts_with($base, '/blog/') && $base !== '/blog/'.$ownSlug) {
                    $postLinks[$base] = true;
                }
            }
        }

        if (count($serviceLinks) < $minServiceLinks) {
            $errors[] = "En az {$minServiceLinks} farklı hizmet linki (/hizmetler/...) olmalı (".count($serviceLinks).').';
        }
        if (count($postLinks) < $minPostLinks) {
            $errors[] = "En az {$minPostLinks} farklı blog linki (/blog/...) olmalı (".count($postLinks).').';
        }

        return $errors;
    }

    /**
     * @return list<string>
     */
    private function forbiddenViolations(string $haystack): array
    {
        $errors = [];
        $lower = mb_strtolower($haystack);

        foreach ((array) config('content.forbidden', []) as $needle) {
            if ($needle !== '' && mb_strpos($lower, mb_strtolower((string) $needle)) !== false) {
                $errors[] = 'Yasaklı ifade geçiyor: "'.$needle.'"';
            }
        }

        return $errors;
    }

    private function wordCount(string $body): int
    {
        $text = trim($this->stripTags($body));
        if ($text === '') {
            return 0;
        }

        return count(preg_split('/\s+/', $text) ?: []);
    }

    private function stripTags(string $html): string
    {
        $text = preg_replace('/\s+/', ' ', strip_tags($html)) ?? '';

        return trim(html_entity_decode($text, ENT_QUOTES | ENT_HTML5));
    }
}
