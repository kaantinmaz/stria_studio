<?php

namespace Database\Seeders;

use App\Models\Post;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class MainPostSeeder extends Seeder
{
    public function run(): void
    {
        $file = database_path('seeders/main/posts.json');

        if (! is_file($file)) {
            $this->command?->warn("MainPostSeeder: no data file at $file — skipped.");

            return;
        }

        $data = json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);

        foreach (($data['posts'] ?? []) as $i => $post) {
            $model = Post::firstOrNew(['site' => null, 'slug' => $post['slug']]);

            $model->fill([
                'site' => null,
                'title_tr' => $post['title_tr'],
                'title_en' => $post['title_en'],
                'excerpt_tr' => $post['excerpt_tr'],
                'excerpt_en' => $post['excerpt_en'],
                'body_tr' => $post['body_tr'],
                'body_en' => $post['body_en'],
                'meta_title_tr' => $post['meta_title_tr'] ?? null,
                'meta_title_en' => $post['meta_title_en'] ?? null,
                'meta_desc_tr' => $post['meta_desc_tr'] ?? null,
                'meta_desc_en' => $post['meta_desc_en'] ?? null,
                'is_published' => true,
            ]);

            // Yayın tarihi yalnızca kayıt yeni oluşturulurken atanır; mevcut yazıların
            // tarihi korunur. JSON'da açık `published_at` varsa o kullanılır (yeni
            // yazılar aylar öncesine tarihlenmesin), yoksa eski sıralama korunur.
            if (! $model->exists) {
                $model->published_at = isset($post['published_at'])
                    ? Carbon::parse($post['published_at'])
                    : Carbon::now()->subDays(($i + 1) * 5);
            }

            $model->save();
        }

        $this->command?->info(sprintf(
            'MainPostSeeder: %d main-site posts.',
            count($data['posts'] ?? [])
        ));
    }
}
