"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/app/stores/auth";
import { fetchWithAuth } from "@/app/utils/api";
import Link from "next/link";
import {
  ArrowLeft,
  Save
} from "lucide-react";

interface TestForm {
  title: string;
  description: string;
  duration_minutes: number;
}

export default function EditTestPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [test, setTest] = useState<TestForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const testId = params.id as string;

  const fetchTestDetail = useCallback(async () => {
    if (!testId) return;
    
    try {
      const data = await fetchWithAuth(`/admin/tests/${testId}`);
      setTest({
        title: data.title || '',
        description: data.description || '',
        duration_minutes: data.duration_minutes || 30
      });
    } catch (error) {
      console.error('Error fetching test detail:', error);
    } finally {
      setIsLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/dashboard/student');
      return;
    }

    if (testId) {
      fetchTestDetail();
    }
  }, [user, router, testId, fetchTestDetail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    try {
      await fetchWithAuth(`/admin/tests/${testId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test),
      });

      router.push(`/dashboard/admin/tests/${testId}`);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { errors?: Record<string, string> } } };
        if (err.response?.data?.errors) {
          setErrors(err.response.data.errors);
        }
      } else {
        console.error('Error updating test:', error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof TestForm, value: string | number) => {
    if (test) {
      setTest({
        ...test,
        [field]: value
      });
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            Tes tidak ditemukan
          </div>
        </div>
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
                href={`/dashboard/admin/tests/${testId}`}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Tes</h1>
                <p className="text-sm text-gray-500">Ubah informasi tes</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Judul Tes
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={test.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                    required
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Deskripsi
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={test.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black placeholder-black"
                    placeholder="Deskripsi tes (opsional)"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700">
                    Durasi (menit)
                  </label>
                  <input
                    type="number"
                    id="duration_minutes"
                    min="1"
                    max="480"
                    value={test.duration_minutes}
                    onChange={(e) => handleChange('duration_minutes', parseInt(e.target.value) || 30)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                    required
                  />
                  {errors.duration_minutes && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration_minutes}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <Link
                href={`/dashboard/admin/tests/${testId}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-3"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}