"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/app/stores/auth";
import { fetchWithAuth } from "@/app/utils/api";
import Link from "next/link";
import {
  Edit,
  User,
  Mail,
  Calendar,
  Trophy,
  Clock,
  FileText
} from "lucide-react";

interface StudentDetail {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  history: Array<{
    id: string;
    test: {
      id: string;
      title: string;
    };
    score: number;
    status: string;
    started_at: string;
    completed_at: string;
    time_taken_seconds: number;
  }>;
}

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const studentId = params.id as string;

  const fetchStudentDetail = useCallback(async () => {
    if (!studentId) return;

    try {
      const data = await fetchWithAuth(`/admin/students/${studentId}`);
      setStudent(data);
    } catch (error) {
      console.error('Error fetching student detail:', error);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/dashboard/student');
      return;
    }

    if (studentId) {
      fetchStudentDetail();
    }
  }, [user, router, studentId, fetchStudentDetail]);

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

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            Siswa tidak ditemukan
          </div>
        </div>
      </div>
    );
  }

  const studentHistory = student.history || [];
  const completedAttempts = studentHistory.filter(h => h.status === 'completed');
  const averageScore = completedAttempts.length > 0
    ? completedAttempts.reduce((sum, h) => sum + h.score, 0) / completedAttempts.length
    : 0;
  const totalTime = completedAttempts.reduce((sum, h) => sum + h.time_taken_seconds, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white border border-[#9BC8FF] rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FFB28A] flex items-center justify-center text-white text-2xl font-bold">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
              <p className="text-sm text-gray-600">Detail Siswa</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/admin/students" className="text-sm text-gray-600 hidden md:inline">Kembali</Link>
            <Link
              href={`/dashboard/admin/students/${student.id}/edit`}
              className="inline-flex items-center px-4 py-2 rounded-full bg-[#FF661F] text-white text-sm font-semibold hover:bg-[#E6540F] transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Siswa
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Tes</dt>
                    <dd className="text-xl font-semibold text-gray-900">{studentHistory.length}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-xl flex items-center p-5 h-28 border border-[#9BC8FF]">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tes Selesai</dt>
                    <dd className="text-xl font-semibold text-gray-900">{completedAttempts.length}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-xl flex items-center p-5 h-28 border border-[#9BC8FF]">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Rata-rata Nilai</dt>
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
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Waktu</dt>
                    <dd className="text-xl font-semibold text-gray-900">{Math.floor(totalTime / 60)}m</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Info */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-[#9BC8FF] rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Informasi Siswa</h3>

                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-16 w-16 rounded-full bg-[#FFB28A] flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{student.name}</h4>
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-1" />
                      {student.email}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Bergabung: {new Date(student.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Total Tes: {studentHistory.length}</span>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Rata-rata Skor: {averageScore.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Total Waktu: {Math.floor(totalTime / 60)}m {totalTime % 60}s</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Terakhir diubah: {new Date(student.updated_at).toLocaleDateString('id-ID')}
                </div>
              </div>
            </div>

            {/* Test History */}
            <div className="bg-white border border-[#9BC8FF] rounded-xl shadow-sm overflow-hidden mt-6">
              <div className="px-6 py-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Riwayat Tes</h3>

                {studentHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">Belum ada riwayat tes</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studentHistory.map((attempt, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-white transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-900">{attempt.test.title}</h4>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            attempt.status === 'completed'
                              ? attempt.score >= 70 ? 'bg-green-100 text-green-800' :
                                attempt.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {attempt.status === 'completed' ? `${attempt.score.toFixed(1)}%` : 'Belum Selesai'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                          <div>
                            <Calendar className="h-4 w-4 inline mr-1" />
                            Dimulai: {new Date(attempt.started_at).toLocaleDateString('id-ID')}
                          </div>
                          {attempt.completed_at && (
                            <div>
                              <Calendar className="h-4 w-4 inline mr-1" />
                              Selesai: {new Date(attempt.completed_at).toLocaleDateString('id-ID')}
                            </div>
                          )}
                          {attempt.status === 'completed' && (
                            <div>
                              <Clock className="h-4 w-4 inline mr-1" />
                              Waktu: {Math.floor(attempt.time_taken_seconds / 60)}m {attempt.time_taken_seconds % 60}s
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div>
            <div className="bg-white border border-[#9BC8FF] rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Statistik Detail</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total Tes</span>
                    <span className="text-sm font-semibold text-gray-900">{studentHistory.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-600">Tes Selesai</span>
                    <span className="text-sm font-semibold text-green-600">{completedAttempts.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm text-gray-600">Tes Belum Selesai</span>
                    <span className="text-sm font-semibold text-yellow-600">{studentHistory.length - completedAttempts.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-600">Rata-rata Skor</span>
                    <span className="text-sm font-semibold text-blue-600">{averageScore.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm text-gray-600">Skor Tertinggi</span>
                    <span className="text-sm font-semibold text-purple-600">
                      {completedAttempts.length > 0 ? Math.max(...completedAttempts.map(a => a.score)).toFixed(1) : '0'}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-sm text-gray-600">Skor Terendah</span>
                    <span className="text-sm font-semibold text-red-600">
                      {completedAttempts.length > 0 ? Math.min(...completedAttempts.map(a => a.score)).toFixed(1) : '0'}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white border border-[#9BC8FF] rounded-xl shadow-sm overflow-hidden mt-6">
              <div className="px-6 py-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Performa Terbaru</h3>

                {completedAttempts.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">Belum ada data performa</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedAttempts.slice(-5).map((attempt, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-600 truncate flex-1 mr-2">{attempt.test.title}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-[#FF661F] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(attempt.score, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-gray-900 min-w-[35px]">{attempt.score.toFixed(0)}%</span>
                        </div>
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