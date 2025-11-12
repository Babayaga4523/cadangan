"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from '@/app/utils/api';
import { ArrowLeft, Save, Plus } from "lucide-react";

interface Question {
  id: number;
  question_text: string;
  stimulus_type?: string;
  stimulus_content?: string;
  options: string[];
  correct_answer: string;
}

export default function CreateTestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_minutes: 60,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const data = await fetchWithAuth('/admin/questions');
      setQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestions.length === 0) {
      setError('Please select at least one question');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await fetchWithAuth('/admin/tests', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          question_ids: selectedQuestions,
        }),
      });

      router.push('/admin/tests');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create test');
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (questionId: number) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="mr-4 p-2 text-gray-400 hover:text-gray-600"
                  title="Go back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Create New CBT Test</h1>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-800">{error}</div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Test Title *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter test title"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter test description (optional)"
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  id="duration"
                  required
                  min="1"
                  max="480"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Select Questions</h3>
                <span className="text-sm text-gray-500">
                  {selectedQuestions.length} question{selectedQuestions.length !== 1 ? 's' : ''} selected
                </span>
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <Plus className="w-12 h-12 mx-auto" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No questions available</h4>
                  <p className="text-gray-600 mb-4">Create some questions first before creating a test.</p>
                  <button
                    type="button"
                    onClick={() => router.push('/admin/questions/create')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Question
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {questions.map((question, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedQuestions.includes(question.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleQuestion(question.id)}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(question.id)}
                            onChange={() => toggleQuestion(question.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            title={`Select question ${question.id}`}
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium text-gray-900 mb-2">
                            {question.question_text}
                          </div>
                          {question.stimulus_type && (
                            <div className="text-sm text-gray-500 mb-2">
                              Stimulus: {question.stimulus_type}
                            </div>
                          )}
                          <div className="text-sm text-gray-500">
                            Options: {question.options.length} • Correct: {question.correct_answer}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || selectedQuestions.length === 0}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Create Test
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}