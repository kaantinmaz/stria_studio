<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class ServiceListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'name_tr' => $this->name_tr,
            'name_en' => $this->name_en,
            'tag_tr' => $this->tag_tr,
            'tag_en' => $this->tag_en,
            'desc_tr' => $this->desc_tr,
            'desc_en' => $this->desc_en,
            'image' => $this->image && Str::startsWith($this->image, '/storage')
                ? asset(ltrim($this->image, '/'))
                : $this->image,
            'url' => '/hizmetler/'.$this->slug,
        ];
    }
}
