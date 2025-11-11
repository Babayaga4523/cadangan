"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/app/stores/auth";
import { fetchWithAuth } from "@/app/utils/api";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  ImageIcon,
  FileText,
  BookOpen
} from "lucide-react";

interface QuestionForm {
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
}

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const { user, checkAuth } = useAuthStore();
  const [question, setQuestion] = useState<QuestionForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const questionId = params.id as string;

  const fetchQuestionDetail = useCallback(async () => {
    if (!questionId) return;
    
    try {
      const data = await fetchWithAuth(`/admin/questions/${questionId}`);
      if (data) {
        setQuestion({
          stimulus_type: data.stimulus_type || 'none',
          stimulus: data.stimulus || '',
          question: data.question || '',
          option_a: data.option_a || '',
          option_b: data.option_b || '',
          option_c: data.option_c || '',
          option_d: data.option_d || '',
          correct_answer: data.correct_answer || 'A',
          explanation: data.explanation || '',
          duration: data.duration || undefined
        });
      }
    } catch (error) {
      console.error('Error fetching question detail:', error);
    } finally {
      setIsLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard/student');
    } else if (user && questionId) {
      fetchQuestionDetail();
    }
  }, [user, router, questionId, fetchQuestionDetail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    try {
      await fetchWithAuth(`/admin/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(question),
      });

      router.push('/dashboard/admin/questions');
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { errors?: Record<string, string> } } };
        if (err.response?.data?.errors) {
          setErrors(err.response.data.errors);
        }
      } else {
        console.error('Error updating question:', error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof QuestionForm, value: string | number | undefined) => {
    if (question) {
      setQuestion({
        ...question,
        [field]: value
      });
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            Soal tidak ditemukan
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/admin/questions"
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Soal</h1>
                <p className="text-sm text-gray-500">Ubah informasi soal</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <form onSubmit={handleSubmit} className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                {/* Stimulus Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Stimulus
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'none', label: 'Tanpa Stimulus', icon: BookOpen },
                      { value: 'text', label: 'Teks', icon: FileText },
                      { value: 'image', label: 'Gambar', icon: ImageIcon }
                    ].map((type) => (
                      <label key={type.value} className="relative">
                        <input
                          type="radio"
                          name="stimulus_type"
                          value={type.value}
                          checked={question.stimulus_type === type.value}
                          onChange={(e) => handleChange('stimulus_type', e.target.value as 'none' | 'text' | 'image')}
                          className="sr-only"
                        />
                        <div className={`cursor-pointer border rounded-lg p-4 text-center ${
                          question.stimulus_type === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}>
                          <type.icon className={`h-6 w-6 mx-auto mb-2 ${
                            question.stimulus_type === type.value ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                          <span className={`text-sm font-medium ${
                            question.stimulus_type === type.value ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {type.label}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.stimulus_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.stimulus_type}</p>
                  )}
                </div>

                {/* Stimulus Content */}
                {(question.stimulus_type === 'text' || question.stimulus_type === 'image') && (
                  <div>
                    <label htmlFor="stimulus" className="block text-sm font-medium text-gray-700">
                      {question.stimulus_type === 'text' ? 'Teks Stimulus' : 'URL Gambar'}
                    </label>
                    {question.stimulus_type === 'text' ? (
                      <textarea
                        id="stimulus"
                        rows={3}
                        value={question.stimulus || ''}
                        onChange={(e) => handleChange('stimulus', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Masukkan teks stimulus"
                      />
                    ) : (
                      <input
                        type="url"
                        id="stimulus"
                        value={question.stimulus || ''}
                        onChange={(e) => handleChange('stimulus', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="https://example.com/image.jpg"
                      />
                    )}
                    {errors.stimulus && (
                      <p className="mt-1 text-sm text-red-600">{errors.stimulus}</p>
                    )}
                  </div>
                )}

                {/* Question */}
                <div>
                  <label htmlFor="question" className="block text-sm font-medium text-gray-700">
                    Pertanyaan
                  </label>
                  <textarea
                    id="question"
                    rows={3}
                    value={question.question}
                    onChange={(e) => handleChange('question', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                  {errors.question && (
                    <p className="mt-1 text-sm text-red-600">{errors.question}</p>
                  )}
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'option_a', label: 'A', field: 'option_a' },
                    { key: 'option_b', label: 'B', field: 'option_b' },
                    { key: 'option_c', label: 'C', field: 'option_c' },
                    { key: 'option_d', label: 'D', field: 'option_d' }
                  ].map((option) => (
                    <div key={option.key}>
                      <label htmlFor={option.key} className="block text-sm font-medium text-gray-700">
                        Opsi {option.label}
                      </label>
                      <input
                        type="text"
                        id={option.key}
                        value={question[option.field as keyof QuestionForm] as string}
                        onChange={(e) => handleChange(option.field as keyof QuestionForm, e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                      {errors[option.field] && (
                        <p className="mt-1 text-sm text-red-600">{errors[option.field]}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Correct Answer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jawaban Benar
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {['A', 'B', 'C', 'D'].map((answer) => (
                      <label key={answer} className="relative">
                        <input
                          type="radio"
                          name="correct_answer"
                          value={answer}
                          checked={question.correct_answer === answer}
                          onChange={(e) => handleChange('correct_answer', e.target.value as 'A' | 'B' | 'C' | 'D')}
                          className="sr-only"
                        />
                        <div className={`cursor-pointer border rounded-lg p-3 text-center ${
                          question.correct_answer === answer
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}>
                          <span className={`text-sm font-medium ${
                            question.correct_answer === answer ? 'text-green-900' : 'text-gray-900'
                          }`}>
                            {answer}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.correct_answer && (
                    <p className="mt-1 text-sm text-red-600">{errors.correct_answer}</p>
                  )}
                </div>

                {/* Explanation */}
                <div>
                  <label htmlFor="explanation" className="block text-sm font-medium text-gray-700">
                    Penjelasan (Opsional)
                  </label>
                  <textarea
                    id="explanation"
                    rows={3}
                    value={question.explanation || ''}
                    onChange={(e) => handleChange('explanation', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Penjelasan jawaban yang benar"
                  />
                  {errors.explanation && (
                    <p className="mt-1 text-sm text-red-600">{errors.explanation}</p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                    Durasi (detik, opsional)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    min="0"
                    value={question.duration || ''}
                    onChange={(e) => handleChange('duration', parseInt(e.target.value) || undefined)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="60"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <Link
                href="/dashboard/admin/questions"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-3"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}