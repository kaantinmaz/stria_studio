<?php

namespace Tests\Feature;

use App\Models\GalleryImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GalleryImageTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_scope_filters_and_orders(): void
    {
        GalleryImage::factory()->create(['is_active' => false, 'sort_order' => 0]);
        GalleryImage::factory()->create(['alt_tr' => 'B', 'is_active' => true, 'sort_order' => 2]);
        GalleryImage::factory()->create(['alt_tr' => 'A', 'is_active' => true, 'sort_order' => 1]);

        $this->assertSame(['A', 'B'], GalleryImage::active()->pluck('alt_tr')->all());
    }
}
