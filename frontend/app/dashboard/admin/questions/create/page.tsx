"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/app/utils/api";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useAuthStore } from '@/app/stores/auth';

export default function CreateQuestionPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    stimulus_type: 'none' as 'none' | 'text' | 'image',
    stimulus: '',
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A' as 'A' | 'B' | 'C' | 'D',
    explanation: '',
    duration: 60,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await fetchWithAuth('/admin/questions', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      router.push('/dashboard/admin/questions');
    } catch (error) {
      console.error('Error creating question:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat soal';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/admin/questions"
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Tambah Soal Baru</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
            {/* Stimulus Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipe Stimulus
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'none', label: 'Tanpa Stimulus', desc: 'Soal langsung tanpa bacaan/gambar' },
                  { value: 'text', label: 'Stimulus Teks', desc: 'Dengan bacaan pendukung' },
                  { value: 'image', label: 'Stimulus Gambar', desc: 'Dengan gambar pendukung' },
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleInputChange('stimulus_type', option.value)}
                    className={`cursor-pointer border rounded-lg p-4 text-center ${
                      formData.stimulus_type === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stimulus Content */}
            {formData.stimulus_type !== 'none' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.stimulus_type === 'text' ? 'Bacaan Pendukung' : 'URL Gambar'}
                </label>
                {formData.stimulus_type === 'text' ? (
                  <textarea
                    value={formData.stimulus}
                    onChange={(e) => handleInputChange('stimulus', e.target.value)}
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black placeholder-black"
                    placeholder="Masukkan bacaan pendukung..."
                    required
                  />
                ) : (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={formData.stimulus}
                      onChange={(e) => handleInputChange('stimulus', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black placeholder-black"
                      placeholder="https://example.com/image.jpg"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Masukkan URL gambar yang valid
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Question */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pertanyaan
              </label>
              <textarea
                value={formData.question}
                onChange={(e) => handleInputChange('question', e.target.value)}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black placeholder-black"
                placeholder="Masukkan pertanyaan..."
                required
              />
            </div>

            {/* Answer Options */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Pilihan Jawaban
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { key: 'option_a', label: 'A', color: 'bg-blue-50 border-blue-200' },
                  { key: 'option_b', label: 'B', color: 'bg-green-50 border-green-200' },
                  { key: 'option_c', label: 'C', color: 'bg-yellow-50 border-yellow-200' },
                  { key: 'option_d', label: 'D', color: 'bg-red-50 border-red-200' },
                ].map((option) => (
                  <div key={option.key} className={`border rounded-lg p-3 ${option.color}`}>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="correct_answer"
                          value={option.label}
                          checked={formData.correct_answer === option.label}
                          onChange={(e) => handleInputChange('correct_answer', e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          title={`Pilih jawaban ${option.label} sebagai jawaban benar`}
                        />
                        <label className="ml-2 block text-sm font-medium text-gray-700">
                          {option.label}
                        </label>
                      </div>
                      <input
                        type="text"
                        value={formData[option.key as keyof typeof formData] as string}
                        onChange={(e) => handleInputChange(option.key, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black placeholder-black"
                        placeholder={`Pilihan ${option.label}...`}
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Penjelasan/Pembahasan
              </label>
              <textarea
                value={formData.explanation}
                onChange={(e) => handleInputChange('explanation', e.target.value)}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black placeholder-black"
                placeholder="Masukkan penjelasan jawaban yang benar..."
              />
            </div>

            {/* Duration */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durasi Pengerjaan (detik)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 60)}
                min="30"
                max="300"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                title="Durasi pengerjaan soal dalam detik"
              />
              <p className="text-xs text-gray-500 mt-1">
                Waktu yang disarankan untuk menjawab soal ini (30-300 detik)
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3">
              <Link
                href="/dashboard/admin/questions"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Menyimpan...' : 'Simpan Soal'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}