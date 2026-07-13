<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Post;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPostApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.admin_api.token' => 'test-token']);
    }

    public function test_request_without_token_is_unauthorized(): void
    {
        $this->postJson('/api/admin/posts', $this->postData())
            ->assertStatus(401)
            ->assertExactJson(['message' => 'Unauthorized.']);
    }

    public function test_request_with_wrong_token_is_unauthorized(): void
    {
        $this->withToken('wrong-token')
            ->postJson('/api/admin/posts', $this->postData())
            ->assertStatus(401)
            ->assertExactJson(['message' => 'Unauthorized.']);
    }

    public function test_empty_config_token_is_unauthorized(): void
    {
        config(['services.admin_api.token' => '']);

        $this->withHeader('Authorization', 'Bearer ')
            ->postJson('/api/admin/posts', $this->postData())
            ->assertStatus(401)
            ->assertExactJson(['message' => 'Unauthorized.']);
    }

    public function test_post_is_created_with_category_tags_and_english_fallbacks(): void
    {
        $response = $this->withToken('test-token')->postJson('/api/admin/posts', $this->postData([
            'category' => 'cilt-bakimi',
            'tags' => ['Bakım', 'Ankara'],
        ]));

        $response->assertCreated()
            ->assertJsonPath('data.slug', 'ilk-yazi')
            ->assertJsonPath('data.site', null)
            ->assertJsonPath('data.url', '/blog/ilk-yazi');

        $post = Post::with(['category', 'tags'])->sole();

        $this->assertSame('Türkçe Başlık', $post->title_en);
        $this->assertSame('Türkçe Özet', $post->excerpt_en);
        $this->assertSame('Türkçe İçerik', $post->body_en);
        $this->assertSame('Cilt Bakimi', $post->category->name_tr);
        $this->assertSame('Cilt Bakimi', $post->category->name_en);
        $this->assertSame(['ankara', 'bakim'], $post->tags->pluck('slug')->sort()->values()->all());
        $this->assertSame(1, Category::count());
        $this->assertSame(2, Tag::count());
        $this->assertTrue($post->is_published);
        $this->assertNotNull($post->published_at);
    }

    public function test_second_post_with_same_slug_and_site_updates_existing_post(): void
    {
        $this->withToken('test-token')
            ->postJson('/api/admin/posts', $this->postData())
            ->assertCreated();

        $this->withToken('test-token')
            ->postJson('/api/admin/posts', $this->postData(['title_tr' => 'Güncel Başlık']))
            ->assertOk();

        $this->assertSame(1, Post::count());
        $this->assertSame('Güncel Başlık', Post::sole()->title_tr);
    }

    public function test_unknown_site_is_rejected(): void
    {
        $this->withToken('test-token')
            ->postJson('/api/admin/posts', $this->postData(['site' => 'unknown-site']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('site');
    }

    public function test_valid_microsite_is_stored_on_post(): void
    {
        $site = array_key_first(config('microsites'));

        $this->withToken('test-token')
            ->postJson('/api/admin/posts', $this->postData(['site' => $site]))
            ->assertCreated()
            ->assertJsonPath('data.site', $site);

        $this->assertSame($site, Post::sole()->site);
    }

    public function test_delete_removes_post_and_unknown_slug_returns_not_found(): void
    {
        $this->withToken('test-token')
            ->postJson('/api/admin/posts', $this->postData())
            ->assertCreated();

        $this->withToken('test-token')
            ->deleteJson('/api/admin/posts/ilk-yazi')
            ->assertNoContent();

        $this->assertSame(0, Post::count());

        $this->withToken('test-token')
            ->deleteJson('/api/admin/posts/unknown-slug')
            ->assertNotFound();
    }

    private function postData(array $overrides = []): array
    {
        return array_merge([
            'slug' => 'ilk-yazi',
            'title_tr' => 'Türkçe Başlık',
            'excerpt_tr' => 'Türkçe Özet',
            'body_tr' => 'Türkçe İçerik',
        ], $overrides);
    }
}
