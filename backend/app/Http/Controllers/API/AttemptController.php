<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use App\Models\Attempt;
use App\Models\AttemptAnswer;
use App\Models\Question;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;
use App\Mail\ShareAttemptResult;

class AttemptController extends Controller
{
    public function getAttemptAnswers($attemptId)
    {
        $userId = request()->user()->id;
        
        $attempt = Attempt::where('id', $attemptId)->where('user_id', $userId)->first();
        if (!$attempt) {
            return response()->json(['error' => 'Attempt not found or access denied'], 404);
        }

        $answers = AttemptAnswer::where('attempt_id', $attemptId)->get();
        
        return response()->json($answers->map(function ($answer) {
            return [
                'question_id' => $answer->question_id,
                'answer' => $answer->answer,
            ];
        }));
    }

    public function submitAnswer(Request $request, $attemptId)
    {
        $userId = $request->user()->id;
        
        // Verify the attempt belongs to the authenticated user
        $attempt = Attempt::where('id', $attemptId)->where('user_id', $userId)->first();
        if (!$attempt) {
            return response()->json(['error' => 'Attempt not found or access denied'], 404);
        }

        // Get attemptId from route parameter
        $questionId = $request->input('question_id');
        $answerText = $request->input('answer');

        if (!$questionId || !$answerText) {
            return response()->json(['error' => 'question_id and answer are required'], 422);
        }

        // Upsert by attempt & question
        $existing = AttemptAnswer::where('attempt_id', $attemptId)
            ->where('question_id', $questionId)
            ->first();
            
        if ($existing) {
            $existing->answer = $answerText;
            $existing->save();
        } else {
            AttemptAnswer::create([
                'attempt_id' => $attemptId,
                'question_id' => $questionId,
                'answer' => $answerText,
            ]);
        }

        return response()->json(['ok' => true]);
    }

    public function finish($attemptId)
    {
        $attempt = Attempt::where('id', $attemptId)->first();
        if (! $attempt) return response()->json(['error' => 'Not found'], 404);

        $answers = $attempt->answers()->get();
        $questions = Question::where('test_id', $attempt->test_id)->get()->keyBy('id');

        $correct = 0;
        foreach ($answers as $a) {
            $q = $questions[$a->question_id] ?? null;
            if ($q) {
                // resolve correct answer from answers table (Answer model)
                $correctAnswer = null;
                if (method_exists($q, 'answers')) {
                    $correctRec = $q->answers()->where('is_correct', true)->first();
                    $correctAnswer = $correctRec ? $correctRec->answer_text : null;
                }
                if ($correctAnswer !== null && $correctAnswer === $a->answer) $correct++;
            }
        }

        $total = $questions->count();
        $score = $total > 0 ? ($correct / $total) * 100 : 0;

        $attempt->score = $score;
        $attempt->finished_at = now();
        // Only set completed_at if the column exists in the DB
        if (Schema::hasColumn('attempts', 'completed_at')) {
            $attempt->completed_at = $attempt->finished_at;
        }
        $attempt->status = 'completed';
        $attempt->save();

        return response()->json(['title' => $attempt->test?->title ?? 'Ujian', 'score' => $score, 'total' => $total]);
    }

    // finish by test id with attempt id in body (spec: POST /api/tests/{id}/finish)
    public function finishByTest(Request $request, $testId)
    {
        $data = $request->validate([
            'attempt_id' => 'required|string',
        ]);
        return $this->finish($data['attempt_id']);
    }

    // GET detailed result for a test attempt: /api/tests/{id}/result?attempt_id=...
    public function result(Request $request, $testId)
    {
        $attemptId = $request->query('attempt_id');
        if (! $attemptId) return response()->json(['error' => 'attempt_id required'], 422);

        $attempt = Attempt::where('id', $attemptId)->first();
        if (! $attempt) return response()->json(['error' => 'Not found'], 404);

        $answers = $attempt->answers()->get();
        $questions = Question::where('test_id', $attempt->test_id)->get()->keyBy('id');

        $correct = 0;
        $detail = [];
        foreach ($questions as $qid => $q) {
            $userA = $answers->firstWhere('question_id', $qid);
            $userAnswer = $userA->answer ?? null;

            $correctAnswer = null;
            if (method_exists($q, 'answers')) {
                $correctRec = $q->answers()->where('is_correct', true)->first();
                $correctAnswer = $correctRec ? $correctRec->answer_text : null;
            }

            $isCorrect = $userAnswer !== null && $correctAnswer !== null && $correctAnswer === $userAnswer;
            if ($isCorrect) $correct++;

            $detail[] = [
                'question' => $q->question_text ?? ($q->text ?? ''),
                'user_answer' => $userAnswer,
                'correct_answer' => $correctAnswer,
                'is_correct' => $isCorrect,
            ];
        }

        $total = $questions->count();
        $score = $total > 0 ? ($correct / $total) * 100 : 0;

        return response()->json(['score' => $score, 'correct' => $correct, 'total' => $total, 'answers' => $detail]);
    }

    public function history(Request $request)
    {
        $userId = $request->user()->id;
        $testId = $request->query('test_id');

        $query = Attempt::with('test')
            ->where('user_id', $userId);

        if ($testId) {
            $query->where('test_id', $testId);
        }

        $attempts = $query->orderByDesc('created_at')
            ->get()
            ->map(function ($attempt) {
                $timeTaken = $attempt->started_at && $attempt->finished_at
                    ? $attempt->started_at->diffInSeconds($attempt->finished_at)
                    : null;
                return [
                    'id' => $attempt->id,
                    'test_id' => $attempt->test_id,
                    'status' => $attempt->status,
                    'score' => $attempt->score,
                    'started_at' => $attempt->started_at?->toISOString(),
                    'finished_at' => $attempt->finished_at?->toISOString(),
                    'time_taken' => $timeTaken,
                    'test' => [
                        'title' => $attempt->test?->title ?? 'Unknown',
                        'description' => $attempt->test?->description ?? null,
                    ],
                ];
            });
        return response()->json($attempts);
    }

    public function historyTests(Request $request)
    {
        $userId = $request->user()->id;

        $tests = Attempt::with('test')
            ->where('user_id', $userId)
            ->select('test_id')
            ->distinct()
            ->get()
            ->map(function ($attempt) {
                return [
                    'id' => $attempt->test_id,
                    'title' => $attempt->test?->title ?? 'Unknown Test',
                    'description' => $attempt->test?->description ?? null,
                ];
            });

        return response()->json($tests);
    }

    public function studentScores(Request $request)
    {
        $userId = $request->user()->id;
        $subjectId = $request->query('subject_id');

        if (!$subjectId) {
            return response()->json(['error' => 'subject_id is required'], 400);
        }

        $attempts = Attempt::with('test')
            ->where('user_id', $userId)
            ->whereHas('test', function ($query) use ($subjectId) {
                $query->where('subject_id', $subjectId);
            })
            ->where('status', 'completed')
            ->orderByDesc('finished_at')
            ->get()
            ->map(function ($attempt) {
                return [
                    'id' => $attempt->id,
                    'attempt_id' => $attempt->id, // Add attempt_id for links
                    'test_id' => $attempt->test_id,
                    'test_title' => $attempt->test?->title ?? 'Unknown Test',
                    'score' => round($attempt->score ?? 0, 1),
                    'finished_at' => $attempt->finished_at?->toISOString(),
                    'subject_id' => $attempt->test?->subject_id,
                ];
            });

        return response()->json($attempts);
    }

    public function review(Request $request, $attemptId)
    {
        $userId = $request->user()->id;
        // Base query (without status restriction first)
        $baseQuery = Attempt::where('id', $attemptId)
            ->where('user_id', $userId)
            ->with('test');

        // Prefer completed attempt
        $attempt = (clone $baseQuery)->where('status', 'completed')->first();
        $preview = false;

        // Fallback to any existing attempt (preview mode) so UI can still show partial answers
        if (! $attempt) {
            $attempt = (clone $baseQuery)->first();
            if ($attempt) {
                $preview = $attempt->status !== 'completed';
            }
        }

        if (! $attempt) {
            return response()->json(['error' => 'Attempt not found'], 404);
        }

        $answers = $attempt->answers()->get()->keyBy('question_id');
        $questions = Question::where('test_id', $attempt->test_id)->get();

        $correct = 0;
        $totalQuestions = $questions->count();
        $endAt = $attempt->completed_at ?: $attempt->finished_at; // may be null if still in progress
        $timeTaken = $attempt->started_at && $endAt
            ? $attempt->started_at->diffInSeconds($endAt)
            : 0;

        $questionReviews = $questions->map(function ($question) use ($answers, &$correct) {
            $userAnswer = $answers[$question->id] ?? null;
            $userAnswerText = $userAnswer ? $userAnswer->answer : null;

            // Map the question options to the expected format - always include all 4 options
            $options = [];
            $optionMapping = [
                'A' => $question->option_a,
                'B' => $question->option_b,
                'C' => $question->option_c,
                'D' => $question->option_d,
            ];

            foreach ($optionMapping as $key => $value) {
                $options[] = $value ?: ''; // Include empty options as empty strings
            }

            // Get correct answer based on correct_answer field
            $correctAnswer = null;
            if ($question->correct_answer && isset($optionMapping[$question->correct_answer])) {
                $correctAnswer = $optionMapping[$question->correct_answer];
            }

            $isCorrect = $userAnswerText !== null && $correctAnswer !== null && $correctAnswer === $userAnswerText;
            if ($isCorrect) $correct++;

            return [
                'id' => $question->id,
                'question_text' => $question->question,
                'stimulus_type' => $question->stimulus_type ?: 'none',
                'stimulus_content' => $question->stimulus,
                'options' => $options,
                'correct_answer' => $correctAnswer,
                'user_answer' => $userAnswerText,
                'is_correct' => $isCorrect,
                'explanation' => $question->explanation,
            ];
        });

        // completed_at may be string (raw) or Carbon; normalize to ISO8601 safely
        $completedRaw = $attempt->completed_at ?: $attempt->finished_at;
        $completedIso = null;
        if ($completedRaw instanceof \Carbon\CarbonInterface) {
            $completedIso = $completedRaw->toISOString();
        } elseif (is_string($completedRaw) && !empty($completedRaw)) {
            try { $completedIso = \Carbon\Carbon::parse($completedRaw)->toISOString(); } catch (\Throwable $e) { $completedIso = $completedRaw; }
        }

        return response()->json([
            'test_id' => $attempt->test_id,
            'test_title' => $attempt->test?->title ?? 'Unknown Test',
            'description' => $attempt->test?->description ?? null,
            'score' => round($attempt->score, 1),
            'total_questions' => $totalQuestions,
            'correct_answers' => $correct,
            'time_taken' => $timeTaken,
            'completed_at' => $completedIso,
            'questions' => $questionReviews,
            'preview' => $preview,
        ]);
    }

    /**
     * Share attempt result by sending an email to the specified address.
     * POST /api/attempts/{attemptId}/share
     * Body: { email: required|email, school?: string, class?: string }
     */
    public function share(Request $request, $attemptId)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'school' => 'nullable|string',
            'class' => 'nullable|string',
        ]);

        $userId = $request->user()->id;
        $attempt = Attempt::where('id', $attemptId)->where('user_id', $userId)->with('test')->first();
        if (! $attempt) {
            return response()->json(['error' => 'Attempt not found'], 404);
        }

        // Gather result summary
        $answers = $attempt->answers()->get();
        $questions = Question::where('test_id', $attempt->test_id)->get();

        $correct = 0;
        foreach ($answers as $a) {
            $q = $questions->firstWhere('id', $a->question_id);
            if ($q && method_exists($q, 'answers')) {
                $correctRec = $q->answers()->where('is_correct', true)->first();
                $correctAnswer = $correctRec ? $correctRec->answer_text : null;
                if ($correctAnswer !== null && $correctAnswer === $a->answer) $correct++;
            }
        }
        $total = $questions->count();
        $score = $attempt->score ?? ($total > 0 ? ($correct / $total) * 100 : 0);

        // If a Mailtrap API token is configured, prefer sending via Mailtrap HTTP API
        $mailtrapToken = env('MAILTRAP_API_TOKEN');
        if (!empty($mailtrapToken)) {
            try {
                $html = view('emails.share_attempt', [
                    'attempt' => $attempt,
                    'score' => round($score, 1),
                    'total' => $total,
                    'correct' => $correct,
                    'school' => $data['school'] ?? null,
                    'class' => $data['class'] ?? null,
                ])->render();
                $text = view('emails.share_attempt_text', [
                    'attempt' => $attempt,
                    'score' => round($score, 1),
                    'total' => $total,
                    'correct' => $correct,
                    'school' => $data['school'] ?? null,
                    'class' => $data['class'] ?? null,
                ])->render();

                $payload = [
                    'from' => [
                        'email' => config('mail.from.address') ?? 'hello@example.com',
                        'name' => config('mail.from.name') ?? config('app.name')
                    ],
                    'to' => [ ['email' => $data['email'] ] ],
                    'subject' => 'Hasil Ujian: ' . ($attempt->test->title ?? 'Ujian'),
                    'text' => strip_tags($text),
                    'html' => $html,
                    'category' => 'Attempt Result'
                ];

                $resp = Http::withToken($mailtrapToken)
                    ->acceptJson()
                    ->withoutVerifying()  // Skip SSL verification for dev
                    ->post('https://send.api.mailtrap.io/api/send', $payload);

                if ($resp->successful()) {
                    return response()->json(['ok' => true]);
                }
                // If API failed, save rendered HTML for debugging and return error
                try {
                    $dir = storage_path('app/mail-failures');
                    if (!is_dir($dir)) @mkdir($dir, 0755, true);
                    $path = $dir . '/' . uniqid('share_attempt_') . '.html';
                    @file_put_contents($path, $html);
                } catch (\Throwable $_) {
                    // ignore secondary errors
                }

                return response()->json(['error' => 'Failed to send email via Mailtrap API (saved copy)', 'detail' => $resp->body(), 'saved' => $path ?? null], 500);
            } catch (\Throwable $e) {
                // If API failed, save rendered HTML for debugging and return error
                try {
                    $html = view('emails.share_attempt', [
                        'attempt' => $attempt,
                        'score' => round($score, 1),
                        'total' => $total,
                        'correct' => $correct,
                        'school' => $data['school'] ?? null,
                        'class' => $data['class'] ?? null,
                    ])->render();
                    $dir = storage_path('app/mail-failures');
                    if (!is_dir($dir)) @mkdir($dir, 0755, true);
                    $path = $dir . '/' . uniqid('share_attempt_') . '.html';
                    @file_put_contents($path, $html);
                } catch (\Throwable $_) {
                    // ignore secondary errors
                }

                return response()->json(['error' => 'Failed to send email via Mailtrap API (saved copy)', 'detail' => $e->getMessage(), 'saved' => $path ?? null], 500);
            }
        }

        try {
            Mail::to($data['email'])->send(new ShareAttemptResult(
                $attempt,
                round($score, 1),
                $total,
                $correct,
                $data['school'] ?? null,
                $data['class'] ?? null
            ));
        } catch (\Throwable $e) {
            // fallback: render email HTML and save to storage for inspection
            try {
                $html = view('emails.share_attempt', [
                    'attempt' => $attempt,
                    'score' => round($score, 1),
                    'total' => $total,
                    'correct' => $correct,
                    'school' => $data['school'] ?? null,
                    'class' => $data['class'] ?? null,
                ])->render();
                $dir = storage_path('app/mail-failures');
                if (!is_dir($dir)) @mkdir($dir, 0755, true);
                $path = $dir . '/' . uniqid('share_attempt_') . '.html';
                @file_put_contents($path, $html);
            } catch (\Throwable $_) {
                // ignore secondary errors
            }

            return response()->json(['error' => 'Failed to send email (saved copy)', 'detail' => $e->getMessage(), 'saved' => $path ?? null], 500);
        }

        return response()->json(['ok' => true]);
    }

    /**
     * Dev helper: trigger share without authentication. ONLY works when APP_ENV=local.
     * GET /api/dev/send-share?attempt_id=...&email=...&school=...&class=...
     */
    public function shareDev(Request $request)
    {
        if (!app()->environment('local')) {
            return response()->json(['error' => 'Unavailable'], 403);
        }
        $attemptId = $request->query('attempt_id');
        $email = $request->query('email');
        if (!$attemptId || !$email) return response()->json(['error' => 'attempt_id & email required'], 422);

        $attempt = Attempt::where('id', $attemptId)->with('test')->first();
        if (! $attempt) return response()->json(['error' => 'Attempt not found'], 404);

        // compute summary (reuse share logic locally)
        $answers = $attempt->answers()->get();
        $questions = Question::where('test_id', $attempt->test_id)->get();
        $correct = 0;
        foreach ($answers as $a) {
            $q = $questions->firstWhere('id', $a->question_id);
            if ($q && method_exists($q, 'answers')) {
                $correctRec = $q->answers()->where('is_correct', true)->first();
                $correctAnswer = $correctRec ? $correctRec->answer_text : null;
                if ($correctAnswer !== null && $correctAnswer === $a->answer) $correct++;
            }
        }
        $total = $questions->count();
        $score = $attempt->score ?? ($total > 0 ? ($correct / $total) * 100 : 0);

        // delegate to same sending mechanism by faking $data
        $data = [
            'email' => $email,
            'school' => $request->query('school'),
            'class' => $request->query('class'),
        ];

        // try Mailtrap API first (same as share)
        $mailtrapToken = env('MAILTRAP_API_TOKEN');
        if (!empty($mailtrapToken)) {
            try {
                $html = view('emails.share_attempt', [
                    'attempt' => $attempt,
                    'score' => round($score, 1),
                    'total' => $total,
                    'correct' => $correct,
                    'school' => $data['school'] ?? null,
                    'class' => $data['class'] ?? null,
                ])->render();
                $text = view('emails.share_attempt_text', [
                    'attempt' => $attempt,
                    'score' => round($score, 1),
                    'total' => $total,
                    'correct' => $correct,
                    'school' => $data['school'] ?? null,
                    'class' => $data['class'] ?? null,
                ])->render();

                $payload = [
                    'from' => [
                        'email' => config('mail.from.address') ?? 'hello@example.com',
                        'name' => config('mail.from.name') ?? config('app.name')
                    ],
                    'to' => [ ['email' => $data['email'] ] ],
                    'subject' => 'Hasil Ujian: ' . ($attempt->test->title ?? 'Ujian'),
                    'text' => strip_tags($text),
                    'html' => $html,
                    'category' => 'Attempt Result'
                ];

                $resp = \Illuminate\Support\Facades\Http::withToken($mailtrapToken)
                    ->acceptJson()
                    ->withoutVerifying()  // Skip SSL verification for dev
                    ->post('https://send.api.mailtrap.io/api/send', $payload);

                if ($resp->successful()) {
                    return response()->json(['ok' => true]);
                }
                // If API failed, save rendered HTML for debugging and return error
                try {
                    $dir = storage_path('app/mail-failures');
                    if (!is_dir($dir)) @mkdir($dir, 0755, true);
                    $path = $dir . '/' . uniqid('share_attempt_') . '.html';
                    @file_put_contents($path, $html);
                } catch (\Throwable $_) {
                    // ignore secondary errors
                }

                return response()->json(['error' => 'Failed to send email via Mailtrap API (saved copy)', 'detail' => $resp->body(), 'saved' => $path ?? null], 500);
            } catch (\Throwable $e) {
                // If API failed, save rendered HTML for debugging and return error
                try {
                    $html = view('emails.share_attempt', [
                        'attempt' => $attempt,
                        'score' => round($score, 1),
                        'total' => $total,
                        'correct' => $correct,
                        'school' => $data['school'] ?? null,
                        'class' => $data['class'] ?? null,
                    ])->render();
                    $dir = storage_path('app/mail-failures');
                    if (!is_dir($dir)) @mkdir($dir, 0755, true);
                    $path = $dir . '/' . uniqid('share_attempt_') . '.html';
                    @file_put_contents($path, $html);
                } catch (\Throwable $_) {
                    // ignore secondary errors
                }

                return response()->json(['error' => 'Failed to send email via Mailtrap API (saved copy)', 'detail' => $e->getMessage(), 'saved' => $path ?? null], 500);
            }
        }

        try {
            Mail::to($data['email'])->send(new ShareAttemptResult(
                $attempt,
                round($score, 1),
                $total,
                $correct,
                $data['school'] ?? null,
                $data['class'] ?? null
            ));
        } catch (\Throwable $e) {
            // save copy
            try {
                $html = view('emails.share_attempt', [
                    'attempt' => $attempt,
                    'score' => round($score, 1),
                    'total' => $total,
                    'correct' => $correct,
                    'school' => $data['school'] ?? null,
                    'class' => $data['class'] ?? null,
                ])->render();
                $dir = storage_path('app/mail-failures');
                if (!is_dir($dir)) @mkdir($dir, 0755, true);
                $path = $dir . '/' . uniqid('share_attempt_') . '.html';
                @file_put_contents($path, $html);
            } catch (\Throwable $_) {}

            return response()->json(['error' => 'Failed to send email (saved copy)', 'detail' => $e->getMessage(), 'saved' => $path ?? null], 500);
        }

        return response()->json(['ok' => true]);
    }
}
