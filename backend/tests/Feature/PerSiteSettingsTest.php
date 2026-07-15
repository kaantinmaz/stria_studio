<?php

namespace Tests\Feature;

use App\Filament\Pages\ManageSettings;
use App\Models\Setting;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class PerSiteSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_microsite_settings_are_isolated_from_main(): void
    {
        Setting::current()->update(['phone' => '+90 MAIN']);
        Setting::forSite('mikroblading-ankara')->update([
            'phone' => '+90 MIKRO',
            'campaign_enabled' => true,
            'popup_enabled' => true,
            'popup_title_tr' => 'Mikro pop-up',
            'popup_text_tr' => 'Mikro içerik',
            'popup_image' => 'popups/mikro.png',
            'popup_cta_text_tr' => 'Randevu al',
            'popup_cta_url' => 'https://wa.me/905000000000',
        ]);

        $this->getJson('/api/settings')
            ->assertOk()
            ->assertJsonPath('data.phone', '+90 MAIN')
            ->assertJsonStructure(['data' => ['campaign_enabled', 'campaign_text_tr', 'header_code', 'footer_code']]);

        $this->getJson('/api/microsites/mikroblading-ankara/settings')
            ->assertOk()
            ->assertJsonPath('data.phone', '+90 MIKRO')
            ->assertJsonPath('data.campaign_enabled', true)
            ->assertJsonPath('data.popup_enabled', true)
            ->assertJsonPath('data.popup_image', asset('storage/popups/mikro.png'))
            ->assertJsonStructure(['data' => [
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

        // A different microsite is unaffected by the mikroblading edit.
        $this->getJson('/api/microsites/kas-tasarimi-ankara/settings')
            ->assertOk()
            ->assertJsonPath('data.phone', null);
    }

    public function test_manage_settings_page_saves_the_selected_site_only(): void
    {
        Setting::current()->update(['phone' => '+90 MAIN']);
        $this->actingAs(User::factory()->create());
        Filament::setCurrentPanel(Filament::getPanel('admin'));

        Livewire::test(ManageSettings::class)
            ->fillForm(['editing_site' => 'mikroblading-ankara', 'phone' => '+90 SWITCHED'])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame('+90 SWITCHED', Setting::forSite('mikroblading-ankara')->fresh()->phone);
        // Main row untouched, and the switcher value never leaked into the `site` column.
        $this->assertSame('+90 MAIN', Setting::current()->fresh()->phone);
        $this->assertNull(Setting::current()->site);
    }
}
