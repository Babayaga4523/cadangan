"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/auth";
import { fetchWithAuth } from "@/app/utils/api";
import Link from "next/link";
import { ArrowLeft, Save, Plus, List, FileText, BookOpen, Image as ImageIcon, CheckCircle, X } from "lucide-react";
import QuestionFormTab from "@/app/components/QuestionFormTab";

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  stimulus_type: 'none' | 'text' | 'image';
  stimulus_content?: string;
}

export default function CreateTestPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_minutes: 30,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/dashboard/student');
      return;
    }

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

  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleNewQuestionSubmit = async (formData: {
    stimulus_type: 'none' | 'text' | 'image';
    stimulus: string;
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: 'A' | 'B' | 'C' | 'D';
    explanation: string;
    duration: number;
  }) => {
    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth('/admin/questions', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      handleNewQuestionCreatedFromResponse(response);
    } catch (error) {
      console.error('Error creating question:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat soal';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewQuestionCreatedFromResponse = (newQuestion: Question) => {
    setQuestions(prev => [newQuestion, ...prev]);
    setSelectedQuestions(prev => [...prev, newQuestion.id]);
    setActiveTab('existing');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedQuestions.length === 0) {
      alert('Pilih minimal 1 soal untuk tes');
      return;
    }

    setIsSubmitting(true);

    try {
      await fetchWithAuth('/admin/tests', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          question_ids: selectedQuestions,
        }),
      });

      router.push('/dashboard/admin/tests');
    } catch (error) {
      console.error('Error creating test:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat tes';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-black">Memverifikasi autentikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
            <CheckCircle className="h-6 w-6" />
            <span className="font-semibold">Soal berhasil ditambahkan!</span>
            <button
              onClick={() => setShowSuccess(false)}
              className="ml-2 hover:bg-green-600 rounded-full p-1"
              title="Tutup notifikasi"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 pt-8">
        <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  <Plus className="h-8 w-8" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Buat Tes Baru</h1>
                <p className="text-black">Buat tes CBT dengan soal-soal yang lengkap dan terorganisir</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/admin/tests"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-black font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Kembali
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Test Information */}
          <div className="bg-white border border-blue-100 rounded-2xl p-8 shadow-xl shadow-blue-100/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Informasi Tes</h3>
                <p className="text-black">Masukkan detail dasar untuk tes baru Anda</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <label htmlFor="title" className="block text-sm font-semibold text-black mb-2">
                  Judul Tes *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all sm:text-sm bg-white/50 backdrop-blur-sm placeholder-black text-black"
                  placeholder="Contoh: Ujian Matematika Dasar Kelas X Semester 1"
                />
              </div>

              <div className="lg:col-span-2">
                <label htmlFor="description" className="block text-sm font-semibold text-black mb-2">
                  Deskripsi Tes
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all sm:text-sm bg-white/50 backdrop-blur-sm resize-none placeholder-black text-black"
                  placeholder="Contoh: Tes ini mencakup materi aljabar, geometri, dan statistika. Siswa memiliki waktu 90 menit untuk menyelesaikan 50 soal pilihan ganda. Pastikan koneksi internet stabil selama tes berlangsung."
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-semibold text-black mb-2">
                  Durasi Tes *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="duration"
                    min="5"
                    max="300"
                    required
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 30 }))}
                    className="block w-full px-4 py-3 pr-16 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all sm:text-sm bg-white/50 backdrop-blur-sm placeholder-black text-black"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <span className="text-black text-sm font-medium">menit</span>
                  </div>
                </div>
                <p className="text-xs text-black mt-2">Waktu pengerjaan tes dalam menit (5-300 menit)</p>
              </div>

              <div className="flex items-center justify-center lg:justify-start">
                <div className="bg-gradient-to-r from-blue-50 to-orange-50 px-6 py-4 rounded-xl border border-blue-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{selectedQuestions.length}</div>
                    <div className="text-sm text-black">Soal Dipilih</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-8 shadow-xl shadow-blue-100/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  2
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-black">Pilih Soal Tes</h3>
                  <p className="text-black">Pilih soal yang akan dimasukkan ke dalam tes</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('existing')}
                  className={`inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm ${
                    activeTab === 'existing'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'bg-white border border-gray-200 text-black hover:bg-gray-50'
                  }`}
                  title="Pilih soal yang sudah ada dari bank soal"
                >
                  <List className="h-5 w-5 mr-2" />
                  Pilih Soal
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('new')}
                  className={`inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm ${
                    activeTab === 'new'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                      : 'bg-white border border-gray-200 text-black hover:bg-gray-50'
                  }`}
                  title="Buat soal baru untuk ditambahkan ke tes"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Buat Soal Baru
                </button>
              </div>
            </div>

            {activeTab === 'existing' ? (
              <>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-6 animate-pulse">
                        <div className="flex items-start space-x-4">
                          <div className="w-5 h-5 bg-gray-200 rounded"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                            <div className="flex gap-2">
                              <div className="h-6 bg-gray-200 rounded w-16"></div>
                              <div className="h-6 bg-gray-200 rounded w-16"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      <BookOpen className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-bold text-black mb-2">Belum Ada Soal</h3>
                    <p className="text-black mb-6 max-w-md mx-auto">
                      Belum ada soal yang tersedia. Buat soal baru terlebih dahulu untuk dapat membuat tes.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('new')}
                      className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Buat Soal Baru
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {questions.map((question, index) => (
                      <div
                        key={index}
                        className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedQuestions.includes(question.id)
                            ? 'border-orange-300 bg-gradient-to-r from-orange-50 to-orange-25 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => handleQuestionToggle(question.id)}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                              selectedQuestions.includes(question.id)
                                ? 'border-orange-500 bg-orange-500'
                                : 'border-gray-300'
                            }`}>
                              {selectedQuestions.includes(question.id) && (
                                <CheckCircle className="h-4 w-4 text-white" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <p className="text-sm font-semibold text-black line-clamp-2 flex-1 mr-4">
                                {question.question}
                              </p>
                              <div className="flex gap-2 flex-shrink-0">
                                {question.stimulus_type !== 'none' && (
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                    question.stimulus_type === 'text'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-purple-100 text-purple-800'
                                  }`}>
                                    {question.stimulus_type === 'text' ? (
                                      <FileText className="h-3 w-3 mr-1" />
                                    ) : (
                                      <ImageIcon className="h-3 w-3 mr-1" />
                                    )}
                                    {question.stimulus_type === 'text' ? 'Teks' : 'Gambar'}
                                  </span>
                                )}
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {question.correct_answer}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs text-black mb-3">
                              <div className="bg-gray-50 px-3 py-2 rounded-lg">
                                <strong className="text-orange-600">A:</strong> <span className="text-black">{question.option_a || 'Belum diisi'}</span>
                              </div>
                              <div className="bg-gray-50 px-3 py-2 rounded-lg">
                                <strong className="text-orange-600">B:</strong> <span className="text-black">{question.option_b || 'Belum diisi'}</span>
                              </div>
                              <div className="bg-gray-50 px-3 py-2 rounded-lg">
                                <strong className="text-orange-600">C:</strong> <span className="text-black">{question.option_c || 'Belum diisi'}</span>
                              </div>
                              <div className="bg-gray-50 px-3 py-2 rounded-lg">
                                <strong className="text-orange-600">D:</strong> <span className="text-black">{question.option_d || 'Belum diisi'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gradient-to-br from-orange-50 to-orange-25 border-2 border-orange-200 rounded-xl p-6">
                <QuestionFormTab onQuestionCreated={handleNewQuestionCreatedFromResponse} onSubmit={handleNewQuestionSubmit} />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/dashboard/admin/tests"
              className="inline-flex items-center px-8 py-4 border-2 border-gray-300 shadow-sm text-sm font-semibold rounded-xl text-black bg-white hover:bg-gray-50 transition-all duration-200"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || selectedQuestions.length === 0}
              className="inline-flex items-center px-8 py-4 border-2 border-orange-500 shadow-sm text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Membuat Tes...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-3" />
                  Buat Tes ({selectedQuestions.length} soal)
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}