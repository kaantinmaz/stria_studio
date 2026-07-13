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
            Post::updateOrCreate(
                ['site' => null, 'slug' => $post['slug']],
                [
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
                    'published_at' => Carbon::now()->subDays(($i + 1) * 5),
                ]
            );
        }

        $this->command?->info(sprintf(
            'MainPostSeeder: %d main-site posts.',
            count($data['posts'] ?? [])
        ));
    }
}
