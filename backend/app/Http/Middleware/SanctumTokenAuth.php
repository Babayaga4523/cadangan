<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * Simple middleware that authenticates requests using a Sanctum personal access token
 * sent in the Authorization: Bearer <token> header.
 *
 * This avoids relying on an auth guard named "sanctum" being registered and
 * keeps API token auth working for the frontend.
 */
class SanctumTokenAuth
{
    public function handle(Request $request, Closure $next)
    {
        // If the request already has an authenticated user (for example when
        // session-based auth / StartSession ran earlier), accept it immediately.
        if ($request->user()) {
            return $next($request);
        }

        // Try token authentication from the 'Authorization' header.
        $tokenString = $request->bearerToken();

        if ($tokenString) {
            // Find the personal access token using Sanctum's helper
            $token = PersonalAccessToken::findToken($tokenString);

            // The 'tokenable' relationship on the token model will load the user.
            // We can then set this user as the authenticated user for the request.
            if ($token && $token->tokenable_id && $token->tokenable) {
                // Make the token's user available via the request user resolver so
                // Laravel and packages that call $request->user() will receive it.
                $request->setUserResolver(fn () => $token->tokenable);

                // Try to set the user on an available guard. Some environments
                // may not have the 'api' guard configured (or default guard may
                // point to a non-existent guard) which would throw. Check for a
                // usable guard name first and only call setUser if available.
                try {
                    $guards = array_keys(config('auth.guards', []));
                    $default = config('auth.defaults.guard');
                    $guardToUse = in_array($default, $guards) ? $default : (in_array('web', $guards) ? 'web' : null);

                    if ($guardToUse) {
                        Auth::guard($guardToUse)->setUser($token->tokenable);
                    }
                } catch (\Throwable $e) {
                    // If anything goes wrong setting the guard, ignore and
                    // continue — the request user resolver is already set.
                }

                return $next($request);
            }
        }

        return response()->json(['message' => 'Unauthenticated'], 401);
    }
}
