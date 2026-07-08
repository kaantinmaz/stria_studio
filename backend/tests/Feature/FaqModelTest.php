<?php

namespace Tests\Feature;

use App\Models\Faq;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FaqModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_scope_filters_and_orders(): void
    {
        Faq::factory()->create(['is_active' => false, 'sort_order' => 0]);
        Faq::factory()->create(['q_tr' => 'B', 'is_active' => true, 'sort_order' => 2]);
        Faq::factory()->create(['q_tr' => 'A', 'is_active' => true, 'sort_order' => 1]);

        $this->assertSame(['A', 'B'], Faq::active()->pluck('q_tr')->all());
    }
}
