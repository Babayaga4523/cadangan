<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\TestController;
use App\Http\Controllers\API\AttemptController;
use App\Http\Controllers\API\AuthController;

// Sanctum CSRF cookie route (must be before other routes)
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie set']);
})->middleware('web');

// Public auth routes (stateless) — placed here so they use the `api` middleware and are not subject to CSRF
Route::middleware('api')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

// Public routes

// Protected routes — use token middleware that works with Sanctum personal access tokens
// (this avoids errors when an 'sanctum' auth guard isn't defined in config/auth.php)
Route::middleware([
    'api', // Add the 'api' middleware group to handle CORS
])->group(function () {
    // Test routes
    // Note: /tests routes are handled by student routes below

    // User routes
    Route::middleware(\App\Http\Middleware\SanctumTokenAuth::class)->get('/me', [AuthController::class, 'me']);
    Route::middleware(\App\Http\Middleware\SanctumTokenAuth::class)->post('/logout', [AuthController::class, 'logout']);
    Route::middleware(\App\Http\Middleware\SanctumTokenAuth::class)->put('/profile', [AuthController::class, 'updateProfile']);

    // Admin routes
    Route::middleware([\App\Http\Middleware\SanctumTokenAuth::class, \App\Http\Middleware\RoleMiddleware::class . ':admin'])->group(function () {
        Route::get('/admin/question-categories', [\App\Http\Controllers\QuestionCategoryController::class, 'index']);
        Route::post('/admin/question-categories', [\App\Http\Controllers\QuestionCategoryController::class, 'store']);
        Route::get('/admin/question-categories/{id}', [\App\Http\Controllers\QuestionCategoryController::class, 'show']);
        Route::put('/admin/question-categories/{id}', [\App\Http\Controllers\QuestionCategoryController::class, 'update']);
        Route::delete('/admin/question-categories/{id}', [\App\Http\Controllers\QuestionCategoryController::class, 'destroy']);

        Route::get('/admin/tests', [\App\Http\Controllers\CBTTestController::class, 'index']);
        Route::post('/admin/tests', [\App\Http\Controllers\CBTTestController::class, 'store']);
        Route::get('/admin/tests/{id}', [\App\Http\Controllers\CBTTestController::class, 'show']);
        Route::get('/admin/tests/{id}/scores', [\App\Http\Controllers\CBTTestController::class, 'scores']);
        Route::put('/admin/tests/{id}', [\App\Http\Controllers\CBTTestController::class, 'update']);
        Route::delete('/admin/tests/{id}', [\App\Http\Controllers\CBTTestController::class, 'destroy']);

        Route::get('/admin/questions', [\App\Http\Controllers\QuestionController::class, 'index']);
        Route::post('/admin/questions', [\App\Http\Controllers\QuestionController::class, 'store']);
        Route::get('/admin/questions/{id}', [\App\Http\Controllers\QuestionController::class, 'show']);
        Route::put('/admin/questions/{id}', [\App\Http\Controllers\QuestionController::class, 'update']);
        Route::delete('/admin/questions/{id}', [\App\Http\Controllers\QuestionController::class, 'destroy']);

        Route::get('/admin/students', [\App\Http\Controllers\StudentController::class, 'index']);
        Route::post('/admin/students', [\App\Http\Controllers\StudentController::class, 'store']);
        Route::get('/admin/students/{studentId}', [\App\Http\Controllers\StudentController::class, 'show']);
        Route::put('/admin/students/{studentId}', [\App\Http\Controllers\StudentController::class, 'update']);
        Route::delete('/admin/students/{studentId}', [\App\Http\Controllers\StudentController::class, 'destroy']);
        Route::get('/admin/students/{studentId}/history', [\App\Http\Controllers\StudentController::class, 'history']);

        Route::get('/admin/reports', [\App\Http\Controllers\ReportController::class, 'index']);
        Route::get('/admin/reports/filtered', [\App\Http\Controllers\ReportController::class, 'filtered']);
        Route::get('/admin/reports/export', [\App\Http\Controllers\ReportController::class, 'export']);
        Route::get('/admin/reports/{testId}', [\App\Http\Controllers\ReportController::class, 'show']);

        // Image upload route
        Route::post('/admin/upload-image', [\App\Http\Controllers\ImageController::class, 'upload']);
    });

    // Student routes
    Route::middleware([\App\Http\Middleware\SanctumTokenAuth::class, \App\Http\Middleware\RoleMiddleware::class . ':siswa'])->group(function () {
        Route::get('/student/tests', [TestController::class, 'studentIndex']);
        Route::get('/student/results', [AttemptController::class, 'studentResults']);
        Route::get('/student/review/{attemptId}', [AttemptController::class, 'review']);

        // Test routes
        Route::get('/tests', [TestController::class, 'index']);
        Route::get('/tests/{id}', [TestController::class, 'show']);
        Route::get('/tests/{id}/questions', [TestController::class, 'questions']);
        Route::post('/tests/{id}/start', [TestController::class, 'start']);

        // Attempt routes
        Route::get('/attempts/{attemptId}', [AttemptController::class, 'getAttemptAnswers']);
        Route::post('/attempts/{attemptId}/answers', [AttemptController::class, 'submitAnswer']);
        Route::post('/attempts/{attemptId}/submit', [AttemptController::class, 'finish']);
    // Share attempt results via email (server-side)
    Route::post('/attempts/{attemptId}/share', [AttemptController::class, 'share']);
        Route::post('/tests/{id}/finish', [AttemptController::class, 'finishByTest']);
        Route::get('/tests/{id}/result', [AttemptController::class, 'result']);
        Route::get('/history/tests', [AttemptController::class, 'historyTests']);
        Route::get('/history', [AttemptController::class, 'history']);
        Route::get('/student/scores', [AttemptController::class, 'studentScores']);
        // Development-only helper to trigger share without auth (only when APP_ENV=local)
        // Usage (browser): /api/dev/send-share?attempt_id=<id>&email=you@example.com&school=...&class=...
        Route::get('/dev/send-share', [AttemptController::class, 'shareDev']);
    });
});
