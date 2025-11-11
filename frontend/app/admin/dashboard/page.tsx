'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuthRaw } from '@/app/utils/api';
import { useAuthStore } from '@/app/stores/auth';

interface Test {
  id: string;
  title: string;
  description?: string;
  duration_minutes: number;
  total_attempts: number;
  completed_attempts: number;
  average_score: number;
}

export default function AdminDashboard() {
  const [tests, setTests] = useState<Test[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.replace('/dashboard/student');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    const loadTests = async () => {
      try {
  const res = await fetchWithAuthRaw('/admin/tests');
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`Failed to load tests (${res.status}) ${text}`);
        }
        const data = await res.json();
        setTests(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        setError(errorMessage);
        console.error('Error loading tests:', error);
      }
    };

    loadTests();
  }, []);

  if (error) return <div>Error loading tests: {error}</div>;
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Tests</h2>
        {tests.length === 0 ? (
          <p>No tests available</p>
        ) : (
          <ul className="space-y-4">
            {tests.map((test) => (
              <li key={test.id} className="border-b pb-4">
                <h3 className="font-medium">{test.title}</h3>
                {test.description && <p className="text-gray-600">{test.description}</p>}
                <div className="mt-2 text-sm text-gray-500">
                  <span>Duration: {test.duration_minutes} minutes</span>
                  <span className="mx-2">•</span>
                  <span>Attempts: {test.total_attempts}</span>
                  <span className="mx-2">•</span>
                  <span>Completed: {test.completed_attempts}</span>
                  <span className="mx-2">•</span>
                  <span>Average Score: {Number(test.average_score ?? 0).toFixed(1)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}