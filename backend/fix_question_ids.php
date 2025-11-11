<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Question;
use Illuminate\Support\Facades\DB;

// Get all questions and find the highest integer ID
$allQuestions = Question::all();
$maxId = 0;
$zeroIdQuestions = [];

foreach($allQuestions as $question) {
    if (is_numeric($question->id)) {
        $id = (int)$question->id;
        if ($id > $maxId) {
            $maxId = $id;
        }
        if ($id === 0) {
            $zeroIdQuestions[] = $question;
        }
    }
}

echo "Found " . count($zeroIdQuestions) . " questions with id 0\n";
echo "Max ID currently: {$maxId}\n";

foreach($zeroIdQuestions as $index => $question) {
    $newId = $maxId + $index + 1;

    // Use raw SQL to update the ID
    DB::statement("UPDATE questions SET id = ? WHERE id = 0 LIMIT 1", [
        $newId
    ]);

    echo "Updated question to ID: {$newId}\n";
}

echo "Fixed " . count($zeroIdQuestions) . " questions\n";