"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from '@/app/utils/api';
import { Trophy, Clock, Target, TrendingUp, Eye, RotateCcw } from "lucide-react";

interface TestResult {
  id: number;
  test_title: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken: number;
  completed_at: string;
  max_score: number;
}

export default function StudentResultsPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const data = await fetchWithAuth('/student/results');
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold">Error</div>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={fetchResults}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Test Results</h1>
          <p className="mt-2 text-gray-600">View your CBT test performance and progress</p>
        </div>

        {results.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Trophy className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No test results yet</h3>
            <p className="text-gray-600 mb-6">You haven&apos;t completed any CBT tests yet. Start taking tests to see your results here.</p>
            <Link
              href="/student/tests"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Target className="w-5 h-5 mr-2" />
              Take a Test
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Statistics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {results.length}
                  </div>
                  <div className="text-sm text-gray-600">Tests Taken</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {(results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {Math.floor(results.reduce((sum, r) => sum + r.time_taken, 0) / results.length / 60)}m
                  </div>
                  <div className="text-sm text-gray-600">Avg Time</div>
                </div>
              </div>
            </div>

            {/* Individual Test Results */}
            <div className="space-y-4">
              {results.map((result) => (
                <div key={result.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{result.test_title}</h3>
                      <p className="text-sm text-gray-600">
                        Completed on {new Date(result.completed_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(result.score)}`}>
                      {getScoreLabel(result.score)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Target className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">Score</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{result.score}%</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Trophy className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">Correct</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {result.correct_answers}/{result.total_questions}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Clock className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">Time</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.floor(result.time_taken / 60)}:{(result.time_taken % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">Max Score</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{result.max_score}%</div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Link
                      href={`/student/results/${result.id}`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Link>
                    <Link
                      href={`/cbt/${result.id}?retake=true`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retake Test
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}