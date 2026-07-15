<?php

namespace Tests\Feature;

use App\Filament\Resources\Posts\Tables\PostsTable;
use App\Filament\Resources\Services\Tables\ServicesTable;
use App\Models\Post;
use App\Models\Service;
use App\Models\Visit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContentViewCountsTest extends TestCase
{
    use RefreshDatabase;

    public function test_service_visit_counts_only_include_the_main_site_and_matching_path(): void
    {
        $service = Service::factory()->create(['slug' => 'microblading']);

        $this->createVisits('/hizmetler/microblading');
        Visit::create($this->visitAttributes('/hizmetler/microblading', 'other-site', 'third'));
        Visit::create($this->visitAttributes('/hizmetler/other-service', null, 'third'));

        $service = ServicesTable::withVisitCounts(Service::query())->findOrFail($service->id);

        $this->assertSame(3, (int) $service->views_count);
        $this->assertSame(2, (int) $service->readers_count);
    }

    public function test_post_visit_counts_match_null_and_named_sites_safely(): void
    {
        $mainPost = Post::factory()->create(['slug' => 'main-post', 'site' => null]);
        $sitePost = Post::factory()->create(['slug' => 'site-post', 'site' => 'microblading-ankara']);

        $this->createVisits('/blog/main-post');
        Visit::create($this->visitAttributes('/blog/main-post', 'microblading-ankara', 'third'));

        $this->createVisits('/blog/site-post', 'microblading-ankara');
        Visit::create($this->visitAttributes('/blog/site-post', null, 'third'));

        $posts = PostsTable::withVisitCounts(Post::query())
            ->whereKey([$mainPost->id, $sitePost->id])
            ->get()
            ->keyBy('id');

        $this->assertSame(3, (int) $posts[$mainPost->id]->views_count);
        $this->assertSame(2, (int) $posts[$mainPost->id]->readers_count);
        $this->assertSame(3, (int) $posts[$sitePost->id]->views_count);
        $this->assertSame(2, (int) $posts[$sitePost->id]->readers_count);
    }

    private function createVisits(string $path, ?string $site = null): void
    {
        Visit::create($this->visitAttributes($path, $site, 'repeat'));
        Visit::create($this->visitAttributes($path, $site, 'repeat'));
        Visit::create($this->visitAttributes($path, $site, 'unique'));
    }

    /**
     * @return array<string, string|null>
     */
    private function visitAttributes(string $path, ?string $site, string $visitor): array
    {
        return [
            'visitor_id' => hash('sha256', $visitor),
            'site' => $site,
            'path' => $path,
            'source' => 'direct',
        ];
    }
}
