"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { fetchWithAuth } from '@/app/utils/api';
import Link from "next/link";
import { useParams } from 'next/navigation';

interface Attempt {
  id: string;
  test_id: string;
  score: number | null;
  status: 'in_progress' | 'completed';
  started_at: string;
  finished_at: string | null;
  time_taken: number | null;
  test: {
    title: string;
    description: string;
  };
}

interface Student {
  id: string;
  name: string;
  email: string;
}

interface HistoryData {
  student: Student;
  attempts: Attempt[];
}

export default function StudentHistoryPage() {
  const params = useParams();
  const studentId = params.id as string;

  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const historyData = await fetchWithAuth(`/admin/students/${studentId}/history`);
      setData(historyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchHistory();
    }
  }, [studentId, fetchHistory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student history...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold">Error</div>
          <p className="mt-2 text-gray-600">{error || 'Failed to load data'}</p>
          <div className="mt-4 space-x-4">
            <button
              onClick={fetchHistory}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
            <Link
              href="/admin/students"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Students
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { student, attempts } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white border border-[#9BC8FF] rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FFB28A] flex items-center justify-center text-white text-2xl font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19 2H8c-1.1 0-2 .9-2 2v2H5a2 2 0 00-2 2v11a2 2 0 002 2h14a2 2 0 002-2V4a2 2 0 00-2-2zM8 6h9v3H8z"/></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Riwayat Nilai Tes</h1>
              <p className="text-sm text-gray-600">Riwayat pengerjaan tes {student.name}</p>
              <p className="text-xs text-gray-500">{student.email}</p>
            </div>
          </div>
          <Link
            href="/admin/students"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
          >
            Back to Students
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Riwayat Pengerjaan Tes</h2>

          {attempts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Belum ada riwayat pengerjaan tes untuk siswa ini
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {attempts.map((a) => (
                <div key={a.id} className="w-full bg-white rounded-xl shadow p-0 overflow-hidden relative">
                  <div className="flex">
                    <div className="w-28 bg-[#FF661F] flex items-center justify-center p-4">
                      <div className="text-white text-center">
                        <div className="text-xs uppercase tracking-wide">Nilai</div>
                        <div className="text-2xl font-extrabold mt-1">{a.score !== null ? Number(a.score).toFixed(0) : '-'}</div>
                        <div className="text-xs mt-1">{a.status === 'completed' ? 'Selesai' : 'Berjalan'}</div>
                      </div>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{a.test.title}</p>
                          <p className="text-sm text-gray-600 mt-1 truncate">{a.test.description}</p>
                        </div>
                        <div className="ml-3">
                          {a.status === 'completed' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">Selesai</span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">Dalam Pengerjaan</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                        <div>Dimulai: {new Date(a.started_at).toLocaleDateString('id-ID')}</div>
                        <div className="flex items-center gap-2">
                          <Link href={`/cbt/hasil?attemptId=${a.id}`} className="text-sm px-3 py-1 rounded-full bg-[#FFE7DE] text-[#C24A12] font-semibold hover:bg-[#FFDCC9]">Lihat Pembahasan</Link>
                          <Link href={`/cbt/${a.test_id}`} className="text-sm px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">Ulangi</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}