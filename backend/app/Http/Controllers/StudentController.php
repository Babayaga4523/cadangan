<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Attempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class StudentController extends Controller
{
    /**
     * Display a listing of students.
     */
    public function index()
    {
        $students = User::where('role', 'siswa')
            ->with(['attempts' => function ($query) {
                $query->with('test')->orderBy('created_at', 'desc');
            }])
            ->get()
            ->map(function ($student) {
                $totalAttempts = $student->attempts->count();
                $completedAttempts = $student->attempts->where('status', 'completed')->count();
                $averageScore = $student->attempts->where('status', 'completed')->avg('score') ?? 0;

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'total_attempts' => $totalAttempts,
                    'completed_attempts' => $completedAttempts,
                    'average_score' => round($averageScore, 2),
                    'last_attempt' => $student->attempts->first()?->created_at,
                ];
            });

        return response()->json($students);
    }

    /**
     * Store a newly created student.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $student = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'siswa',
        ]);

        return response()->json($student, 201);
    }

    /**
     * Get detailed information about a specific student.
     */
    public function show($studentId)
    {
        $student = User::where('role', 'siswa')->findOrFail($studentId);

        $attempts = Attempt::with('test')
            ->where('user_id', $studentId)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($attempt) {
                $timeTaken = $attempt->started_at && $attempt->finished_at
                    ? $attempt->started_at->diffInSeconds($attempt->finished_at)
                    : null;
                return [
                    'id' => $attempt->id,
                    'test' => [
                        'id' => $attempt->test_id,
                        'title' => $attempt->test?->title ?? 'Unknown Test',
                    ],
                    'score' => $attempt->score,
                    'status' => $attempt->status,
                    'started_at' => $attempt->started_at?->toISOString(),
                    'completed_at' => $attempt->finished_at?->toISOString(),
                    'time_taken_seconds' => $timeTaken,
                ];
            });

        return response()->json([
            'id' => $student->id,
            'name' => $student->name,
            'email' => $student->email,
            'created_at' => $student->created_at?->toISOString(),
            'updated_at' => $student->updated_at?->toISOString(),
            'history' => $attempts,
        ]);
    }

    /**
     * Update student information.
     */
    public function update(Request $request, $studentId)
    {
        $student = User::where('role', 'siswa')->findOrFail($studentId);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $student->id,
            'password' => 'sometimes|nullable|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $updateData = [];
        if ($request->has('name')) $updateData['name'] = $request->name;
        if ($request->has('email')) $updateData['email'] = $request->email;
        if ($request->has('password') && $request->password) {
            $updateData['password'] = Hash::make($request->password);
        }

        $student->update($updateData);

        return response()->json($student);
    }

    /**
     * Remove a student.
     */
    public function destroy($studentId)
    {
        $student = User::where('role', 'siswa')->findOrFail($studentId);
        $student->delete();

        return response()->json(['message' => 'Student deleted successfully']);
    }

    /**
     * Get test attempt history for a specific student.
     */
    public function history($studentId)
    {
        $student = User::where('role', 'siswa')->findOrFail($studentId);

        $attempts = Attempt::with('test')
            ->where('user_id', $studentId)
            ->orderByDesc('created_at')
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
                        'title' => $attempt->test?->title ?? 'Unknown Test',
                        'description' => $attempt->test?->description ?? null,
                    ],
                ];
            });

        return response()->json([
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
            ],
            'attempts' => $attempts,
        ]);
    }
}
