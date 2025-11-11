"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchWithAuth } from '@/app/utils/api';
import { ArrowLeft, Edit, Trash2, Users } from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
}

interface CBTTest {
  id: string;
  title: string;
  description?: string;
  duration_minutes: number;
  total_questions: number;
  questions: Question[];
  created_at: string;
  updated_at: string;
}

export default function TestDetailPage() {
  const params = useParams();
  const testId = params.id as string;
  const [test, setTest] = useState<CBTTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (testId) {
      fetchTest();
    }
  }, [testId]);

  const fetchTest = async () => {
    try {
      const data = await fetchWithAuth(`/admin/tests/${testId}`);
      setTest(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load test');
    } finally {
      setLoading(false);
    }
  };

  const deleteTest = async () => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    try {
      await fetchWithAuth(`/admin/tests/${testId}`, {
        method: 'DELETE',
      });
      window.location.href = '/admin/tests';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete test');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading test details...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold">Error</div>
          <p className="mt-2 text-gray-600">{error || 'Test not found'}</p>
          <Link
            href="/admin/tests"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/admin/tests"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tests
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
                {test.description && (
                  <p className="mt-2 text-gray-600">{test.description}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/admin/tests/${test.id}/edit`}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Test
                </Link>
                <button
                  onClick={deleteTest}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Test
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Duration</div>
                <div className="text-lg font-semibold text-gray-900">{test.duration_minutes} minutes</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Total Questions</div>
                <div className="text-lg font-semibold text-gray-900">{test.total_questions}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Created</div>
                <div className="text-lg font-semibold text-gray-900">
                  {new Date(test.created_at).toLocaleDateString('id-ID')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Questions</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {test.questions.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Users className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                <p className="text-gray-600">This test doesn't have any questions yet.</p>
              </div>
            ) : (
              test.questions.map((question, index) => (
                <div key={question.id} className="px-6 py-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="text-sm text-gray-900 mb-2">
                        {question.question_text}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className={`p-2 rounded ${question.correct_answer === 'A' ? 'bg-green-100 text-green-800' : 'bg-gray-50 text-gray-700'}`}>
                          A. {question.option_a}
                        </div>
                        <div className={`p-2 rounded ${question.correct_answer === 'B' ? 'bg-green-100 text-green-800' : 'bg-gray-50 text-gray-700'}`}>
                          B. {question.option_b}
                        </div>
                        <div className={`p-2 rounded ${question.correct_answer === 'C' ? 'bg-green-100 text-green-800' : 'bg-gray-50 text-gray-700'}`}>
                          C. {question.option_c}
                        </div>
                        <div className={`p-2 rounded ${question.correct_answer === 'D' ? 'bg-green-100 text-green-800' : 'bg-gray-50 text-gray-700'}`}>
                          D. {question.option_d}
                        </div>
                      </div>
                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-blue-800">
                          <strong>Explanation:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}