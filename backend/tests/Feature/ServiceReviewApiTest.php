<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\ServiceReview;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceReviewApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_service_without_reviews_has_null_rating_and_empty_list(): void
    {
        Service::factory()->create(['slug' => 'plain', 'is_active' => true]);

        $this->getJson('/api/services')
            ->assertOk()
            ->assertJsonPath('data.0.rating_avg', null)
            ->assertJsonPath('data.0.rating_count', 0);

        $this->getJson('/api/services/plain')
            ->assertOk()
            ->assertJsonPath('data.rating_avg', null)
            ->assertJsonPath('data.rating_count', 0)
            ->assertJsonPath('data.reviews', []);
    }

    public function test_only_active_reviews_count_toward_average(): void
    {
        $service = Service::factory()->create(['slug' => 'rated', 'is_active' => true]);

        $service->reviews()->createMany([
            ['author_name' => 'A', 'rating' => 5, 'body' => 'a', 'is_active' => true],
            ['author_name' => 'B', 'rating' => 4, 'body' => 'b', 'is_active' => true],
            ['author_name' => 'C', 'rating' => 4, 'body' => 'c', 'is_active' => true],
            ['author_name' => 'D', 'rating' => 1, 'body' => 'd', 'is_active' => false],
        ]);

        $this->getJson('/api/services')
            ->assertOk()
            ->assertJsonPath('data.0.rating_avg', 4.3)
            ->assertJsonPath('data.0.rating_count', 3);

        $this->getJson('/api/services/rated')
            ->assertOk()
            ->assertJsonPath('data.rating_avg', 4.3)
            ->assertJsonPath('data.rating_count', 3)
            ->assertJsonCount(3, 'data.reviews');
    }

    public function test_review_ordering_and_field_shape(): void
    {
        $service = Service::factory()->create(['slug' => 'ordered', 'is_active' => true]);

        $service->reviews()->createMany([
            ['author_name' => 'Later sort', 'rating' => 3, 'body' => 'z', 'sort_order' => 1, 'reviewed_at' => '2026-01-01'],
            ['author_name' => 'Older', 'rating' => 4, 'body' => 'y', 'sort_order' => 0, 'reviewed_at' => '2026-05-01'],
            ['author_name' => 'Newer', 'rating' => 5, 'body' => 'x', 'sort_order' => 0, 'reviewed_at' => '2026-06-01',
                'body_en' => 'x-en', 'source' => 'google', 'source_url' => 'https://maps.example/1'],
        ]);

        $res = $this->getJson('/api/services/ordered')->assertOk();

        // sort_order ASC, then reviewed_at DESC
        $res->assertJsonPath('data.reviews.0.author_name', 'Newer');
        $res->assertJsonPath('data.reviews.1.author_name', 'Older');
        $res->assertJsonPath('data.reviews.2.author_name', 'Later sort');

        $res->assertJsonPath('data.reviews.0', [
            'author_name' => 'Newer',
            'rating' => 5,
            'body' => 'x',
            'body_en' => 'x-en',
            'source' => 'google',
            'source_url' => 'https://maps.example/1',
            'reviewed_at' => '2026-06-01',
        ]);
    }

    public function test_settings_expose_google_rating_fields_as_null_when_unset(): void
    {
        \App\Models\Setting::factory()->create();

        $this->getJson('/api/settings')
            ->assertOk()
            ->assertJsonPath('data.google_rating', null)
            ->assertJsonPath('data.google_review_count', null)
            ->assertJsonPath('data.google_maps_url', null)
            ->assertJsonPath('data.google_reviews_synced_at', null);
    }
}
