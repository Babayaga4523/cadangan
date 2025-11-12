"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/app/utils/api";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  BarChart3,
  Users
} from "lucide-react";

interface Test {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  total_attempts: number;
  completed_attempts: number;
  average_score: number;
  is_active: boolean;
  total_questions: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'siswa';
}

interface Stats {
  totalTests: number;
  totalQuestions: number;
  totalStudents: number;
  totalReports: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [stats, setStats] = useState<Stats>({ totalTests: 0, totalQuestions: 0, totalStudents: 0, totalReports: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check auth from localStorage
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      setIsCheckingAuth(false);
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      if (!userData || userData.role !== 'admin') {
        router.push('/dashboard/student');
        setIsCheckingAuth(false);
        return;
      }

      setUser(userData);
      setIsCheckingAuth(false);
      fetchData();
    } catch {
      router.push('/login');
      setIsCheckingAuth(false);
    }
  }, [router]);

  const fetchData = async () => {
    try {
      const [testsData, questionsData, studentsData, reportsData] = await Promise.all([
        fetchWithAuth('/admin/tests').catch(() => []),
        fetchWithAuth('/admin/questions').catch(() => []),
        fetchWithAuth('/admin/students').catch(() => []),
        fetchWithAuth('/admin/reports').catch(() => ({ total_attempts: 0 })),
      ]);
      setTests(testsData);
      setStats({
        totalTests: testsData.length,
        totalQuestions: questionsData.length,
        totalStudents: studentsData.length,
        totalReports: reportsData.total_attempts || 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set default values if all fail
      setTests([]);
      setStats({ totalTests: 0, totalQuestions: 0, totalStudents: 0, totalReports: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">
            {isCheckingAuth ? 'Memverifikasi autentikasi...' : 'Mengalihkan...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-8">
        {/* Stats Cards */}
        <div className="mb-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-800">Total Tes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTests}</p>
                  </div>
                </div>
                <div className="text-blue-500">
                  <FileText className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-green-200/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-800">Total Soal</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
                  </div>
                </div>
                <div className="text-green-500">
                  <BookOpen className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-800">Total Siswa</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                  </div>
                </div>
                <div className="text-purple-500">
                  <Users className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-orange-200/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-800">Total Laporan</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
                  </div>
                </div>
                <div className="text-orange-500">
                  <BarChart3 className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Aksi Cepat</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            <Link
              href="/dashboard/admin/test-questions"
              className="group"
            >
              <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-300 hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Tes & Soal</h3>
                  <p className="text-sm text-gray-700 mb-4">Kelola tes dan soal dengan mudah</p>
                  <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg">
                    Kelola Tes & Soal
                  </div>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/admin/questions"
              className="group"
            >
              <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-green-200/50 transition-all duration-300 hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Bank Soal</h3>
                  <p className="text-sm text-gray-700 mb-4">Kelola koleksi soal lengkap</p>
                  <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg">
                    Kelola Soal
                  </div>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/admin/tests"
              className="group"
            >
              <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-300 hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Kelola Tes</h3>
                  <p className="text-sm text-gray-700 mb-4">Buat dan atur tes CBT</p>
                  <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg">
                    Kelola Tes
                  </div>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/admin/students"
              className="group"
            >
              <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-indigo-200/50 transition-all duration-300 hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Kelola Siswa</h3>
                  <p className="text-sm text-gray-700 mb-4">Pantau dan kelola siswa</p>
                  <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg">
                    Kelola Siswa
                  </div>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/admin/reports"
              className="group"
            >
              <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-orange-200/50 transition-all duration-300 hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Laporan</h3>
                  <p className="text-sm text-gray-700 mb-4">Analisis hasil tes lengkap</p>
                  <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg">
                    Lihat Laporan
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Tests */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Tes Terbaru</h2>
            <Link
              href="/dashboard/admin/tests"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Lihat Semua Tes
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xl shadow-gray-100/50 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : tests.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-xl shadow-gray-100/50 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Belum Ada Tes</h3>
              <p className="text-gray-700 mb-6">Belum ada tes yang dibuat. Mulai buat tes pertama Anda!</p>
              <Link
                href="/dashboard/admin/tests"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl inline-block"
              >
                Buat Tes Baru
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tests.slice(0, 6).map((test) => (
                <div key={test.id} className="group">
                  <div className="relative bg-white border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                    {/* Background gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-orange-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Floating particles effect */}
                    <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-60 animate-pulse"></div>
                    <div className="absolute bottom-6 left-6 w-1 h-1 bg-orange-400 rounded-full opacity-0 group-hover:opacity-40 animate-pulse animation-delay-500"></div>

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-bold text-blue-700">{test.total_attempts ?? 0} peserta</span>
                            </div>
                          </div>
                          {test.is_active && (
                            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
                              <span className="text-xs font-semibold text-green-700 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                Aktif
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-900 transition-colors duration-300">{test.title}</h3>
                      <p className="text-sm text-gray-700 mb-6 line-clamp-3 leading-relaxed">{test.description}</p>

                      {/* Stats row */}
                      <div className="flex items-center justify-between mb-6 p-3 rounded-xl bg-gray-50/80 backdrop-blur-sm border border-gray-100">
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-semibold text-gray-700">{test.duration_minutes} menit</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="font-semibold text-gray-700">{test.total_questions} soal</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Link
                          href={`/dashboard/admin/tests/${test.id}/scores`}
                          className="group flex-1 relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-200/50 hover:-translate-y-0.5"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative flex items-center justify-center px-4 py-3 gap-2">
                            <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <span className="font-bold">Lihat Nilai</span>
                          </div>
                        </Link>
                        <Link
                          href={`/dashboard/admin/tests/${test.id}`}
                          className="group flex-1 relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-orange-200/50 hover:-translate-y-0.5"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative flex items-center justify-center px-4 py-3 gap-2">
                            <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </div>
                            <span className="font-bold">Edit Tes</span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}