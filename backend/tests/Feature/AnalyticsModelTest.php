<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Visit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_visit_and_event_persist(): void
    {
        Visit::create(['visitor_id' => 'abc', 'path' => '/', 'source' => 'ai']);
        Event::create(['visitor_id' => 'abc', 'name' => 'whatsapp_click', 'path' => '/']);

        $this->assertSame(1, Visit::where('source', 'ai')->count());
        $this->assertSame(1, Event::where('name', 'whatsapp_click')->count());
    }
}
