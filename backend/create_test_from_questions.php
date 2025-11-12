<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\CBTTest;
use App\Models\Question;
use Illuminate\Support\Str;

// Get some of the newly created questions (last 10)
$recentQuestions = Question::orderBy('created_at', 'desc')->take(10)->get();

// Create a test with these questions
$testData = [
    'id' => (string) Str::uuid(),
    'title' => 'Tes CBT Lengkap - Berbagai Tipe Soal',
    'description' => 'Tes yang berisi berbagai jenis soal dengan stimulus teks, gambar, dan tanpa stimulus. Cocok untuk menguji sistem CBT.',
    'duration_minutes' => 45,
];

$test = CBTTest::create($testData);

// Assign questions to the test
$questionIds = $recentQuestions->pluck('id')->toArray();
foreach ($questionIds as $questionId) {
    Question::where('id', $questionId)->update(['test_id' => $test->id]);
}

echo "✓ Test created successfully!\n";
echo "Test ID: " . $test->id . "\n";
echo "Title: " . $test->title . "\n";
echo "Description: " . $test->description . "\n";
echo "Duration: " . $test->duration_minutes . " minutes\n";
echo "Questions: " . count($questionIds) . "\n\n";

echo "Question breakdown:\n";
foreach ($recentQuestions as $index => $question) {
    echo ($index + 1) . ". " . substr($question->question, 0, 60) . "...\n";
    echo "   Type: " . ($question->stimulus_type ?: 'none') . "\n";
}

echo "\nTest URL: http://localhost:3000/cbt/" . $test->id . "\n";
echo "You can now test the CBT system with this comprehensive test!\n";