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
        <div className="bg-gradient-to-r from-white via-blue-50 to-purple-50 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-2xl shadow-blue-100/30 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-400 to-pink-500 rounded-full translate-y-24 -translate-x-24"></div>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-purple-500/30 animate-pulse">
                  📊
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <div className="absolute -top-1 -left-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
                  Laporan & Analisis CBT
                </h1>
                <p className="text-gray-600 text-lg font-medium">
                  Analisis mendalam hasil tes dan performa siswa
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-500">Data terbaru tersedia</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Sistem Aktif</span>
              </div>
              <Link
                href="/dashboard/admin"
                className="group inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali
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
                <div key={i} className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 backdrop-blur-sm border border-white/50 rounded-3xl p-6 shadow-xl shadow-gray-100/30 animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-gray-600/5 rounded-3xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300"></div>
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20 mb-2"></div>
                      <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16 mb-3"></div>
                      <div className="flex items-center text-xs">
                        <div className="w-3 h-3 bg-gray-200 rounded mr-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Test Statistics Loading */}
            <div className="bg-gradient-to-br from-white via-slate-50 to-gray-50 backdrop-blur-sm border border-white/50 rounded-3xl shadow-2xl shadow-slate-100/30 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20"></div>
                  <div>
                    <div className="h-5 bg-white/20 rounded w-40 mb-2"></div>
                    <div className="h-3 bg-white/20 rounded w-32"></div>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white/60 border border-white/50 rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300"></div>
                        <div>
                          <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-48 mb-2"></div>
                          <div className="flex gap-4">
                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-12 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                      <div className="w-full bg-gray-200 rounded-full h-3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : reportData ? (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="group relative bg-gradient-to-br from-white via-blue-50 to-blue-100 backdrop-blur-sm border border-white/50 rounded-3xl p-6 shadow-xl shadow-blue-100/30 hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <FileText className="h-7 w-7" />
                    </div>
                    <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <FileText className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Total Tes</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{reportData.total_tests || 0}</p>
                    <div className="flex items-center text-xs text-blue-600 font-medium">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>Aktif</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-white via-green-50 to-green-100 backdrop-blur-sm border border-white/50 rounded-3xl p-6 shadow-xl shadow-green-100/30 hover:shadow-2xl hover:shadow-green-200/40 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <Users className="h-7 w-7" />
                    </div>
                    <div className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Total Peserta</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{reportData.total_attempts || 0}</p>
                    <div className="flex items-center text-xs text-green-600 font-medium">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>Peserta Aktif</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-white via-yellow-50 to-yellow-100 backdrop-blur-sm border border-white/50 rounded-3xl p-6 shadow-xl shadow-yellow-100/30 hover:shadow-2xl hover:shadow-yellow-200/40 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <Trophy className="h-7 w-7" />
                    </div>
                    <div className="text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <Trophy className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Rata-rata Nilai</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{reportData.average_score || 0}</p>
                    <div className="flex items-center text-xs text-yellow-600 font-medium">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>Dari 100</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-white via-orange-50 to-red-50 backdrop-blur-sm border border-white/50 rounded-3xl p-6 shadow-xl shadow-orange-100/30 hover:shadow-2xl hover:shadow-orange-200/40 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <TrendingUp className="h-7 w-7" />
                    </div>
                    <div className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Tingkat Kelulusan</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{reportData.completion_rate || 0}%</p>
                    <div className="flex items-center text-xs text-orange-600 font-medium">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>Persentase</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Statistics */}
            <div className="bg-gradient-to-br from-white via-slate-50 to-gray-50 backdrop-blur-sm border border-white/50 rounded-3xl shadow-2xl shadow-slate-100/30 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Statistik per Tes</h3>
                    <p className="text-white/80 text-sm">Analisis performa setiap tes</p>
                  </div>
                </div>
              </div>

              {reportData.test_stats.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl mb-4">
                    📊
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada data tes</h3>
                  <p className="text-gray-600">Data statistik akan muncul setelah ada aktivitas tes</p>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {reportData.test_stats.map((stat, index) => (
                    <div key={stat.test_id} className="group relative bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900 mb-1">{stat.test_title}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4 text-blue-500" />
                                  <span>{stat.attempts_count} peserta</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Trophy className="h-4 w-4 text-yellow-500" />
                                  <span>Rata-rata: {stat.average_score}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.completion_rate}%</div>
                            <div className="text-sm text-gray-600">Kelulusan</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 font-medium">Tingkat Kelulusan</span>
                            <span className="text-gray-900 font-semibold">{stat.completion_rate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            {/* Dynamic width for progress bar - inline styles required for runtime percentage calculation */}
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${Math.min(stat.completion_rate || 0, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>0%</span>
                            <span className="font-medium text-gray-700">Kelulusan: {stat.completion_rate}%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Attempts */}
            <div className="bg-gradient-to-br from-white via-indigo-50 to-purple-50 backdrop-blur-sm border border-white/50 rounded-3xl shadow-2xl shadow-indigo-100/30 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Aktivitas Terbaru</h3>
                    <p className="text-white/80 text-sm">Riwayat tes siswa terakhir</p>
                  </div>
                </div>
              </div>

              {reportData.recent_attempts.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl mb-4">
                    🕐
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada aktivitas</h3>
                  <p className="text-gray-600">Aktivitas tes akan muncul di sini setelah siswa mulai mengerjakan tes</p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {reportData.recent_attempts.map((attempt, index) => (
                    <div key={attempt.id} className="group relative bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                                {attempt.user_name.charAt(0).toUpperCase()}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900 mb-1">{attempt.user_name}</h4>
                              <p className="text-sm text-gray-600 mb-2">{attempt.test_title}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Trophy className="h-3 w-3 text-yellow-500" />
                                  <span>Skor: {attempt.score}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-orange-500" />
                                  <span>Waktu: {formatTime(attempt.time_taken)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-blue-500" />
                                  <span>{new Date(attempt.completed_at).toLocaleDateString('id-ID')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold mb-2 ${
                              attempt.score >= 80
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                : attempt.score >= 60
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                                : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                            }`}>
                              {attempt.score >= 80 ? '🏆 Excellent' : attempt.score >= 60 ? '✅ Good' : '⚠️ Needs Work'}
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{attempt.score}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Diselesaikan {new Date(attempt.completed_at).toLocaleString('id-ID')}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            #{index + 1} dari aktivitas terbaru
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-lg mx-auto">
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center text-6xl shadow-2xl">
                  📊
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-sm font-bold">?</span>
                </div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-ping opacity-75"></div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Tidak ada data laporan</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Belum ada laporan yang tersedia saat ini. Data akan muncul secara otomatis setelah siswa mulai mengikuti tes dan menyelesaikannya.
              </p>

              <div className="space-y-4">
                <Link
                  href="/dashboard/admin"
                  className="inline-flex items-center px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Kembali ke Dashboard
                </Link>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Data akan diperbarui secara real-time</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}