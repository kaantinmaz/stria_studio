<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Visit;
use App\Support\TrafficSource;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrackApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_classify(): void
    {
        $this->assertSame('ai', TrafficSource::classify('https://chatgpt.com/', null));
        $this->assertSame('ai', TrafficSource::classify(null, 'perplexity'));
        $this->assertSame('search', TrafficSource::classify('https://www.google.com/search?q=x', null));
        $this->assertSame('social', TrafficSource::classify('https://instagram.com/', null));
        $this->assertSame('direct', TrafficSource::classify(null, null));
        $this->assertSame('referral', TrafficSource::classify('https://some-blog.example/', null));
    }

    public function test_pageview_stored_with_source(): void
    {
        $this->postJson('/api/track', [
            'type' => 'pageview', 'path' => '/hizmetler', 'referrer' => 'https://chatgpt.com/',
        ])->assertNoContent();

        $this->assertSame(1, Visit::where('path', '/hizmetler')->where('source', 'ai')->count());
    }

    public function test_event_stored(): void
    {
        $this->postJson('/api/track', ['type' => 'event', 'name' => 'whatsapp_click', 'path' => '/'])
            ->assertNoContent();
        $this->assertSame(1, Event::where('name', 'whatsapp_click')->count());
    }

    public function test_bot_ua_skipped(): void
    {
        $this->withHeaders(['User-Agent' => 'Googlebot/2.1'])
            ->postJson('/api/track', ['type' => 'pageview', 'path' => '/'])
            ->assertNoContent();
        $this->assertSame(0, Visit::count());
    }

    public function test_validation_error(): void
    {
        $this->postJson('/api/track', ['type' => 'bogus'])->assertStatus(422);
    }
}
