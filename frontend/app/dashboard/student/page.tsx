"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from '@/app/stores/auth';
import { fetchWithAuth } from '@/app/utils/api';
import Link from "next/link";
import {
  Clock,
  CheckCircle,
  LogOut,
  BookOpen,
  Trophy
} from "lucide-react";

interface Test {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
}

interface Attempt {
  id: string;
  test_id: string;
  score: number | null;
  status: 'in_progress' | 'completed';
  started_at: string;
  finished_at: string | null;
  test: {
    title: string;
    description: string;
  };
}

export default function StudentDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and has the correct role
    if (user === null) {
      // User state is still loading or not authenticated
      setIsCheckingAuth(true);
    } else if (!user) {
      // User is not authenticated
      router.push('/login');
      return;
    } else if (user.role !== 'siswa') {
      // User is authenticated but not a student
      router.push('/dashboard/admin');
      return;
    } else {
      // User is authenticated and is a student
      setIsCheckingAuth(false);
    }
  }, [user, router]);

  useEffect(() => {
    if (!isCheckingAuth) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role !== 'siswa') {
        router.push('/dashboard/admin');
        return;
      }
    }
  }, [user, router, isCheckingAuth]);

  useEffect(() => {
    if (user && user.role === 'siswa') {
      fetchTests();
      fetchAttempts();
    }
  }, [user]);

  const fetchTests = async () => {
    try {
      const data = await fetchWithAuth('/tests');
      setTests(data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const fetchAttempts = async () => {
    try {
      const data = await fetchWithAuth('/history');
      setAttempts(data);
    } catch (error) {
      console.error('Error fetching attempts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getTestStatus = (testId: string) => {
    const attempt = attempts.find(a => a.test_id === testId);
    return attempt ? attempt.status : null;
  };

  const getTestScore = (testId: string) => {
    const attempt = attempts.find(a => a.test_id === testId);
    return attempt ? attempt.score : null;
  };

  if (isCheckingAuth || !user || user.role !== 'siswa') {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header (card-style to match test tiles) */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white border border-[#9BC8FF] rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FFB28A] flex items-center justify-center text-white text-2xl font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19 2H8c-1.1 0-2 .9-2 2v2H5a2 2 0 00-2 2v11a2 2 0 002 2h14a2 2 0 002-2V4a2 2 0 00-2-2zM8 6h9v3H8z"/></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Siswa CBT</h1>
              <p className="text-sm text-gray-700">Selamat datang, <span className="font-semibold">{user.name}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/student/profile" className="text-sm text-gray-700 hidden md:inline">Profil</Link>
            <Link href="/dashboard/student" className="text-sm text-gray-700 hidden md:inline">Dashboard</Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 rounded-full bg-[#FFE7DE] text-[#C24A12] text-sm font-semibold hover:bg-[#FFDCC9]"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            <div className="bg-white overflow-hidden shadow rounded-lg flex items-center p-5 h-28">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-700 truncate">Tes Tersedia</dt>
                    <dd className="text-xl font-semibold text-gray-900">{tests.length}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg flex items-center p-5 h-28">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-700 truncate">Tes Selesai</dt>
                    <dd className="text-xl font-semibold text-gray-900">{attempts.filter(a => a.status === 'completed').length}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg flex items-center p-5 h-28">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-700 truncate">Rata-rata Nilai</dt>
                    <dd className="text-xl font-semibold text-gray-900">
                      {attempts.length > 0
                        ? (attempts
                            .filter(a => a.score !== null)
                            .reduce((sum, a) => sum + (a.score || 0), 0) /
                            attempts.filter(a => a.score !== null).length
                          ).toFixed(1)
                        : '0'
                      }
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg flex items-center p-5 h-28">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-700 truncate">Dalam Pengerjaan</dt>
                    <dd className="text-xl font-semibold text-gray-900">{attempts.filter(a => a.status === 'in_progress').length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Available Tests */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Tes Tersedia</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : tests.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-700">
              Belum ada tes yang tersedia
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tests.map((test) => {
                const status = getTestStatus(test.id);
                const score = getTestScore(test.id);
                return (
                  <div key={test.id} className="flex justify-center">
                    <div className="w-full max-w-md bg-white rounded-xl shadow p-6 relative overflow-hidden transition-shadow hover:shadow-lg">
                      <div className="absolute inset-0 rounded-xl bg-[conic-gradient(from_180deg_at_50%_50%,rgba(154,200,255,0.12),transparent)] pointer-events-none"></div>
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-[#FFB28A] flex items-center justify-center text-white text-xl font-bold mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 2H8c-1.1 0-2 .9-2 2v2H5a2 2 0 00-2 2v11a2 2 0 002 2h14a2 2 0 002-2V4a2 2 0 00-2-2zM8 6h9v3H8z"/></svg>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">{test.title}</h3>
                        <p className="text-xs text-gray-700 mt-1 mb-4">{test.description}</p>

                        <div className="flex flex-col gap-2 w-full">
                          <Link href={`/history?subject_id=${encodeURIComponent(test.title)}`} className="w-full px-4 py-2 rounded-full bg-[#FFE7DE] text-[#C24A12] text-sm font-semibold hover:bg-[#FFDCC9] transition-colors text-center">
                            Riwayat Nilai Tes
                          </Link>
                          <Link href={`/cbt/${test.id}`} className="w-full px-6 py-2 rounded-full bg-[#FF661F] text-white text-sm font-semibold hover:bg-[#E6540F] transition-colors text-center">
                            Mulai CBT
                          </Link>
                        </div>
                      </div>
                      {status === 'completed' && score !== null && (
                        <div className="absolute top-3 right-3 text-xs bg-green-50 text-green-800 px-2 py-1 rounded">Nilai: {score}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Attempts (card grid to match Available Tests theme) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Riwayat Pengerjaan</h3>
            <Link href="/history" className="text-sm text-gray-700">Lihat semua</Link>
          </div>

          {attempts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-700">
              Belum ada riwayat pengerjaan
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {attempts.slice(0, 9).map((a) => (
                <div key={a.id} className="w-full bg-white rounded-xl shadow p-0 overflow-hidden relative">
                  <div className="flex">
                    <div className="w-28 bg-[#FF661F] flex items-center justify-center p-4">
                      <div className="text-white text-center">
                        <div className="text-xs uppercase tracking-wide">Nilai</div>
                        <div className="text-2xl font-extrabold mt-1">{a.score !== null ? Number(a.score).toFixed(0) : '-'}</div>
                        <div className="text-xs mt-1">{a.status === 'completed' ? 'Selesai' : 'Berjalan'}</div>
                      </div>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{a.test.title}</p>
                          <p className="text-xs text-gray-700 mt-1 truncate">{a.test.description}</p>
                        </div>
                        <div className="ml-3">
                          {a.status === 'completed' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Selesai</span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Dalam Pengerjaan</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-col space-y-2">
                        <div className="text-xs text-gray-700">
                          Dimulai: {new Date(a.started_at).toLocaleDateString('id-ID')}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/cbt/hasil?attemptId=${a.id}`} className="text-sm px-3 py-1.5 rounded-full bg-[#FFE7DE] text-[#C24A12] font-semibold hover:bg-[#FFDCC9] transition-colors">
                            Lihat Pembahasan
                          </Link>
                          <Link href={`/cbt/${a.test_id}`} className="text-sm px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                            Ulangi
                          </Link>
                        </div>
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