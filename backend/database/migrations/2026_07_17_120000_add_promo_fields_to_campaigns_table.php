<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->string('kind')->default('loyalty')->index()->after('title');
            $table->text('description')->nullable()->after('kind');
            $table->string('image')->nullable()->after('description');
            $table->date('starts_at')->nullable()->after('is_active');
            $table->date('ends_at')->nullable()->after('starts_at');
            $table->decimal('old_price', 10, 2)->nullable()->after('ends_at');
            $table->decimal('new_price', 10, 2)->nullable()->after('old_price');
        });

        Schema::table('campaigns', function (Blueprint $table) {
            $table->unsignedTinyInteger('nth')->nullable()->change();
            $table->unsignedTinyInteger('discount_percent')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->unsignedTinyInteger('nth')->nullable(false)->change();
            $table->unsignedTinyInteger('discount_percent')->nullable(false)->change();
        });

        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropIndex(['kind']);
            $table->dropColumn([
                'kind',
                'description',
                'image',
                'starts_at',
                'ends_at',
                'old_price',
                'new_price',
            ]);
        });
    }
};
