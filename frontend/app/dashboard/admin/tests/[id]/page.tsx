"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/app/stores/auth";
import { fetchWithAuth } from "@/app/utils/api";
import Link from "next/link";
import {
  Edit,
  Clock,
  FileText,
  Users,
  TrendingUp,
  Calendar
} from "lucide-react";

interface TestDetail {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  total_questions: number;
  created_at: string;
  updated_at: string;
  questions: Array<{
    id: number;
    question: string;
    stimulus_type: string;
    correct_answer: string;
  }>;
  attempts: Array<{
    id: string;
    user: {
      name: string;
      email: string;
    };
    score: number;
    status: string;
    completed_at: string;
  }>;
}

export default function TestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [test, setTest] = useState<TestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const testId = params.id as string;

  const fetchTestDetail = useCallback(async () => {
    if (!testId) return;
    
    try {
      const data = await fetchWithAuth(`/admin/tests/${testId}`);
      setTest(data);
    } catch (error) {
      console.error('Error fetching test detail:', error);
    } finally {
      setIsLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/dashboard/student');
      return;
    }

    if (testId) {
      fetchTestDetail();
    }
  }, [user, router, testId, fetchTestDetail]);

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

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            Tes tidak ditemukan
          </div>
        </div>
      </div>
    );
  }

  const testAttempts = test.attempts || [];
  const completedAttempts = testAttempts.filter(a => a.status === 'completed');
  const averageScore = completedAttempts.length > 0
    ? completedAttempts.reduce((sum, a) => sum + a.score, 0) / completedAttempts.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white border border-[#9BC8FF] rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FFB28A] flex items-center justify-center text-white text-2xl font-bold">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
              <p className="text-sm text-gray-700">Detail Tes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/admin/tests" className="text-sm text-gray-700 hidden md:inline">Kembali</Link>
            <Link
              href={`/dashboard/admin/tests/${test.id}/edit`}
              className="inline-flex items-center px-4 py-2 rounded-full bg-[#FF661F] text-white text-sm font-semibold hover:bg-[#E6540F] transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Tes
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="mb-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            <div className="bg-white overflow-hidden shadow rounded-xl flex items-center p-5 h-28 border border-[#9BC8FF]">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-700 truncate">Jumlah Soal</dt>
                    <dd className="text-xl font-semibold text-gray-900">{test.total_questions}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-xl flex items-center p-5 h-28 border border-[#9BC8FF]">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-700 truncate">Total Percobaan</dt>
                    <dd className="text-xl font-semibold text-gray-900">{testAttempts.length}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-xl flex items-center p-5 h-28 border border-[#9BC8FF]">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-700 truncate">Rata-rata Nilai</dt>
                    <dd className="text-xl font-semibold text-gray-900">
                      {averageScore.toFixed(1)}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-xl flex items-center p-5 h-28 border border-[#9BC8FF]">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-700 truncate">Durasi</dt>
                    <dd className="text-xl font-semibold text-gray-900">{test.duration_minutes}m</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Test Info */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-[#9BC8FF] rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Informasi Tes</h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">Durasi: {test.duration_minutes} menit</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">Jumlah Soal: {test.total_questions}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">Total Percobaan: {testAttempts.length}</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">Rata-rata Skor: {averageScore.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Deskripsi</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{test.description || 'Tidak ada deskripsi'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-gray-700">
                  <div>
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Dibuat: {new Date(test.created_at).toLocaleDateString('id-ID')}
                  </div>
                  <div>
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Diubah: {new Date(test.updated_at).toLocaleDateString('id-ID')}
                  </div>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="bg-white border border-[#9BC8FF] rounded-xl shadow-sm overflow-hidden mt-6">
              <div className="px-6 py-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Daftar Soal</h3>

                {test.questions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-700">Belum ada soal untuk tes ini</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {test.questions.map((question, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-white transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Soal {index + 1}
                              </span>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Jawaban: {question.correct_answer}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 mb-2">{question.question}</p>
                          </div>
                          <Link
                            href={`/dashboard/admin/questions/${question.id}/edit`}
                            className="text-gray-400 hover:text-[#FF661F] ml-2 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Attempts Summary */}
          <div>
            <div className="bg-white border border-[#9BC8FF] rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Ringkasan Percobaan</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Total Percobaan</span>
                    <span className="text-sm font-semibold text-gray-900">{testAttempts.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-700">Selesai</span>
                    <span className="text-sm font-semibold text-green-600">{completedAttempts.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm text-gray-700">Belum Selesai</span>
                    <span className="text-sm font-semibold text-yellow-600">{testAttempts.length - completedAttempts.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-700">Rata-rata Skor</span>
                    <span className="text-sm font-semibold text-blue-600">{averageScore.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Attempts */}
            <div className="bg-white border border-[#9BC8FF] rounded-xl shadow-sm overflow-hidden mt-6">
              <div className="px-6 py-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Percobaan Terbaru</h3>

                {completedAttempts.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-700">Belum ada percobaan yang selesai</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedAttempts.slice(0, 5).map((attempt, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{attempt.user.name}</p>
                          <p className="text-xs text-gray-700">{new Date(attempt.completed_at).toLocaleDateString('id-ID')}</p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ml-2 ${
                          attempt.score >= 70 ? 'bg-green-100 text-green-800' :
                          attempt.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {attempt.score.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}