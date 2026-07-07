<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('phone', 40);
            $table->string('email', 160)->nullable();
            $table->string('service', 80)->nullable();
            $table->date('preferred_date')->nullable();
            $table->text('message')->nullable();
            $table->string('locale', 5)->default('tr');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
