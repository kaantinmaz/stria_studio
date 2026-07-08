<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FaqResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'q_tr' => $this->q_tr,
            'q_en' => $this->q_en,
            'a_tr' => $this->a_tr,
            'a_en' => $this->a_en,
        ];
    }
}
