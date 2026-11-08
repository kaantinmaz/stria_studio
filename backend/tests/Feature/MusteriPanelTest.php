<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\AppUser;
use App\Models\Customer;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MusteriPanelTest extends TestCase
{
    use RefreshDatabase;

    private const HOST = 'http://musteri.localhost';

    protected function setUp(): void
    {
        parent::setUp();
        CarbonImmutable::setTestNow('2026-06-15 12:00:00');
    }

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();
        parent::tearDown();
    }

    private function owner(): User
    {
        return User::factory()->create();
    }

    public function test_domain_is_configured_for_tests(): void
    {
        $this->assertSame('musteri.localhost', config('musteri.domain'));
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get(self::HOST.'/')->assertRedirect(self::HOST.'/giris');
        $this->get(self::HOST.'/randevular')->assertRedirect(self::HOST.'/giris');
    }

    public function test_login_page_is_served_with_noindex(): void
    {
        $this->get(self::HOST.'/giris')
            ->assertOk()
            ->assertSee('Müşteri Takip Paneli')
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow');
    }

    public function test_invalid_credentials_are_rejected(): void
    {
        $user = $this->owner();

        $this->from(self::HOST.'/giris')
            ->post(self::HOST.'/giris', ['email' => $user->email, 'password' => 'wrong-pass'])
            ->assertRedirect(self::HOST.'/giris')
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_owner_can_login_and_view_pages(): void
    {
        $user = $this->owner();

        $this->post(self::HOST.'/giris', ['email' => $user->email, 'password' => 'password'])
            ->assertRedirect(self::HOST);

        $this->assertAuthenticatedAs($user);

        foreach (['/', '/randevular', '/musteriler', '/raporlar', '/disa-aktar'] as $path) {
            $this->get(self::HOST.$path)
                ->assertOk()
                ->assertHeader('X-Robots-Tag', 'noindex, nofollow');
        }
    }

    public function test_app_requested_appointment_appears_and_can_be_confirmed(): void
    {
        $appUser = AppUser::query()->create([
            'name' => 'Zeynep App',
            'email' => 'zeynep@example.com',
            'password' => 'secret-pass',
        ]);
        $customer = Customer::query()->create(['name' => 'Zeynep Yılmaz', 'phone' => '5551112233']);
        $appointment = Appointment::query()->create([
            'customer_id' => $customer->id,
            'app_user_id' => $appUser->id,
            'starts_at' => '2026-06-17 14:00:00',
            'duration_min' => 60,
            'status' => 'requested',
        ]);

        $this->actingAs($this->owner());

        $this->get(self::HOST.'/')
            ->assertOk()
            ->assertSee('Zeynep Yılmaz')
            ->assertSee('Mobil uygulama');

        $this->post(self::HOST.'/randevular/'.$appointment->id.'/onayla')
            ->assertRedirect();

        $this->assertSame('confirmed', $appointment->refresh()->status);
    }

    public function test_panel_creates_three_session_package_with_money_only_on_root(): void
    {
        $customer = Customer::query()->create(['name' => 'Paket Müşteri']);
        $this->actingAs($this->owner());

        $this->post(self::HOST.'/randevular', [
            'customer_id' => $customer->id,
            'starts_at' => '2026-06-16T10:00',
            'duration_min' => 60,
            'status' => 'confirmed',
            'price' => '3000',
            'is_paid' => '1',
            'payment_method' => 'nakit',
            'session_total' => 3,
            'interval_days' => 28,
        ])->assertRedirect();

        $this->assertSame(3, Appointment::query()->count());

        $roots = Appointment::query()->whereNull('parent_id')->get();
        $this->assertCount(1, $roots);
        $this->assertSame('3000.00', $roots->first()->price);
        $this->assertTrue($roots->first()->is_paid);

        $children = Appointment::query()->whereNotNull('parent_id')->get();
        $this->assertCount(2, $children);
        foreach ($children as $child) {
            $this->assertNull($child->price);
            $this->assertFalse($child->is_paid);
            $this->assertNull($child->payment_method);
        }
    }

    public function test_price_edit_on_child_session_is_rejected(): void
    {
        $customer = Customer::query()->create(['name' => 'Paket Müşteri']);
        $root = Appointment::query()->create([
            'customer_id' => $customer->id,
            'starts_at' => '2026-06-16 10:00:00',
            'duration_min' => 60,
            'status' => 'confirmed',
            'price' => '3000',
            'is_paid' => true,
            'payment_method' => 'nakit',
        ]);
        \App\Support\AppointmentSessions::split($root, 3, 28);

        $child = Appointment::query()->whereNotNull('parent_id')->orderBy('starts_at')->first();

        $this->actingAs($this->owner());

        $this->from(self::HOST.'/randevular/'.$child->id.'/duzenle')
            ->put(self::HOST.'/randevular/'.$child->id, [
                'starts_at' => $child->starts_at->format('Y-m-d\TH:i'),
                'duration_min' => $child->duration_min,
                'status' => $child->status,
                'price' => '500',
            ])
            ->assertSessionHasErrors('price');

        $this->assertNull($child->refresh()->price);
    }

    public function test_reports_counts_package_revenue_once(): void
    {
        $customer = Customer::query()->create(['name' => 'Rapor Müşteri']);
        $root = Appointment::query()->create([
            'customer_id' => $customer->id,
            'starts_at' => '2026-06-10 10:00:00',
            'duration_min' => 60,
            'status' => 'confirmed',
            'price' => '3000',
            'is_paid' => true,
            'payment_method' => 'nakit',
        ]);
        \App\Support\AppointmentSessions::split($root, 3, 28);

        // Üç satır var ama ciro yalnızca kökün fiyatı kadar olmalı.
        $this->assertSame(3, Appointment::query()->count());

        $this->actingAs($this->owner());

        $this->get(self::HOST.'/raporlar?month=2026-06')
            ->assertOk()
            ->assertSee('3.000,00');

        $reports = new \App\Filament\Pages\Reports();
        $this->assertSame(3000.0, $reports->calculateMonthSummary('2026-06')['income']);
    }

    public function test_panel_routes_do_not_respond_on_admin_domain(): void
    {
        $this->actingAs($this->owner());

        $this->get('http://localhost/randevular')->assertNotFound();
        $this->get('http://localhost/musteriler')->assertNotFound();

        // Admin alan adının kök davranışı değişmedi.
        $this->get('http://localhost/')->assertRedirect('/admin');
    }
}
