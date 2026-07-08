<?php

namespace Tests\Feature;

use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_current_returns_single_row(): void
    {
        $a = Setting::current();
        $b = Setting::current();
        $this->assertSame($a->id, $b->id);
        $this->assertSame(1, Setting::count());
    }

    public function test_hours_casts_to_array(): void
    {
        $s = Setting::current();
        $s->update(['hours' => [['days' => ['Monday'], 'open' => '10:00', 'close' => '19:00']]]);
        $this->assertSame('10:00', $s->fresh()->hours[0]['open']);
    }
}
