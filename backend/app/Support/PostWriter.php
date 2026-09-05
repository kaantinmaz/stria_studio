<?php

namespace App\Support;

use App\Models\Category;
use App\Models\Post;
use App\Models\Tag;
use Illuminate\Support\Str;

/**
 * Blog yazısını (site, slug) üzerinden ekler/günceller. TR alanlarını EN'e
 * aynalar (EN sütunları NOT NULL), kategori ve etiketleri firstOrCreate ile
 * eşler, ana sitede yayımlanan yazılar için IndexNow'a ping atar.
 *
 * Kapak indirme burada YOK: o HTTP'ye özgü ve çağıran (controller) hazır
 * cover_path'i $attributes içinde geçirir.
 */
final class PostWriter
{
    /**
     * @param  array<string, mixed>  $attributes  Kabul edilen anahtarlar:
     *   site, slug, title_tr, title_en, excerpt_tr, excerpt_en, body_tr, body_en,
     *   meta_title_tr, meta_title_en, meta_desc_tr, meta_desc_en,
     *   category, category_name_tr, category_name_en, tags,
     *   is_published, published_at, cover_path
     */
    public function upsert(array $attributes): Post
    {
        $site = $attributes['site'] ?? null;

        $category = null;
        if (isset($attributes['category'])) {
            // Gelen değer zaten slug olabilir (admin API) ya da görünen ad
            // olabilir (üretim komutu). Str::slug ikisini de güvenli bir
            // slug'a indirger; hazır slug'lar aynen korunur.
            $categorySlug = Str::slug($attributes['category']);
            $categoryNameTr = $attributes['category_name_tr'] ?? Str::headline($attributes['category']);
            $category = Category::firstOrCreate(
                ['slug' => $categorySlug],
                [
                    'name_tr' => $categoryNameTr,
                    'name_en' => $attributes['category_name_en'] ?? $categoryNameTr,
                ]
            );
        }

        $values = [
            'site' => $site,
            'title_tr' => $attributes['title_tr'],
            'title_en' => $attributes['title_en'] ?? $attributes['title_tr'],
            'excerpt_tr' => $attributes['excerpt_tr'] ?? '',
            'excerpt_en' => $attributes['excerpt_en'] ?? $attributes['excerpt_tr'] ?? '',
            'body_tr' => $attributes['body_tr'],
            'body_en' => $attributes['body_en'] ?? $attributes['body_tr'],
            'category_id' => $category?->id,
            'meta_title_tr' => $attributes['meta_title_tr'] ?? null,
            'meta_title_en' => $attributes['meta_title_en'] ?? null,
            'meta_desc_tr' => $attributes['meta_desc_tr'] ?? null,
            'meta_desc_en' => $attributes['meta_desc_en'] ?? null,
            'is_published' => $attributes['is_published'] ?? true,
            'published_at' => $attributes['published_at'] ?? now(),
        ];

        if (($attributes['cover_path'] ?? null) !== null) {
            $values['cover_path'] = $attributes['cover_path'];
        }

        $post = Post::updateOrCreate(
            ['site' => $site, 'slug' => $attributes['slug']],
            $values
        );

        $tagIds = collect($attributes['tags'] ?? [])->map(function (string $name) {
            return Tag::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name_tr' => $name, 'name_en' => $name]
            )->id;
        });
        $post->tags()->sync($tagIds);

        if ($post->site === null && $post->is_published) {
            IndexNow::submit([
                'https://'.config('services.indexnow.host').'/blog/'.$post->slug,
            ]);
        }

        return $post;
    }
}
