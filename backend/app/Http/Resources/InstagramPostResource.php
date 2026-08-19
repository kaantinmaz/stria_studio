<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class InstagramPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->ig_id,
            'permalink' => $this->permalink,
            'media_type' => $this->media_type,
            'caption' => $this->caption,
            'image' => $this->image && ! Str::startsWith($this->image, ['http://', 'https://', '/'])
                ? asset('storage/'.$this->image)
                : $this->image,
            'posted_at' => $this->posted_at?->toIso8601String(),
        ];
    }
}
