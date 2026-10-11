<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\PhoneCall;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class NetgsmTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.netgsm.webhook_token' => 'hook', 'services.netgsm.usercode' => '8503000000', 'services.netgsm.password' => 'pw']);
    }

    private function callClick(string $at, string $campaign): void
    {
        $this->travelTo(CarbonImmutable::parse($at, 'Europe/Istanbul'), fn () => $this->postJson('/api/track', [
            'type' => 'event', 'name' => 'call_click', 'path' => '/hizmetler/kas-laminasyon',
            'attr' => ['gclid' => "G-$campaign", 'utm_campaign' => $campaign],
        ])->assertNoContent());
    }

    private function cdr(array $over = []): array
    {
        return $over + [
            'bas' => '2026-10-12 14:32:10', 'kimlik' => 1866400001, 'arayan' => '05551112233',
            'aranan' => '8503000000-queue-Stria', 'sure' => 95, 'sondurum' => 3, 'santral' => '8503000000',
            'yon' => 1, 'seskaydi' => 'https://dosyaindir.netgsm.com.tr/upload.php?tip=1&q=x',
            'asteriskId' => 'sip8-1760268730.100', 'trunk' => '8503000000', 'scenario' => 'cdr',
        ];
    }

    public function test_inbound_cdr_claims_preceding_call_click_and_later_customer_inherits_source(): void
    {
        $this->callClick('2026-10-12 14:10', 'eski');   // 22 dk önce: pencere dışı
        $this->callClick('2026-10-12 14:31', 'kas');

        $this->postJson('/api/netgsm/hook', ['scenario' => 'Inbound_call', 'customer_num' => '05551112233'])->assertNoContent();
        $this->postJson('/api/netgsm/hook', $this->cdr())->assertNoContent();
        $this->postJson('/api/netgsm/hook', $this->cdr())->assertNoContent(); // tekrar gönderim

        $call = PhoneCall::sole();
        $this->assertSame(['in', '905551112233', 95, 3, 'G-kas'],
            [$call->direction, $call->customer_phone, $call->duration, $call->status, $call->touchpoint->gclid]);
        $this->assertSame('2026-10-12 14:32', $call->started_at->timezone('Europe/Istanbul')->format('Y-m-d H:i'));

        $customer = Customer::create(['name' => 'Arayan', 'phone' => '0555 111 22 33']);
        $this->assertSame('G-kas', $customer->touchpoint->gclid);
    }

    public function test_known_customer_without_source_is_linked_on_call(): void
    {
        $customer = Customer::create(['name' => 'Kayıtlı', 'phone' => '+90 555 111 2233']);
        $this->callClick('2026-10-12 14:30', 'kas');

        $this->postJson('/api/netgsm/hook', $this->cdr())->assertNoContent();

        $this->assertSame($customer->id, PhoneCall::sole()->customer_id);
        $this->assertSame('G-kas', $customer->fresh()->touchpoint->gclid);
    }

    public function test_wrong_token_is_rejected(): void
    {
        $this->postJson('/api/netgsm/wrong', $this->cdr())->assertNotFound();
        $this->assertSame(0, PhoneCall::count());
    }

    public function test_sync_command_stores_report_rows_and_keeps_webhook_status(): void
    {
        $this->postJson('/api/netgsm/hook', $this->cdr())->assertNoContent();
        Http::fake(['api.netgsm.com.tr/netsantral/report' => Http::response([
            ['uniqueid' => 'sip8-1760268730.100', 'values' => [[
                'date' => '12.10.2026 14:32:10', 'destination' => '8503000000', 'source' => '05551112233',
                'duration' => 95, 'direction' => 1, 'line' => '8503000000',
            ]]],
            ['uniqueid' => 'sip8-1760269000.200', 'values' => [[
                'date' => '12.10.2026 14:40:00', 'destination' => '5324445566', 'source' => '101',
                'duration' => 30, 'direction' => 0, 'line' => '8503000000',
            ]]],
        ])]);

        $this->artisan('netgsm:sync-calls')->assertSuccessful();

        Http::assertSent(fn ($r) => $r['usercode'] === '8503000000' && preg_match('/^\d{12}$/', $r['startdate']) === 1);
        $this->assertSame(2, PhoneCall::count());
        $this->assertSame(3, PhoneCall::where('unique_id', 'sip8-1760268730.100')->value('status'));
        $out = PhoneCall::where('direction', 'out')->sole();
        $this->assertSame(['905324445566', 30], [$out->customer_phone, $out->duration]);
    }

    public function test_sync_command_fails_on_error_body(): void
    {
        Http::fake(['api.netgsm.com.tr/*' => Http::response(['code' => '30', 'error' => 'Geçersiz kullanıcı'])]);

        $this->artisan('netgsm:sync-calls')->assertFailed();
    }
}
