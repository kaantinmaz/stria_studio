<?php

namespace Tests\Feature;

use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_current_returns_the_single_main_row(): void
    {
        $a = Setting::current();
        $b = Setting::current();
        $this->assertSame($a->id, $b->id);
        // current() is the main site (site = NULL); per-site rows may also exist,
        // but there is exactly one main row and it is never duplicated.
        $this->assertNull($a->site);
        $this->assertSame(1, Setting::whereNull('site')->count());
    }

    public function test_hours_casts_to_array(): void
    {
        $s = Setting::current();
        $s->update(['hours' => [['days' => ['Monday'], 'open' => '10:00', 'close' => '19:00']]]);
        $this->assertSame('10:00', $s->fresh()->hours[0]['open']);
    }

    public function test_popup_enabled_casts_to_boolean(): void
    {
        $s = Setting::current();
        $s->update(['popup_enabled' => 1]);

        $this->assertTrue($s->fresh()->popup_enabled);
    }
}
