"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/auth";
import { fetchWithAuth } from "@/app/utils/api";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Clock
} from "lucide-react";

interface Test {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  total_questions: number;
  created_at: string;
  updated_at: string;
}

export default function AdminTestsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [tests, setTests] = useState<Test[]>([]);
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

    fetchTests();
  }, [user, router]);

  const fetchTests = async () => {
    try {
      const data = await fetchWithAuth('/admin/tests');
      setTests(data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (testId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tes ini?')) {
      return;
    }

    try {
      await fetchWithAuth(`/admin/tests/${testId}`, {
        method: 'DELETE',
      });
      setTests(tests.filter(t => t.id !== testId));
    } catch (error) {
      console.error('Error deleting test:', error);
    }
  };

  const filteredTests = tests.filter(test =>
    test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.description.toLowerCase().includes(searchTerm.toLowerCase())
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
                  <FileText className="h-8 w-8" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Manajemen Tes</h1>
                <p className="text-gray-600">Kelola tes CBT dengan mudah dan efisien</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/admin"
                className="text-sm text-gray-600 hidden md:inline hover:text-orange-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/admin/tests/create"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Buat Tes Baru
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Search & Stats */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Search Card */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Cari Tes</h3>
                    <p className="text-sm text-gray-600">Temukan tes berdasarkan judul atau deskripsi</p>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Ketik untuk mencari tes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none text-black placeholder-black"
                />
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xl font-bold">
                  {filteredTests.length}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {searchTerm ? 'Hasil Pencarian' : 'Total Tes'}
                </h3>
                <p className="text-sm text-gray-600">
                  {searchTerm ? `${filteredTests.length} dari ${tests.length} tes` : 'Tes dalam sistem'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tests List */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-xl shadow-gray-100/50 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-12 shadow-xl shadow-gray-100/50 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-4xl">
              {searchTerm ? '🔍' : '📝'}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchTerm ? 'Tidak Ditemukan' : 'Belum Ada Tes'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'Coba kata kunci yang berbeda atau periksa ejaan'
                : 'Mulai buat tes pertama Anda untuk mengisi bank tes CBT'
              }
            </p>
            {!searchTerm && (
              <Link
                href="/dashboard/admin/tests/create"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Buat Tes Pertama
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTests.map((test, index) => (
              <div key={test.id} className="group bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-300 hover:-translate-y-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Tes CBT</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        test.total_questions > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {test.total_questions} Soal
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/admin/tests/${test.id}/scores`}
                      className="w-9 h-9 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
                      title="Lihat Nilai"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </Link>
                    <Link
                      href={`/dashboard/admin/tests/${test.id}`}
                      className="w-9 h-9 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors duration-200"
                      title="Lihat Detail"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/dashboard/admin/tests/${test.id}/edit`}
                      className="w-9 h-9 rounded-lg bg-amber-50 hover:bg-amber-100 flex items-center justify-center text-amber-600 hover:text-amber-700 transition-colors duration-200"
                      title="Edit Tes"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(test.id)}
                      className="w-9 h-9 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 hover:text-red-700 transition-colors duration-200"
                      title="Hapus Tes"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Test Content */}
                <div className="mb-4">
                  <h4 className="text-xl font-bold text-gray-900 mb-2 leading-relaxed">
                    {test.title}
                  </h4>

                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {test.description}
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-blue-700 font-medium">Durasi</p>
                          <p className="text-sm font-bold text-blue-900">{test.duration_minutes} menit</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50/50 border border-green-200 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-xs text-green-700 font-medium">Soal</p>
                          <p className="text-sm font-bold text-green-900">{test.total_questions}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="text-xs text-purple-700 font-medium">Dibuat</p>
                          <p className="text-sm font-bold text-purple-900">
                            {new Date(test.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50/50 border border-orange-200 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <div>
                          <p className="text-xs text-orange-700 font-medium">Diubah</p>
                          <p className="text-sm font-bold text-orange-900">
                            {new Date(test.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
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
                      ID: {test.id}
                    </span>
                  </div>

                  <div className="text-xs text-gray-400">
                    Dibuat {new Date(test.created_at).toLocaleDateString('id-ID')}
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