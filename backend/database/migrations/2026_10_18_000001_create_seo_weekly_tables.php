<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('search_queries', function (Blueprint $table) {
            // Sorgu için en çok tıklama/gösterim alan sayfa (gsc:sync).
            $table->string('top_page', 255)->nullable()->after('position');
            // 'gsc' = Search Console satırı, 'serp' = seo:weekly'nin SERP'ten
            // eklediği konu fikri (gösterim 0). Eski CSV satırları 'gsc'.
            $table->string('source', 8)->nullable()->default('gsc')->after('top_page');
        });

        Schema::create('search_pages', function (Blueprint $table) {
            $table->id();
            $table->string('page', 255);
            $table->unsignedInteger('clicks')->default(0);
            $table->unsignedInteger('impressions')->default(0);
            $table->decimal('ctr', 6, 4)->nullable();
            $table->decimal('position', 6, 2)->nullable();
            $table->string('period', 7);
            $table->timestamps();

            $table->unique(['page', 'period']);
        });

        Schema::create('serp_results', function (Blueprint $table) {
            $table->id();
            $table->string('query', 190);
            $table->string('period', 7);
            $table->unsignedSmallInteger('own_position')->nullable();
            $table->string('own_url', 255)->nullable();
            $table->json('top_results');
            $table->json('people_also_ask')->nullable();
            $table->json('related_searches')->nullable();
            $table->json('answer_box')->nullable();
            $table->json('places')->nullable();
            $table->unsignedInteger('credits')->nullable();
            $table->timestamps();

            $table->unique(['query', 'period']);
        });

        // Otomatik değişikliklerin önce/sonra kopyası (seo:revert ile geri alınır).
        Schema::create('content_revisions', function (Blueprint $table) {
            $table->id();
            $table->morphs('revisable');
            $table->string('period', 7)->nullable();
            $table->string('reason', 190);
            $table->json('before');
            $table->json('after')->nullable();
            $table->timestamp('reverted_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_revisions');
        Schema::dropIfExists('serp_results');
        Schema::dropIfExists('search_pages');

        Schema::table('search_queries', function (Blueprint $table) {
            $table->dropColumn(['top_page', 'source']);
        });
    }
};
