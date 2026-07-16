<?php

namespace Tests\Feature;

use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_list_returns_active_ordered(): void
    {
        Service::factory()->create(['slug' => 'hidden', 'is_active' => false]);
        Service::factory()->create(['slug' => 'second', 'is_active' => true, 'sort_order' => 2]);
        Service::factory()->create(['slug' => 'first', 'is_active' => true, 'sort_order' => 1]);

        $res = $this->getJson('/api/services');

        $res->assertOk()->assertJsonCount(2, 'data');
        $res->assertJsonPath('data.0.slug', 'first');
        $res->assertJsonPath('data.1.slug', 'second');
    }

    public function test_single_service_full_shape(): void
    {
        Service::factory()->create(['slug' => 'micro', 'is_active' => true, 'benefits_tr' => ['x']]);

        $this->getJson('/api/services/micro')
            ->assertOk()
            ->assertJsonPath('data.slug', 'micro')
            ->assertJsonPath('data.image', '/images/micro.png')
            ->assertJsonStructure(['data' => ['intro_tr', 'benefits_tr', 'faq_tr', 'gallery', 'related']]);
    }

    public function test_uploaded_image_path_becomes_storage_url(): void
    {
        Service::factory()->create(['slug' => 'up', 'is_active' => true, 'image' => 'services/x.png']);

        $this->getJson('/api/services/up')
            ->assertOk()
            ->assertJsonPath('data.image', asset('storage/services/x.png'));
    }

    public function test_single_service_returns_absolute_hero_image_urls(): void
    {
        Service::factory()->create([
            'slug' => 'hero',
            'is_active' => true,
            'hero_images' => ['services/hero-one.png', 'https://cdn.example.com/hero-two.png'],
        ]);

        $this->getJson('/api/services/hero')
            ->assertOk()
            ->assertJsonPath('data.hero_images', [
                asset('storage/services/hero-one.png'),
                'https://cdn.example.com/hero-two.png',
            ]);
    }

    public function test_single_service_returns_empty_hero_images_when_column_is_null(): void
    {
        Service::factory()->create([
            'slug' => 'no-hero',
            'is_active' => true,
            'hero_images' => null,
        ]);

        $this->getJson('/api/services/no-hero')
            ->assertOk()
            ->assertJsonPath('data.hero_images', []);
    }

    public function test_single_service_returns_subservices(): void
    {
        $subservices = [
            ['name' => 'Çatlak Gizleme', 'desc' => 'Çatlaklar cilt tonuna uygun pigmentlerle kamufle edilir.'],
        ];

        Service::factory()->create([
            'slug' => 'camouflage',
            'is_active' => true,
            'subservices_tr' => $subservices,
        ]);

        $this->getJson('/api/services/camouflage')
            ->assertOk()
            ->assertJsonPath('data.subservices_tr', $subservices);
    }

    public function test_single_service_returns_empty_subservices_when_column_is_null(): void
    {
        Service::factory()->create([
            'slug' => 'no-subservices',
            'is_active' => true,
            'subservices_tr' => null,
        ]);

        $this->getJson('/api/services/no-subservices')
            ->assertOk()
            ->assertJsonPath('data.subservices_tr', []);
    }

    public function test_inactive_service_is_404(): void
    {
        Service::factory()->create(['slug' => 'off', 'is_active' => false]);
        $this->getJson('/api/services/off')->assertNotFound();
    }
}
