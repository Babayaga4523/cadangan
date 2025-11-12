'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/app/stores/auth';
import { fetchWithAuth } from '@/app/utils/api';
import { getCsrf } from '@/app/utils/api';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  FileText,
  Clock,
  Users,
  Search,
  BookOpen,
  TestTube,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  Upload
} from 'lucide-react';

interface Test {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  total_questions: number;
  questions?: Question[];
  hasError?: boolean;
}

interface Question {
  id: string;
  category_id?: string;
  category?: {
    id: string;
    name: string;
  };
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
}

interface EditableQuestion extends Question {
  isEditing?: boolean;
  isNew?: boolean;
}

export default function TestQuestionsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [tests, setTests] = useState<Test[]>([]);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [questionSearchTerm, setQuestionSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newTestData, setNewTestData] = useState({
    title: '',
    description: '',
    duration_minutes: 30,
    start_date: '',
    end_date: '',
    is_active: true,
    randomize_questions: false,
    show_results_immediately: false,
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

    fetchTests();
  }, [user, router]);

  const fetchTests = async () => {
    try {
      setError(null);
      console.log('Fetching tests...');
      const data = await fetchWithAuth('/admin/tests');
      console.log('Tests data:', data);

      if (!data || !Array.isArray(data)) {
        const errorMsg = 'Invalid response from server';
        console.error(errorMsg, data);
        setError(errorMsg);
        setTests([]);
        setLoading(false);
        return;
      }

      if (data.length === 0) {
        console.log('No tests found');
        setTests([]);
        setLoading(false);
        return;
      }

      // Load questions for all tests with better error handling
      const testsWithQuestions = [];

      for (const test of data) {
        try {
          console.log('Fetching questions for test:', test.id);
          const testData = await fetchWithAuth(`/admin/tests/${test.id}`);
          console.log('Test data for', test.id, ':', testData);

          const questions = testData?.questions || [];
          console.log('Questions for', test.id, ':', questions.length);

          testsWithQuestions.push({
            ...test,
            questions: questions
          });
        } catch (error) {
          console.error('Error fetching questions for test:', test.id, error);
          // Still add the test but with empty questions and mark it as having an error
          testsWithQuestions.push({
            ...test,
            questions: [],
            hasError: true
          });
        }
      }

      console.log('Final tests with questions:', testsWithQuestions);
      setTests(testsWithQuestions);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load tests';
      console.error('Error fetching tests:', error);
      setError(errorMsg);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };



  const toggleTestExpansion = (testId: string) => {
    if (expandedTest === testId) {
      setExpandedTest(null);
    } else {
      setExpandedTest(testId);
      // Questions are already loaded, no need to fetch
    }
  };

  const addNewQuestion = (testId: string) => {
    const newQuestion: EditableQuestion = {
      id: Date.now().toString(), // Temporary ID for new questions
      stimulus_type: 'none',
      stimulus: '',
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      explanation: '',
      duration: 60,
      isEditing: true,
      isNew: true
    };

    setTests(prevTests =>
      prevTests.map(test =>
        test.id === testId
          ? {
              ...test,
              questions: [...(test.questions || []), newQuestion],
              total_questions: (test.total_questions || 0) + 1
            }
          : test
      )
    );
  };

  const startEditingQuestion = (testId: string, questionId: string) => {
    setTests(prevTests =>
      prevTests.map(test =>
        test.id === testId
          ? {
              ...test,
              questions: (test.questions || []).map(q =>
                q.id === questionId ? { ...q, isEditing: true } : q
              )
            }
          : test
      )
    );
  };

  const cancelEditingQuestion = (testId: string, questionId: string) => {
    setTests(prevTests =>
      prevTests.map(test =>
        test.id === testId
          ? {
              ...test,
              questions: (test.questions || []).map(q =>
                q.id === questionId
                  ? { ...q, isEditing: false, isNew: undefined }
                  : q
              ).filter(q => !(q as EditableQuestion).isNew || q.id !== questionId)
            }
          : test
      )
    );
  };

  const updateQuestionField = (testId: string, questionId: string, field: string, value: string | number) => {
    setTests(prevTests =>
      prevTests.map(test =>
        test.id === testId
          ? {
              ...test,
              questions: (test.questions || []).map(q =>
                q.id === questionId ? { ...q, [field]: value } : q
              )
            }
          : test
      )
    );
  };

  const saveQuestion = async (testId: string, question: EditableQuestion) => {
    setSaving(true);
    try {
      const questionData = {
        category_id: question.category_id,
        stimulus_type: question.stimulus_type,
        stimulus: question.stimulus,
        question: question.question,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        correct_answer: question.correct_answer,
        explanation: question.explanation,
        duration: question.duration
      };

      let savedQuestion;
      if (question.isNew) {
        // Create new question
        savedQuestion = await fetchWithAuth('/admin/questions', {
          method: 'POST',
          body: JSON.stringify(questionData),
        });

        // Add question to test
        await fetchWithAuth(`/admin/tests/${testId}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: tests.find(t => t.id === testId)?.title,
            description: tests.find(t => t.id === testId)?.description,
            duration_minutes: tests.find(t => t.id === testId)?.duration_minutes,
            question_ids: [
              ...(tests.find(t => t.id === testId)?.questions?.map(q => q.id).filter(id => id !== question.id) || []),
              savedQuestion.id
            ]
          }),
        });
      } else {
        // Update existing question
        savedQuestion = await fetchWithAuth(`/admin/questions/${question.id}`, {
          method: 'PUT',
          body: JSON.stringify(questionData),
        });
      }

      // Update local state
      setTests(prevTests =>
        prevTests.map(test =>
          test.id === testId
            ? {
                ...test,
                questions: (test.questions || []).map(q =>
                  q.id === question.id
                    ? { ...savedQuestion, isEditing: false, isNew: undefined }
                    : q
                )
              }
            : test
        )
      );

      alert('Soal berhasil disimpan!');
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Gagal menyimpan soal. Periksa koneksi internet dan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (testId: string, questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await fetchWithAuth(`/admin/questions/${questionId}`, {
        method: 'DELETE',
      });

      // Remove question from test
      const test = tests.find(t => t.id === testId);
      const remainingQuestionIds = (test?.questions?.map(q => q.id).filter(id => id !== questionId) || []);

      await fetchWithAuth(`/admin/tests/${testId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: test?.title,
          description: test?.description,
          duration_minutes: test?.duration_minutes,
          question_ids: remainingQuestionIds
        }),
      });

      // Update local state
      setTests(prevTests =>
        prevTests.map(test =>
          test.id === testId
            ? {
                ...test,
                questions: (test.questions || []).filter(q => q.id !== questionId),
                total_questions: (test.total_questions || 0) - 1
              }
            : test
        )
      );

      alert('Soal berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Gagal menghapus soal. Periksa koneksi internet dan coba lagi.');
    }
  };

  const filteredTests = tests.filter(test =>
    test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFilteredQuestions = (questions: Question[] = []) => {
    return questions.filter(question =>
      question.question?.toLowerCase().includes(questionSearchTerm.toLowerCase()) ||
      question.option_a?.toLowerCase().includes(questionSearchTerm.toLowerCase()) ||
      question.option_b?.toLowerCase().includes(questionSearchTerm.toLowerCase()) ||
      question.option_c?.toLowerCase().includes(questionSearchTerm.toLowerCase()) ||
      question.option_d?.toLowerCase().includes(questionSearchTerm.toLowerCase())
    );
  };

  const createNewTest = async () => {
    if (!newTestData.title.trim()) {
      alert('Judul tes harus diisi');
      return;
    }

    setSaving(true);
    try {
      const testData = {
        title: newTestData.title,
        description: newTestData.description,
        duration_minutes: newTestData.duration_minutes,
        start_date: newTestData.start_date || null,
        end_date: newTestData.end_date || null,
        is_active: newTestData.is_active,
        randomize_questions: newTestData.randomize_questions,
        show_results_immediately: newTestData.show_results_immediately,
      };

      console.log('Creating test with data:', testData);

      // Get CSRF token first
      await getCsrf();

      const response = await fetchWithAuth('/admin/tests', {
        method: 'POST',
        body: JSON.stringify(testData),
      });

      console.log('Test creation response:', response);

      // Refresh tests list
      await fetchTests();
      
      // Reset form and close modal
      setNewTestData({
        title: '',
        description: '',
        duration_minutes: 30,
        start_date: '',
        end_date: '',
        is_active: true,
        randomize_questions: false,
        show_results_immediately: false,
      });
      setShowCreateTestModal(false);
      
      alert('Tes CBT berhasil dibuat dan siap digunakan!');
    } catch (error) {
      console.error('Error creating test:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Gagal membuat tes baru: ${errorMessage}. Periksa data yang dimasukkan dan coba lagi.`);
    } finally {
      setSaving(false);
    }
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
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  <BookOpen className="h-8 w-8" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Manajemen Tes & Soal</h1>
                <p className="text-gray-600">Kelola tes CBT dan soal-soalnya dengan mudah dan efisien</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/admin"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Quick Actions */}
        <div className="mb-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group">
              <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-300 hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <TestTube className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Buat Tes Baru</h3>
                  <p className="text-sm text-gray-600 mb-4">Buat tes CBT dari nol dengan soal-soal lengkap</p>
                  <button
                    onClick={() => setShowCreateTestModal(true)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
                  >
                    Buat Tes Baru
                  </button>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-green-200/50 transition-all duration-300 hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Plus className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Pilih Soal Existing</h3>
                  <p className="text-sm text-gray-600 mb-4">Buat tes dengan memilih soal yang sudah ada</p>
                  <Link
                    href="/dashboard/admin/tests/create"
                    className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg"
                  >
                    Pilih Soal
                  </Link>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-300 hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Bank Soal</h3>
                  <p className="text-sm text-gray-600 mb-4">Kelola koleksi soal lengkap Anda</p>
                  <Link
                    href="/dashboard/admin/questions"
                    className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                  >
                    Kelola Soal
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-6 shadow-xl shadow-red-100/50">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg">
                  <X className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-red-800 mb-2">
                  Gagal Memuat Data Tes
                </h3>
                <div className="text-sm text-red-700 mb-4">
                  <p>Terjadi kesalahan saat mengambil data tes dari server. Hal ini mungkin disebabkan oleh:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Koneksi internet bermasalah</li>
                    <li>Server sedang mengalami gangguan</li>
                    <li>Data tes tidak dapat diakses</li>
                  </ul>
                  <p className="mt-2">{error}</p>
                </div>
                <button
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    fetchTests();
                  }}
                  className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Tests */}
        <div className="mb-8">
          <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                <Search className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Cari Tes</h3>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan judul atau deskripsi tes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all sm:text-sm bg-white text-black placeholder-black"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tests List */}
        {loading ? (
          <div className="bg-white border border-blue-100 rounded-2xl p-8 shadow-xl shadow-blue-100/50">
            <div className="animate-pulse space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-6">
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
            </div>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="bg-white border border-blue-100 rounded-2xl p-12 shadow-xl shadow-blue-100/50 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              <FileText className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm ? 'Tidak Ada Tes yang Cocok' : 'Belum Ada Tes CBT'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm
                ? 'Coba ubah kata kunci pencarian atau hapus filter untuk melihat semua tes yang tersedia.'
                : 'Belum ada tes CBT yang dibuat. Mulai buat tes pertama Anda untuk mengelola soal-soal CBT dengan mudah dan efisien.'
              }
            </p>
            <button
              onClick={() => setShowCreateTestModal(true)}
              className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-6 w-6 mr-3" />
              Buat Tes Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTests.map((test) => (
              <div key={test.id} className="bg-white border border-blue-100 rounded-2xl shadow-xl shadow-blue-100/50 overflow-hidden">
                {/* Test Header */}
                <div
                  className="px-8 py-6 bg-gradient-to-r from-blue-50 to-orange-50 border-b border-blue-100 cursor-pointer hover:from-blue-100 hover:to-orange-100 transition-all duration-200"
                  onClick={() => toggleTestExpansion(test.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                        {expandedTest === test.id ? (
                          <ChevronDown className="h-6 w-6" />
                        ) : (
                          <ChevronRight className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{test.title}</h3>
                          <p className="text-gray-600">{test.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-8 text-sm">
                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-blue-100">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-gray-900">{test.duration_minutes} menit</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-green-100">
                        <Users className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-gray-900">{test.total_questions} soal</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Questions Section */}
                {expandedTest === test.id && (
                  <div className="px-8 py-6">
                    {/* Question Search and Add Button */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex-1 max-w-md">
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="text"
                            placeholder="Cari soal dalam tes ini..."
                            value={questionSearchTerm}
                            onChange={(e) => setQuestionSearchTerm(e.target.value)}
                            className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all sm:text-sm bg-white text-black placeholder-black"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => addNewQuestion(test.id)}
                        className="inline-flex items-center px-6 py-3 ml-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Tambah Soal Baru
                      </button>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-4">
                      {test.hasError ? (
                        <div className="text-center py-12 bg-red-50 border-2 border-red-200 rounded-xl">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            <X className="h-8 w-8" />
                          </div>
                          <h3 className="text-lg font-bold text-red-800 mb-2">Gagal Memuat Soal</h3>
                          <p className="text-red-600 mb-6">Tidak dapat mengambil daftar soal untuk tes ini. Silakan coba lagi atau hubungi administrator jika masalah berlanjut.</p>
                          <button
                            onClick={async () => {
                              try {
                                console.log('Retrying to load questions for test:', test.id);
                                const testData = await fetchWithAuth(`/admin/tests/${test.id}`);
                                const questions = testData?.questions || [];

                                setTests(prevTests =>
                                  prevTests.map(t =>
                                    t.id === test.id
                                      ? { ...t, questions, hasError: false }
                                      : t
                                  )
                                );
                              } catch (error) {
                                console.error('Retry failed:', error);
                              }
                            }}
                            className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            <RefreshCw className="h-5 w-5 mr-2" />
                            Coba Lagi
                          </button>
                        </div>
                      ) : getFilteredQuestions(test.questions).length === 0 ? (
                        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-25 border-2 border-gray-200 rounded-xl">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            <BookOpen className="h-8 w-8" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {questionSearchTerm ? 'Tidak Ada Soal yang Cocok' : 'Belum Ada Soal dalam Tes Ini'}
                          </h3>
                          <p className="text-gray-600 mb-6">
                            {questionSearchTerm
                              ? 'Coba ubah kata kunci pencarian untuk menemukan soal yang sesuai.'
                              : 'Tes ini belum memiliki soal. Tambahkan soal pertama untuk melengkapi tes CBT Anda.'
                            }
                          </p>
                          {!questionSearchTerm && (
                            <button
                              onClick={() => addNewQuestion(test.id)}
                              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                              <Plus className="h-5 w-5 mr-2" />
                              Tambah Soal Pertama
                            </button>
                          )}
                        </div>
                      ) : (
                        getFilteredQuestions(test.questions).map((question, index) => (
                          <QuestionCard
                            key={index}
                            question={question}
                            onEdit={() => startEditingQuestion(test.id, question.id)}
                            onCancel={() => cancelEditingQuestion(test.id, question.id)}
                            onSave={(q) => saveQuestion(test.id, q)}
                            onDelete={() => deleteQuestion(test.id, question.id)}
                            onUpdateField={(field, value) => updateQuestionField(test.id, question.id, field, value)}
                            saving={saving}
                          />
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Test Modal */}
      {showCreateTestModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Buat Tes Baru</h3>
                <button
                  onClick={() => setShowCreateTestModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Tutup modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Tes *
                  </label>
                  <input
                    type="text"
                    value={newTestData.title}
                    onChange={(e) => setNewTestData(prev => ({ ...prev, title: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black placeholder-black"
                    placeholder="Masukkan judul tes"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={newTestData.description}
                    onChange={(e) => setNewTestData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black placeholder-black"
                    placeholder="Masukkan deskripsi tes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durasi (menit) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newTestData.duration_minutes}
                    onChange={(e) => setNewTestData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 30 }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                    title="Durasi tes dalam menit"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Mulai
                    </label>
                    <input
                      type="datetime-local"
                      value={newTestData.start_date}
                      onChange={(e) => setNewTestData(prev => ({ ...prev, start_date: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                      title="Tanggal dan waktu mulai tes"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Selesai
                    </label>
                    <input
                      type="datetime-local"
                      value={newTestData.end_date}
                      onChange={(e) => setNewTestData(prev => ({ ...prev, end_date: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                      title="Tanggal dan waktu selesai tes"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={newTestData.is_active}
                      onChange={(e) => setNewTestData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Tes aktif dan dapat diakses siswa
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="randomize_questions"
                      checked={newTestData.randomize_questions}
                      onChange={(e) => setNewTestData(prev => ({ ...prev, randomize_questions: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="randomize_questions" className="ml-2 block text-sm text-gray-900">
                      Acak urutan soal untuk setiap siswa (mencegah contekan)
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="show_results_immediately"
                      checked={newTestData.show_results_immediately}
                      onChange={(e) => setNewTestData(prev => ({ ...prev, show_results_immediately: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="show_results_immediately" className="ml-2 block text-sm text-gray-900">
                      Tampilkan skor dan pembahasan langsung setelah tes selesai
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateTestModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={createNewTest}
                  disabled={saving || !newTestData.title.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Menyimpan...' : 'Buat Tes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Question Card Component
interface QuestionCardProps {
  question: EditableQuestion;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (question: EditableQuestion) => void;
  onDelete: () => void;
  onUpdateField: (field: string, value: string | number) => void;
  saving: boolean;
}

function QuestionCard({ question, onEdit, onCancel, onSave, onDelete, onUpdateField, saving }: QuestionCardProps) {
  const isEditing = question.isEditing;
  const [imageError, setImageError] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create form data
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetchWithAuth('/admin/upload-image', {
        method: 'POST',
        body: formData,
        headers: {} // Override default headers for multipart form data
      });

      onUpdateField('stimulus', response.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Gagal mengunggah gambar. Pastikan file gambar valid (JPG, PNG, GIF) dan ukuran tidak melebihi batas yang ditentukan.');
    }
  };

  return (
    <div className="bg-white border border-blue-100 rounded-2xl shadow-xl shadow-blue-100/50 overflow-hidden">
      {isEditing ? (
        // Edit Mode - Enhanced form like create question page
        <div className="p-8 space-y-6">
          {/* Stimulus Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Tipe Stimulus
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'none', label: 'Tanpa Stimulus', desc: 'Soal langsung tanpa teks atau gambar tambahan', icon: BookOpen },
                { value: 'text', label: 'Stimulus Teks', desc: 'Soal dengan bacaan atau teks pendukung', icon: FileText },
                { value: 'image', label: 'Stimulus Gambar', desc: 'Soal dengan gambar atau ilustrasi pendukung', icon: Upload },
              ].map((option) => (
                <div
                  key={option.value}
                  onClick={() => onUpdateField('stimulus_type', option.value)}
                  className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all hover:shadow-md ${
                    question.stimulus_type === option.value
                      ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-orange-25 shadow-lg scale-[1.02]'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 mb-3">
                    <option.icon className={`h-6 w-6 ${
                      question.stimulus_type === option.value ? 'text-orange-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="font-semibold text-sm text-gray-900 mb-1">{option.label}</div>
                  <div className="text-xs text-gray-600">{option.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stimulus Content */}
          {question.stimulus_type !== 'none' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {question.stimulus_type === 'text' ? 'Bacaan Pendukung' : 'Gambar Pendukung'}
              </label>
              {question.stimulus_type === 'text' ? (
                <textarea
                  value={question.stimulus || ''}
                  onChange={(e) => onUpdateField('stimulus', e.target.value)}
                  rows={4}
                  className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all sm:text-sm bg-white text-black placeholder-black"
                  placeholder="Masukkan teks bacaan atau konteks pendukung untuk soal..."
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={question.stimulus || ''}
                      onChange={(e) => onUpdateField('stimulus', e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all sm:text-sm bg-white text-black placeholder-black"
                      placeholder="URL gambar atau pilih file..."
                    />
                    <label className="inline-flex items-center px-4 py-3 border-2 border-orange-500 shadow-sm text-sm font-medium rounded-xl text-orange-500 bg-white hover:bg-orange-50 cursor-pointer transition-colors">
                      <Upload className="h-4 w-4 mr-2" />
                      Pilih File
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  {question.stimulus && (
                    <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="relative w-full h-48">
                        <Image
                          src={question.stimulus}
                          alt="Preview stimulus soal"
                          fill
                          className="object-contain rounded-lg"
                          onError={() => {
                            setImageError(true);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pertanyaan
            </label>
            <textarea
              value={question.question}
              onChange={(e) => onUpdateField('question', e.target.value)}
              rows={3}
              className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all sm:text-sm bg-white resize-none text-black placeholder-black"
              placeholder="Masukkan pertanyaan..."
            />
          </div>

          {/* Answer Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Pilihan Jawaban
            </label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { key: 'option_a', label: 'A', color: 'from-blue-500 to-blue-600' },
                { key: 'option_b', label: 'B', color: 'from-green-500 to-green-600' },
                { key: 'option_c', label: 'C', color: 'from-yellow-500 to-yellow-600' },
                { key: 'option_d', label: 'D', color: 'from-red-500 to-red-600' },
              ].map((option) => (
                <div key={option.key} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center text-white font-semibold text-sm shadow-lg`}>
                      {option.label}
                    </div>
                    <input
                      type="radio"
                      name={`correct_answer_${question.id}`}
                      value={option.label}
                      checked={question.correct_answer === option.label}
                      onChange={(e) => onUpdateField('correct_answer', e.target.value)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      title={`Pilih jawaban ${option.label} sebagai jawaban benar`}
                    />
                  </div>
                  <input
                    type="text"
                    value={(question as Record<'option_a' | 'option_b' | 'option_c' | 'option_d', string>)[option.key as 'option_a' | 'option_b' | 'option_c' | 'option_d'] || ''}
                    onChange={(e) => onUpdateField(option.key, e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all sm:text-sm bg-white text-black placeholder-black"
                    placeholder={`Pilihan ${option.label}...`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Penjelasan/Pembahasan
            </label>
            <textarea
              value={question.explanation || ''}
              onChange={(e) => onUpdateField('explanation', e.target.value)}
              rows={3}
              className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all sm:text-sm bg-white resize-none text-black placeholder-black"
              placeholder="Masukkan penjelasan jawaban yang benar..."
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durasi Pengerjaan (detik)
            </label>
            <input
              type="number"
              value={question.duration || 60}
              onChange={(e) => onUpdateField('duration', parseInt(e.target.value))}
              min="30"
              max="300"
              className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all sm:text-sm bg-white text-black placeholder-black"
              placeholder="60"
            />
            <p className="text-xs text-gray-500 mt-1">
              Waktu yang disarankan untuk menjawab soal ini (30-300 detik)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              disabled={saving}
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <X className="h-5 w-5 mr-2" />
              Batal
            </button>
            <button
              onClick={() => onSave(question)}
              disabled={saving}
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      ) : (
        // View Mode
        <div className="p-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Display stimulus if exists */}
              {question.stimulus_type === 'image' && question.stimulus && (
                <div className="mb-4">
                  <div className="relative w-full max-w-md mx-auto">
                    {!imageError ? (
                      <Image
                        src={question.stimulus || ''}
                        alt="Stimulus"
                        fill
                        className="rounded-lg border border-gray-300 shadow-sm object-contain"
                        onError={() => {
                          setImageError(true);
                        }}
                      />
                    ) : (
                      <div className="text-red-500 text-sm p-4 text-center bg-red-50 rounded-lg border border-red-200">
                        Gambar tidak dapat dimuat
                      </div>
                    )}
                  </div>
                </div>
              )}

              {question.stimulus_type === 'text' && question.stimulus && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-900 text-sm italic">{question.stimulus}</p>
                </div>
              )}

              <p className="text-gray-900 font-semibold text-lg mb-4 leading-relaxed">{question.question}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                <div key="A" className={`p-3 rounded-lg border-2 transition-colors ${
                  question.correct_answer === 'A'
                    ? 'border-green-500 bg-green-50 text-green-900'
                    : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                }`}>
                  <strong className="text-base">A:</strong> <span className="ml-1">{question.option_a}</span>
                </div>
                <div key="B" className={`p-3 rounded-lg border-2 transition-colors ${
                  question.correct_answer === 'B'
                    ? 'border-green-500 bg-green-50 text-green-900'
                    : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                }`}>
                  <strong className="text-base">B:</strong> <span className="ml-1">{question.option_b}</span>
                </div>
                <div key="C" className={`p-3 rounded-lg border-2 transition-colors ${
                  question.correct_answer === 'C'
                    ? 'border-green-500 bg-green-50 text-green-900'
                    : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                }`}>
                  <strong className="text-base">C:</strong> <span className="ml-1">{question.option_c}</span>
                </div>
                <div key="D" className={`p-3 rounded-lg border-2 transition-colors ${
                  question.correct_answer === 'D'
                    ? 'border-green-500 bg-green-50 text-green-900'
                    : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                }`}>
                  <strong className="text-base">D:</strong> <span className="ml-1">{question.option_d}</span>
                </div>
              </div>

              {question.explanation && (
                <div className="text-sm bg-amber-50 border border-amber-200 p-3 rounded-lg">
                  <strong className="text-amber-800">Pembahasan:</strong>
                  <p className="text-amber-900 mt-1">{question.explanation}</p>
                </div>
              )}

              {question.duration && (
                <div className="text-xs text-gray-500 mt-2">
                  Durasi: {question.duration} detik
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={onEdit}
                className="text-gray-600 hover:text-blue-600 p-2 rounded-md hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={onDelete}
                className="text-gray-600 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
                title="Hapus"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}