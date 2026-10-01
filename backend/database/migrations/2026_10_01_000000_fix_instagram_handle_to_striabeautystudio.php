<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $oldUrls = [
            'https://instagram.com/striastudio',
            'https://instagram.com/striastudio/',
            'https://www.instagram.com/striastudio',
            'https://www.instagram.com/striastudio/',
        ];

        DB::table('settings')
            ->where(function ($q) use ($oldUrls) {
                $q->whereIn('instagram', $oldUrls)
                    ->orWhereIn('instagram_handle', ['@striastudio', '@striakamuflaj']);
            })
            ->update([
                'instagram' => 'https://instagram.com/striabeautystudio',
                'instagram_handle' => '@striabeautystudio',
            ]);

        DB::table('links')
            ->whereIn('url', $oldUrls)
            ->update([
                'url' => 'https://instagram.com/striabeautystudio',
                'subtitle_tr' => '@striabeautystudio',
            ]);
    }

    // Data-only correction of a wrong handle; the previous value was an error,
    // so there is nothing meaningful to restore on rollback.
    public function down(): void
    {
    }
};
