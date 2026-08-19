<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'author_name' => $this->author_name,
            'rating' => (int) $this->rating,
            'body' => $this->body,
            'body_en' => $this->body_en,
            'source' => $this->source,
            'source_url' => $this->source_url,
            'reviewed_at' => $this->reviewed_at?->format('Y-m-d'),
        ];
    }
}
