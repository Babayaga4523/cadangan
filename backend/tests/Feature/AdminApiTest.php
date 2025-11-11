<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Question;
use App\Models\CBTTest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class AdminApiTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $token;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin user
        $this->admin = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin@test.com',
            'password' => bcrypt('password')
        ]);

        // Login to get token
        $response = $this->postJson('/api/login', [
            'email' => 'admin@test.com',
            'password' => 'password'
        ]);

        $this->token = $response->json('token');
    }

    /** @test */
    public function admin_can_list_questions()
    {
        Question::factory()->count(3)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/admin/questions');

        $response->assertStatus(200)
                ->assertJsonCount(3);
    }

    /** @test */
    public function admin_can_create_question()
    {
        $questionData = [
            'stimulus_type' => 'none',
            'question' => 'What is 2+2?',
            'option_a' => '3',
            'option_b' => '4',
            'option_c' => '5',
            'option_d' => '6',
            'correct_answer' => 'B'
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/admin/questions', $questionData);

        $response->assertStatus(201)
                ->assertJson($questionData);

        $this->assertDatabaseHas('questions', $questionData);
    }

    /** @test */
    public function admin_can_list_tests()
    {
        CBTTest::factory()->count(2)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/admin/tests');

        $response->assertStatus(200)
                ->assertJsonCount(2);
    }

    /** @test */
    public function admin_can_create_test()
    {
        $question = Question::factory()->create();

        $testData = [
            'title' => 'Math Test',
            'description' => 'Basic math test',
            'duration_minutes' => 60,
            'question_ids' => [$question->id]
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/admin/tests', $testData);

        $response->assertStatus(201)
                ->assertJsonFragment(['title' => 'Math Test']);

        $this->assertDatabaseHas('c_b_t_tests', [
            'title' => 'Math Test',
            'description' => 'Basic math test',
            'duration_minutes' => 60
        ]);
    }

    /** @test */
    public function admin_can_list_students()
    {
        User::factory()->count(3)->create(['role' => 'siswa']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/admin/students');

        $response->assertStatus(200)
                ->assertJsonCount(3);
    }

    /** @test */
    public function admin_can_create_student()
    {
        $studentData = [
            'name' => 'John Doe',
            'email' => 'john@test.com',
            'password' => 'password123'
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/admin/students', $studentData);

        $response->assertStatus(201)
                ->assertJsonFragment(['name' => 'John Doe', 'email' => 'john@test.com']);

        $this->assertDatabaseHas('users', [
            'name' => 'John Doe',
            'email' => 'john@test.com',
            'role' => 'siswa'
        ]);
    }

    /** @test */
    public function admin_can_view_reports()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/admin/reports');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'total_tests',
                    'total_attempts',
                    'average_score',
                    'completion_rate',
                    'test_stats',
                    'recent_attempts'
                ]);
    }
}