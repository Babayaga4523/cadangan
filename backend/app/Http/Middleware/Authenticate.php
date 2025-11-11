<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    protected function redirectTo($request)
    {
        // For API requests, do not redirect
        if (!$request->expectsJson()) {
            return route('login');
        }
    }
}
