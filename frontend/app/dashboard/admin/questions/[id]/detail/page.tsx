'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { fetchWithAuth } from '@/app/utils/api';

interface Question {
  id: string;
  stimulus_type: 'none' | 'text' | 'image';
  stimulus?: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  duration?: number;
  points?: number;
  test_id: string;
  test?: {
    title: string;
  };
}

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuestion = useCallback(async () => {
    try {
      const data = await fetchWithAuth(`/admin/questions/${params.id}`);
      setQuestion(data);
    } catch {
      alert('Error fetching question details');
      router.push('/dashboard/admin/questions');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await fetchWithAuth(`/admin/questions/${params.id}`, {
        method: 'DELETE',
      });
      alert('Question deleted successfully');
      router.push('/dashboard/admin/questions');
    } catch {
      alert('Error deleting question');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Question Not Found</h2>
          <Link
            href="/dashboard/admin/questions"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#FF661F] hover:bg-[#E6540F]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Questions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white border border-[#9BC8FF] rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/admin/questions"
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Questions
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Question Details</h1>
                <p className="text-gray-600">Question ID: {question.id}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                href={`/dashboard/admin/questions/${question.id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#FF661F] hover:bg-[#E6540F]"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Question Details */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white border border-[#9BC8FF] rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test
                </label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {question.test?.title || 'Unknown Test'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points
                </label>
                <span className="text-lg font-semibold text-[#FF661F]">
                  {question.points || 1} points
                </span>
              </div>
              {question.duration && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <span className="text-sm text-gray-600">
                    {question.duration} seconds
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Question Text */}
          <div className="bg-white border border-[#9BC8FF] rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Question</h3>
            </div>
            <div className="px-6 py-4">
              <div className="prose max-w-none">
                <p className="text-lg leading-relaxed whitespace-pre-wrap text-gray-900">
                  {question.question}
                </p>
              </div>
            </div>
          </div>

          {/* Stimulus */}
          {question.stimulus && (
            <div className="bg-white border border-[#9BC8FF] rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Stimulus</h3>
              </div>
              <div className="px-6 py-4">
                {question.stimulus_type === 'image' ? (
                  <div className="relative w-full h-48">
                    <Image
                      src={`http://localhost:8000/storage/${question.stimulus}`}
                      alt="Question stimulus"
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{question.stimulus}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="bg-white border border-[#9BC8FF] rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Options</h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-3">
                {[
                  { key: 'A', value: question.option_a },
                  { key: 'B', value: question.option_b },
                  { key: 'C', value: question.option_c },
                  { key: 'D', value: question.option_d },
                ].map((option) => (
                  <div
                    key={option.key}
                    className={`p-4 rounded-lg border-2 ${
                      question.correct_answer === option.key
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-700">
                        {option.key}.
                      </span>
                      <span className="flex-1">{option.value || 'N/A'}</span>
                      {question.correct_answer === option.key && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Correct Answer
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div className="bg-white border border-[#9BC8FF] rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Explanation</h3>
              </div>
              <div className="px-6 py-4">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {question.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}