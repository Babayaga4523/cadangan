"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/auth";
import { fetchWithAuth } from "@/app/utils/api";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Trophy,
  Clock,
  Calendar
} from "lucide-react";

interface TestStat {
  test_id: string;
  test_title: string;
  attempts_count: number;
  average_score: number;
  completion_rate: number;
}

interface RecentAttempt {
  id: string;
  user_name: string;
  test_title: string;
  score: number;
  completed_at: string;
  time_taken: number;
}

interface ReportData {
  total_tests: number;
  total_attempts: number;
  average_score: number;
  completion_rate: number;
  test_stats: TestStat[];
  recent_attempts: RecentAttempt[];
}

export default function AdminReportsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/dashboard/student');
      return;
    }

    fetchReports();
  }, [user, router]);

  const fetchReports = async () => {
    try {
      const data = await fetchWithAuth('/admin/reports');
      setReportData(data || {
        total_tests: 0,
        total_attempts: 0,
        average_score: 0,
        completion_rate: 0,
        test_stats: [],
        recent_attempts: []
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReportData({
        total_tests: 0,
        total_attempts: 0,
        average_score: 0,
        completion_rate: 0,
        test_stats: [],
        recent_attempts: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 pt-8">
        <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  📊
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Laporan & Analisis CBT</h1>
                <p className="text-gray-700">Analisis mendalam hasil tes dan performa siswa</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/admin"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                ← Kembali
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {isLoading ? (
          <div className="space-y-8">
            {/* Loading Skeleton */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : reportData ? (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-800">Total Tes</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.total_tests || 0}</p>
                    </div>
                  </div>
                  <div className="text-blue-500">
                    <FileText className="h-8 w-8" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-green-200/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                      <Users className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-800">Total Peserta</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.total_attempts || 0}</p>
                    </div>
                  </div>
                  <div className="text-green-500">
                    <Users className="h-8 w-8" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-yellow-200/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white shadow-lg">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-800">Rata-rata Nilai</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.average_score || 0}</p>
                    </div>
                  </div>
                  <div className="text-yellow-500">
                    <Trophy className="h-8 w-8" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-orange-200/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-800">Tingkat Kelulusan</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.completion_rate || 0}%</p>
                    </div>
                  </div>
                  <div className="text-orange-500">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>

            {/* Test Statistics */}
            <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl shadow-xl shadow-blue-100/50 overflow-hidden">
              <div className="px-6 py-5 border-b border-blue-50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Statistik per Tes
                </h3>
              </div>

              {reportData.test_stats.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-700">
                  <BarChart3 className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p>Belum ada data tes</p>
                </div>
              ) : (
                <ul className="divide-y divide-blue-50">
                  {reportData.test_stats.map((stat) => (
                    <li key={stat.test_id} className="px-6 py-4 hover:bg-blue-50/50 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {stat.test_title}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-blue-500" />
                              <span>Peserta: {stat.attempts_count}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              <span>Rata-rata: {stat.average_score}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <span>Kelulusan: {stat.completion_rate}%</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 mt-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[#FF661F] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(stat.completion_rate || 0, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-700">
                              {stat.completion_rate}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent Attempts */}
            <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl shadow-xl shadow-blue-100/50 overflow-hidden">
              <div className="px-6 py-5 border-b border-blue-50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Aktivitas Terbaru
                </h3>
              </div>

              {reportData.recent_attempts.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-700">
                  <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p>Belum ada aktivitas</p>
                </div>
              ) : (
                <ul className="divide-y divide-blue-50">
                  {reportData.recent_attempts.map((attempt) => (
                    <li key={attempt.id} className="px-6 py-4 hover:bg-blue-50/50 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                              <Users className="h-5 w-5" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-900">
                                {attempt.user_name}
                              </span>
                              <p className="text-xs text-gray-700">
                                {attempt.test_title}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center text-xs text-gray-700 space-x-4">
                            <div className="flex items-center space-x-1">
                              <Trophy className="h-3 w-3 text-yellow-500" />
                              <span>Skor: {attempt.score}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 text-orange-500" />
                              <span>Waktu: {formatTime(attempt.time_taken)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-blue-500" />
                              <span>{new Date(attempt.completed_at).toLocaleDateString('id-ID')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            attempt.score >= 70
                              ? 'bg-green-100 text-green-800'
                              : attempt.score >= 50
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {attempt.score >= 70 ? 'Lulus' : attempt.score >= 50 ? 'Cukup' : 'Tidak Lulus'}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-12 shadow-xl shadow-blue-100/50 max-w-md mx-auto">
              <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada data</h3>
              <p className="text-gray-700 mb-6">
                Belum ada laporan yang tersedia. Data akan muncul setelah ada aktivitas tes.
              </p>
              <Link
                href="/dashboard/admin"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Kembali ke Dashboard
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}