<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'phone' => $this->phone,
            'phone_local' => $this->phone_local,
            'whatsapp' => $this->whatsapp,
            'instagram' => $this->instagram,
            'instagram_handle' => $this->instagram_handle,
            'address' => $this->address,
            'street_address' => $this->street_address,
            'locality' => $this->locality,
            'region' => $this->region,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'hours' => $this->hours ?? [],
        ];
    }
}
