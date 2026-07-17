<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\AppUser;
use App\Models\Campaign;
use App\Models\Service;
use App\Models\Setting;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CampaignScopeTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();

        parent::tearDown();
    }

    public function test_store_locks_campaign_and_accepts_appointment_date_outside_window(): void
    {
        // Today (17th) is within the campaign window even though the appointment (25th) is not.
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        $this->openAllDays();
        $service = Service::factory()->create(['slug' => 'microblading', 'is_active' => true]);
        $campaign = Campaign::query()->create([
            'title' => 'Haftaya Özel',
            'kind' => 'promo',
            'old_price' => 1000,
            'new_price' => 750,
            'starts_at' => '2026-07-13',
            'ends_at' => '2026-07-19',
            'is_active' => true,
            'service_ids' => [$service->id],
        ]);
        $user = $this->appUser();

        $response = $this->actingAsAppUser($user)->postJson('/api/app/appointments', [
            'service_slug' => 'microblading',
            'date' => '2026-07-25',
            'time' => '10:00',
            'campaign_id' => $campaign->id,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.status', 'requested');
        $this->assertDatabaseHas('appointments', [
            'id' => $response->json('data.id'),
            'service_id' => $service->id,
            'campaign_id' => $campaign->id,
        ]);
    }

    public function test_store_rejects_campaign_when_today_is_outside_window(): void
    {
        // Campaign ended yesterday relative to the creation day.
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        $this->openAllDays();
        $service = Service::factory()->create(['slug' => 'microblading', 'is_active' => true]);
        $campaign = Campaign::query()->create([
            'title' => 'Biten Kampanya',
            'kind' => 'promo',
            'new_price' => 750,
            'starts_at' => '2026-07-10',
            'ends_at' => '2026-07-16',
            'is_active' => true,
            'service_ids' => [$service->id],
        ]);
        $user = $this->appUser();

        $this->actingAsAppUser($user)->postJson('/api/app/appointments', [
            'service_slug' => 'microblading',
            'date' => '2026-07-25',
            'time' => '10:00',
            'campaign_id' => $campaign->id,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('campaign_id')
            ->assertJsonFragment(['campaign_id' => ['Kampanya artık geçerli değil.']]);
    }

    public function test_store_rejects_service_out_of_campaign_scope(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        $this->openAllDays();
        $inScope = Service::factory()->create(['slug' => 'microblading', 'is_active' => true]);
        $outScope = Service::factory()->create(['slug' => 'lash-lift', 'is_active' => true]);
        $campaign = Campaign::query()->create([
            'title' => 'Sınırlı Kampanya',
            'kind' => 'promo',
            'new_price' => 750,
            'starts_at' => '2026-07-13',
            'ends_at' => '2026-07-19',
            'is_active' => true,
            'service_ids' => [$inScope->id],
        ]);
        $user = $this->appUser();

        $this->actingAsAppUser($user)->postJson('/api/app/appointments', [
            'service_slug' => 'lash-lift',
            'date' => '2026-07-25',
            'time' => '10:00',
            'campaign_id' => $campaign->id,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('campaign_id')
            ->assertJsonFragment(['campaign_id' => ['Kampanya bu hizmet için geçerli değil.']]);
    }

    public function test_store_allows_any_service_when_scope_is_null(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        $this->openAllDays();
        Service::factory()->create(['slug' => 'lash-lift', 'is_active' => true]);
        $campaign = Campaign::query()->create([
            'title' => 'Tüm Hizmetler',
            'kind' => 'promo',
            'new_price' => 500,
            'starts_at' => '2026-07-13',
            'ends_at' => '2026-07-19',
            'is_active' => true,
            'service_ids' => null,
        ]);
        $user = $this->appUser();

        $response = $this->actingAsAppUser($user)->postJson('/api/app/appointments', [
            'service_slug' => 'lash-lift',
            'date' => '2026-07-25',
            'time' => '10:00',
            'campaign_id' => $campaign->id,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('appointments', [
            'id' => $response->json('data.id'),
            'campaign_id' => $campaign->id,
        ]);
    }

    public function test_index_returns_campaign_object(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        $service = Service::factory()->create(['slug' => 'microblading', 'is_active' => true]);
        $campaign = Campaign::query()->create([
            'title' => 'Haftaya Özel',
            'kind' => 'promo',
            'new_price' => 750,
            'is_active' => true,
        ]);
        $user = $this->appUser();
        Appointment::query()->create([
            'app_user_id' => $user->id,
            'service_id' => $service->id,
            'campaign_id' => $campaign->id,
            'starts_at' => '2026-07-25 10:00:00',
            'status' => 'requested',
        ]);

        $this->actingAsAppUser($user)->getJson('/api/app/appointments')
            ->assertOk()
            ->assertJsonPath('data.0.campaign.title', 'Haftaya Özel')
            ->assertJsonPath('data.0.campaign.new_price', '750.00');
    }

    public function test_index_campaign_is_null_without_campaign(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        $service = Service::factory()->create(['slug' => 'microblading', 'is_active' => true]);
        $user = $this->appUser();
        Appointment::query()->create([
            'app_user_id' => $user->id,
            'service_id' => $service->id,
            'starts_at' => '2026-07-25 10:00:00',
            'status' => 'requested',
        ]);

        $this->actingAsAppUser($user)->getJson('/api/app/appointments')
            ->assertOk()
            ->assertJsonPath('data.0.campaign', null);
    }

    public function test_campaigns_endpoint_returns_service_slugs(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        $scoped = Service::factory()->create(['slug' => 'microblading', 'is_active' => true]);
        Campaign::query()->create([
            'title' => 'Kapsamlı',
            'kind' => 'promo',
            'new_price' => 750,
            'starts_at' => '2026-07-13',
            'ends_at' => '2026-07-20',
            'is_active' => true,
            'service_ids' => [$scoped->id],
        ]);
        Campaign::query()->create([
            'title' => 'Tüm Hizmetler',
            'kind' => 'promo',
            'new_price' => 400,
            'starts_at' => '2026-07-13',
            'ends_at' => '2026-07-20',
            'is_active' => true,
            'service_ids' => null,
        ]);

        $this->actingAsAppUser()->getJson('/api/app/campaigns')
            ->assertOk()
            ->assertJsonPath('data.0.service_slugs', ['microblading'])
            ->assertJsonPath('data.1.service_slugs', null);
    }

    private function openAllDays(): void
    {
        Setting::forSite()->update([
            'hours' => [[
                'days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                'open' => '10:00',
                'close' => '19:00',
            ]],
        ]);
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
