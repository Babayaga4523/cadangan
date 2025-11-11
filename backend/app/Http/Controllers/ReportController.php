<?php

namespace App\Http\Controllers;

use App\Models\Attempt;
use App\Models\CBTTest;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Display a listing of reports.
     */
    public function index()
    {
        // Overall statistics
        $totalTests = CBTTest::count();
        $totalAttempts = Attempt::count();
        $completedAttempts = Attempt::where('status', 'completed')->count();
        $averageScore = Attempt::where('status', 'completed')->avg('score') ?? 0;
        $completionRate = $totalAttempts > 0 ? ($completedAttempts / $totalAttempts) * 100 : 0;

        // Test statistics
        $testStats = CBTTest::with(['attempts' => function ($query) {
            $query->where('status', 'completed');
        }])->get()->map(function ($test) {
            $attempts = $test->attempts;
            $totalAttempts = $attempts->count();
            $averageScore = $attempts->avg('score') ?? 0;
            $completionRate = $totalAttempts > 0 ? 100 : 0; // Since we're only getting completed attempts

            return [
                'test_id' => $test->id,
                'test_title' => $test->title ?? 'Unknown Test',
                'attempts_count' => $totalAttempts,
                'average_score' => round($averageScore, 1),
                'completion_rate' => round($completionRate, 1),
            ];
        });

        // Recent attempts
        $recentAttempts = Attempt::with(['user', 'test'])
            ->where('status', 'completed')
            ->orderBy('completed_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($attempt) {
                $timeTaken = $attempt->started_at && $attempt->completed_at
                    ? $attempt->started_at->diffInSeconds($attempt->completed_at)
                    : 0;

                return [
                    'id' => $attempt->id,
                    'user_name' => $attempt->user?->name ?? 'Unknown User',
                    'test_title' => $attempt->test?->title ?? 'Unknown Test',
                    'score' => round($attempt->score, 1),
                    'completed_at' => $attempt->completed_at?->toISOString(),
                    'time_taken' => $timeTaken,
                ];
            });

        return response()->json([
            'total_tests' => $totalTests,
            'total_attempts' => $totalAttempts,
            'average_score' => round($averageScore, 1),
            'completion_rate' => round($completionRate, 1),
            'test_stats' => $testStats,
            'recent_attempts' => $recentAttempts,
        ]);
    }

    /**
     * Get filtered reports based on date range.
     */
    public function filtered(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $query = Attempt::with(['user', 'test'])->where('status', 'completed');

        if ($startDate) {
            $query->where('completed_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('completed_at', '<=', $endDate);
        }

        $attempts = $query->orderBy('completed_at', 'desc')->get();

        $stats = [
            'total_attempts' => $attempts->count(),
            'average_score' => round($attempts->avg('score') ?? 0, 1),
            'highest_score' => round($attempts->max('score') ?? 0, 1),
            'lowest_score' => round($attempts->min('score') ?? 0, 1),
        ];

        $attemptsData = $attempts->map(function ($attempt) {
            $timeTaken = $attempt->started_at && $attempt->completed_at
                ? $attempt->started_at->diffInSeconds($attempt->completed_at)
                : 0;

            return [
                'id' => $attempt->id,
                'user_name' => $attempt->user?->name ?? 'Unknown User',
                'user_email' => $attempt->user?->email ?? 'Unknown Email',
                'test_title' => $attempt->test?->title ?? 'Unknown Test',
                'score' => round($attempt->score, 1),
                'completed_at' => $attempt->completed_at?->toISOString(),
                'time_taken_seconds' => $timeTaken,
            ];
        });

        return response()->json([
            'stats' => $stats,
            'attempts' => $attemptsData,
        ]);
    }

    /**
     * Export report data as CSV.
     */
    public function export(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $query = Attempt::with(['user', 'test'])->where('status', 'completed');

        if ($startDate) {
            $query->where('completed_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('completed_at', '<=', $endDate);
        }

        $attempts = $query->orderBy('completed_at', 'desc')->get();

        $csvData = "User Name,User Email,Test Title,Score,Completed At,Time Taken (seconds)\n";

        foreach ($attempts as $attempt) {
            $timeTaken = $attempt->started_at && $attempt->completed_at
                ? $attempt->started_at->diffInSeconds($attempt->completed_at)
                : 0;

            $csvData .= sprintf(
                "%s,%s,%s,%.1f,%s,%d\n",
                $attempt->user?->name ?? 'Unknown User',
                $attempt->user?->email ?? 'Unknown Email',
                $attempt->test?->title ?? 'Unknown Test',
                $attempt->score,
                $attempt->completed_at?->format('Y-m-d H:i:s'),
                $timeTaken
            );
        }

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="cbt_report_' . now()->format('Y-m-d') . '.csv"');
    }

    /**
     * Get detailed report for a specific test.
     */
    public function show($testId)
    {
        $test = CBTTest::with('attempts.user')->findOrFail($testId);

        $attempts = $test->attempts->map(function ($attempt) {
            return [
                'user_name' => $attempt->user?->name ?? 'Unknown User',
                'score' => $attempt->score,
                'status' => $attempt->status,
                'started_at' => $attempt->started_at,
                'completed_at' => $attempt->completed_at,
            ];
        });

        return response()->json([
            'test' => $test,
            'attempts' => $attempts,
        ]);
    }
}
