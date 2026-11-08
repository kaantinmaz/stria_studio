<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\SearchQuery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * content:write otomatik konu seçimi: aynı sorgu ikinci kez yazılmamalı ve
 * kaldırılmış hizmetlerin sorguları hiç seçilmemeli. (2026-10-27 → 11-05
 * arasında "kalıcı aylaynır ne kadar sürer" her gün yeniden yazıldı.)
 */
class ContentWriteSelectionTest extends TestCase
{
    use RefreshDatabase;

    private const PERIOD = '2026-11';

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.telegram.bot_token' => null,
            'services.telegram.chat_id' => null,
            'services.indexnow.key' => null,
            // Gerçek claude CLI asla çağrılmasın; üretim adımı başarısız olur,
            // seçim kararı çıktıdaki "Hedef sorgu" satırından okunur.
            'content.claude.binary' => '/nonexistent/claude',
            'content.post.excluded_terms' => ['eyeliner', 'aylayn', 'dipliner'],
        ]);
    }

    private function makePost(string $slug, string $title, ?string $sourceQuery): void
    {
        Post::create([
            'site' => null,
            'slug' => $slug,
            'title_tr' => $title,
            'title_en' => $title,
            'excerpt_tr' => '',
            'excerpt_en' => '',
            'body_tr' => '<p>x</p>',
            'body_en' => '<p>x</p>',
            'is_published' => false,
            'published_at' => now(),
            'source_query' => $sourceQuery,
        ]);
    }

    public function test_query_already_written_is_not_picked_again_even_if_title_does_not_match(): void
    {
        config(['content.post.excluded_terms' => []]);
        // Başlıkta "Eyeliner", sorguda yazım hatalı "aylaynır": token eşleşmesi
        // bunu yakalayamaz; source_query yakalamalı (yazı yayında olmasa bile).
        $this->makePost('kalici-eyeliner-ne-kadar-surer', 'Kalıcı Eyeliner Ne Kadar Sürer?', 'kalici aylaynir ne kadar surer');
        SearchQuery::create(['query' => 'kalıcı aylaynır ne kadar sürer', 'period' => self::PERIOD, 'impressions' => 500]);
        SearchQuery::create(['query' => 'kaş laminasyonu kaç gün kalıcı', 'period' => self::PERIOD, 'impressions' => 40]);

        $this->artisan('content:write', ['--no-alert' => true])
            ->doesntExpectOutputToContain('Hedef sorgu: kalıcı aylaynır ne kadar sürer')
            ->expectsOutputToContain('Hedef sorgu: kaş laminasyonu kaç gün kalıcı');
    }

    public function test_excluded_service_queries_are_never_picked(): void
    {
        SearchQuery::create(['query' => 'kalıcı aylaynır ne kadar sürer', 'period' => self::PERIOD, 'impressions' => 500]);
        SearchQuery::create(['query' => 'dipliner kaç yıl kalır', 'period' => self::PERIOD, 'impressions' => 300]);
        SearchQuery::create(['query' => 'kaş laminasyonu kaç gün kalıcı', 'period' => self::PERIOD, 'impressions' => 40]);

        $this->artisan('content:write', ['--no-alert' => true])
            ->doesntExpectOutputToContain('Hedef sorgu: kalıcı aylaynır')
            ->doesntExpectOutputToContain('Hedef sorgu: dipliner')
            ->expectsOutputToContain('Hedef sorgu: kaş laminasyonu kaç gün kalıcı');
    }

    public function test_explicit_query_that_was_already_written_is_refused(): void
    {
        $this->makePost('kas-laminasyonu-kac-gun', 'Kaş Laminasyonu Kaç Gün Kalıcı?', 'kas laminasyonu kac gun kalici');

        $this->artisan('content:write', ['query' => 'Kaş laminasyonu kaç gün kalıcı', '--no-alert' => true])
            ->expectsOutputToContain('zaten yazı üretildi: /blog/kas-laminasyonu-kac-gun')
            ->assertFailed();

        $this->assertSame(1, Post::count());
    }
}
