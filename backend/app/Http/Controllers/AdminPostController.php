<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Post;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Throwable;

class AdminPostController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'slug' => ['required', 'string', 'max:190'],
            'title_tr' => ['required', 'string'],
            'title_en' => ['nullable', 'string'],
            'excerpt_tr' => ['nullable', 'string'],
            'excerpt_en' => ['nullable', 'string'],
            'body_tr' => ['required', 'string'],
            'body_en' => ['nullable', 'string'],
            'meta_title_tr' => ['nullable', 'string'],
            'meta_title_en' => ['nullable', 'string'],
            'meta_desc_tr' => ['nullable', 'string'],
            'meta_desc_en' => ['nullable', 'string'],
            'site' => ['nullable', 'string', Rule::in(array_keys(config('microsites', [])))],
            'category' => ['nullable', 'string'],
            'category_name_tr' => ['nullable', 'string'],
            'category_name_en' => ['nullable', 'string'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string'],
            'is_published' => ['nullable', 'boolean'],
            'published_at' => ['nullable', 'date'],
            'cover_url' => ['nullable', 'url'],
        ]);

        $coverPath = isset($data['cover_url'])
            ? $this->downloadCover($data['cover_url'], $data['slug'])
            : null;

        $category = null;
        if (isset($data['category'])) {
            $categoryNameTr = $data['category_name_tr'] ?? Str::headline($data['category']);
            $category = Category::firstOrCreate(
                ['slug' => $data['category']],
                [
                    'name_tr' => $categoryNameTr,
                    'name_en' => $data['category_name_en'] ?? $categoryNameTr,
                ]
            );
        }

        $attributes = [
            'site' => $data['site'] ?? null,
            'title_tr' => $data['title_tr'],
            'title_en' => $data['title_en'] ?? $data['title_tr'],
            'excerpt_tr' => $data['excerpt_tr'] ?? '',
            'excerpt_en' => $data['excerpt_en'] ?? $data['excerpt_tr'] ?? '',
            'body_tr' => $data['body_tr'],
            'body_en' => $data['body_en'] ?? $data['body_tr'],
            'category_id' => $category?->id,
            'meta_title_tr' => $data['meta_title_tr'] ?? null,
            'meta_title_en' => $data['meta_title_en'] ?? null,
            'meta_desc_tr' => $data['meta_desc_tr'] ?? null,
            'meta_desc_en' => $data['meta_desc_en'] ?? null,
            'is_published' => $data['is_published'] ?? true,
            'published_at' => $data['published_at'] ?? now(),
        ];

        if ($coverPath !== null) {
            $attributes['cover_path'] = $coverPath;
        }

        $post = Post::updateOrCreate(
            ['site' => $data['site'] ?? null, 'slug' => $data['slug']],
            $attributes
        );

        $tagIds = collect($data['tags'] ?? [])->map(function (string $name) {
            return Tag::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name_tr' => $name, 'name_en' => $name]
            )->id;
        });
        $post->tags()->sync($tagIds);

        return response()->json([
            'data' => [
                'id' => $post->id,
                'slug' => $post->slug,
                'site' => $post->site,
                'url' => '/blog/'.$post->slug,
            ],
        ], $post->wasRecentlyCreated ? 201 : 200);
    }

    public function destroy(string $slug, Request $request): JsonResponse
    {
        $post = Post::where('slug', $slug)
            ->where('site', $request->query('site'))
            ->firstOrFail();

        $post->delete();

        return response()->json(null, 204);
    }

    private function downloadCover(string $url, string $slug): string
    {
        if (! in_array(Str::lower((string) parse_url($url, PHP_URL_SCHEME)), ['http', 'https'], true)) {
            throw ValidationException::withMessages([
                'cover_url' => ['The cover URL must use HTTP or HTTPS.'],
            ]);
        }

        try {
            $response = Http::timeout(15)->get($url);
        } catch (Throwable) {
            throw ValidationException::withMessages([
                'cover_url' => ['The cover image could not be downloaded.'],
            ]);
        }

        if (! $response->successful()) {
            throw ValidationException::withMessages([
                'cover_url' => ['The cover image could not be downloaded.'],
            ]);
        }

        $contents = $response->body();
        if (strlen($contents) > 5 * 1024 * 1024) {
            throw ValidationException::withMessages([
                'cover_url' => ['The cover image may not be larger than 5 MB.'],
            ]);
        }

        $contentType = Str::lower(trim(Str::before((string) $response->header('Content-Type'), ';')));
        $extension = match ($contentType) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            default => null,
        };

        if ($extension === null) {
            throw ValidationException::withMessages([
                'cover_url' => ['The cover image must be a JPG, PNG, or WebP image.'],
            ]);
        }

        $path = 'covers/'.$slug.'-'.now()->timestamp.'.'.$extension;

        try {
            if (! Storage::disk('public')->put($path, $contents)) {
                throw new \RuntimeException;
            }
        } catch (Throwable) {
            throw ValidationException::withMessages([
                'cover_url' => ['The cover image could not be stored.'],
            ]);
        }

        return $path;
    }
}
