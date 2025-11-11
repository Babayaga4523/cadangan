<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\CBTTest;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CBTTest>
 */
class CBTTestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => $this->faker->uuid(),
            'title' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph(),
            'duration_minutes' => $this->faker->numberBetween(30, 120),
        ];
    }
}