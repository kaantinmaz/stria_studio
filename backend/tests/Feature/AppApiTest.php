<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\AppUser;
use App\Models\Campaign;
use App\Models\Customer;
use App\Models\Service;
use App\Models\Setting;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppApiTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();

        parent::tearDown();
    }

    public function test_register_returns_token_and_me_returns_unlinked_user_without_loyalty(): void
    {
        $response = $this->postJson('/api/app/register', [
            'name' => 'Ayşe Yılmaz',
            'email' => 'ayse@example.com',
            'password' => 'password123',
            'phone' => '0555 111 22 33',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.user.name', 'Ayşe Yılmaz')
            ->assertJsonPath('data.user.email', 'ayse@example.com')
            ->assertJsonPath('data.user.customer_linked', false);
        $this->assertMatchesRegularExpression('/^S-1\d{3}$/', $response->json('data.user.code'));

        $this->withToken($response->json('data.token'))
            ->getJson('/api/app/me')
            ->assertOk()
            ->assertJsonPath('data.user.code', $response->json('data.user.code'))
            ->assertJsonPath('data.user.customer_linked', false)
            ->assertJsonPath('data.loyalty', null);
    }

    public function test_login_with_wrong_password_returns_email_validation_error(): void
    {
        $this->appUser();

        $this->postJson('/api/app/login', [
            'email' => 'mobil@example.com',
            'password' => 'wrong-password',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_logout_revokes_the_current_token(): void
    {
        $user = $this->appUser();
        $token = $user->createToken('test-device')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/app/logout')
            ->assertNoContent();

        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->app['auth']->forgetGuards();
        $this->withToken($token)
            ->getJson('/api/app/me')
            ->assertUnauthorized();
    }

    public function test_linked_customer_sees_customer_and_app_created_appointment_history(): void
    {
        $user = $this->appUser();
        $customer = Customer::query()->create([
            'name' => 'Mobil Müşteri',
            'app_user_id' => $user->id,
        ]);
        $service = Service::factory()->create(['name_tr' => 'Kaş Tasarımı']);
        $customerAppointment = Appointment::query()->create([
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'starts_at' => '2026-07-20 10:00:00',
            'status' => 'confirmed',
        ]);
        $appAppointment = Appointment::query()->create([
            'app_user_id' => $user->id,
            'service_id' => $service->id,
            'starts_at' => '2026-07-21 11:00:00',
            'status' => 'requested',
        ]);
        Appointment::query()->create([
            'starts_at' => '2026-07-22 12:00:00',
        ]);

        $response = $this->actingAsAppUser($user)->getJson('/api/app/appointments');

        $response
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $appAppointment->id)
            ->assertJsonPath('data.0.service_name', 'Kaş Tasarımı')
            ->assertJsonPath('data.0.duration_min', 60)
            ->assertJsonPath('data.0.status', 'requested')
            ->assertJsonPath('data.1.id', $customerAppointment->id)
            ->assertJsonPath('data.1.status', 'confirmed');
    }

    public function test_slots_respect_hours_conflicts_and_reject_past_dates(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        Setting::forSite()->update([
            'hours' => [[
                'days' => ['Monday'],
                'open' => '10:00',
                'close' => '19:00',
            ]],
        ]);
        Appointment::query()->create([
            'starts_at' => '2026-07-20 11:00:00',
            'duration_min' => 120,
            'status' => 'confirmed',
        ]);
        Appointment::query()->create([
            'starts_at' => '2026-07-20 14:00:00',
            'duration_min' => 60,
            'status' => 'requested',
        ]);

        $this->actingAsAppUser()->getJson('/api/app/slots?date=2026-07-20')
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    'date' => '2026-07-20',
                    'slots' => ['10:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
                ],
            ]);

        $this->getJson('/api/app/slots?date=2026-07-19')
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    'date' => '2026-07-19',
                    'slots' => [],
                ],
            ]);

        $this->getJson('/api/app/slots?date=2026-07-16')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('date');
    }

    public function test_store_appointment_creates_request_and_rejects_occupied_slot(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        Setting::forSite()->update([
            'hours' => [[
                'days' => ['Monday'],
                'open' => '10:00',
                'close' => '19:00',
            ]],
        ]);
        $service = Service::factory()->create(['slug' => 'microblading', 'is_active' => true]);
        $user = $this->appUser();
        $customer = Customer::query()->create([
            'name' => 'Bağlı Müşteri',
            'app_user_id' => $user->id,
        ]);

        $response = $this->actingAsAppUser($user)->postJson('/api/app/appointments', [
            'service_slug' => 'microblading',
            'date' => '2026-07-20',
            'time' => '10:00',
            'note' => 'İlk uygulama talebi',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.status', 'requested');
        $this->assertDatabaseHas('appointments', [
            'id' => $response->json('data.id'),
            'customer_id' => $customer->id,
            'app_user_id' => $user->id,
            'service_id' => $service->id,
            'status' => 'requested',
            'duration_min' => 60,
        ]);

        Appointment::query()->create([
            'starts_at' => '2026-07-20 11:00:00',
            'status' => 'confirmed',
        ]);

        $this->postJson('/api/app/appointments', [
            'service_slug' => 'microblading',
            'date' => '2026-07-20',
            'time' => '11:00',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('time');
    }

    public function test_campaigns_lists_only_active_campaigns(): void
    {
        Campaign::query()->create([
            'title' => '5. İşleme %40',
            'nth' => 5,
            'discount_percent' => 40,
            'is_active' => true,
        ]);
        Campaign::query()->create([
            'title' => 'Pasif kampanya',
            'nth' => 3,
            'discount_percent' => 20,
            'is_active' => false,
        ]);

        $this->actingAsAppUser()->getJson('/api/app/campaigns')
            ->assertOk()
            ->assertExactJson([
                'data' => [[
                    'title' => '5. İşleme %40',
                    'nth' => 5,
                    'discount_percent' => 40,
                ]],
            ]);
    }

    public function test_loyalty_math_marks_the_next_appointment_as_reward(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        $user = $this->appUser();
        $customer = Customer::query()->create([
            'name' => 'Sadakat Müşterisi',
            'app_user_id' => $user->id,
        ]);
        Campaign::query()->create([
            'title' => '5. İşleme %40',
            'nth' => 5,
            'discount_percent' => 40,
            'is_active' => true,
        ]);

        foreach (range(1, 4) as $day) {
            Appointment::query()->create([
                'customer_id' => $customer->id,
                'starts_at' => "2026-07-0{$day} 10:00:00",
                'status' => 'confirmed',
            ]);
        }
        Appointment::query()->create([
            'customer_id' => $customer->id,
            'starts_at' => '2026-07-05 10:00:00',
            'status' => 'cancelled',
        ]);
        Appointment::query()->create([
            'customer_id' => $customer->id,
            'starts_at' => '2026-07-20 10:00:00',
            'status' => 'confirmed',
        ]);

        $this->actingAsAppUser($user)->getJson('/api/app/me')
            ->assertOk()
            ->assertJsonPath('data.user.customer_linked', true)
            ->assertJsonPath('data.loyalty.campaign_title', '5. İşleme %40')
            ->assertJsonPath('data.loyalty.nth', 5)
            ->assertJsonPath('data.loyalty.discount_percent', 40)
            ->assertJsonPath('data.loyalty.completed_count', 4)
            ->assertJsonPath('data.loyalty.progress', 4)
            ->assertJsonPath('data.loyalty.remaining', 1)
            ->assertJsonPath('data.loyalty.reward_next', true);
    }

    public function test_cancel_rejects_appointment_not_owned_by_user(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        $appointment = Appointment::query()->create([
            'starts_at' => '2026-07-25 10:00:00',
            'status' => 'confirmed',
        ]);

        $this->actingAsAppUser()->postJson("/api/app/appointments/{$appointment->id}/cancel")
            ->assertNotFound();
        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_cancel_rejects_appointment_starting_within_twelve_hours(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        $user = $this->appUser();
        $appointment = Appointment::query()->create([
            'app_user_id' => $user->id,
            'starts_at' => '2026-07-17 15:00:00',
            'status' => 'confirmed',
        ]);

        $this->actingAsAppUser($user)->postJson("/api/app/appointments/{$appointment->id}/cancel")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('starts_at');
        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_cancel_succeeds_for_owned_appointment_more_than_twelve_hours_away(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        $user = $this->appUser();
        $appointment = Appointment::query()->create([
            'app_user_id' => $user->id,
            'starts_at' => '2026-07-25 10:00:00',
            'status' => 'confirmed',
        ]);

        $this->actingAsAppUser($user)->postJson("/api/app/appointments/{$appointment->id}/cancel")
            ->assertOk()
            ->assertJsonPath('data.id', $appointment->id)
            ->assertJsonPath('data.status', 'cancelled');
        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_cancel_rejects_already_cancelled_appointment(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        $user = $this->appUser();
        $appointment = Appointment::query()->create([
            'app_user_id' => $user->id,
            'starts_at' => '2026-07-25 10:00:00',
            'status' => 'cancelled',
        ]);

        $this->actingAsAppUser($user)->postJson("/api/app/appointments/{$appointment->id}/cancel")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');
    }

    private function appUser(): AppUser
    {
        return AppUser::query()->create([
            'name' => 'Mobil Kullanıcı',
            'email' => 'mobil@example.com',
            'password' => 'password123',
            'phone' => '0555 000 00 00',
        ]);
    }

    private function actingAsAppUser(?AppUser $user = null): static
    {
        $user ??= $this->appUser();

        return $this->withToken($user->createToken('test-device')->plainTextToken);
    }
}
