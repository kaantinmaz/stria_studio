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
        Setting::current()->update(['phone' => '+90 507 732 30 26']);

        $this->getJson('/api/settings')
            ->assertOk()
            ->assertJsonPath('data.phone', '+90 507 732 30 26')
            ->assertJsonStructure(['data' => ['whatsapp', 'lat', 'lng', 'hours', 'address']]);
    }
}
