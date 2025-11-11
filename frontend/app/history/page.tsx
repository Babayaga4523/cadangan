"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { fetchWithAuth } from '@/app/utils/api';
import Link from "next/link";
import { useSearchParams } from 'next/navigation';

interface Attempt {
  id: string;
  test_id: string;
  score: number | null;
  status: 'in_progress' | 'completed';
  started_at: string;
  finished_at: string | null;
  test: {
    title: string;
    description: string;
  };
}

interface ScoreData {
  id: string;
  attempt_id: string;
  test_id: string;
  test_title: string;
  score: number;
  finished_at: string;
  subject_id: string;
}

interface TestOption {
  id: string;
  title: string;
  description: string | null;
}

export default function HistoryPage() {
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subject_id');

  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [scores, setScores] = useState<ScoreData[]>([]);
  const [tests, setTests] = useState<TestOption[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingTests, setLoadingTests] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      if (subjectId) {
        // Use new endpoint for subject-based filtering
        const data = await fetchWithAuth(`/student/scores?subject_id=${encodeURIComponent(subjectId)}`);
        setScores(Array.isArray(data) ? data : []);
        setAttempts([]);
      } else {
        // Use existing endpoint for test-based filtering
        const url = selectedTestId ? `/history?test_id=${selectedTestId}` : '/history';
        const data = await fetchWithAuth(url);
        setAttempts(Array.isArray(data) ? data : []);
        setScores([]);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setAttempts([]);
      setScores([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTestId, subjectId]);

  useEffect(() => {
    if (!subjectId) {
      fetchTests();
    }
  }, [subjectId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const fetchTests = async () => {
    try {
      const data = await fetchWithAuth('/history/tests');
      setTests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
      setTests([]);
    } finally {
      setLoadingTests(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header (card-style to match student dashboard) */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white border border-[#9BC8FF] rounded-xl p-4 shadow-sm flex items-center justify-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FFB28A] flex items-center justify-center text-white text-2xl font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19 2H8c-1.1 0-2 .9-2 2v2H5a2 2 0 00-2 2v11a2 2 0 002 2h14a2 2 0 002-2V4a2 2 0 00-2-2zM8 6h9v3H8z"/></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {subjectId ? `Riwayat Nilai - ${subjectId}` : 'Riwayat Nilai Tes'}
              </h1>
              <p className="text-sm text-gray-700">
                {subjectId
                  ? `Lihat riwayat nilai tes untuk mata pelajaran ${subjectId}`
                  : 'Lihat semua riwayat pengerjaan tes Anda'
                }
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {subjectId ? `Riwayat Nilai ${subjectId}` : 'Riwayat Pengerjaan Tes'}
          </h2>

          {/* Filter Dropdown - only show when not filtering by subject */}
          {!subjectId && (
            <div className="mb-6">
              <label htmlFor="test-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter berdasarkan Tes
              </label>
              <select
                id="test-filter"
                value={selectedTestId}
                onChange={(e) => setSelectedTestId(e.target.value)}
                className="block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={loadingTests}
              >
                <option value="">Semua Tes</option>
                {tests.map((test) => (
                  <option key={test.id} value={test.id}>
                    {test.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : subjectId ? (
            // Display scores for subject in card layout
            scores.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-700">
                Belum ada riwayat nilai untuk mata pelajaran ini
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {scores.map((score) => (
                  <div key={score.id} className="w-full bg-white rounded-xl shadow p-0 overflow-hidden relative">
                    <div className="flex">
                      <div className="w-28 bg-[#FF661F] flex items-center justify-center p-4">
                        <div className="text-white text-center">
                          <div className="text-xs uppercase tracking-wide">Nilai</div>
                          <div className="text-2xl font-extrabold mt-1">{score.score.toFixed(0)}</div>
                          <div className="text-xs mt-1">Selesai</div>
                        </div>
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{score.test_title}</p>
                            <p className="text-xs text-gray-700 mt-1 truncate">Mata Pelajaran: {subjectId}</p>
                          </div>
                          <div className="ml-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Selesai</span>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-col space-y-2">
                          <div className="text-xs text-gray-700">
                            Selesai: {new Date(score.finished_at).toLocaleDateString('id-ID')}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/cbt/hasil?attemptId=${score.attempt_id}`} className="text-sm px-3 py-1.5 rounded-full bg-[#FFE7DE] text-[#C24A12] font-semibold hover:bg-[#FFDCC9] transition-colors">
                              Lihat Pembahasan
                            </Link>
                            <Link href={`/cbt/${score.test_id}`} className="text-sm px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                              Ulangi
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Display attempts with filter
            attempts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-700">
                {selectedTestId
                  ? `Belum ada riwayat pengerjaan untuk tes yang dipilih`
                  : `Belum ada riwayat pengerjaan`
                }
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
                            <p className="text-xs text-gray-700 mt-1 truncate">{a.test.description}</p>
                          </div>
                          <div className="ml-3">
                            {a.status === 'completed' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Selesai</span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Dalam Pengerjaan</span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-col space-y-2">
                          <div className="text-xs text-gray-700">
                            Dimulai: {new Date(a.started_at).toLocaleDateString('id-ID')}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/cbt/hasil?attemptId=${a.id}`} className="text-sm px-3 py-1.5 rounded-full bg-[#FFE7DE] text-[#C24A12] font-semibold hover:bg-[#FFDCC9] transition-colors">
                              Lihat Pembahasan
                            </Link>
                            <Link href={`/cbt/${a.test_id}`} className="text-sm px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                              Ulangi
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
