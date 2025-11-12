'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/stores/auth';

export default function StudentDashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Protect the route - only allow siswa
    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== 'siswa') {
      router.replace('/login');
      return;
    }
  }, [user, router]);

  if (!user) {
    return null; // or loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header tanpa navbar, profil dashboard, dan logo */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Dashboard Siswa
              </h1>
              <p className="text-sm text-gray-500">
                Selamat datang, {user.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Ringkasan</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Test yang tersedia</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Test selesai</span>
                <span className="font-medium">0</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Menu Cepat</h2>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/student/tests')}
                className="w-full text-left px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
              >
                Lihat Test Tersedia
              </button>
              <button
                onClick={() => router.push('/student/history')}
                className="w-full text-left px-4 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
              >
                Riwayat Test
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}