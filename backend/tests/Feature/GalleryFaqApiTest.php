<?php

namespace Tests\Feature;

use App\Models\Faq;
use App\Models\GalleryImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GalleryFaqApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_gallery_returns_active_ordered(): void
    {
        GalleryImage::factory()->create(['is_active' => false]);
        GalleryImage::factory()->create(['alt_tr' => 'Two', 'is_active' => true, 'sort_order' => 2]);
        GalleryImage::factory()->create(['alt_tr' => 'One', 'is_active' => true, 'sort_order' => 1]);

        $res = $this->getJson('/api/gallery');
        $res->assertOk()->assertJsonCount(2, 'data');
        $res->assertJsonPath('data.0.alt_tr', 'One');
    }

    public function test_gallery_storage_image_absolute(): void
    {
        GalleryImage::factory()->create(['image' => 'gallery/x.png', 'is_active' => true]);
        $this->getJson('/api/gallery')->assertOk()
            ->assertJsonPath('data.0.image', asset('storage/gallery/x.png'));
    }

    public function test_faqs_returns_active_ordered(): void
    {
        Faq::factory()->create(['is_active' => false]);
        Faq::factory()->create(['q_tr' => 'Q2', 'is_active' => true, 'sort_order' => 2]);
        Faq::factory()->create(['q_tr' => 'Q1', 'is_active' => true, 'sort_order' => 1]);

        $this->getJson('/api/faqs')->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.q_tr', 'Q1')
            ->assertJsonStructure(['data' => [['q_tr', 'q_en', 'a_tr', 'a_en']]]);
    }
}
