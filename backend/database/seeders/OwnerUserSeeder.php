<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OwnerUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => env('OWNER_EMAIL', 'owner@striastudio.com')],
            [
                'name' => 'Stria Studio',
                'password' => Hash::make(env('OWNER_PASSWORD', 'change-me-now')),
            ],
        );
    }
}
