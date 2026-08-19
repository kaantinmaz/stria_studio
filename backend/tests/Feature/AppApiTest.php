<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\Appointment;
use App\Models\AppUser;
use App\Models\Campaign;
use App\Models\Customer;
use App\Models\Service;
use App\Models\Setting;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AppApiTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();

        parent::tearDown();
    }

    public function test_register_creates_linked_customer_and_returns_token(): void
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
            ->assertJsonPath('data.user.customer_linked', true);
        $this->assertMatchesRegularExpression('/^S-1\d{3}$/', $response->json('data.user.code'));

        $userId = AppUser::query()->where('email', 'ayse@example.com')->value('id');
        $this->assertDatabaseHas('customers', [
            'app_user_id' => $userId,
            'name' => 'Ayşe Yılmaz',
            'phone' => '0555 111 22 33',
        ]);

        $this->withToken($response->json('data.token'))
            ->getJson('/api/app/me')
            ->assertOk()
            ->assertJsonPath('data.user.code', $response->json('data.user.code'))
            ->assertJsonPath('data.user.customer_linked', true)
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

    public function test_delete_account_removes_user_and_token_but_keeps_business_records(): void
    {
        Storage::fake('public');
        $photoPath = 'customers/before.jpg';
        Storage::disk('public')->put($photoPath, 'fake-image-bytes');

        $user = $this->appUser();
        $token = $user->createToken('test-device')->plainTextToken;
        $customer = Customer::query()->create([
            'name' => 'Mobil Müşteri',
            'app_user_id' => $user->id,
            'phone' => '0555 123 45 67',
            'email' => 'musteri@example.com',
            'instagram' => 'musteri',
            'notes' => 'Alerjik.',
            'photos' => [$photoPath],
        ]);
        $service = Service::factory()->create(['name_tr' => 'Kaş Tasarımı']);
        $appointment = Appointment::query()->create([
            'app_user_id' => $user->id,
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'starts_at' => '2026-07-21 11:00:00',
            'status' => 'requested',
        ]);

        Storage::disk('public')->assertExists($photoPath);

        $this->withToken($token)
            ->deleteJson('/api/app/account')
            ->assertNoContent();

        $this->assertDatabaseMissing('app_users', ['id' => $user->id]);
        $this->assertDatabaseCount('personal_access_tokens', 0);

        // Müşteri kaydı muhasebe için kalır ama kimliğe götüren alanlar temizlenir.
        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'app_user_id' => null,
            'name' => 'Silinmiş Müşteri',
            'phone' => null,
            'email' => null,
            'instagram' => null,
            'notes' => null,
        ]);
        $this->assertSame([], $customer->fresh()->photos);
        Storage::disk('public')->assertMissing($photoPath);

        // Randevu tarih/hizmet/tutar için kalır, kişiye bağlanamaz.
        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'app_user_id' => null,
            'customer_id' => $customer->id,
        ]);

        $this->app['auth']->forgetGuards();
        $this->withToken($token)
            ->getJson('/api/app/me')
            ->assertUnauthorized();
    }

    public function test_delete_account_requires_authentication(): void
    {
        $this->deleteJson('/api/app/account')->assertUnauthorized();
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
        Service::factory()->create(['slug' => 'microblading', 'is_active' => true, 'duration_min' => 60]);
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

        $this->actingAsAppUser()->getJson('/api/app/slots?date=2026-07-20&service_slug=microblading')
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    'date' => '2026-07-20',
                    'duration_min' => 60,
                    'slots' => ['10:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
                ],
            ]);

        $this->getJson('/api/app/slots?date=2026-07-19&service_slug=microblading')
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    'date' => '2026-07-19',
                    'duration_min' => 60,
                    'slots' => [],
                ],
            ]);

        $this->getJson('/api/app/slots?date=2026-07-16&service_slug=microblading')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('date');

        $this->getJson('/api/app/slots?date=2026-07-20')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('service_slug');
    }

    public function test_slots_and_store_reject_hours_that_already_passed_today(): void
    {
        CarbonImmutable::setTestNow('2026-07-20 15:30:00');
        Setting::forSite()->update([
            'hours' => [[
                'days' => ['Monday'],
                'open' => '10:00',
                'close' => '19:00',
            ]],
        ]);
        Service::factory()->create(['slug' => 'microblading', 'is_active' => true, 'duration_min' => 60]);

        $this->actingAsAppUser()->getJson('/api/app/slots?date=2026-07-20&service_slug=microblading')
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    'date' => '2026-07-20',
                    'duration_min' => 60,
                    'slots' => ['16:00', '17:00', '18:00'],
                ],
            ]);

        $this->postJson('/api/app/appointments', [
            'service_slug' => 'microblading',
            'date' => '2026-07-20',
            'time' => '10:00',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('time');

        $this->postJson('/api/app/appointments', [
            'service_slug' => 'microblading',
            'date' => '2026-07-20',
            'time' => '16:00',
        ])->assertCreated();
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

    public function test_campaigns_lists_only_active_and_in_window_campaigns_with_promo_first(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');

        Campaign::query()->create([
            'title' => '5. İşleme %40',
            'kind' => 'loyalty',
            'nth' => 5,
            'discount_percent' => 40,
            'is_active' => true,
        ]);
        Campaign::query()->create([
            'title' => 'Pasif kampanya',
            'kind' => 'loyalty',
            'nth' => 3,
            'discount_percent' => 20,
            'is_active' => false,
        ]);
        $promo = Campaign::query()->create([
            'title' => 'Haftaya Özel',
            'kind' => 'promo',
            'description' => 'Bu haftaya özel indirim',
            'image' => 'campaigns/promo.jpg',
            'old_price' => 1000,
            'new_price' => 750,
            'starts_at' => '2026-07-13',
            'ends_at' => '2026-07-20',
            'is_active' => true,
        ]);
        Campaign::query()->create([
            'title' => 'Geçmiş kampanya',
            'kind' => 'promo',
            'description' => 'Süresi doldu',
            'starts_at' => '2026-07-01',
            'ends_at' => '2026-07-10',
            'is_active' => true,
        ]);

        $response = $this->actingAsAppUser()->getJson('/api/app/campaigns')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        // Promo first, then loyalty.
        $response
            ->assertJsonPath('data.0.id', $promo->id)
            ->assertJsonPath('data.0.kind', 'promo')
            ->assertJsonPath('data.0.title', 'Haftaya Özel')
            ->assertJsonPath('data.0.description', 'Bu haftaya özel indirim')
            ->assertJsonPath('data.0.old_price', '1000.00')
            ->assertJsonPath('data.0.new_price', '750.00')
            ->assertJsonPath('data.0.starts_at', '2026-07-13')
            ->assertJsonPath('data.0.ends_at', '2026-07-20')
            ->assertJsonPath('data.0.nth', null)
            ->assertJsonPath('data.0.discount_percent', null)
            ->assertJsonPath('data.1.kind', 'loyalty')
            ->assertJsonPath('data.1.title', '5. İşleme %40')
            ->assertJsonPath('data.1.nth', 5)
            ->assertJsonPath('data.1.discount_percent', 40)
            ->assertJsonPath('data.1.old_price', null)
            ->assertJsonPath('data.1.new_price', null)
            ->assertJsonPath('data.1.starts_at', null)
            ->assertJsonPath('data.1.ends_at', null);

        $this->assertStringContainsString('storage/campaigns/promo.jpg', $response->json('data.0.image'));
        $this->assertNull($response->json('data.1.image'));
    }

    public function test_loyalty_ignores_promo_campaign_even_with_smaller_id(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        $user = $this->appUser();
        $customer = Customer::query()->create([
            'name' => 'Sadakat Müşterisi',
            'app_user_id' => $user->id,
        ]);

        // Promo has the smaller id but must never be selected for loyalty.
        Campaign::query()->create([
            'title' => 'Promosyon',
            'kind' => 'promo',
            'old_price' => 500,
            'new_price' => 400,
            'is_active' => true,
        ]);
        Campaign::query()->create([
            'title' => '5. İşleme %40',
            'kind' => 'loyalty',
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

        $this->actingAsAppUser($user)->getJson('/api/app/me')
            ->assertOk()
            ->assertJsonPath('data.loyalty.campaign_title', '5. İşleme %40')
            ->assertJsonPath('data.loyalty.nth', 5)
            ->assertJsonPath('data.loyalty.discount_percent', 40)
            ->assertJsonPath('data.loyalty.completed_count', 4)
            ->assertJsonPath('data.loyalty.reward_next', true);
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

    public function test_announcements_lists_only_active_and_in_window_records_newest_first(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');

        $open = Announcement::query()->create([
            'title' => 'Bayram Tatili',
            'body' => '20 Temmuz kapalıyız.',
            'starts_at' => '2026-07-13',
            'ends_at' => '2026-07-20',
            'is_active' => true,
        ]);
        $evergreen = Announcement::query()->create([
            'title' => 'Yeni Çalışma Saatleri',
            'body' => 'Artık 10:00-19:00 açığız.',
            'is_active' => true,
        ]);
        Announcement::query()->create([
            'title' => 'Geçmiş Duyuru',
            'body' => 'Süresi doldu.',
            'starts_at' => '2026-07-01',
            'ends_at' => '2026-07-10',
            'is_active' => true,
        ]);
        Announcement::query()->create([
            'title' => 'Pasif Duyuru',
            'body' => 'Gösterilmemeli.',
            'is_active' => false,
        ]);

        $response = $this->actingAsAppUser()->getJson('/api/app/announcements')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        // Newest first (id desc): evergreen created after open.
        $response
            ->assertJsonPath('data.0.id', $evergreen->id)
            ->assertJsonPath('data.0.title', 'Yeni Çalışma Saatleri')
            ->assertJsonPath('data.0.body', 'Artık 10:00-19:00 açığız.')
            ->assertJsonPath('data.0.starts_at', null)
            ->assertJsonPath('data.0.ends_at', null)
            ->assertJsonPath('data.1.id', $open->id)
            ->assertJsonPath('data.1.title', 'Bayram Tatili')
            ->assertJsonPath('data.1.body', '20 Temmuz kapalıyız.')
            ->assertJsonPath('data.1.starts_at', '2026-07-13')
            ->assertJsonPath('data.1.ends_at', '2026-07-20');

        $this->assertNotNull($response->json('data.0.created_at'));
    }

    public function test_announcements_requires_authentication(): void
    {
        $this->getJson('/api/app/announcements')->assertUnauthorized();
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
