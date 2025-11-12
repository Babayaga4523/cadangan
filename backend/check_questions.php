<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$questions = \App\Models\Question::all();
echo 'Total questions: ' . $questions->count() . "\n";

foreach($questions->take(3) as $q) {
    echo "Question: {$q->question}\n";
    echo "A: {$q->option_a}\n";
    echo "B: {$q->option_b}\n";
    echo "C: {$q->option_c}\n";
    echo "D: {$q->option_d}\n";
    echo "Correct: {$q->correct_answer}\n";
    echo "Test ID: " . ($q->test_id ?: 'NULL') . "\n";
    echo "---\n";
}

// Check tests
$tests = \App\Models\CBTTest::all();
echo 'Total tests: ' . $tests->count() . "\n";

foreach($tests as $t) {
    $questionCount = \App\Models\Question::where('test_id', $t->id)->count();
    echo "Test: {$t->title} - Questions: $questionCount\n";
}

// Test the API response format for one test
$testId = '05922c3f-ad93-48a0-828d-4988ed7465e1'; // Algoritma Pemrograman test
$test = \App\Models\CBTTest::find($testId);
if ($test) {
    echo "\n--- Testing API response format for test: {$test->title} ---\n";
    $questions = \App\Models\Question::where('test_id', $testId)->get();

    $mapped = $questions->map(function ($question) {
        // Map the question options to the expected format - always include all 4 options
        $answers = [];
        $optionMapping = [
            'A' => $question->option_a,
            'B' => $question->option_b,
            'C' => $question->option_c,
            'D' => $question->option_d,
        ];

        foreach ($optionMapping as $key => $value) {
            $answers[] = [
                'id' => $key,
                'answer_text' => $value ?: '' // Include empty options as empty strings
            ];
        }

        return [
            'id' => $question->id,
            'question_text' => $question->question,
            'stimulus' => $question->stimulus,
            'stimulus_type' => $question->stimulus_type,
            'answers' => $answers
        ];
    });

    echo "API Response Format:\n";
    echo json_encode($mapped->toArray(), JSON_PRETTY_PRINT) . "\n";
}