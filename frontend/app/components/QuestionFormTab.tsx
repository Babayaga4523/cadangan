"use client";

import { useState } from 'react';
import Image from 'next/image';
import { fetchWithAuth } from '@/app/utils/api';
import { Upload, FileText, BookOpen, Image as ImageIcon } from 'lucide-react';

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
  duration: number;
}

interface QuestionFormData {
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
}

interface QuestionFormTabProps {
  onQuestionCreated: (question: Question) => void;
  onSubmit?: (formData: QuestionFormData) => void;
}

export default function QuestionFormTab({ onQuestionCreated, onSubmit }: QuestionFormTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<QuestionFormData>({
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
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
        }
      });

      // Assuming the response contains the URL of the uploaded image
      handleInputChange('stimulus', response.url || response.image_url || '');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Gagal mengunggah gambar. Silakan coba lagi.');
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // If onSubmit prop is provided, use it instead of making API call
    if (onSubmit) {
      onSubmit(formData);
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetchWithAuth('/admin/questions', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      onQuestionCreated(response);
      
      // Reset form
      setFormData({
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
      });
    } catch (error) {
      console.error('Error creating question:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat soal';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stimulus Type */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-[#9BC8FF] p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#FFB28A] flex items-center justify-center text-white text-xl font-bold mr-3">
            1
          </div>
          Tipe Stimulus
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'none', label: 'Tanpa Stimulus', desc: 'Soal langsung tanpa bacaan/gambar', icon: BookOpen },
            { value: 'text', label: 'Stimulus Teks', desc: 'Dengan bacaan pendukung', icon: FileText },
            { value: 'image', label: 'Stimulus Gambar', desc: 'Dengan gambar pendukung', icon: ImageIcon },
          ].map((option) => (
            <div
              key={option.value}
              onClick={() => handleInputChange('stimulus_type', option.value)}
              className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all ${
                formData.stimulus_type === option.value
                  ? 'border-[#FF661F] bg-orange-50 shadow-md scale-[1.02]'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow'
              }`}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                <option.icon className={`h-6 w-6 ${
                  formData.stimulus_type === option.value ? 'text-[#FF661F]' : 'text-gray-600'
                }`} />
              </div>
              <div className="font-medium text-sm">{option.label}</div>
              <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stimulus Content */}
      {formData.stimulus_type !== 'none' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-[#9BC8FF] p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#FFB28A] flex items-center justify-center text-white text-xl font-bold mr-3">
              2
            </div>
            {formData.stimulus_type === 'text' ? 'Bacaan Pendukung' : 'Gambar Pendukung'}
          </h3>
          {formData.stimulus_type === 'text' ? (
            <textarea
              value={formData.stimulus}
              onChange={(e) => handleInputChange('stimulus', e.target.value)}
              rows={4}
              className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF661F] focus:border-[#FF661F] transition-all sm:text-sm placeholder-black text-black"
              placeholder="Masukkan bacaan pendukung..."
              required
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={formData.stimulus}
                  onChange={(e) => handleInputChange('stimulus', e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF661F] focus:border-[#FF661F] transition-all sm:text-sm placeholder-black text-black"
                  placeholder="URL gambar atau pilih file..."
                  required
                />
                <label className="inline-flex items-center px-4 py-2 border-2 border-[#FF661F] shadow-sm text-sm font-medium rounded-lg text-[#FF661F] bg-white hover:bg-orange-50 cursor-pointer transition-colors">
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
              {formData.stimulus && (
                <div className="mt-2 border rounded-lg p-2 bg-gray-50">
                  <ImageIcon className="h-4 w-4 inline-block mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">Preview:</span>
                  <div className="relative w-full h-48 mt-2">
                    <Image
                      src={formData.stimulus}
                      alt="Preview stimulus soal"
                      fill
                      className="object-contain rounded-lg"
                      onError={() => {
                        console.error('Gagal memuat gambar. Pastikan URL valid.');
                        handleInputChange('stimulus', '');
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Question */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-[#9BC8FF] p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#FFB28A] flex items-center justify-center text-white text-xl font-bold mr-3">
            3
          </div>
          Pertanyaan
        </h3>
        <textarea
          value={formData.question}
          onChange={(e) => handleInputChange('question', e.target.value)}
          rows={3}
          className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF661F] focus:border-[#FF661F] transition-all sm:text-sm placeholder-black text-black"
          placeholder="Masukkan pertanyaan..."
          required
        />
      </div>

      {/* Answer Options */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-[#9BC8FF] p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#FFB28A] flex items-center justify-center text-white text-xl font-bold mr-3">
            4
          </div>
          Pilihan Jawaban
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {[
            { key: 'option_a', label: 'A', color: 'bg-orange-50 border-[#FF661F]' },
            { key: 'option_b', label: 'B', color: 'bg-orange-50 border-[#FF661F]' },
            { key: 'option_c', label: 'C', color: 'bg-orange-50 border-[#FF661F]' },
            { key: 'option_d', label: 'D', color: 'bg-orange-50 border-[#FF661F]' },
          ].map((option) => (
            <div key={option.key} 
              className={`border-2 rounded-lg p-4 transition-all ${
                formData.correct_answer === option.label ? option.color : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="correct_answer"
                    value={option.label}
                    checked={formData.correct_answer === option.label}
                    onChange={(e) => handleInputChange('correct_answer', e.target.value)}
                    className="h-4 w-4 text-[#FF661F] focus:ring-[#FF661F] border-gray-300"
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
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF661F] focus:border-[#FF661F] transition-all sm:text-sm placeholder-black text-black"
                    placeholder={`Pilihan ${option.label}...`}
                  />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-[#9BC8FF] p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#FFB28A] flex items-center justify-center text-white text-xl font-bold mr-3">
            5
          </div>
          Penjelasan/Pembahasan
        </h3>
        <textarea
          value={formData.explanation}
          onChange={(e) => handleInputChange('explanation', e.target.value)}
          rows={3}
          className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF661F] focus:border-[#FF661F] transition-all sm:text-sm placeholder-black text-black"
          placeholder="Masukkan penjelasan jawaban yang benar..."
        />
      </div>

      {/* Duration */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-[#9BC8FF] p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#FFB28A] flex items-center justify-center text-white text-xl font-bold mr-3">
            6
          </div>
          Durasi Pengerjaan
        </h3>
        <div className="max-w-xs">
          <div className="relative rounded-lg shadow-sm">
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 60)}
              min="30"
              max="300"
              className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF661F] focus:border-[#FF661F] transition-all sm:text-sm pr-12 placeholder-black text-black"
              placeholder="Contoh: 60"
              title="Durasi pengerjaan soal dalam detik"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-black sm:text-sm">detik</span>
            </div>
          </div>
          <p className="text-sm text-black/70 mt-2">
            Waktu yang disarankan untuk menjawab soal ini (30-300 detik)
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="inline-flex justify-center items-center px-6 py-3 border-2 border-[#FF661F] text-base font-medium rounded-lg text-white bg-[#FF661F] hover:bg-[#E6540F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF661F] disabled:opacity-50 transition-colors shadow-sm"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </>
          ) : (
            'Tambah Soal'
          )}
        </button>
      </div>
    </div>
  );
}