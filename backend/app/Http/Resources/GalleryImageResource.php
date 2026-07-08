<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class GalleryImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'image' => $this->image && ! Str::startsWith($this->image, ['http://', 'https://', '/'])
                ? asset('storage/'.$this->image)
                : $this->image,
            'alt_tr' => $this->alt_tr,
            'alt_en' => $this->alt_en,
        ];
    }
}
