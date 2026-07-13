<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title_tr' => $this->title_tr,
            'title_en' => $this->title_en,
            'excerpt_tr' => $this->excerpt_tr,
            'excerpt_en' => $this->excerpt_en,
            'cover_url' => $this->cover_path ? asset('storage/'.$this->cover_path) : null,
            'published_at' => $this->published_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'category' => $this->whenLoaded('category', fn () => $this->category ? [
                'slug' => $this->category->slug,
                'name_tr' => $this->category->name_tr,
                'name_en' => $this->category->name_en,
            ] : null),
            'tags' => $this->whenLoaded('tags', fn () => $this->tags->map(fn ($t) => [
                'slug' => $t->slug, 'name_tr' => $t->name_tr, 'name_en' => $t->name_en,
            ])),
        ];
    }
}
