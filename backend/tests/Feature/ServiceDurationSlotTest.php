<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\AppUser;
use App\Models\Customer;
use App\Models\Service;
use App\Models\Setting;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceDurationSlotTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // 2026-07-16 Perşembe, 2026-07-23 de Perşembe.
        CarbonImmutable::setTestNow('2026-07-16 09:00:00');
        Setting::forSite()->update([
            'hours' => [[
                'days' => ['Thursday'],
                'open' => '10:00',
                'close' => '20:00',
            ]],
        ]);
    }

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();

        parent::tearDown();
    }

    public function test_a_hundred_minute_service_blocks_the_following_hour(): void
    {
        $microblading = Service::factory()->create([
            'slug' => 'microblading',
            'is_active' => true,
            'duration_min' => 100,
        ]);
        // Perşembe 10:00 microblading → 11:40'a kadar dolu.
        Appointment::query()->create([
            'starts_at' => '2026-07-23 10:00:00',
            'duration_min' => $microblading->duration_min,
            'status' => 'confirmed',
        ]);

        $this->actingAsAppUser()
            ->getJson('/api/app/slots?date=2026-07-23&service_slug=microblading')
            ->assertOk()
            ->assertJsonPath('data.duration_min', 100)
            // 10:00 dolu, 11:00 çakışıyor (11:00+100dk 10:00-11:40 ile kesişir),
            // 18:00+100dk = 19:40 sığar, 19:00+100dk = 20:40 kapanışı geçer.
            ->assertJsonPath('data.slots', ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']);
    }

    public function test_a_short_service_still_fits_around_a_long_appointment(): void
    {
        Service::factory()->create(['slug' => 'microblading', 'is_active' => true, 'duration_min' => 100]);
        Service::factory()->create(['slug' => 'kas-tasarimi', 'is_active' => true, 'duration_min' => 30]);
        Appointment::query()->create([
            'starts_at' => '2026-07-23 10:00:00',
            'duration_min' => 100,
            'status' => 'confirmed',
        ]);

        // 30 dakikalık işlem için de 11:00 kapalı (10:00-11:40 sürüyor) ama
        // 19:00 açık: 19:30 kapanıştan önce biter.
        $this->actingAsAppUser()
            ->getJson('/api/app/slots?date=2026-07-23&service_slug=kas-tasarimi')
            ->assertOk()
            ->assertJsonPath('data.duration_min', 30)
            ->assertJsonPath('data.slots', ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']);
    }

    public function test_store_uses_the_service_duration_and_refuses_the_blocked_hour(): void
    {
        Service::factory()->create(['slug' => 'microblading', 'is_active' => true, 'duration_min' => 100]);
        $user = $this->appUser();
        Customer::query()->create(['name' => 'Bağlı Müşteri', 'app_user_id' => $user->id]);

        $response = $this->actingAsAppUser($user)->postJson('/api/app/appointments', [
            'service_slug' => 'microblading',
            'date' => '2026-07-23',
            'time' => '10:00',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('appointments', [
            'id' => $response->json('data.id'),
            'duration_min' => 100,
        ]);

        // Talep henüz onaylanmadığı için slotu kapatmaz; onaylanınca kapatır.
        Appointment::query()->whereKey($response->json('data.id'))->update(['status' => 'confirmed']);

        $this->postJson('/api/app/appointments', [
            'service_slug' => 'microblading',
            'date' => '2026-07-23',
            'time' => '11:00',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('time');

        $this->postJson('/api/app/appointments', [
            'service_slug' => 'microblading',
            'date' => '2026-07-23',
            'time' => '12:00',
        ])->assertCreated();
    }

    public function test_a_service_longer_than_the_working_day_offers_nothing(): void
    {
        Service::factory()->create(['slug' => 'uzun-islem', 'is_active' => true, 'duration_min' => 600]);

        $this->actingAsAppUser()
            ->getJson('/api/app/slots?date=2026-07-23&service_slug=uzun-islem')
            ->assertOk()
            ->assertJsonPath('data.slots', ['10:00']);

        Service::factory()->create(['slug' => 'cok-uzun-islem', 'is_active' => true, 'duration_min' => 601]);

        $this->actingAsAppUser()
            ->getJson('/api/app/slots?date=2026-07-23&service_slug=cok-uzun-islem')
            ->assertOk()
            ->assertJsonPath('data.slots', []);
    }

    public function test_an_appointment_spilling_over_midnight_blocks_the_next_morning(): void
    {
        Service::factory()->create(['slug' => 'microblading', 'is_active' => true, 'duration_min' => 60]);
        // Çarşamba 23:30'da başlayıp Perşembe 10:30'a kadar süren blok (kapanış
        // dışı bir kayıt panelden elle girilebiliyor).
        Appointment::query()->create([
            'starts_at' => '2026-07-22 23:30:00',
            'duration_min' => 660,
            'status' => 'confirmed',
        ]);

        $this->actingAsAppUser()
            ->getJson('/api/app/slots?date=2026-07-23&service_slug=microblading')
            ->assertOk()
            ->assertJsonMissing(['10:00'])
            ->assertJsonPath('data.slots.0', '11:00');
    }

    public function test_slots_reject_an_unknown_or_inactive_service(): void
    {
        Service::factory()->create(['slug' => 'kapali-islem', 'is_active' => false, 'duration_min' => 60]);

        $this->actingAsAppUser()
            ->getJson('/api/app/slots?date=2026-07-23&service_slug=yok-boyle')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('service_slug');

        $this->actingAsAppUser()
            ->getJson('/api/app/slots?date=2026-07-23&service_slug=kapali-islem')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('service_slug');
    }

    public function test_public_service_list_exposes_the_duration(): void
    {
        Service::factory()->create(['slug' => 'microblading', 'is_active' => true, 'duration_min' => 100]);

        $this->getJson('/api/services')
            ->assertOk()
            ->assertJsonPath('data.0.duration_min', 100);
    }

    private function appUser(): AppUser
    {
        // Aynı test içinde birden fazla istek atıldığı için idempotent.
        return AppUser::query()->firstOrCreate(
            ['email' => 'mobil@example.com'],
            [
                'name' => 'Mobil Kullanıcı',
                'password' => 'password123',
                'phone' => '0555 000 00 00',
            ],
        );
    }

    private function actingAsAppUser(?AppUser $user = null): static
    {
        $user ??= $this->appUser();

        return $this->withToken($user->createToken('test-device')->plainTextToken);
    }
}
