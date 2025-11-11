<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Optionally store session info if a session store is available (API routes may be stateless)
        if ($request->hasSession()) {
            $request->session()->put('auth', [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]);
        }

        // Generate token for API access
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
            // alias for clients expecting other key
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Debug logging
        Log::info('Login attempt', [
            'email' => $request->email,
            'has_password' => !empty($request->password),
            'headers' => $request->headers->all(),
        ]);

        // Find user by email
        $user = User::where('email', $request->email)->first();

        Log::info('User lookup result', [
            'email' => $request->email,
            'user_found' => $user ? 'yes' : 'no',
            'user_id' => $user ? $user->id : null,
        ]);

        // Check if user exists and password is correct
        if (!$user || !Hash::check($request->password, $user->password)) {
            Log::warning('Login failed - invalid credentials', [
                'email' => $request->email,
                'user_exists' => $user ? 'yes' : 'no',
                'password_check' => $user ? (Hash::check($request->password, $user->password) ? 'pass' : 'fail') : 'N/A',
            ]);

            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        Log::info('Login successful', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        // For API requests, don't use session login - just return the token
        // The frontend will handle storing the token for subsequent requests

        // Generate token for API access
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'token' => $token,
        ], 200);
    }

    public function logout(Request $request)
    {
        // Clear session if one exists
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }
        
        // Clear token if it exists
        $user = $request->user();
        if ($user && method_exists($user, 'currentAccessToken') && $user->currentAccessToken()) {
            // Revoke the token that was used to authenticate the request
            $user->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Logged out'], 200);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}