<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Scopes content to a microsite. NULL = main Stria site (unchanged behavior).
// A per-service SEO microsite (e.g. mikrobladingankara.com) reads only rows
// carrying its own `site` slug; the main site reads only NULL rows.
return new class extends Migration
{
    private array $tables = ['posts', 'faqs', 'gallery_images', 'leads'];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->string('site', 64)->nullable()->index()->after('id');
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->dropColumn('site');
            });
        }
    }
};
