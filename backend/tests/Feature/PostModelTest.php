<?php

namespace Tests\Feature;

use App\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_published_scope_excludes_drafts_and_future(): void
    {
        Post::factory()->create(['is_published' => false, 'published_at' => now()->subDay()]);
        Post::factory()->create(['is_published' => true, 'published_at' => now()->addDay()]);
        $live = Post::factory()->create(['is_published' => true, 'published_at' => now()->subDay()]);

        $ids = Post::published()->pluck('id');

        $this->assertTrue($ids->contains($live->id));
        $this->assertCount(1, $ids);
    }
}
