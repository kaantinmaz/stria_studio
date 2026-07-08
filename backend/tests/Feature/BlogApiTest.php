<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BlogApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_list_returns_only_published(): void
    {
        Post::factory()->create(['is_published' => false, 'published_at' => now()->subDay()]);
        Post::factory()->create(['title_tr' => 'Yayında', 'is_published' => true, 'published_at' => now()->subDay()]);

        $res = $this->getJson('/api/posts');

        $res->assertOk()->assertJsonCount(1, 'data');
        $res->assertJsonPath('data.0.title_tr', 'Yayında');
    }

    public function test_single_published_post_by_slug(): void
    {
        $post = Post::factory()->create(['slug' => 'ilk-yazi', 'is_published' => true, 'published_at' => now()->subDay()]);

        $this->getJson('/api/posts/ilk-yazi')
            ->assertOk()
            ->assertJsonPath('data.slug', 'ilk-yazi')
            ->assertJsonStructure(['data' => ['body_tr', 'body_en', 'meta_title_tr']]);
    }

    public function test_unpublished_post_is_404(): void
    {
        Post::factory()->create(['slug' => 'gizli', 'is_published' => false]);
        $this->getJson('/api/posts/gizli')->assertNotFound();
    }

    public function test_category_filter(): void
    {
        $cat = Category::factory()->create(['slug' => 'bakim']);
        Post::factory()->create(['is_published' => true, 'published_at' => now()->subDay(), 'category_id' => $cat->id]);
        Post::factory()->create(['is_published' => true, 'published_at' => now()->subDay()]);

        $this->getJson('/api/posts?category=bakim')->assertOk()->assertJsonCount(1, 'data');
    }
}
