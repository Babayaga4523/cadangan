"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from '@/app/utils/api';
import { Play, Clock, FileText, CheckCircle } from "lucide-react";

interface CBTTest {
  id: number;
  title: string;
  description?: string;
  duration_minutes: number;
  total_questions: number;
  created_at: string;
  has_attempted?: boolean;
  last_attempt_score?: number;
  can_retake?: boolean;
}

export default function StudentTestsPage() {
  const [tests, setTests] = useState<CBTTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const data = await fetchWithAuth('/student/tests');
      setTests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const getTestStatus = (test: CBTTest) => {
    if (test.has_attempted) {
      if (test.can_retake) {
        return {
          status: 'completed',
          label: 'Completed - Can Retake',
          color: 'text-blue-600 bg-blue-100',
          icon: CheckCircle
        };
      } else {
        return {
          status: 'completed',
          label: 'Completed',
          color: 'text-green-600 bg-green-100',
          icon: CheckCircle
        };
      }
    }
    return {
      status: 'available',
      label: 'Available',
      color: 'text-purple-600 bg-purple-100',
      icon: Play
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading available tests...</p>
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
            onClick={fetchTests}
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Tests</h1>
          <p className="mt-2 text-gray-600">Choose a CBT test to begin or review your previous attempts</p>
        </div>

        {tests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 mb-4">
              <FileText className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tests available</h3>
            <p className="text-gray-600">There are currently no CBT tests available for you to take. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => {
              const status = getTestStatus(test);
              const StatusIcon = status.icon;

              return (
                <div key={test.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {test.title}
                        </h3>
                        {test.description && (
                          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                            {test.description}
                          </p>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${status.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{test.duration_minutes} minutes</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="w-4 h-4 mr-2" />
                        <span>{test.total_questions} questions</span>
                      </div>
                      {test.has_attempted && test.last_attempt_score !== undefined && (
                        <div className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span>Last score: {test.last_attempt_score}%</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Link
                        href={`/cbt/${test.id}`}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {test.has_attempted ? 'Retake Test' : 'Start Test'}
                      </Link>
                      {test.has_attempted && (
                        <Link
                          href="/student/results"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          View Results
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{tests.length}</div>
              <div className="text-sm text-gray-600">Available Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tests.filter(t => t.has_attempted).length}
              </div>
              <div className="text-sm text-gray-600">Tests Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {tests.filter(t => t.can_retake).length}
              </div>
              <div className="text-sm text-gray-600">Available for Retake</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}