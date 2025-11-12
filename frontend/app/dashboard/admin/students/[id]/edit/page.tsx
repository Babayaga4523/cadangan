"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/app/stores/auth";
import { fetchWithAuth } from "@/app/utils/api";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Shield
} from "lucide-react";

interface StudentForm {
  name: string;
  email: string;
  role: 'siswa' | 'admin';
}

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [student, setStudent] = useState<StudentForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const studentId = params.id as string;

  const fetchStudentDetail = useCallback(async () => {
    if (!studentId) return;

    try {
      const data = await fetchWithAuth(`/admin/students/${studentId}`);
      setStudent({
        name: data.name || '',
        email: data.email || '',
        role: data.role || 'siswa'
      });
    } catch (error) {
      console.error('Error fetching student detail:', error);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/dashboard/student');
      return;
    }

    if (studentId) {
      fetchStudentDetail();
    }
  }, [user, router, studentId, fetchStudentDetail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    try {
      await fetchWithAuth(`/admin/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(student),
      });

      router.push('/dashboard/admin/students');
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { errors?: Record<string, string> } } };
        if (err.response?.data?.errors) {
          setErrors(err.response.data.errors);
        }
      } else {
        console.error('Error updating student:', error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof StudentForm, value: string) => {
    if (student) {
      setStudent({
        ...student,
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

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            Siswa tidak ditemukan
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white border border-[#9BC8FF] rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FFB28A] flex items-center justify-center text-white text-2xl font-bold">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Siswa</h1>
              <p className="text-sm text-gray-600">Ubah informasi siswa</p>
            </div>
          </div>
          <Link
            href={`/dashboard/admin/students/${studentId}`}
            className="inline-flex items-center px-4 py-2 rounded-full bg-[#FFE7DE] text-[#C24A12] text-sm font-semibold hover:bg-[#FFDCC9]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="bg-white border border-[#9BC8FF] rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 sm:p-6">
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      value={student.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF661F] focus:border-[#FF661F] sm:text-sm bg-gray-50 focus:bg-white transition-colors text-black"
                      required
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={student.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF661F] focus:border-[#FF661F] sm:text-sm bg-gray-50 focus:bg-white transition-colors text-black"
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Peran
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'siswa', label: 'Siswa', icon: User },
                      { value: 'admin', label: 'Admin', icon: Shield }
                    ].map((role) => (
                      <label key={role.value} className="relative">
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={student.role === role.value}
                          onChange={(e) => handleChange('role', e.target.value as 'siswa' | 'admin')}
                          className="sr-only"
                        />
                        <div className={`cursor-pointer border rounded-lg p-4 text-center transition-all ${
                          student.role === role.value
                            ? 'border-[#FF661F] bg-[#FFE7DE] shadow-sm'
                            : 'border-gray-300 hover:border-gray-400 bg-white'
                        }`}>
                          <role.icon className={`h-6 w-6 mx-auto mb-2 ${
                            student.role === role.value ? 'text-[#C24A12]' : 'text-gray-600'
                          }`} />
                          <span className={`text-sm font-medium ${
                            student.role === role.value ? 'text-[#C24A12]' : 'text-gray-900'
                          }`}>
                            {role.label}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <Link
                href={`/dashboard/admin/students/${studentId}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#FF661F] hover:bg-[#E6540F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
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