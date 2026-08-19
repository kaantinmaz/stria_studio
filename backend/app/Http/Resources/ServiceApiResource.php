<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class ServiceApiResource extends ServiceListResource
{
    public function toArray(Request $request): array
    {
        return parent::toArray($request) + [
            'seo_title_tr' => $this->seo_title_tr,
            'seo_title_en' => $this->seo_title_en,
            'seo_desc_tr' => $this->seo_desc_tr,
            'seo_desc_en' => $this->seo_desc_en,
            'keywords_tr' => $this->keywords_tr ?? [],
            'keywords_en' => $this->keywords_en ?? [],
            'intro_tr' => $this->intro_tr,
            'intro_en' => $this->intro_en,
            'aftercare_tr' => $this->aftercare_tr,
            'aftercare_en' => $this->aftercare_en,
            'benefits_tr' => $this->benefits_tr ?? [],
            'benefits_en' => $this->benefits_en ?? [],
            'process_tr' => $this->process_tr ?? [],
            'process_en' => $this->process_en ?? [],
            'faq_tr' => $this->faq_tr ?? [],
            'faq_en' => $this->faq_en ?? [],
            'subservices_tr' => collect($this->subservices_tr ?? [])->map(fn (array $item): array => [
                ...$item,
                'gallery' => collect($item['gallery'] ?? [])->map(fn ($p) => $this->imageUrl($p))->values()->all(),
            ])->values()->all(),
            'hero_images' => collect($this->hero_images ?? [])->map(fn ($p) => $this->imageUrl($p))->values()->all(),
            'gallery' => collect($this->gallery ?? [])->map(fn ($p) => $this->imageUrl($p))->values()->all(),
            'related' => $this->related ?? [],
            'reviews' => ServiceReviewResource::collection($this->reviews),
        ];
    }
}
