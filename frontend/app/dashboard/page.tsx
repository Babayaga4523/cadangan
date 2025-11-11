'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [mounted] = useState(true);

  useEffect(() => {
    if (!mounted) return;

    const checkAuth = () => {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        router.replace('/login');
        return;
      }

      try {
        const user = JSON.parse(userStr);
        if (!user) {
          router.replace('/login');
          return;
        }

        if (user.role === 'admin') {
          router.replace('/dashboard/admin');
        } else if (user.role === 'siswa') {
          router.replace('/dashboard/student');
        }
      } catch {
        router.replace('/login');
      }
    };

    checkAuth();
  }, [mounted, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4 text-gray-600">Mengarahkan ke halaman dashboard...</p>
      </div>
    </div>
  );
}