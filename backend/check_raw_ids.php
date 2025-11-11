<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$results = DB::select('SELECT id FROM questions LIMIT 20');
foreach($results as $row) {
    echo "ID: {$row->id}, Type: " . gettype($row->id) . "\n";
}