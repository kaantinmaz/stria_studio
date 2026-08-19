<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\AppUser;
use App\Models\Campaign;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();

        parent::tearDown();
    }

    public function test_feed_merges_announcements_and_campaigns_newest_first(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        $announcement = Announcement::query()->create([
            'title' => 'Bayram Tatili',
            'body' => '20-23 Temmuz kapalıyız.',
            'is_active' => true,
        ]);

        CarbonImmutable::setTestNow('2026-07-17 12:00:00');
        $campaign = Campaign::query()->create([
            'title' => 'Yaz Kampanyası',
            'kind' => 'promo',
            'description' => 'Microblading %20 indirimli.',
            'is_active' => true,
        ]);

        $response = $this->actingAsAppUser()->getJson('/api/app/notifications')->assertOk();

        $response
            ->assertJsonPath('data.unread', 2)
            // Kampanya duyurudan sonra oluştu → başta.
            ->assertJsonPath('data.items.0.id', 'campaign-'.$campaign->id)
            ->assertJsonPath('data.items.0.kind', 'campaign')
            ->assertJsonPath('data.items.0.title', 'Yaz Kampanyası')
            ->assertJsonPath('data.items.0.body', 'Microblading %20 indirimli.')
            ->assertJsonPath('data.items.0.is_new', true)
            ->assertJsonPath('data.items.1.id', 'announcement-'.$announcement->id)
            ->assertJsonPath('data.items.1.kind', 'announcement')
            ->assertJsonPath('data.items.1.is_new', true);
    }

    public function test_marking_seen_clears_the_unread_count_until_something_new_arrives(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        Announcement::query()->create(['title' => 'Eski', 'body' => 'Eski duyuru', 'is_active' => true]);
        $user = $this->appUser();

        $this->actingAsAppUser($user)->getJson('/api/app/notifications')->assertJsonPath('data.unread', 1);

        CarbonImmutable::setTestNow('2026-07-17 10:00:00');
        $this->actingAsAppUser($user)->postJson('/api/app/notifications/seen')
            ->assertOk()
            ->assertJsonPath('data.unread', 0);

        $this->actingAsAppUser($user)->getJson('/api/app/notifications')
            ->assertJsonPath('data.unread', 0)
            ->assertJsonPath('data.items.0.is_new', false);

        // Sonradan yayınlanan duyuru yeniden okunmamış sayılır.
        CarbonImmutable::setTestNow('2026-07-17 11:00:00');
        Announcement::query()->create(['title' => 'Yeni', 'body' => 'Yeni duyuru', 'is_active' => true]);

        $this->actingAsAppUser($user)->getJson('/api/app/notifications')
            ->assertJsonPath('data.unread', 1)
            ->assertJsonPath('data.items.0.title', 'Yeni')
            ->assertJsonPath('data.items.0.is_new', true)
            ->assertJsonPath('data.items.1.is_new', false);
    }

    public function test_feed_hides_inactive_and_out_of_window_records(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        Announcement::query()->create(['title' => 'Kapalı', 'body' => 'x', 'is_active' => false]);
        Announcement::query()->create([
            'title' => 'Bitmiş',
            'body' => 'x',
            'is_active' => true,
            'ends_at' => '2026-07-16',
        ]);
        Announcement::query()->create([
            'title' => 'Henüz Başlamamış',
            'body' => 'x',
            'is_active' => true,
            'starts_at' => '2026-07-18',
        ]);
        Campaign::query()->create([
            'title' => 'Pasif Kampanya',
            'kind' => 'promo',
            'is_active' => false,
        ]);
        Announcement::query()->create(['title' => 'Görünen', 'body' => 'x', 'is_active' => true]);

        $this->actingAsAppUser()->getJson('/api/app/notifications')
            ->assertOk()
            ->assertJsonCount(1, 'data.items')
            ->assertJsonPath('data.items.0.title', 'Görünen');
    }

    public function test_me_endpoint_carries_the_unread_count_for_the_badge(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        Announcement::query()->create(['title' => 'Duyuru', 'body' => 'x', 'is_active' => true]);
        $user = $this->appUser();

        $this->actingAsAppUser($user)->getJson('/api/app/me')
            ->assertOk()
            ->assertJsonPath('data.unread_notifications', 1);

        $this->actingAsAppUser($user)->postJson('/api/app/notifications/seen')->assertOk();

        $this->actingAsAppUser($user)->getJson('/api/app/me')
            ->assertJsonPath('data.unread_notifications', 0);
    }

    public function test_notifications_require_authentication(): void
    {
        $this->getJson('/api/app/notifications')->assertUnauthorized();
        $this->postJson('/api/app/notifications/seen')->assertUnauthorized();
    }

    private function appUser(): AppUser
    {
        return AppUser::query()->firstOrCreate(
            ['email' => 'mobil@example.com'],
            ['name' => 'Mobil Kullanıcı', 'password' => 'password123'],
        );
    }

    private function actingAsAppUser(?AppUser $user = null): static
    {
        $user ??= $this->appUser();

        return $this->withToken($user->createToken('test-device')->plainTextToken);
    }
}
