<?php

namespace App\Http\Controllers;

use App\Models\CBTTest;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CBTTestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $tests = CBTTest::withCount('questions')->get()->map(function ($test) {
                return [
                    'id' => $test->id,
                    'title' => $test->title,
                    'description' => $test->description,
                    'duration_minutes' => $test->duration_minutes,
                    'total_questions' => $test->questions_count,
                    'created_at' => $test->created_at,
                    'updated_at' => $test->updated_at,
                ];
            });
            return response()->json($tests);
        } catch (\Exception $e) {
            Log::error('Error fetching tests: ' . $e->getMessage());
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration_minutes' => 'required|integer|min:1',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'is_active' => 'boolean',
            'randomize_questions' => 'boolean',
            'show_results_immediately' => 'boolean',
            'question_ids' => 'nullable|array',
            'question_ids.*' => 'exists:questions,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $test = CBTTest::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'title' => $request->title,
            'description' => $request->description,
            'duration_minutes' => $request->duration_minutes,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'is_active' => $request->is_active ?? true,
            'randomize_questions' => $request->randomize_questions ?? false,
            'show_results_immediately' => $request->show_results_immediately ?? false,
        ]);

        if ($request->has('question_ids') && is_array($request->question_ids)) {
            // Questions are modeled with a hasMany (each question has a test_id).
            // When creating a test and attaching existing questions, update their
            // test_id to point to the newly created test.
            Question::whereIn('id', $request->question_ids)->get()->each(function ($question) use ($test) {
                $question->test_id = $test->id;
                $question->save();
            });
            // Refresh relation on the model
            $test->load('questions');
        }

        return response()->json($test->load('questions'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $test = CBTTest::findOrFail($id);
        $test->load('questions');
        return response()->json([
            'id' => $test->id,
            'title' => $test->title,
            'description' => $test->description,
            'duration_minutes' => $test->duration_minutes,
            'total_questions' => $test->questions->count(),
            'questions' => $test->questions,
            'created_at' => $test->created_at,
            'updated_at' => $test->updated_at,
        ]);
    }

    /**
     * Scores / leaderboard for a test (completed attempts only).
     */
    public function scores(Request $request, $id)
    {
        $test = CBTTest::findOrFail($id);
        $attempts = $test->attempts()
            ->where('status', 'completed')
            ->with('user')
            ->orderByDesc('score')
            ->orderByDesc('finished_at')
            ->get()
            ->map(function ($attempt) {
                $timeTaken = $attempt->started_at && $attempt->finished_at
                    ? $attempt->started_at->diffInSeconds($attempt->finished_at)
                    : null;
                return [
                    'attempt_id' => $attempt->id,
                    'user_name' => $attempt->user?->name ?? 'Unknown',
                    'user_email' => $attempt->user?->email ?? null,
                    'score' => round($attempt->score ?? 0, 2),
                    'finished_at' => $attempt->finished_at?->toISOString(),
                    'time_taken_seconds' => $timeTaken,
                ];
            });

        return response()->json([
            'test' => [
                'id' => $test->id,
                'title' => $test->title,
                'total_questions' => $test->questions()->count(),
            ],
            'leaderboard' => $attempts,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $test = CBTTest::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'duration_minutes' => 'sometimes|required|integer|min:1',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'is_active' => 'boolean',
            'randomize_questions' => 'boolean',
            'show_results_immediately' => 'boolean',
            'question_ids' => 'sometimes|array',
            'question_ids.*' => 'exists:questions,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $updateData = [
            'title' => $request->title,
            'description' => $request->description,
            'duration_minutes' => $request->duration_minutes,
        ];

        if ($request->has('start_date')) $updateData['start_date'] = $request->start_date;
        if ($request->has('end_date')) $updateData['end_date'] = $request->end_date;
        if ($request->has('is_active')) $updateData['is_active'] = $request->is_active;
        if ($request->has('randomize_questions')) $updateData['randomize_questions'] = $request->randomize_questions;
        if ($request->has('show_results_immediately')) $updateData['show_results_immediately'] = $request->show_results_immediately;

        $test->update($updateData);

        if ($request->has('question_ids') && is_array($request->question_ids)) {
            $incoming = $request->question_ids;
            // Unassign questions that are no longer part of this test
            Question::where('test_id', $test->id)
                ->whereNotIn('id', $incoming)
                ->update(['test_id' => null]);

            // Assign incoming question ids to this test
            Question::whereIn('id', $incoming)->get()->each(function ($question) use ($test) {
                $question->test_id = $test->id;
                $question->save();
            });

            $test->load('questions');
        }

        return response()->json($test->load('questions'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $test = CBTTest::findOrFail($id);
        $test->delete();
        return response()->json(['message' => 'Test deleted successfully']);
    }
}
