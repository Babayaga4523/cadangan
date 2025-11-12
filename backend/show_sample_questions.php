<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Question;

echo "=== 10 SAMPLE QUESTIONS CREATED ===\n\n";

// Get the last 10 questions (newly created ones)
$questions = Question::orderBy('created_at', 'desc')->take(10)->get();

foreach ($questions as $index => $q) {
    echo ($index + 1) . ". " . $q->question . "\n";
    echo "   Stimulus Type: " . ($q->stimulus_type ?: 'none') . "\n";

    if ($q->stimulus_type === 'text' && $q->stimulus) {
        echo "   Stimulus Text: " . substr($q->stimulus, 0, 100) . (strlen($q->stimulus) > 100 ? '...' : '') . "\n";
    } elseif ($q->stimulus_type === 'image' && $q->stimulus) {
        echo "   Stimulus Image: " . $q->stimulus . "\n";
    }

    echo "   Options:\n";
    echo "   A: " . ($q->option_a ?: '(empty)') . "\n";
    echo "   B: " . ($q->option_b ?: '(empty)') . "\n";
    echo "   C: " . ($q->option_c ?: '(empty)') . "\n";
    echo "   D: " . ($q->option_d ?: '(empty)') . "\n";
    echo "   Correct Answer: " . ($q->correct_answer ?: 'Not set') . "\n";
    echo "   Explanation: " . ($q->explanation ? substr($q->explanation, 0, 80) . (strlen($q->explanation) > 80 ? '...' : '') : 'None') . "\n";
    echo "\n";
}

echo "=== SUMMARY ===\n";
$stimulusStats = Question::selectRaw('stimulus_type, COUNT(*) as count')
    ->groupBy('stimulus_type')
    ->get();

foreach ($stimulusStats as $stat) {
    echo "Questions with " . ($stat->stimulus_type ?: 'no') . " stimulus: " . $stat->count . "\n";
}

echo "\nTotal questions in database: " . Question::count() . "\n";