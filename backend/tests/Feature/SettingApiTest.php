<?php

namespace Tests\Feature;

use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_settings_object(): void
    {
        Setting::current()->update([
            'phone' => '+90 507 732 30 26',
            'popup_enabled' => true,
            'popup_title_tr' => 'Yeni kampanya',
            'popup_title_en' => 'New campaign',
            'popup_text_tr' => 'Detaylar burada.',
            'popup_text_en' => 'Details here.',
            'popup_image' => 'popups/campaign.png',
            'popup_cta_text_tr' => 'İncele',
            'popup_cta_text_en' => 'View',
            'popup_cta_url' => 'https://wa.me/905000000000',
        ]);

        $this->getJson('/api/settings')
            ->assertOk()
            ->assertJsonPath('data.phone', '+90 507 732 30 26')
            ->assertJsonPath('data.popup_enabled', true)
            ->assertJsonPath('data.popup_title_tr', 'Yeni kampanya')
            ->assertJsonPath('data.popup_title_en', 'New campaign')
            ->assertJsonPath('data.popup_text_tr', 'Detaylar burada.')
            ->assertJsonPath('data.popup_text_en', 'Details here.')
            ->assertJsonPath('data.popup_image', asset('storage/popups/campaign.png'))
            ->assertJsonPath('data.popup_cta_text_tr', 'İncele')
            ->assertJsonPath('data.popup_cta_text_en', 'View')
            ->assertJsonPath('data.popup_cta_url', 'https://wa.me/905000000000')
            ->assertJsonStructure(['data' => [
                'whatsapp',
                'lat',
                'lng',
                'hours',
                'address',
                'popup_enabled',
                'popup_title_tr',
                'popup_title_en',
                'popup_text_tr',
                'popup_text_en',
                'popup_image',
                'popup_cta_text_tr',
                'popup_cta_text_en',
                'popup_cta_url',
            ]]);
    }
}
