<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

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
            'campaign_enabled' => (bool) $this->campaign_enabled,
            'campaign_text_tr' => $this->campaign_text_tr,
            'campaign_text_en' => $this->campaign_text_en,
            'popup_enabled' => (bool) $this->popup_enabled,
            'popup_title_tr' => $this->popup_title_tr,
            'popup_title_en' => $this->popup_title_en,
            'popup_text_tr' => $this->popup_text_tr,
            'popup_text_en' => $this->popup_text_en,
            'popup_image' => $this->imageUrl($this->popup_image),
            'popup_cta_text_tr' => $this->popup_cta_text_tr,
            'popup_cta_text_en' => $this->popup_cta_text_en,
            'popup_cta_url' => $this->popup_cta_url,
            'header_code' => $this->header_code,
            'footer_code' => $this->footer_code,
            'google_rating' => $this->google_rating !== null ? (float) $this->google_rating : null,
            'google_review_count' => $this->google_review_count !== null ? (int) $this->google_review_count : null,
            'google_maps_url' => $this->google_maps_url,
            'google_reviews_synced_at' => $this->google_reviews_synced_at?->toIso8601String(),
        ];
    }

    protected function imageUrl(?string $p): ?string
    {
        if (! $p) {
            return null;
        }

        return Str::startsWith($p, ['http://', 'https://', '/'])
            ? $p
            : asset('storage/'.$p);
    }
}
