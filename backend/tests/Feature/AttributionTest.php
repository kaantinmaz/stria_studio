<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Service;
use App\Models\Touchpoint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AttributionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutDefer();
        config(['services.meta.capi_token' => 'tok', 'services.meta.pixel_id' => '123',
            'services.meta.test_event_code' => null, 'services.google_ads.offline_token' => 'secret-token']);
        Http::fake(['graph.facebook.com/*' => Http::response(['events_received' => 1])]);
    }

    private function whatsappClick(string $ref, array $attr = []): void
    {
        $this->postJson('/api/track', [
            'type' => 'event', 'name' => 'whatsapp_click', 'path' => '/hizmetler/kas-laminasyon', 'ref' => $ref,
            'attr' => $attr + ['gclid' => 'GCLID-1', 'utm_campaign' => 'kas', 'landing_url' => 'https://striastudio.com.tr/hizmetler/kas-laminasyon?gclid=GCLID-1'],
            'meta' => ['event_id' => 'e1', 'consent' => true, 'fbc' => 'fb.1.1.abc', 'fbp' => 'fb.1.1.2', 'url' => 'https://striastudio.com.tr/hizmetler/kas-laminasyon'],
        ])->assertNoContent();
    }

    private function paidAppointment(Customer $c, array $over = []): Appointment
    {
        return Appointment::create($over + [
            'customer_id' => $c->id, 'starts_at' => now(), 'duration_min' => 60, 'price' => 2750, 'is_paid' => true,
        ]);
    }

    private function purchases(): array
    {
        return Http::recorded()->map(fn ($p) => $p[0]['data'][0])
            ->filter(fn ($e) => $e['event_name'] === 'Purchase')->values()->all();
    }

    public function test_whatsapp_click_stores_ref_and_click_ids(): void
    {
        $this->whatsappClick('K7F3');

        $tp = Touchpoint::sole();
        $this->assertSame(['K7F3', 'whatsapp', 'GCLID-1', 'fb.1.1.abc', 'Google Ads'],
            [$tp->ref_code, $tp->channel, $tp->gclid, $tp->fbc, $tp->source()]);
    }

    public function test_paid_appointment_of_ref_linked_customer_sends_one_purchase_with_click_data(): void
    {
        $this->whatsappClick('K7F3');
        $c = Customer::create(['name' => 'Ayşe', 'phone' => '0507 732 30 26',
            'touchpoint_id' => \App\Support\Attribution::findByRef('Merhaba … (Ref: k7f3)')->id]);

        $a = $this->paidAppointment($c);
        $a->update(['note' => 'tekrar kayıt']);

        $events = $this->purchases();
        $this->assertCount(1, $events);
        $e = $events[0];
        $this->assertSame('physical_store', $e['action_source']);
        $this->assertSame('purchase-'.$a->id, $e['event_id']);
        $this->assertSame(2750.0, $e['custom_data']['value']);
        $this->assertSame([hash('sha256', '905077323026')], $e['user_data']['ph']);
        $this->assertSame('fb.1.1.abc', $e['user_data']['fbc']);
        $this->assertNotNull($a->fresh()->meta_purchase_sent_at);
    }

    public function test_unpaid_and_kamuflaj_appointments_send_nothing(): void
    {
        $c = Customer::create(['name' => 'B', 'phone' => '05000000000']);
        $kam = Service::factory()->create(['slug' => 'kamuflaj-makyaj']);

        $this->paidAppointment($c, ['is_paid' => false]);
        $this->paidAppointment($c, ['service_id' => $kam->id]);

        $this->assertSame([], $this->purchases());
    }

    public function test_form_lead_auto_links_customer_by_phone(): void
    {
        $this->postJson('/api/contact', ['name' => 'Ayşe', 'phone' => '+90 507 732 30 26',
            'attr' => ['fbclid' => 'FBCLID-9']])->assertCreated();

        $c = Customer::create(['name' => 'Ayşe K.', 'phone' => '05077323026']);

        $this->assertSame('Meta', $c->touchpoint->source());
    }

    public function test_google_feed_requires_token_and_lists_paid_conversions(): void
    {
        $this->whatsappClick('K7F3');
        $linked = Customer::create(['name' => 'A', 'phone' => '05077323026', 'touchpoint_id' => Touchpoint::sole()->id]);
        $this->paidAppointment($linked);
        $this->paidAppointment(Customer::create(['name' => 'B', 'phone' => '05551112233']), ['price' => null]);
        $this->paidAppointment(Customer::create(['name' => 'C']), ['is_paid' => false]);

        $this->get('/api/conversions/google/wrong.csv')->assertNotFound();

        $csv = $this->get('/api/conversions/google/secret-token.csv')->assertOk()->getContent();
        $lines = array_values(array_filter(explode("\n", $csv)));
        $this->assertSame('Parameters:TimeZone=Europe/Istanbul', $lines[0]);
        $this->assertCount(4, $lines);
        $this->assertStringStartsWith('GCLID-1,"Stria Müşteri (ödeme)"', $lines[2]);
        $this->assertStringContainsString(',2750.00,TRY,', $lines[2]);
        $this->assertStringContainsString(',2500.00,TRY,,'.hash('sha256', '+905551112233'), $lines[3]);
    }

    public function test_calendar_new_customer_with_pasted_whatsapp_message_is_linked_before_purchase(): void
    {
        $this->whatsappClick('K7F3');
        $this->actingAs(\App\Models\User::factory()->create());
        \Filament\Facades\Filament::setCurrentPanel(\Filament\Facades\Filament::getPanel('admin'));

        \Livewire\Livewire::test(\App\Filament\Pages\Calendar::class)
            ->call('useNewCustomer')
            ->set('newCustomerName', 'Ayşe')
            ->set('newCustomerPhone', '0507 732 30 26')
            ->set('selectedDate', now()->format('Y-m-d'))
            ->set('refInput', 'Merhaba, Kaş Laminasyon hakkında bilgi almak istiyorum. (Ref: K7F3)')
            ->set('price', '2500')
            ->set('is_paid', true)
            ->set('payment_method', 'kart')
            ->call('createAppointment')
            ->assertHasNoErrors();

        $this->assertSame('GCLID-1', Customer::sole()->touchpoint->gclid);
        $this->assertSame('fb.1.1.abc', $this->purchases()[0]['user_data']['fbc']);

        \Livewire\Livewire::test(\App\Filament\Pages\Calendar::class)
            ->call('useNewCustomer')->set('newCustomerName', 'X')
            ->set('selectedDate', now()->format('Y-m-d'))
            ->set('refInput', 'ZZZZ')
            ->call('createAppointment')
            ->assertHasErrors('refInput');
    }

    public function test_call_time_suggests_nearby_unlinked_call_clicks_and_links_selected_one(): void
    {
        $click = fn (string $at, string $campaign) => $this->travelTo(\Carbon\CarbonImmutable::parse($at, 'Europe/Istanbul'),
            fn () => $this->postJson('/api/track', ['type' => 'event', 'name' => 'call_click', 'path' => '/hizmetler/kirpik-lifting',
                'attr' => ['gclid' => "G-$campaign", 'utm_campaign' => $campaign]])->assertNoContent());
        $click('2026-10-11 14:30', 'yakin');
        $click('2026-10-11 14:55', 'uzak');
        $alreadyLinked = (new Touchpoint(['channel' => 'call']))->forceFill(['created_at' => '2026-10-11 14:33']);
        $alreadyLinked->save();
        Customer::create(['name' => 'Eski', 'touchpoint_id' => $alreadyLinked->id]);

        $this->actingAs(\App\Models\User::factory()->create());
        \Filament\Facades\Filament::setCurrentPanel(\Filament\Facades\Filament::getPanel('admin'));

        $page = \Livewire\Livewire::test(\App\Filament\Pages\Calendar::class)
            ->call('useNewCustomer')
            ->set('newCustomerName', 'Arayan')
            ->set('newCustomerPhone', '05001112233')
            ->set('selectedDate', '2026-10-12')
            ->set('callAt', '2026-10-11T14:35');

        // ±10 dk içinde yalnız bağlanmamış "yakin" tıklaması; tek aday olduğu için seçili gelir.
        $this->assertCount(1, $page->get('callCandidates'));
        $page->set('heardFrom', 'google')->call('createAppointment')->assertHasNoErrors();

        $c = Customer::where('name', 'Arayan')->sole();
        $this->assertSame(['G-yakin', 'google'], [$c->touchpoint->gclid, $c->heard_from]);
    }
}
