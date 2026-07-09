<?php

namespace Database\Seeders;

use App\Models\Faq;
use App\Models\GalleryImage;
use App\Models\Post;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

// Seeds content scoped to the mikroblading-ankara microsite. Idempotent:
// posts are upserted by (site, slug); faqs/gallery are reset for the site.
class MicrositeSeeder extends Seeder
{
    private string $site = 'mikroblading-ankara';

    public function run(): void
    {
        $path = database_path('seeders/data/mikroblading-ankara.json');
        if (! is_file($path)) {
            $this->command?->warn("MicrositeSeeder: content file missing at $path — skipped.");

            return;
        }

        $data = json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);

        // Blog posts — spread published dates over recent weeks for a natural feed.
        foreach (($data['posts'] ?? []) as $i => $p) {
            Post::updateOrCreate(
                ['site' => $this->site, 'slug' => $p['slug']],
                [
                    'title_tr' => $p['title_tr'],
                    'title_en' => $p['title_tr'], // TR-only microsite; mirror to satisfy NOT NULL
                    'excerpt_tr' => $p['excerpt_tr'],
                    'excerpt_en' => $p['excerpt_tr'],
                    'body_tr' => $p['body_tr'],
                    'body_en' => $p['body_tr'],
                    'meta_title_tr' => $p['meta_title_tr'] ?? null,
                    'meta_desc_tr' => $p['meta_desc_tr'] ?? null,
                    'is_published' => true,
                    'published_at' => Carbon::now()->subDays(($i + 1) * 5),
                ]
            );
        }

        // FAQs — replace the site's set.
        Faq::where('site', $this->site)->delete();
        foreach (($data['faqs'] ?? []) as $i => $f) {
            Faq::create([
                'site' => $this->site,
                'q_tr' => $f['q_tr'],
                'a_tr' => $f['a_tr'],
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }

        // Gallery — placeholder rows (owner uploads real before/after photos in admin).
        GalleryImage::where('site', $this->site)->delete();
        foreach (($data['gallery_alts'] ?? []) as $i => $alt) {
            GalleryImage::create([
                'site' => $this->site,
                'image' => null,
                'alt_tr' => $alt,
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }

        $this->command?->info(sprintf(
            'MicrositeSeeder: %d posts, %d faqs, %d gallery rows for %s.',
            count($data['posts'] ?? []),
            count($data['faqs'] ?? []),
            count($data['gallery_alts'] ?? []),
            $this->site
        ));
    }
}
