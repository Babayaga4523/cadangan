"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from 'next/image';
import { fetchWithAuth } from '@/app/utils/api';
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface QuestionReview {
  id: number;
  question_text: string;
  stimulus_type?: string;
  stimulus_content?: string;
  options: string[];
  correct_answer: string;
  user_answer: string;
  explanation?: string;
  is_correct: boolean;
}

interface TestReview {
  test_title: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken: number;
  completed_at: string;
  questions: QuestionReview[];
}

export default function TestReviewPage() {
  const params = useParams();
  const attemptId = params?.id ?? "";
  const [review, setReview] = useState<TestReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReview = useCallback(async () => {
    try {
      const data = await fetchWithAuth(`/student/review/${attemptId}`);
      setReview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load review');
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    if (attemptId) {
      fetchReview();
    }
  }, [attemptId, fetchReview]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading test review...</p>
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
          <Link
            href="/student/results"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Link>
        </div>
      </div>
    );
  }

  if (!review) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/student/results"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{review.test_title}</h1>
            <p className="text-gray-600">
              Completed on {new Date(review.completed_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {/* Score Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{review.score}%</div>
              <div className="text-sm text-gray-600">Final Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {review.correct_answers}/{review.total_questions}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.floor(review.time_taken / 60)}:{(review.time_taken % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">
                {((review.correct_answers / review.total_questions) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div className="space-y-6">
          {review.questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    Question {index + 1}
                  </span>
                  <div className="ml-3 flex items-center">
                    {question.is_correct ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`ml-2 text-sm font-medium ${
                      question.is_correct ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {question.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stimulus if exists */}
              {question.stimulus_type && question.stimulus_content && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Stimulus ({question.stimulus_type}):
                  </div>
                  <div className="text-gray-900">
                    {question.stimulus_type === 'text' ? (
                      <p>{question.stimulus_content}</p>
                    ) : question.stimulus_type === 'image' ? (
                      <div className="relative w-full h-48">
                        <Image
                          src={question.stimulus_content}
                          alt="Question stimulus"
                          fill
                          className="object-contain rounded"
                        />
                      </div>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: question.stimulus_content }} />
                    )}
                  </div>
                </div>
              )}

              {/* Question */}
              <div className="mb-4">
                <div className="text-gray-900 font-medium mb-3">
                  {question.question_text}
                </div>

                {/* Options */}
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => {
                    const optionLetter = String.fromCharCode(65 + optionIndex);
                    const isCorrect = option === question.correct_answer;
                    const isUserAnswer = option === question.user_answer;

                    let optionClass = 'border rounded-lg p-3 ';
                    if (isCorrect && isUserAnswer) {
                      optionClass += 'border-green-500 bg-green-50';
                    } else if (isCorrect) {
                      optionClass += 'border-green-500 bg-green-50';
                    } else if (isUserAnswer && !isCorrect) {
                      optionClass += 'border-red-500 bg-red-50';
                    } else {
                      optionClass += 'border-gray-200';
                    }

                    return (
                      <div key={optionIndex} className={optionClass}>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 mr-3">{optionLetter}.</span>
                          <span className="flex-1">{option}</span>
                          {isCorrect && (
                            <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                          )}
                          {isUserAnswer && !isCorrect && (
                            <XCircle className="w-5 h-5 text-red-600 ml-2" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explanation */}
              {question.explanation && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 mb-2">Explanation:</div>
                  <div className="text-blue-700">{question.explanation}</div>
                </div>
              )}

              {/* Answer Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <div>
                    <span className="text-gray-600">Your answer: </span>
                    <span className={`font-medium ${
                      question.is_correct ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {question.user_answer || 'Not answered'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Correct answer: </span>
                    <span className="font-medium text-green-600">{question.correct_answer}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}