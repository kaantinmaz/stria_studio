<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Yazının üretildiği arama sorgusu (QueryCoverage::normalize ile). Başlık
 * token eşleşmesi yazım hatalı sorguları ("kalıcı aylaynır") tanımadığı için
 * aynı sorgu her gün yeniden yazılıyordu; artık bu sütun tekrarı engeller.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->string('source_query')->nullable()->index()->after('slug');
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex(['source_query']);
            $table->dropColumn('source_query');
        });
    }
};
