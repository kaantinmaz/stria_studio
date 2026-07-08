<?php

namespace App\Http\Controllers;

use App\Http\Resources\PostApiResource;
use App\Http\Resources\PostListResource;
use App\Models\Category;
use App\Models\Post;
use App\Models\Tag;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        $posts = Post::published()
            ->with(['category', 'tags'])
            ->when($request->query('category'), fn ($q, $slug) =>
                $q->whereHas('category', fn ($c) => $c->where('slug', $slug)))
            ->when($request->query('tag'), fn ($q, $slug) =>
                $q->whereHas('tags', fn ($t) => $t->where('slug', $slug)))
            ->orderByDesc('published_at')
            ->paginate(9);

        return PostListResource::collection($posts);
    }

    public function show(string $slug)
    {
        $post = Post::published()->with(['category', 'tags'])->where('slug', $slug)->firstOrFail();
        return new PostApiResource($post);
    }

    public function categories()
    {
        return response()->json(['data' => Category::orderBy('name_tr')
            ->get(['id', 'slug', 'name_tr', 'name_en'])]);
    }

    public function tags()
    {
        return response()->json(['data' => Tag::orderBy('name_tr')
            ->get(['id', 'slug', 'name_tr', 'name_en'])]);
    }
}
