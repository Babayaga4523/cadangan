<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\TestController;
use App\Http\Controllers\API\AttemptController;
use App\Http\Controllers\API\AuthController;

Route::get('/', function () {
    return view('welcome');
});

// Auth routes without CSRF
// NOTE: login/register moved to routes/api.php so they run under the stateless `api` middleware

// NOTE: Public API routes are defined in routes/api.php to keep them stateless