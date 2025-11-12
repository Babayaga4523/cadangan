"use client";
import DaftarSoalModal from "@/app/components/DaftarSoalModal";
import UnansweredQuestionsModal from "@/app/components/UnansweredQuestionsModal";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth, fetchWithAuthRaw } from '@/app/utils/api';
import { isAuthenticated } from '@/app/utils/auth';
import type { Question } from '@/app/types/cbt';
import QuestionCard from "@/app/components/QuestionCard";

type TestMetadata = {
  id: string;
  title: string;
  description?: string;
  duration_minutes: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function HalamanCBT() {
  const params = useParams();
  const id = params?.id ?? "";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [unansweredModalOpen, setUnansweredModalOpen] = useState(false);
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});

  // Auto-save states
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);

  // Use ref for auto-save interval to avoid state updates in cleanup
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ref to store the latest performAutoSave function
  const performAutoSaveRef = useRef<() => Promise<void>>(() => Promise.resolve());

  const [testMetadata, setTestMetadata] = useState<TestMetadata | null>(null);
  const router = useRouter();

  // LocalStorage keys
  const localStorageKey = `cbt_answers_${id}`;
  const localStorageTimestampKey = `cbt_timestamp_${id}`;

  // LocalStorage utilities with useCallback
  const saveToLocalStorage = useCallback((answers: Record<string, string>) => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(answers));
      localStorage.setItem(localStorageTimestampKey, new Date().toISOString());
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [localStorageKey, localStorageTimestampKey]);

  const loadFromLocalStorage = useCallback((): Record<string, string> | null => {
    try {
      const data = localStorage.getItem(localStorageKey);
      const timestamp = localStorage.getItem(localStorageTimestampKey);
      
      if (data && timestamp) {
        const savedTime = new Date(timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);
        
        // Only load if saved within last 24 hours
        if (hoursDiff < 24) {
          return JSON.parse(data);
        } else {
          // Clear old data
          localStorage.removeItem(localStorageKey);
          localStorage.removeItem(localStorageTimestampKey);
        }
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    return null;
  }, [localStorageKey, localStorageTimestampKey]);

  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem(localStorageKey);
    localStorage.removeItem(localStorageTimestampKey);
  }, [localStorageKey, localStorageTimestampKey]);

  // Submit answer function with useCallback
  const submitAnswerToAPI = useCallback(async (
    questionId: string | number,
    answerText: string
  ) => {
    if (!attemptId) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetchWithAuthRaw(`/attempts/${attemptId}/answers`, {
        method: 'POST',
        body: JSON.stringify({ question_id: questionId, answer: answerText }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        console.error('Submit answer failed:', res.status, error);
        throw new Error(error.message || `HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (error) {
      console.error('Submit failed:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      setErrorMsg(`Gagal menyimpan jawaban: ${message}`);
      
      if (message === 'Authentication required') {
        router.push('/login');
      }
    } finally {
      setSubmitting(false);
    }
  }, [attemptId, router]);

  // Auto-save function
  const performAutoSave = useCallback(async () => {
    if (!attemptId || Object.keys(answerMap).length === 0) return;

    setAutoSaveStatus('saving');
    
    try {
      // Save to localStorage first (immediate)
      saveToLocalStorage(answerMap);
      
      // Try to save to server
      const savePromises = Object.entries(answerMap).map(([questionId, answerId]) => {
        // Find the question and get the answer text for the selected answer ID
        const question = questions.find(q => q.id === questionId);
        const answerOption = question?.answers.find(a => a.id === answerId);
        const answerText = answerOption?.answer_text || '';
        
        return submitAnswerToAPI(questionId, answerText);
      });
      
      await Promise.all(savePromises);
      
      setAutoSaveStatus('success');
      setLastAutoSave(new Date());
      
      // Clear localStorage after successful server save
      clearLocalStorage();
      
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
      
      // Keep localStorage data as fallback
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 3000); // Show error for 3 seconds
    }
  }, [attemptId, answerMap, saveToLocalStorage, clearLocalStorage, submitAnswerToAPI, questions]);

  // Update the ref whenever performAutoSave changes
  useEffect(() => {
    performAutoSaveRef.current = performAutoSave;
  }, [performAutoSave]);

  // Start auto-save interval when attempt starts
  useEffect(() => {
    if (attemptId && !autoSaveIntervalRef.current) {
      const interval = setInterval(() => {
        // Use the ref to get the latest performAutoSave function
        performAutoSaveRef.current?.();
      }, 30000); // 30 seconds

      autoSaveIntervalRef.current = interval;

      return () => {
        clearInterval(interval);
        autoSaveIntervalRef.current = null;
      };
    }
  }, [attemptId]); // Only depend on attemptId
  useEffect(() => {
    if (!attemptId && id) {
      const savedAnswers = loadFromLocalStorage();
      if (savedAnswers) {
        setAnswerMap(savedAnswers);
        setErrorMsg('Jawaban tersimpan dari sesi sebelumnya telah dimuat. Klik "Mulai CBT" untuk melanjutkan.');
      }
    }
  }, [attemptId, id, loadFromLocalStorage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
    };
  }, []); // Empty dependency array since we only want this on unmount

  // Load saved answers when attempt exists
  useEffect(() => {
    if (!attemptId) return;
    (async () => {
      try {
        // Backend exposes GET /api/attempts/{attemptId} to retrieve saved answers
        const answers = await fetchWithAuth(`/attempts/${attemptId}`);
        const newAnswerMap: Record<string, string> = {};
        (answers || []).forEach((a: { question_id: string; answer: string }) => {
          newAnswerMap[a.question_id] = a.answer;
        });
        setAnswerMap(newAnswerMap);
      } catch (err) {
        console.error('Failed to load saved answers', err);
      }
    })();
  }, [attemptId]);

  // Load test metadata and questions
  useEffect(() => {
    if (!id) return;
    
    // Reset states
    setLoading(true);
    setErrorMsg(null);
    setQuestions([]);
    setTestMetadata(null);

    const fetchTestData = async () => {
      try {
        if (!isAuthenticated()) {
          router.push('/login');
          return;
        }

        const testRes = await fetchWithAuthRaw(`/tests/${id}`);
        if (!testRes.ok) {
          if (testRes.status === 401) {
            // Not authenticated
            router.push('/login');
            return;
          }
          if (testRes.status === 403) {
            // Forbidden - user role cannot access student tests
            throw new Error('Anda tidak memiliki izin untuk mengerjakan tes. Silakan masuk sebagai akun siswa.');
          }
          throw new Error('Test not found');
        }
        const testData = await testRes.json();
        if (testData && typeof testData.duration_minutes === "number") {
          setTestMetadata(testData);
        }

        const qRes = await fetchWithAuthRaw(`/tests/${id}/questions`);
        if (!qRes.ok) {
          if (qRes.status === 401) {
            router.push('/login');
            return;
          }
          if (qRes.status === 403) {
            throw new Error('Anda tidak memiliki izin untuk melihat soal ini.');
          }
          throw new Error('Questions not found');
        }
        const data = await qRes.json();
        if (!Array.isArray(data)) {
          throw new Error('Invalid questions data');
        }
        setQuestions(data);
        setCurrent(0);
      } catch (error) {
        console.error('Failed to fetch test data:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        setErrorMsg(`Gagal memuat informasi ujian: ${message}`);
        setQuestions([]);
        if (message === 'Authentication required') {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [id, router]);

  async function startAttempt() {
    setErrorMsg(null);
    setStarting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Silahkan login terlebih dahulu");
      }

      const res = await fetchWithAuthRaw(`/tests/${id}/start`, {
        method: "POST",
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Silahkan login terlebih dahulu");
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal memulai attempt");
      }
      
      const data = await res.json();
      if (!data.attemptId) {
        throw new Error("Invalid response from server");
      }
      
      setAttemptId(data.attemptId);
      // Timer is handled by HeaderCBT component
    } catch (error) {
      console.error('Start attempt error:', error);
      const errorMessage = error instanceof Error ? error.message : "Gagal memulai ujian";
      setErrorMsg(errorMessage);
      if (errorMessage === "Silahkan login terlebih dahulu") {
        router.push('/login');
      }
    } finally {
      setStarting(false);
    }
  }

  const handleSelectAnswer = async (questionId: string, answerId: string, answerText: string) => {
    if (!attemptId) {
      setErrorMsg("Silakan klik 'Mulai CBT' terlebih dahulu.");
      return;
    }
    setAnswerMap(prev => ({ ...prev, [questionId]: answerId }));
    await submitAnswerToAPI(questionId, answerText);
  };

  const finishAttempt = async () => {
    if (!attemptId) return;

    // Check for unanswered questions
    const unansweredQuestions = questions
      .map((q, index) => ({ question: q, index }))
      .filter(({ question }) => !answerMap[question.id])
      .map(({ index }) => index + 1);

    if (unansweredQuestions.length > 0) {
      setUnansweredModalOpen(true);
      return;
    }

    // No unanswered questions, proceed to finish
    router.push(`/cbt/hasil?attemptId=${attemptId}&id=${id}`);
  }

  const confirmFinishAttempt = () => {
    setUnansweredModalOpen(false);
    // Clear localStorage when finishing test
    clearLocalStorage();
    router.push(`/cbt/hasil?attemptId=${attemptId}&id=${id}`);
  }

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-700 text-lg">Memuat soal...</p>
    );
  if (!questions || questions.length === 0)
    return (
      <p className="text-center mt-10 text-gray-700 text-lg">Tidak ada soal.</p>
    );

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-8 px-4">
      <div className="w-[900px] bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden">
        {/* HEADER (styled to match design) */}
        <div className="px-6 py-6">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FFB28A] flex items-center justify-center text-white text-xl font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19 2H8c-1.1 0-2 .9-2 2v2H5a2 2 0 00-2 2v11a2 2 0 002 2h14a2 2 0 002-2V4a2 2 0 00-2-2zM8 6h9v3H8z"/></svg>
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 truncate">{testMetadata?.title || 'Judul Ujian'}</h2>
                <p className="text-sm text-gray-700 truncate mt-1">{testMetadata?.description || 'Deskripsi singkat ujian'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFEDD9] text-[#FF661F] text-sm font-semibold hover:bg-[#FFDCC4] transition"
              >
                <span>Daftar Soal</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* ISI */}
        <div className="p-8">
          <QuestionCard
            question={questions[current]}
            questionNumber={current + 1}
            selectedAnswerId={answerMap[questions[current].id] || null}
            onSelectAnswer={handleSelectAnswer}
            apiBaseUrl={API_BASE}
          />

          {/* NAVIGASI */}
          <div className="flex justify-between items-center mt-10">
            <button
              onClick={() => setCurrent((c) => c - 1)}
              disabled={current === 0}
              className="bg-gray-200 text-gray-700 font-semibold px-6 py-2 rounded-full hover:bg-gray-300 transition disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              ‹ Sebelumnya
            </button>

            {!attemptId ? (
              <button
                onClick={startAttempt}
                disabled={starting}
                className={`px-8 py-2 rounded-full font-semibold transition ${
                  starting
                    ? "bg-orange-200 text-white cursor-wait"
                    : "bg-[#FF661F] text-white hover:bg-[#E6540F]"
                }`}
                // This button is only for starting, so it doesn't navigate
              >
                {starting ? "Memulai…" : "Mulai CBT"}
              </button>
            ) : current < questions.length - 1 ? (
              <button
                onClick={() => setCurrent((c) => c + 1)}
                disabled={submitting}
                className={`px-8 py-2 rounded-full font-semibold transition ${
                  submitting
                    ? "bg-orange-200 text-white cursor-wait"
                    : "bg-[#FF661F] text-white hover:bg-[#E6540F]"
                }`}
              >
                {submitting ? "Menyimpan…" : "Selanjutnya ›"}
              </button>
            ) : (
              <button
                onClick={finishAttempt}
                disabled={submitting}
                className={`px-8 py-2 rounded-full font-semibold transition ${
                  submitting
                    ? "bg-green-300 text-white cursor-wait"
                    : "bg-[#24B26B] text-white hover:bg-[#1A8E56]"
                }`}
              >
                {submitting ? "Menyimpan…" : "Kumpulkan"}
              </button>
            )}
          </div>

          {/* ERROR / TIMER / AUTO-SAVE STATUS */}
          {errorMsg && (
            <div className="mt-5 text-red-600 font-medium">{errorMsg}</div>
          )}
          
          {/* Auto-save status notification */}
          {attemptId && autoSaveStatus !== 'idle' && (
            <div className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
              autoSaveStatus === 'saving' 
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : autoSaveStatus === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {autoSaveStatus === 'saving' && (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan jawaban...
                </>
              )}
              {autoSaveStatus === 'success' && (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Jawaban tersimpan
                  {lastAutoSave && (
                    <span className="text-xs opacity-75">
                      ({lastAutoSave.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  )}
                </>
              )}
              {autoSaveStatus === 'error' && (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Gagal menyimpan - data tersimpan di browser
                </>
              )}
            </div>
          )}
          
          {attemptId && testMetadata?.duration_minutes && (
            <div className="mt-4 text-sm text-gray-700">
              Durasi tes: {testMetadata.duration_minutes} menit
            </div>
          )}
        </div>
      </div>

      {/* MODAL DAFTAR SOAL */}
      <DaftarSoalModal
        open={modalOpen}
        total={questions.length}
        answered={new Set(Object.keys(answerMap).map(qid => questions.findIndex(q => q.id === qid)))}
        activeIndex={current}
        onClose={() => setModalOpen(false)}
        onJump={(i) => {
          setCurrent(i);
          setModalOpen(false);
        }}
      />

      {/* MODAL PERINGATAN SOAL BELUM DIJAWAB */}
      <UnansweredQuestionsModal
        open={unansweredModalOpen}
        unansweredQuestions={questions
          .map((q, index) => ({ question: q, index }))
          .filter(({ question }) => !answerMap[question.id])
          .map(({ index }) => index + 1)}
        onClose={() => setUnansweredModalOpen(false)}
        onConfirm={confirmFinishAttempt}
      />
    </div>
  );
}
