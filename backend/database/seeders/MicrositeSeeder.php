<?php

namespace Database\Seeders;

use App\Models\Faq;
use App\Models\GalleryImage;
use App\Models\Post;
use App\Models\Service;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

// Seeds content for every microsite that has a data file in seeders/data/.
// Site slug = filename (e.g. data/kas-tasarimi-ankara.json -> site
// "kas-tasarimi-ankara"). Idempotent: posts upserted by (site, slug);
// faqs/gallery reset for the site; the pinned service upserted if provided.
class MicrositeSeeder extends Seeder
{
    public function run(): void
    {
        $dir = database_path('seeders/data');
        if (! is_dir($dir)) {
            $this->command?->warn("MicrositeSeeder: no data dir at $dir — skipped.");

            return;
        }

        foreach (glob("$dir/*.json") as $file) {
            $site = basename($file, '.json');
            $data = json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
            $this->seedSite($site, $data);
        }
    }

    private function seedSite(string $site, array $data): void
    {
        // Optional: upsert the service this microsite pins to (slug from config).
        if (! empty($data['service']) && ($slug = config("microsites.$site.service"))) {
            $svc = $data['service'];
            Service::updateOrCreate(
                ['slug' => $slug],
                [
                    'name_tr' => $svc['name_tr'],
                    'name_en' => $svc['name_tr'],
                    'tag_tr' => $svc['tag_tr'] ?? 'Kaş',
                    'tag_en' => $svc['tag_tr'] ?? 'Brows',
                    'desc_tr' => $svc['desc_tr'],
                    'desc_en' => $svc['desc_tr'],
                    'seo_title_tr' => $svc['seo_title_tr'] ?? null,
                    'seo_desc_tr' => $svc['seo_desc_tr'] ?? null,
                    'keywords_tr' => $svc['keywords_tr'] ?? [],
                    'intro_tr' => $svc['intro_tr'] ?? null,
                    'aftercare_tr' => $svc['aftercare_tr'] ?? null,
                    'benefits_tr' => $svc['benefits_tr'] ?? [],
                    'process_tr' => $svc['process_tr'] ?? [],
                    'faq_tr' => $svc['faq_tr'] ?? [],
                    'is_active' => true,
                    'sort_order' => 50,
                ]
            );
        }

        foreach (($data['posts'] ?? []) as $i => $p) {
            Post::updateOrCreate(
                ['site' => $site, 'slug' => $p['slug']],
                [
                    'title_tr' => $p['title_tr'],
                    'title_en' => $p['title_tr'],
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

        Faq::where('site', $site)->delete();
        foreach (($data['faqs'] ?? []) as $i => $f) {
            Faq::create([
                'site' => $site,
                'q_tr' => $f['q_tr'],
                'a_tr' => $f['a_tr'],
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }

        GalleryImage::where('site', $site)->delete();
        foreach (($data['gallery_alts'] ?? []) as $i => $alt) {
            GalleryImage::create([
                'site' => $site,
                'image' => null,
                'alt_tr' => $alt,
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }

        $this->command?->info(sprintf(
            'MicrositeSeeder[%s]: %d posts, %d faqs, %d gallery%s.',
            $site,
            count($data['posts'] ?? []),
            count($data['faqs'] ?? []),
            count($data['gallery_alts'] ?? []),
            ! empty($data['service']) ? ', +service' : ''
        ));
    }
}
