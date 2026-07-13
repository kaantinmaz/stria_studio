<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Attribute analytics to a site so the dashboard can be filtered per microsite.
// NULL = main site (matches the `site` column convention on posts/faqs/leads).
// Existing rows stay NULL (pre-attribution history counts as main / all).
return new class extends Migration
{
    public function up(): void
    {
        foreach (['visits', 'events'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->string('site', 40)->nullable()->index()->after('visitor_id');
            });
        }
    }

    public function down(): void
    {
        foreach (['visits', 'events'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->dropColumn('site');
            });
        }
    }
};
