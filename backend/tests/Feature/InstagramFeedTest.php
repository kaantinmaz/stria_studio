<?php

namespace Tests\Feature;

use App\Models\InstagramPost;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class InstagramFeedTest extends TestCase
{
    use RefreshDatabase;

    private function makePost(array $attrs = []): InstagramPost
    {
        return InstagramPost::create(array_merge([
            'ig_id' => 'ig_'.Str::random(10),
            'permalink' => 'https://www.instagram.com/p/'.Str::random(6),
            'media_type' => 'IMAGE',
            'caption' => 'örnek açıklama',
            'image' => 'instagram/sample.jpg',
            'posted_at' => now(),
        ], $attrs));
    }

    public function test_index_returns_empty_data_when_no_posts(): void
    {
        $this->getJson('/api/instagram')
            ->assertOk()
            ->assertExactJson(['data' => []]);
    }

    public function test_index_orders_by_posted_at_descending_and_exposes_field_shape(): void
    {
        // caption null olabilir: null caption'lı kaydı da dahil ediyoruz.
        $this->makePost([
            'ig_id' => 'B',
            'permalink' => 'https://www.instagram.com/p/older',
            'media_type' => 'VIDEO',
            'caption' => null,
            'image' => 'instagram/B.jpg',
            'posted_at' => '2026-06-01 09:00:00',
        ]);
        $this->makePost([
            'ig_id' => 'A',
            'permalink' => 'https://www.instagram.com/p/newest',
            'media_type' => 'IMAGE',
            'caption' => 'en yeni',
            'image' => 'instagram/A.jpg',
            'posted_at' => '2026-06-03 09:00:00',
        ]);
        $this->makePost([
            'ig_id' => 'C',
            'permalink' => 'https://www.instagram.com/p/middle',
            'media_type' => 'IMAGE',
            'caption' => 'orta',
            'image' => 'instagram/C.jpg',
            'posted_at' => '2026-06-02 09:00:00',
        ]);

        $res = $this->getJson('/api/instagram')->assertOk();

        // posted_at AZALAN: A (03) -> C (02) -> B (01)
        $res->assertJsonPath('data.0.id', 'A');
        $res->assertJsonPath('data.1.id', 'C');
        $res->assertJsonPath('data.2.id', 'B');

        // Tam alan kümesi ve değerler (id = ig_id).
        $res->assertJsonPath('data.0', [
            'id' => 'A',
            'permalink' => 'https://www.instagram.com/p/newest',
            'media_type' => 'IMAGE',
            'caption' => 'en yeni',
            'image' => asset('storage/instagram/A.jpg'),
            // App timezone Europe/Istanbul (+03:00) -> ISO8601 bu offset ile döner.
            'posted_at' => '2026-06-03T09:00:00+03:00',
        ]);

        // caption null olarak taşınır.
        $res->assertJsonPath('data.2.caption', null);

        // image mutlak URL: asset('storage/...') ile başlar.
        $image = $res->json('data.0.image');
        $this->assertTrue(Str::startsWith($image, asset('storage/')), "image mutlak URL değil: {$image}");
    }

    public function test_index_respects_configured_limit(): void
    {
        config(['services.instagram.limit' => 2]);

        $this->makePost(['ig_id' => 'p1', 'posted_at' => '2026-06-01 09:00:00']);
        $this->makePost(['ig_id' => 'p2', 'posted_at' => '2026-06-02 09:00:00']);
        $this->makePost(['ig_id' => 'p3', 'posted_at' => '2026-06-03 09:00:00']);

        $this->getJson('/api/instagram')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            // En yeni ikisi dönmeli.
            ->assertJsonPath('data.0.id', 'p3')
            ->assertJsonPath('data.1.id', 'p2');
    }

    public function test_sync_fails_and_sends_nothing_when_credentials_missing(): void
    {
        config(['services.instagram.token' => null, 'services.instagram.user_id' => null]);
        Http::fake();

        $this->artisan('instagram:sync')->assertExitCode(1);

        // Kimlik yoksa ağa hiç çıkılmamalı.
        Http::assertNothingSent();
    }

    public function test_sync_stores_posts_and_downloads_images(): void
    {
        Storage::fake('public');
        config([
            'services.instagram.token' => 'test-token',
            'services.instagram.user_id' => '17841400000000000',
            'services.instagram.limit' => 12,
        ]);

        Http::fake([
            'graph.instagram.com/*' => Http::response([
                'data' => [
                    [
                        'id' => '111',
                        'caption' => 'ilk gönderi',
                        'media_type' => 'IMAGE',
                        'media_url' => 'https://cdn.example/image1.jpg',
                        'permalink' => 'https://www.instagram.com/p/one',
                        'timestamp' => '2026-06-03T10:00:00+0000',
                    ],
                    [
                        'id' => '222',
                        'caption' => null,
                        'media_type' => 'VIDEO',
                        // VIDEO'da media_url yok, thumbnail_url var.
                        'thumbnail_url' => 'https://cdn.example/thumb2.jpg',
                        'permalink' => 'https://www.instagram.com/p/two',
                        'timestamp' => '2026-06-02T10:00:00+0000',
                    ],
                ],
            ], 200),
            'cdn.example/*' => Http::response('fake-image-bytes', 200),
        ]);

        $this->artisan('instagram:sync')->assertExitCode(0);

        $this->assertSame(2, InstagramPost::query()->count());

        $image = InstagramPost::where('ig_id', '111')->first();
        $this->assertSame('IMAGE', $image->media_type);
        $this->assertSame('ilk gönderi', $image->caption);
        $this->assertSame('https://www.instagram.com/p/one', $image->permalink);
        $this->assertSame('instagram/111.jpg', $image->image);
        // Graph UTC timestamp'i uygulama saat dilimine çevrilerek yazılır:
        // 10:00+0000 => 13:00 Europe/Istanbul (mutlak an korunur).
        $this->assertSame('2026-06-03 13:00:00', $image->posted_at->format('Y-m-d H:i:s'));
        $this->assertSame('2026-06-03T13:00:00+03:00', $image->posted_at->toIso8601String());

        $video = InstagramPost::where('ig_id', '222')->first();
        $this->assertSame('VIDEO', $video->media_type);
        $this->assertNull($video->caption);
        $this->assertSame('instagram/222.jpg', $video->image);

        // Görseller fake disk'e indirilmiş olmalı.
        Storage::disk('public')->assertExists('instagram/111.jpg');
        Storage::disk('public')->assertExists('instagram/222.jpg');

        // VIDEO kaydı için indirilen kaynak thumbnail_url olmalı (media_url değil).
        Http::assertSent(fn ($request) => $request->url() === 'https://cdn.example/thumb2.jpg');
        Http::assertSent(fn ($request) => $request->url() === 'https://cdn.example/image1.jpg');
    }

    public function test_sync_leaves_existing_posts_untouched_on_api_error(): void
    {
        config([
            'services.instagram.token' => 'test-token',
            'services.instagram.user_id' => '17841400000000000',
        ]);

        $existing = $this->makePost([
            'ig_id' => 'keep-me',
            'image' => 'instagram/keep-me.jpg',
            'posted_at' => '2026-06-01 09:00:00',
        ]);

        Http::fake([
            'graph.instagram.com/*' => Http::response('Bad Request', 400),
        ]);

        $this->artisan('instagram:sync')->assertExitCode(1);

        // Hata sonrası mevcut kayıt silinmemeli/değişmemeli.
        $this->assertDatabaseHas('instagram_posts', [
            'ig_id' => 'keep-me',
            'image' => 'instagram/keep-me.jpg',
        ]);
        $this->assertSame(1, InstagramPost::query()->count());
        $this->assertTrue($existing->is($existing->fresh()));
    }

    public function test_sync_removes_posts_absent_from_feed_and_deletes_their_image(): void
    {
        Storage::fake('public');
        config([
            'services.instagram.token' => 'test-token',
            'services.instagram.user_id' => '17841400000000000',
        ]);

        // Eskiden indirilmiş, feed'de artık olmayan kayıt + disk'teki dosyası.
        Storage::disk('public')->put('instagram/stale.jpg', 'old-bytes');
        $this->makePost([
            'ig_id' => 'stale',
            'image' => 'instagram/stale.jpg',
            'posted_at' => '2026-05-01 09:00:00',
        ]);

        Http::fake([
            'graph.instagram.com/*' => Http::response([
                'data' => [
                    [
                        'id' => 'fresh',
                        'caption' => 'yeni',
                        'media_type' => 'IMAGE',
                        'media_url' => 'https://cdn.example/fresh.jpg',
                        'permalink' => 'https://www.instagram.com/p/fresh',
                        'timestamp' => '2026-06-05T10:00:00+0000',
                    ],
                ],
            ], 200),
            'cdn.example/*' => Http::response('fresh-bytes', 200),
        ]);

        $this->artisan('instagram:sync')->assertExitCode(0);

        // Stale kayıt ve görseli temizlenmeli.
        $this->assertDatabaseMissing('instagram_posts', ['ig_id' => 'stale']);
        Storage::disk('public')->assertMissing('instagram/stale.jpg');

        // Feed'deki yeni kayıt eklenmeli.
        $this->assertDatabaseHas('instagram_posts', ['ig_id' => 'fresh']);
        Storage::disk('public')->assertExists('instagram/fresh.jpg');
    }
}
