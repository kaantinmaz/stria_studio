<?php

namespace Tests\Feature;

use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceStaticAssetTest extends TestCase
{
    use RefreshDatabase;

    public function test_saving_an_empty_upload_field_keeps_the_static_asset_path(): void
    {
        $service = Service::factory()->create([
            'slug' => 'microblading',
            'image' => '/images/micro.png',
            'gallery' => ['/images/works/microblading-1.jpg'],
            'hero_images' => ['/images/hero-brows.png'],
        ]);

        // Filament FileUpload statik yolu çözemediği için formu boş gönderiyor.
        $service->update([
            'image' => null,
            'gallery' => [],
            'hero_images' => [],
            'duration_min' => 100,
        ]);

        $service->refresh();

        $this->assertSame('/images/micro.png', $service->image);
        $this->assertSame(['/images/works/microblading-1.jpg'], $service->gallery);
        $this->assertSame(['/images/hero-brows.png'], $service->hero_images);
        // Formdaki diğer alanlar normal şekilde kaydedilmeli.
        $this->assertSame(100, (int) $service->duration_min);
    }

    public function test_a_real_upload_still_replaces_the_static_asset(): void
    {
        $service = Service::factory()->create(['image' => '/images/micro.png']);

        $service->update(['image' => 'services/yeni-gorsel.png']);

        $this->assertSame('services/yeni-gorsel.png', $service->fresh()->image);
    }

    public function test_uploaded_paths_are_not_protected_and_can_be_cleared(): void
    {
        $service = Service::factory()->create([
            'image' => 'services/yuklenen.png',
            'gallery' => ['services/yuklenen-1.png'],
        ]);

        $service->update(['image' => null, 'gallery' => []]);
        $service->refresh();

        $this->assertNull($service->image);
        $this->assertSame([], $service->gallery);
    }
}
