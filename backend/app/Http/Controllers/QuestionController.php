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
            'category_id' => 'nullable|exists:question_categories,id',
            'stimulus_type' => 'required|in:none,text,image',
            'stimulus' => 'nullable|string',
            'question' => 'required|string',
            'option_a' => 'required|string',
            'option_b' => 'required|string',
            'option_c' => 'required|string',
            'option_d' => 'required|string',
            'correct_answer' => 'required|in:A,B,C,D',
            'explanation' => 'nullable|string',
            'duration' => 'nullable|integer|min:30|max:300',
        ]);

        // Map 'question' to 'question_text' for database storage
        $validated['question_text'] = $validated['question'];
        unset($validated['question']);

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
            'category_id' => 'nullable|exists:question_categories,id',
            'stimulus_type' => 'required|in:none,text,image',
            'stimulus' => 'nullable|string',
            'question' => 'required|string',
            'option_a' => 'required|string',
            'option_b' => 'required|string',
            'option_c' => 'required|string',
            'option_d' => 'required|string',
            'correct_answer' => 'required|in:A,B,C,D',
            'explanation' => 'nullable|string',
            'duration' => 'nullable|integer|min:30|max:300',
        ]);

        // Map 'question' to 'question_text' for database storage
        $validated['question_text'] = $validated['question'];
        unset($validated['question']);

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
