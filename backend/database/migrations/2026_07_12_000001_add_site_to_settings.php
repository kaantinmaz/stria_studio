<?php

use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Per-site settings. Until now `settings` held one shared row (Setting::current(),
// id=1) reused by every microsite. Each site now gets its own row so NAP, campaign
// bar and code injection can differ per domain. NULL `site` = the main site.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->string('site')->nullable()->unique()->after('id');
        });

        // Existing row (id=1) becomes the main site (site = NULL, already the default).
        // Seed one row per microsite, copied from the main row so each site starts
        // identical to today's shared values; the owner then customizes per site.
        $main = Setting::whereNull('site')->first();
        $base = $main ? collect($main->attributesToArray())
            ->except(['id', 'site', 'created_at', 'updated_at'])
            ->all() : [];

        foreach (array_keys(config('microsites', [])) as $slug) {
            Setting::firstOrCreate(['site' => $slug], $base);
        }
    }

    public function down(): void
    {
        Setting::whereNotNull('site')->delete();

        Schema::table('settings', function (Blueprint $table) {
            $table->dropUnique(['site']);
            $table->dropColumn('site');
        });
    }
};
