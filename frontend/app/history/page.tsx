"use client";
import React, { useEffect, useState, useCallback, Suspense } from 'react';
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

function HistoryContent() {
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subject_id');

  const formatDate = (d?: string | null) => {
    if (!d) return '-';
    const dt = new Date(d);
    const date = dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const time = dt.toLocaleTimeString('id-ID');
    return `${date} - ${time}`;
  };

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
    <div className="min-h-screen bg-white font-sans">
      {/* Header with centered title inside light blue box */}
          <header className="max-w-7xl mx-auto p-8">
            <div className="rounded-xl bg-[#EAF6FF] p-6">
              <div className="max-w-4xl mx-auto bg-[#DFF4FF] rounded-lg py-6 px-8 border border-[#CFEFFF]">
                <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight uppercase text-center">
                  HISTORI NILAI ESPS IPS 4 SD KELAS IV
                </h1>
              </div>
            </div>
          </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-10">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/student" className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                <span>Kembali</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-sm text-gray-600">&nbsp;</div>
              <select
                className="text-base font-medium text-gray-900 px-3 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none"
                aria-label="Pilihan bab"
              >
                <option>Pilihan bab</option>
                {tests.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>

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
                className="block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base font-medium text-gray-900"
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
            // Display scores for subject in card layout (styled to match screenshot)
            scores.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-700">
                Belum ada riwayat nilai untuk mata pelajaran ini
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {scores.map((score) => (
                      <div key={score.id} className="relative rounded-[24px] p-6 shadow-md overflow-hidden transform transition hover:scale-105 hover:shadow-lg duration-200 w-full">
                        <div className="bg-gradient-to-br from-[#FFF1E6] to-[#FFD6B0] border border-[#FF8A3D] rounded-[20px] p-6 relative overflow-hidden">
                          {/* Decorative diagonal overlay */}
                          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.35)0%,rgba(255,255,255,0)40%)] rounded-[20px] pointer-events-none" />

                          {/* Centered pill label */}
                          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-6">
                            <div className="inline-block bg-[#FF6F2A] text-white text-xs font-semibold px-4 py-2 rounded-full">Nilai CBT</div>
                          </div>

                          <div className="flex flex-col h-full pt-8">
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                              <div className="text-base font-medium text-gray-800 mb-2">{score.test_title}</div>
                              <div className="text-[64px] font-extrabold text-[#FF6600] leading-none">{Number(score.score).toFixed(2)}</div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-700">
                              <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#FF6F2A]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="1.5"/><path d="M12 7v5l3 3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                <div>
                                  <div className="font-medium">Mulai :</div>
                                  <div className="text-sm font-semibold">{formatDate(score.finished_at)}</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 justify-end">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#FF6F2A]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                <div className="text-right">
                                  <div className="font-medium">Selesai :</div>
                                  <div className="text-sm font-semibold">{formatDate(score.finished_at)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
            )
          ) : (
            // Display attempts with filter (styled similar to scores)
            attempts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-700">
                {selectedTestId
                  ? `Belum ada riwayat pengerjaan untuk tes yang dipilih`
                  : `Belum ada riwayat pengerjaan`
                }
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {attempts.map((a) => (
                  <div key={a.id} className="relative rounded-[24px] p-6 shadow-md overflow-hidden transform transition hover:scale-105 hover:shadow-lg duration-200 w-full">
                    <div className="bg-gradient-to-br from-[#FFF1E6] to-[#FFD6B0] border border-[#FF8A3D] rounded-[20px] p-6 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.35)0%,rgba(255,255,255,0)40%)] rounded-[20px] pointer-events-none" />

                      <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-6">
                        <div className="inline-block bg-[#FF6F2A] text-white text-xs font-semibold px-4 py-2 rounded-full">Nilai CBT</div>
                      </div>

                      <div className="flex flex-col h-full pt-8">
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                          <div className="text-base font-medium text-gray-800 mb-2">{a.test.title}</div>
                          <div className="text-[64px] font-extrabold text-[#FF6600] leading-none">{a.score !== null ? Number(a.score).toFixed(2) : '-'}</div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#FF6F2A]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="1.5"/><path d="M12 7v5l3 3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            <div>
                              <div className="font-medium">Mulai :</div>
                              <div className="text-sm font-semibold">{formatDate(a.started_at)}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 justify-end">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#FF6F2A]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            <div className="text-right">
                              <div className="font-medium">Selesai :</div>
                              <div className="text-sm font-semibold">{a.finished_at ? formatDate(a.finished_at) : '-'}</div>
                            </div>
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

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>}>
      <HistoryContent />
    </Suspense>
  );
}
