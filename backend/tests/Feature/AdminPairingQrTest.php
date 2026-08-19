<?php

namespace Tests\Feature;

use App\Filament\Pages\Calendar;
use App\Models\Appointment;
use App\Models\AppUser;
use App\Models\Customer;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class AdminPairingQrTest extends TestCase
{
    use RefreshDatabase;

    public function test_customers_table_offers_the_pairing_action(): void
    {
        Customer::query()->create(['name' => 'QR Bekleyen']);

        $this->actingAs(User::factory()->create())
            ->get('/admin/customers')
            ->assertOk()
            ->assertSee('Uygulama QR');
    }

    public function test_calendar_appointment_modal_produces_a_scannable_code(): void
    {
        $customer = Customer::query()->create(['name' => 'Takvimden Bağlanan']);
        $appointment = $this->appointmentFor($customer);

        Livewire::actingAs(User::factory()->create())
            ->test(Calendar::class)
            ->call('openEditModal', $appointment->id)
            ->assertSet('pairingNotice', null)
            ->assertSet('pairingQrSvg', null)
            ->call('showPairingQr')
            ->assertSet('pairingQrCustomer', 'Takvimden Bağlanan')
            ->assertSet('pairingQrAppointmentCount', 1)
            ->assertSet('pairingQrSvg', fn (?string $svg): bool => is_string($svg)
                && str_contains($svg, '<svg')
                && str_contains($svg, 'viewBox')
                // Sabit genişlik kaldırılmalı, yoksa dar modalda taşıyor.
                && ! str_contains($svg, 'width="320"'))
            ->call('hidePairingQr')
            ->assertSet('pairingQrSvg', null);
    }

    public function test_calendar_explains_why_a_linked_customer_gets_no_code(): void
    {
        $appUser = AppUser::query()->create([
            'name' => 'Bağlı',
            'email' => 'bagli@example.com',
            'password' => 'password123',
        ]);
        $customer = Customer::query()->create([
            'name' => 'Zaten Bağlı',
            'app_user_id' => $appUser->id,
        ]);
        $appointment = $this->appointmentFor($customer);

        Livewire::actingAs(User::factory()->create())
            ->test(Calendar::class)
            ->call('openEditModal', $appointment->id)
            ->call('showPairingQr')
            ->assertSet('pairingQrSvg', null)
            // Sessiz kalmak yerine sebebi ve hangi hesaba bağlı olduğunu söyler.
            ->assertSet('pairingNotice', fn (?string $notice): bool => is_string($notice)
                && str_contains($notice, 'Zaten Bağlı')
                && str_contains($notice, $appUser->fresh()->code))
            ->call('hidePairingQr')
            ->assertSet('pairingNotice', null);
    }

    public function test_calendar_explains_an_appointment_without_a_customer(): void
    {
        $appointment = Appointment::query()->create([
            'starts_at' => '2026-07-20 10:00:00',
            'duration_min' => 60,
            'status' => 'confirmed',
        ]);

        Livewire::actingAs(User::factory()->create())
            ->test(Calendar::class)
            ->call('openEditModal', $appointment->id)
            ->call('showPairingQr')
            ->assertSet('pairingQrSvg', null)
            ->assertSet('pairingNotice', 'Bu randevuya bağlı bir müşteri kaydı yok, QR açılamıyor.');
    }

    public function test_closing_the_appointment_modal_clears_the_code(): void
    {
        $customer = Customer::query()->create(['name' => 'Kapanınca Silinen']);
        $appointment = $this->appointmentFor($customer);

        Livewire::actingAs(User::factory()->create())
            ->test(Calendar::class)
            ->call('openEditModal', $appointment->id)
            ->call('showPairingQr')
            ->assertSet('pairingQrCustomer', 'Kapanınca Silinen')
            ->call('closeAppointmentModal')
            ->assertSet('pairingQrSvg', null)
            ->assertSet('pairingQrCustomer', null)
            ->assertSet('pairingNotice', null);
    }

    private function appointmentFor(Customer $customer): Appointment
    {
        return Appointment::query()->create([
            'customer_id' => $customer->id,
            'service_id' => Service::factory()->create(['is_active' => true])->id,
            'starts_at' => '2026-07-20 10:00:00',
            'duration_min' => 60,
            'status' => 'confirmed',
        ]);
    }
}
