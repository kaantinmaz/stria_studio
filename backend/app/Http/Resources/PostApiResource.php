<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class PostApiResource extends PostListResource
{
    public function toArray(Request $request): array
    {
        return parent::toArray($request) + [
            'body_tr' => $this->body_tr,
            'body_en' => $this->body_en,
            'meta_title_tr' => $this->meta_title_tr,
            'meta_title_en' => $this->meta_title_en,
            'meta_desc_tr' => $this->meta_desc_tr,
            'meta_desc_en' => $this->meta_desc_en,
        ];
    }
}
