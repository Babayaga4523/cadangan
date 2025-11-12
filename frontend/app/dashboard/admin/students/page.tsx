"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/auth";
import { fetchWithAuth } from "@/app/utils/api";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Users,
  Trophy,
  Clock,
  TrendingUp,
  Edit
} from "lucide-react";

interface Student {
  id: number;
  name: string;
  email: string;
  total_attempts: number;
  completed_attempts: number;
  average_score: number;
  last_attempt: string | null;
}

export default function AdminStudentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/dashboard/student');
      return;
    }

    fetchStudents();
  }, [user, router]);

  const fetchStudents = async () => {
    try {
      const data = await fetchWithAuth('/admin/students');
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    (student.name?.toLowerCase() || '').includes(searchTerm?.toLowerCase() || '') ||
    (student.email?.toLowerCase() || '').includes(searchTerm?.toLowerCase() || '')
  );

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
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  <Users className="h-8 w-8" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Manajemen Siswa</h1>
                <p className="text-gray-600">Kelola data siswa CBT dengan mudah dan efisien</p>
              </div>
            </div>
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 font-semibold hover:from-blue-200 hover:to-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Stats Cards */}
        <div className="mb-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Siswa</p>
                    <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                  </div>
                </div>
                <div className="text-blue-500">
                  <Users className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-green-200/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Rata-rata Nilai</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {students.length > 0
                        ? (students.reduce((sum, s) => sum + s.average_score, 0) / students.length).toFixed(1)
                        : '0'
                      }
                    </p>
                  </div>
                </div>
                <div className="text-green-500">
                  <Trophy className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-yellow-200/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white shadow-lg">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Tes</p>
                    <p className="text-2xl font-bold text-gray-900">{students.reduce((sum, s) => sum + s.total_attempts, 0)}</p>
                  </div>
                </div>
                <div className="text-yellow-500">
                  <TrendingUp className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-orange-200/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tes Selesai</p>
                    <p className="text-2xl font-bold text-gray-900">{students.reduce((sum, s) => sum + s.completed_attempts, 0)}</p>
                  </div>
                </div>
                <div className="text-orange-500">
                  <Clock className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cari Siswa</h3>
                <p className="text-sm text-gray-600">Temukan siswa berdasarkan nama atau email</p>
              </div>
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Ketik untuk mencari siswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none text-black placeholder-black"
              />
              <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-xl border border-blue-200">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">
                  {searchTerm ? `${filteredStudents.length} dari ${students.length}` : `${students.length} siswa`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-xl shadow-gray-100/50 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-12 shadow-xl shadow-gray-100/50 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-4xl">
              {searchTerm ? '🔍' : '👥'}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchTerm ? 'Tidak Ditemukan' : 'Belum Ada Siswa'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'Coba kata kunci yang berbeda atau periksa ejaan'
                : 'Belum ada siswa yang terdaftar dalam sistem CBT'
              }
            </p>
            {!searchTerm && (
              <Link
                href="/dashboard/admin/students/create"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Users className="h-5 w-5 mr-2" />
                Tambah Siswa Baru
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredStudents.map((student, index) => (
              <div key={student.id} className="group bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-300 hover:-translate-y-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Siswa CBT</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        student.average_score >= 80 ? 'bg-green-100 text-green-800' :
                        student.average_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {student.average_score >= 80 ? '🏆 Excellence' :
                         student.average_score >= 60 ? '⭐ Good' : '📚 Needs Improvement'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/admin/students/${student.id}`}
                      className="w-9 h-9 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors duration-200"
                      title="Lihat Detail"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/dashboard/admin/students/${student.id}/edit`}
                      className="w-9 h-9 rounded-lg bg-amber-50 hover:bg-amber-100 flex items-center justify-center text-amber-600 hover:text-amber-700 transition-colors duration-200"
                      title="Edit Siswa"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                {/* Student Content */}
                <div className="mb-4">
                  <h4 className="text-xl font-bold text-gray-900 mb-2 leading-relaxed">
                    {student.name}
                  </h4>

                  <p className="text-gray-600 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {student.email}
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-blue-700 font-medium">Rata-rata</p>
                          <p className="text-sm font-bold text-blue-900">{student.average_score.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50/50 border border-green-200 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-xs text-green-700 font-medium">Total Tes</p>
                          <p className="text-sm font-bold text-green-900">{student.total_attempts}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50/50 border border-yellow-200 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-xs text-yellow-700 font-medium">Selesai</p>
                          <p className="text-sm font-bold text-yellow-900">{student.completed_attempts}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50/50 border border-orange-200 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="text-xs text-orange-700 font-medium">Terakhir</p>
                          <p className="text-sm font-bold text-orange-900">
                            {student.last_attempt
                              ? new Date(student.last_attempt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                              : '-'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress Tes</span>
                      <span className="text-sm text-gray-600">
                        {student.completed_attempts}/{student.total_attempts} tes
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: student.total_attempts > 0
                            ? `${(student.completed_attempts / student.total_attempts) * 100}%`
                            : '0%'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      ID: {student.id}
                    </span>
                  </div>

                  <div className="text-xs text-gray-400">
                    Bergabung {new Date().toLocaleDateString('id-ID')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}