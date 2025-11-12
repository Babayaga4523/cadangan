<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CBTTest;
use App\Models\Question;
use Illuminate\Support\Str;
use App\Models\Attempt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class TestController extends Controller
{
    public function index()
    {
        try {
            Log::info('Fetching all tests');
            
            // Debug database connection
            try {
                DB::connection()->getPdo();
                Log::info("Successfully connected to database");
            } catch (\Exception $e) {
                Log::error("Database connection error: " . $e->getMessage());
                return response()->json([
                    'error' => 'Database error',
                    'message' => 'Cannot connect to database'
                ], 500);
            }
            
            $tests = CBTTest::all();
            Log::info('Found ' . $tests->count() . ' tests');
            
            if ($tests->isEmpty()) {
                Log::warning('No tests found in database');
                return response()->json([], 200);
            }
            
            return response()->json($tests);
        } catch (\Exception $e) {
            Log::error("Failed to fetch tests: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch tests',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            Log::info("Mencari test dengan ID: " . $id);
            
            // Debug koneksi database
            try {
                DB::connection()->getPdo();
                Log::info("Berhasil terhubung ke database");
            } catch (\Exception $e) {
                Log::error("Error koneksi database: " . $e->getMessage());
                return response()->json([
                    'error' => 'Database error',
                    'message' => 'Tidak dapat terhubung ke database'
                ], 500);
            }
            
            // Cari test berdasarkan ID
            Log::info("Mencoba query: SELECT * FROM tests WHERE id = '" . $id . "'");
            $test = CBTTest::where('id', $id)->first();
            
            if (!$test) {
                Log::warning("Test tidak ditemukan dengan ID: " . $id);
                // Debug: tampilkan semua test yang ada
                $allTests = CBTTest::all();
                Log::info("Tests yang ada: " . $allTests->pluck('id')->join(', '));
                
                return response()->json([
                    'error' => 'Test tidak ditemukan',
                    'message' => 'Test dengan ID ' . $id . ' tidak ada dalam database'
                ], 404);
            }
            
            Log::info("Test ditemukan: " . $test->title);
            return response()->json($test);
        } catch (\Exception $e) {
            Log::error("Error saat mengambil test {$id}: " . $e->getMessage());
            return response()->json([
                'error' => 'Terjadi kesalahan',
                'message' => 'Gagal mengambil data test'
            ], 500);
        }
    }

    public function questions($id)
    {
        try {
            $test = CBTTest::findOrFail($id);
            Log::info("Found test with ID: {$id}");
            
            $questions = Question::where('test_id', $id)->get();
                
            Log::info("Found " . $questions->count() . " questions for test {$id}");
            
            if ($questions->isEmpty()) {
                return response()->json(['error' => 'No questions found for this test'], 404);
            }
            
            $mapped = $questions->map(function ($question) {
                // Map the question options to the expected format - always include all 4 options
                $answers = [];
                $optionMapping = [
                    'A' => $question->option_a,
                    'B' => $question->option_b,
                    'C' => $question->option_c,
                    'D' => $question->option_d,
                ];
                
                foreach ($optionMapping as $key => $value) {
                    $answers[] = [
                        'id' => $key,
                        'answer_text' => $value ?: '' // Include empty options as empty strings
                    ];
                }
                
                return [
                    'id' => $question->id,
                    'question_text' => $question->question,
                    'stimulus' => $question->stimulus,
                    'stimulus_type' => $question->stimulus_type,
                    'answers' => $answers
                ];
            });

            return response()->json($mapped);
        } catch (\Exception $e) {
            Log::error("Failed to fetch questions for test {$id}: " . $e->getMessage());
            return response()->json(['error' => 'Test not found'], 404);
        }
    }

    public function studentIndex(Request $request)
    {
        try {
            $userId = $request->user()->id;

            $tests = CBTTest::withCount('questions')
                ->with(['attempts' => function ($query) use ($userId) {
                    $query->where('user_id', $userId)
                          ->orderBy('created_at', 'desc')
                          ->limit(1);
                }])
                ->get()
                ->map(function ($test) use ($userId) {
                    $lastAttempt = $test->attempts->first();
                    $hasAttempted = $lastAttempt !== null;
                    $lastScore = $hasAttempted ? $lastAttempt->score : null;
                    $canRetake = $hasAttempted && $lastAttempt->status === 'completed';

                    return [
                        'id' => $test->id,
                        'title' => $test->title,
                        'description' => $test->description,
                        'duration_minutes' => $test->duration_minutes,
                        'total_questions' => $test->questions_count,
                        'has_attempted' => $hasAttempted,
                        'last_attempt_score' => $lastScore,
                        'can_retake' => $canRetake,
                    ];
                });

            return response()->json($tests);
        } catch (\Exception $e) {
            Log::error("Failed to fetch student tests: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch tests',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function start(Request $request, $id)
    {
        try {
            $test = CBTTest::findOrFail($id);
            Log::info("Starting test with ID: {$id}");
            $userId = $request->user()->id;

            // Reuse existing in-progress attempt if one exists
            $existing = Attempt::where('test_id', $id)
                ->where('user_id', $userId)
                ->where('status', 'in_progress')
                ->first();

            if ($existing) {
                Log::info("Reusing existing attempt {$existing->id} for user {$userId} test {$id}");
                return response()->json([
                    'attemptId' => $existing->id,
                    'status' => 'resumed'
                ]);
            }

            // Allow retake only if last attempt completed
            $lastCompleted = Attempt::where('test_id', $id)
                ->where('user_id', $userId)
                ->where('status', 'completed')
                ->orderByDesc('finished_at')
                ->first();

            $attemptId = (string) Str::uuid();
            $attempt = Attempt::create([
                'id' => $attemptId,
                'test_id' => $id,
                'user_id' => $userId,
                'status' => 'in_progress',
                'started_at' => now()
            ]);

            Log::info("Created new attempt {$attemptId} for test {$id} user {$userId}");

            return response()->json([
                'attemptId' => $attemptId,
                'status' => 'started',
                'previousScore' => $lastCompleted?->score
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to start test {$id}: " . $e->getMessage());
            return response()->json(['error' => 'Could not start test: ' . $e->getMessage()], 500);
        }
    }
}
