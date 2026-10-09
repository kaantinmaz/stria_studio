<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MetaConversionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutDefer();
        config(['services.meta.capi_token' => 'tok', 'services.meta.pixel_id' => '123', 'services.meta.test_event_code' => null]);
        Http::fake(['graph.facebook.com/*' => Http::response(['events_received' => 1])]);
    }

    private function meta(array $over = []): array
    {
        return $over + ['event_id' => 'ev-1', 'consent' => true, 'fbp' => 'fb.1.1.2', 'url' => 'https://striastudio.com.tr/hizmetler/kas-laminasyon'];
    }

    private function lead(array $meta): \Illuminate\Testing\TestResponse
    {
        return $this->postJson('/api/contact', [
            'name' => 'Ayşe', 'phone' => '0507 732 30 26', 'email' => ' Ayse@Example.com ', 'service' => 'kas-laminasyon', 'meta' => $meta,
        ]);
    }

    public function test_lead_sends_deduplicated_hashed_event(): void
    {
        $this->lead($this->meta())->assertCreated();

        Http::assertSentCount(1);
        Http::assertSent(function (Request $r) {
            $e = $r['data'][0];

            return str_contains($r->url(), '/123/events')
                && $e['event_name'] === 'Lead'
                && $e['event_id'] === 'ev-1'
                && $e['user_data']['em'] === [hash('sha256', 'ayse@example.com')]
                && $e['user_data']['ph'] === [hash('sha256', '905077323026')]
                && $e['user_data']['fbp'] === 'fb.1.1.2'
                && $e['custom_data']['content_name'] === 'kas-laminasyon';
        });
    }

    public function test_nothing_sent_without_consent(): void
    {
        $this->lead($this->meta(['consent' => false]))->assertCreated();
        $this->lead(['event_id' => 'x'])->assertCreated();
        Http::assertNothingSent();
    }

    public function test_nothing_sent_from_kamuflaj_pages(): void
    {
        $this->lead($this->meta(['url' => 'https://striastudio.com.tr/hizmetler/kamuflaj-makyaj/vitiligo-kamuflaji']))->assertCreated();
        $this->postJson('/api/track', ['type' => 'event', 'name' => 'whatsapp_click', 'path' => '/hizmetler/kamuflaj-makyaj',
            'meta' => $this->meta(['url' => 'https://striastudio.com.tr/hizmetler/kamuflaj-makyaj'])])->assertNoContent();
        Http::assertNothingSent();
    }

    public function test_whatsapp_click_sends_contact_but_other_events_and_microsites_do_not(): void
    {
        $this->postJson('/api/track', ['type' => 'event', 'name' => 'whatsapp_click', 'path' => '/', 'meta' => $this->meta(['url' => 'https://striastudio.com.tr/'])]);
        $this->postJson('/api/track', ['type' => 'event', 'name' => 'scroll_75', 'path' => '/', 'meta' => $this->meta()]);
        $this->postJson('/api/track', ['type' => 'event', 'name' => 'call_click', 'path' => '/', 'site' => array_key_first(config('microsites')), 'meta' => $this->meta()]);

        Http::assertSentCount(1);
        Http::assertSent(fn (Request $r) => $r['data'][0]['event_name'] === 'Contact' && $r['data'][0]['custom_data']['method'] === 'whatsapp');
    }

    public function test_missing_token_skips_without_breaking_lead(): void
    {
        config(['services.meta.capi_token' => null]);
        $this->lead($this->meta())->assertCreated();
        Http::assertNothingSent();
    }
}
