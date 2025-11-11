<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Question;

$questions = Question::take(10)->get();
foreach($questions as $q) {
    echo "ID: {$q->id}, Type: " . gettype($q->id) . "\n";
}