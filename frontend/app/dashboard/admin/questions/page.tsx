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
  BookOpen,
  ImageIcon,
  FileText
} from "lucide-react";

interface Question {
  id: string;
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
  created_at: string;
}

export default function QuestionsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      setIsCheckingAuth(false);
      return;
    }

    if (user.role !== 'admin') {
      router.push('/dashboard/student');
      setIsCheckingAuth(false);
      return;
    }

    setIsCheckingAuth(false);
    fetchQuestions();
  }, [user, router]);

  const fetchQuestions = async () => {
    try {
      const data = await fetchWithAuth('/admin/questions');
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
      return;
    }

    try {
      await fetchWithAuth(`/admin/questions/${questionId}`, {
        method: 'DELETE',
      });
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const filteredQuestions = questions.filter(question =>
    (question.question?.toLowerCase() || '').includes(searchTerm?.toLowerCase() || '') ||
    (question.option_a?.toLowerCase() || '').includes(searchTerm?.toLowerCase() || '') ||
    (question.option_b?.toLowerCase() || '').includes(searchTerm?.toLowerCase() || '') ||
    (question.option_c?.toLowerCase() || '').includes(searchTerm?.toLowerCase() || '') ||
    (question.option_d?.toLowerCase() || '').includes(searchTerm?.toLowerCase() || '')
  );

  const getStimulusIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4 text-blue-600" />;
      case 'text':
        return <FileText className="h-4 w-4 text-green-600" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStimulusLabel = (type: string) => {
    switch (type) {
      case 'image':
        return 'Gambar';
      case 'text':
        return 'Teks';
      default:
        return 'Tanpa Stimulus';
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
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 pt-8">
        <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  <BookOpen className="h-8 w-8" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Manajemen Soal</h1>
                <p className="text-gray-700">Kelola bank soal CBT dengan mudah dan efisien</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/admin"
                className="text-sm text-gray-700 hidden md:inline hover:text-orange-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/admin/questions/create"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Tambah Soal Baru
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
                    <h3 className="text-lg font-semibold text-gray-900">Cari Soal</h3>
                    <p className="text-sm text-gray-700">Temukan soal berdasarkan pertanyaan atau opsi jawaban</p>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Ketik untuk mencari soal..."
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
                  {filteredQuestions.length}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {searchTerm ? 'Hasil Pencarian' : 'Total Soal'}
                </h3>
                <p className="text-sm text-gray-700">
                  {searchTerm ? `${filteredQuestions.length} dari ${questions.length} soal` : 'Soal dalam bank'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-xl shadow-gray-100/50 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
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
        ) : filteredQuestions.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-12 shadow-xl shadow-gray-100/50 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-4xl">
              {searchTerm ? '🔍' : '📚'}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchTerm ? 'Tidak Ditemukan' : 'Belum Ada Soal'}
            </h3>
            <p className="text-gray-700 mb-6">
              {searchTerm
                ? 'Coba kata kunci yang berbeda atau periksa ejaan'
                : 'Mulai buat soal pertama Anda untuk mengisi bank soal CBT'
              }
            </p>
            {!searchTerm && (
              <Link
                href="/dashboard/admin/questions/create"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Buat Soal Pertama
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQuestions.map((question, index) => (
              <div key={question.id} className="group bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-300 hover:-translate-y-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStimulusIcon(question.stimulus_type)}
                      <span className="text-sm font-medium text-gray-700">
                        {getStimulusLabel(question.stimulus_type)}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        question.correct_answer === 'A' ? 'bg-green-100 text-green-800' :
                        question.correct_answer === 'B' ? 'bg-blue-100 text-blue-800' :
                        question.correct_answer === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        Jawaban: {question.correct_answer}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/admin/questions/${question.id}/detail`}
                      className="w-9 h-9 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors duration-200"
                      title="Lihat Detail"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/dashboard/admin/questions/${question.id}/edit`}
                      className="w-9 h-9 rounded-lg bg-amber-50 hover:bg-amber-100 flex items-center justify-center text-amber-600 hover:text-amber-700 transition-colors duration-200"
                      title="Edit Soal"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="w-9 h-9 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 hover:text-red-700 transition-colors duration-200"
                      title="Hapus Soal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Question Content */}
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 leading-relaxed">
                    {question.question}
                  </h4>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      question.correct_answer === 'A'
                        ? 'border-green-300 bg-green-50/50'
                        : 'border-gray-200 bg-gray-50/30'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          question.correct_answer === 'A'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}>
                          A
                        </span>
                        <span className="text-sm text-gray-800 flex-1">{question.option_a || 'N/A'}</span>
                      </div>
                    </div>

                    <div className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      question.correct_answer === 'B'
                        ? 'border-green-300 bg-green-50/50'
                        : 'border-gray-200 bg-gray-50/30'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          question.correct_answer === 'B'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}>
                          B
                        </span>
                        <span className="text-sm text-gray-800 flex-1">{question.option_b || 'N/A'}</span>
                      </div>
                    </div>

                    <div className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      question.correct_answer === 'C'
                        ? 'border-green-300 bg-green-50/50'
                        : 'border-gray-200 bg-gray-50/30'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          question.correct_answer === 'C'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}>
                          C
                        </span>
                        <span className="text-sm text-gray-800 flex-1">{question.option_c || 'N/A'}</span>
                      </div>
                    </div>

                    <div className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      question.correct_answer === 'D'
                        ? 'border-green-300 bg-green-50/50'
                        : 'border-gray-200 bg-gray-50/30'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          question.correct_answer === 'D'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}>
                          D
                        </span>
                        <span className="text-sm text-gray-800 flex-1">{question.option_d || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h5 className="text-sm font-semibold text-blue-900 mb-1">Pembahasan</h5>
                          <p className="text-sm text-blue-800 leading-relaxed">{question.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-xs text-gray-700">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {question.duration ? `${question.duration}s` : 'Tidak dibatasi'}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(question.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500">
                    ID: {question.id}
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