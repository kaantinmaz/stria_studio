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
            [
                'slug' => 'catlak-gizleme',
                'name' => 'Çatlak Gizleme',
                'desc' => 'Çatlaklar cilt tonuna uygun pigmentlerle kamufle edilir.',
                'seo_title' => 'Çatlak Gizleme Ankara | Doğal Cilt Tonu',
                'seo_desc' => "Ankara'da çatlak gizleme uygulamasıyla renk farkını cilt tonunuza özel pigmentlerle kamufle edin. Stria Studio'da ön görüşme için hemen iletişime geçin.",
                'intro' => "Çatlak gizleme, ciltteki açık renkli çatlak çizgileri ile çevre doku arasındaki ton farkını azaltmayı amaçlayan bir kamuflaj uygulamasıdır. Özellikle rengi oturmuş, hipopigmente çatlakların daha bütünlüklü ve doğal görünmesine yardımcı olur.\n\nStria Studio'da önce çatlağın dokusu ve cildin alt tonu incelenir. Kişiye özel hazırlanan medikal pigment, steril ve tek kullanımlık ekipmanla kontrollü katmanlar hâlinde uygulanır; iyileşme sonrasında renk uyumu yeniden değerlendirilir.",
                'gallery' => [],
                'benefits' => [
                    'Açık renkli çatlaklarla çevre cilt arasındaki kontrastı azaltır',
                    'Karın, kalça, basen ve bacak bölgelerine uyarlanabilir',
                    'Cildin alt tonuna göre kişisel pigment karışımı hazırlanır',
                    'Makyajla günlük kapatma ihtiyacını azaltmaya yardımcı olur',
                ],
                'faq' => [
                    ['q' => 'Çatlak gizleme kaç seans sürer?', 'a' => 'Çatlağın genişliği, rengi ve cildin pigmenti tutma biçimine göre genellikle birden fazla seans planlanabilir; net plan ön görüşmede oluşturulur.'],
                    ['q' => 'Yeni ve kırmızı çatlaklara uygulanır mı?', 'a' => 'Kamuflaj için çoğunlukla rengi oturmuş, açık tonlu çatlaklar tercih edilir. Yeni veya aktif görünümlü çatlakların önce olgunlaşması beklenebilir.'],
                    ['q' => 'İyileşirken renk nasıl görünür?', 'a' => 'İlk günlerde pigment daha koyu veya sıcak görünebilir. Kabuklanma azaldıkça ton yumuşar ve nihai uyum birkaç hafta içinde değerlendirilir.'],
                    ['q' => 'Sonuç doğal görünür mü?', 'a' => 'Amaç çatlağın dokusunu yok etmek değil, renk farkını azaltmaktır. Doğallık; doğru alt ton seçimi ve kontrollü pigment katmanlarıyla desteklenir.'],
                ],
            ],
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

    public function test_subservice_gallery_paths_are_mapped_to_public_urls(): void
    {
        Service::factory()->create([
            'slug' => 'subservice-gallery',
            'is_active' => true,
            'subservices_tr' => [
                [
                    'slug' => 'catlak-gizleme',
                    'gallery' => ['subservices/x.png', '/images/works/catlak-gizleme-1.png'],
                ],
                [
                    'slug' => 'empty-gallery',
                ],
            ],
        ]);

        $this->getJson('/api/services/subservice-gallery')
            ->assertOk()
            ->assertJsonPath('data.subservices_tr.0.gallery', [
                asset('storage/subservices/x.png'),
                '/images/works/catlak-gizleme-1.png',
            ])
            ->assertJsonPath('data.subservices_tr.1.gallery', []);
    }

    public function test_inactive_service_is_404(): void
    {
        Service::factory()->create(['slug' => 'off', 'is_active' => false]);
        $this->getJson('/api/services/off')->assertNotFound();
    }
}
