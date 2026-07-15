<?php

namespace Tests\Feature;

use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_scope_orders_and_filters(): void
    {
        Service::factory()->create(['slug' => 'a', 'is_active' => false, 'sort_order' => 0]);
        Service::factory()->create(['slug' => 'b', 'is_active' => true, 'sort_order' => 2]);
        Service::factory()->create(['slug' => 'c', 'is_active' => true, 'sort_order' => 1]);

        $slugs = Service::active()->pluck('slug')->all();

        $this->assertSame(['c', 'b'], $slugs);
    }

    public function test_json_fields_cast_to_arrays(): void
    {
        $s = Service::factory()->create([
            'benefits_tr' => ['x', 'y'],
            'faq_tr' => [['q' => 'q1', 'a' => 'a1']],
            'hero_images' => ['services/one.png', 'services/two.png'],
        ]);

        $this->assertSame(['x', 'y'], $s->fresh()->benefits_tr);
        $this->assertSame('q1', $s->fresh()->faq_tr[0]['q']);
        $this->assertSame(['services/one.png', 'services/two.png'], $s->fresh()->hero_images);
    }
}
