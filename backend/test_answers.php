<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Test the questions method
$testController = new \App\Http\Controllers\API\TestController();
$test = \App\Models\CBTTest::first();

if ($test) {
    $response = $testController->questions($test->id);
    $data = json_decode($response->getContent(), true);

    if (count($data) > 0) {
        $firstQuestion = $data[0];
        echo 'Question: ' . $firstQuestion['question_text'] . "\n";
        echo 'Answers count: ' . count($firstQuestion['answers']) . "\n";
        foreach ($firstQuestion['answers'] as $answer) {
            echo $answer['id'] . ': ' . ($answer['answer_text'] ?: '(empty)') . "\n";
        }
    }
}