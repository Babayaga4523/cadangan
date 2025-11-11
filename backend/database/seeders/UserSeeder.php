<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin CBT',
            'email' => 'admin@cbt.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);

        // Create student user
        User::create([
            'name' => 'Siswa CBT',
            'email' => 'siswa@cbt.com',
            'password' => Hash::make('siswa123'),
            'role' => 'siswa',
        ]);
    }
}
