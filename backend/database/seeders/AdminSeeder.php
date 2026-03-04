<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeder to create default admin account
 */
class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Admin::updateOrCreate(
            ['email' => 'itriainticevent@gmail.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('NTIC-@-26ITRIAI'),
            ]
        );
    }
}
