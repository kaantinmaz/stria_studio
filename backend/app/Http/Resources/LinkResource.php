<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LinkResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'label_tr' => $this->label_tr,
            'label_en' => $this->label_en,
            'subtitle_tr' => $this->subtitle_tr,
            'subtitle_en' => $this->subtitle_en,
            'url' => $this->url,
            'icon' => $this->icon,
            'is_featured' => $this->is_featured,
        ];
    }
}
