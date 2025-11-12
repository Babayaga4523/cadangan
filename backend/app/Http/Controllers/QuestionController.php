<?php

namespace App\Http\Controllers;

use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $questions = Question::orderBy('created_at', 'desc')->get();
        return response()->json($questions);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'test_id' => 'nullable|string|exists:tests,id',
            'category_id' => 'nullable|exists:question_categories,id',
            'stimulus_type' => 'required|in:none,text,image',
            'stimulus' => 'nullable|string',
            'question' => 'required|string',
            'option_a' => 'nullable|string',
            'option_b' => 'nullable|string',
            'option_c' => 'nullable|string',
            'option_d' => 'nullable|string',
            'correct_answer' => 'required|in:A,B,C,D',
            'explanation' => 'nullable|string',
            'duration' => 'nullable|integer|min:30|max:300',
        ]);

        // Generate UUID for id since the model uses string keys
        $validated['id'] = (string) \Illuminate\Support\Str::uuid();

        $question = Question::create($validated);

        return response()->json($question->load('category'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Question $question)
    {
        return response()->json($question);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Question $question)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Question $question)
    {
        $validated = $request->validate([
            'test_id' => 'nullable|string|exists:tests,id',
            'category_id' => 'nullable|exists:question_categories,id',
            'stimulus_type' => 'required|in:none,text,image',
            'stimulus' => 'nullable|string',
            'question' => 'required|string',
            'option_a' => 'nullable|string',
            'option_b' => 'nullable|string',
            'option_c' => 'nullable|string',
            'option_d' => 'nullable|string',
            'correct_answer' => 'required|in:A,B,C,D',
            'explanation' => 'nullable|string',
            'duration' => 'nullable|integer|min:30|max:300',
        ]);

        $question->update($validated);

        return response()->json($question->load('category'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Question $question)
    {
        $question->delete();

        return response()->json(['message' => 'Question deleted successfully']);
    }
}
