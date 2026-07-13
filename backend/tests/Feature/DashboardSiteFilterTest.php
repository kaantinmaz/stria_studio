<?php

namespace Tests\Feature;

use App\Filament\Pages\Dashboard;
use App\Filament\Widgets\TopPagesChart;
use App\Models\User;
use App\Models\Visit;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class DashboardSiteFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_track_stores_only_known_site_slugs(): void
    {
        $this->postJson('/api/track', ['type' => 'pageview', 'path' => '/', 'site' => 'mikroblading-ankara'])->assertNoContent();
        $this->postJson('/api/track', ['type' => 'pageview', 'path' => '/', 'site' => 'not-a-site'])->assertNoContent();
        $this->postJson('/api/track', ['type' => 'pageview', 'path' => '/'])->assertNoContent();

        $this->assertSame('mikroblading-ankara', Visit::whereNotNull('site')->value('site'));
        // Unknown slug and no slug both fall back to the main site (NULL).
        $this->assertSame(2, Visit::whereNull('site')->count());
    }

    public function test_site_filter_scopes_widget_queries(): void
    {
        $this->makeVisits(null, 5);
        $this->makeVisits('mikroblading-ankara', 3);
        $this->makeVisits('kas-tasarimi-ankara', 2);

        // A widget subclass exposing the scope so we exercise the real trait logic.
        $widget = new class extends TopPagesChart {
            public function scopedCount(?string $site): int
            {
                $this->pageFilters = ['site' => $site];

                return $this->scopeSite(Visit::query())->count();
            }
        };

        $this->assertSame(10, $widget->scopedCount(''));                     // all sites
        $this->assertSame(10, $widget->scopedCount(null));                   // all sites
        $this->assertSame(5, $widget->scopedCount('main'));                  // main only
        $this->assertSame(3, $widget->scopedCount('mikroblading-ankara'));   // one microsite
        $this->assertSame(2, $widget->scopedCount('kas-tasarimi-ankara'));
    }

    public function test_dashboard_page_boots_with_site_filter(): void
    {
        $this->actingAs(User::factory()->create());
        Filament::setCurrentPanel(Filament::getPanel('admin'));

        Livewire::test(Dashboard::class)->assertOk();
    }

    private function makeVisits(?string $site, int $n): void
    {
        foreach (range(1, $n) as $i) {
            Visit::create([
                'visitor_id' => hash('sha256', ($site ?? 'main').$i),
                'site' => $site,
                'path' => '/',
                'source' => 'direct',
            ]);
        }
    }
}
