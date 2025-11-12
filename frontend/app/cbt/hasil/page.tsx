"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from 'next/image';
import { fetchWithAuthRaw } from "@/app/utils/api";

interface QuestionReview {
  id: number;
  question_text: string;
  stimulus_type?: string;
  stimulus_content?: string;
  options: string[];
  correct_answer: string;
  user_answer: string;
  explanation?: string;
  is_correct: boolean;
}

interface TestReview {
  test_id: string;
  test_title: string;
  description?: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken: number;
  completed_at: string;
  questions: QuestionReview[];
}
// Resolve image path candidates. Returns array of candidate URLs to try in order.
function buildImageCandidates(content?: string) {
  if (!content) return [];
  if (content.startsWith("http")) return [content];
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  const norm = content.replace(/\\/g, "/").replace(/^\//, "");
  // try direct, then storage/ prefix
  return [`${base}/${norm}`, `${base}/storage/${norm}`];
}

function QuestionImage({ content, alt, className }: { content?: string; alt?: string; className?: string }) {
  const candidates = React.useMemo(() => buildImageCandidates(content), [content]);
  const [idx, setIdx] = React.useState(0);
  const [visible, setVisible] = React.useState(true);
  React.useEffect(() => {
    setIdx(0);
    setVisible(true);
  }, [content]);
  if (!candidates.length || !visible) return null;
  const src = candidates[idx];
  return (
    <Image
      src={src}
      alt={alt || ''}
      width={460}
      height={320}
      className={className}
      onError={() => {
        if (idx + 1 < candidates.length) setIdx((s) => s + 1);
        else setVisible(false);
      }}
    />
  );
}

function HasilCBTContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId =
    searchParams.get("attemptId") ||
    searchParams.get("attempt_id") ||
    "";

  const [review, setReview] = useState<TestReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // avoid hydration mismatches by delaying interactive UI until client mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  // share form state
  const [schoolName, setSchoolName] = useState("");
  const [className, setClassName] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  // close success modal on ESC
  useEffect(() => {
    if (!shareSuccess) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setShareSuccess(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shareSuccess]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      let currentAttemptId = attemptId;
      const testId = searchParams.get("id");

      setLoading(true);
      setError(null);

      try {
        // If no attemptId, try to get the latest one for the test
        if (!currentAttemptId && testId) {
          const res = await fetchWithAuthRaw(`/student/tests/${testId}/latest_attempt`);
          if (res.ok) {
            const data = await res.json();
            currentAttemptId = data.attempt_id;
          } else {
            throw new Error("No completed attempts found for this test.");
          }
        }

        if (!currentAttemptId) {
          setLoading(false);
          setError("No attempt specified.");
          return;
        }

        // First, ensure the attempt is submitted
        try {
          await fetchWithAuthRaw(`/attempts/${currentAttemptId}/submit`, {
            method: "POST",
          });
        } catch (submitError) {
          // Ignore if it fails (e.g., already submitted)
          console.warn("Submit call failed, proceeding with review...", submitError);
        }

        // Fetch the review data
        let res = await fetchWithAuthRaw(`/student/review/${currentAttemptId}`);
        if (!res.ok) {
          // Retry once after a short delay
          await new Promise((r) => setTimeout(r, 500));
          res = await fetchWithAuthRaw(`/student/review/${currentAttemptId}`);
        }

        if (!res.ok) {
          const msg =
            res.status === 404
              ? "Hasil ujian tidak ditemukan. Pastikan ujian telah diselesaikan."
              : "Gagal memuat hasil. Silakan coba lagi.";
          throw new Error(msg);
        }

        const data: TestReview = await res.json();
        if (!cancelled) {
          setReview(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Terjadi kesalahan");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [attemptId, searchParams]);

  // keep buildImageCandidates/QuestionImage at module level

  return (
    <div suppressHydrationWarning className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="w-full max-w-5xl mb-6">
        <div className="bg-white border border-[#9BC8FF] rounded-xl p-4 shadow-sm flex items-center justify-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#FFB28A] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            <span role="img" aria-label="Soal">📄</span>
          </div>
          <div className="flex-1 min-w-0 text-center">
            <h1 className="text-lg font-bold text-gray-800">
              {review?.test_title || (loading ? "Memuat judul soal..." : "Judul soal tidak tersedia")}
            </h1>
            
            <p className="text-sm text-gray-500 mt-1 truncate">
              {review?.description || "Deskripsi tidak tersedia"}
            </p>
          </div>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="w-full max-w-5xl mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
          {error}
        </div>
      )}

      {/* Nilai & Form */}
      <section className="w-full max-w-5xl bg-[#EAF3FF] border border-[#9BC8FF] rounded-2xl shadow p-6 flex flex-col md:flex-row gap-6 justify-between">
        {/* Nilai CBT */}
        <div className="flex-1 text-center">
          <h3 className="text-base font-semibold text-gray-700 tracking-wide mb-2">Nilai CBT</h3>
          <div className="text-[72px] font-extrabold text-[#E65100] mb-1 leading-none">
            {loading ? "…" : Number(review?.score ?? 0).toFixed(2)}
          </div>
          
          <p className="text-gray-700 mb-4 text-sm">
            Total nilai kamu adalah
          </p>
          <p className="text-gray-600 mb-5 text-sm leading-tight">
            {(() => {
              const score = Number(review?.score ?? 0);
              if (score >= 80) {
                return "Luar biasa! Kamu telah menunjukkan pemahaman yang sangat baik terhadap materi. Terus pertahankan semangat belajar dan jangan pernah berhenti berkembang!";
              } else if (score >= 70) {
                return "Bagus sekali! Kamu sudah cukup memahami materi dengan baik. Tingkatkan lagi dengan belajar lebih tekun untuk mencapai hasil yang lebih maksimal.";
              } else if (score >= 60) {
                return "Cukup baik! Kamu sudah berusaha dengan baik. Mari tingkatkan lagi pemahamanmu dengan belajar lebih giat dan fokus pada materi yang masih kurang dipahami.";
              } else {
                return "Jangan berkecil hati! Setiap kegagalan adalah kesempatan untuk belajar lebih baik. Belajar lebih giat lagi, fokus pada pemahaman konsep, dan jangan pernah menyerah. Kamu pasti bisa!";
              }
            })()}
          </p>
          <div className="flex justify-center gap-3">
            {mounted ? (
              <>
                <button
                  onClick={() => router.push(`/cbt/${review?.test_id || "latihan-1"}`)}
                  className="bg-[#FF661F] hover:bg-[#E6540F] text-white font-semibold px-6 py-2 rounded-full transition text-sm"
                >
                  Kerjakan Ulang
                </button>
                <button
                  onClick={() => router.push("/dashboard/student")}
                  className="bg-[#FFE7DE] hover:bg-[#FFDCC9] text-[#C24A12] font-semibold px-6 py-2 rounded-full transition text-sm"
                >
                  Kembali ke Kelas
                </button>
              </>
            ) : (
              <div className="space-x-3">
                <span className="inline-block w-28 h-9 bg-gray-200 rounded-full" />
                <span className="inline-block w-28 h-9 bg-gray-200 rounded-full" />
              </div>
            )}
          </div>
        </div>

        {/* Form Bagikan Nilai */}
        <div className="flex-1 bg-white border border-[#9BC8FF] rounded-2xl p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Bagikan Nilai
          </h3>
          <form className="flex flex-col gap-3 text-gray-800">
            {mounted ? (
              <>
                <input
                  type="text"
                  placeholder="Masukkan nama sekolah"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="placeholder:text-gray-500 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <input
                  type="text"
                  placeholder="Masukkan kelas"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="placeholder:text-gray-500 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <input
                  type="email"
                  placeholder="Masukkan alamat email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="placeholder:text-gray-500 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      setShareError(null);
                      if (!attemptId) { setShareError('Attempt ID tidak tersedia'); return; }
                      if (!shareEmail) { setShareError('Masukkan alamat email tujuan'); return; }
                      setSharing(true);
                      try {
                        const res = await fetchWithAuthRaw(`/attempts/${attemptId}/share`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: shareEmail, school: schoolName, class: className }),
                        });
                        if (!res.ok) {
                          const txt = await res.text().catch(() => '');
                          throw new Error(txt || `Server returned ${res.status}`);
                        }
                        // success
                        setSchoolName(''); setClassName(''); setShareEmail('');
                        setShareSuccess(true);
                      } catch (err) {
                        setShareError(err instanceof Error ? err.message : 'Gagal mengirim email');
                      } finally {
                        setSharing(false);
                      }
                    }}
                    disabled={sharing}
                    className={`bg-[#FF661F] ${sharing ? 'opacity-60 pointer-events-none' : 'hover:bg-[#E6540F]'} text-white font-semibold text-sm py-2 rounded-full transition flex-1`}
                  >
                    {sharing ? 'Membagikan...' : 'Bagikan'}
                  </button>
                  
                </div>
                {shareError && <p className="text-sm text-red-600 mt-1">{shareError}</p>}
              </>
            ) : (
              <div className="space-y-2">
                <div className="h-9 bg-gray-200 rounded-lg w-full" />
                <div className="h-9 bg-gray-200 rounded-lg w-full" />
                <div className="h-9 bg-gray-200 rounded-lg w-full" />
                <div className="h-9 bg-gray-200 rounded-lg w-40" />
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Success modal modern and elegant */}
      {shareSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
          <div
            role="dialog"
            aria-modal="true"
            className="relative bg-white rounded-2xl w-[400px] p-8 shadow-2xl z-10 border border-gray-100 animate-scale-in"
          >
            <button
              aria-label="Close"
              onClick={() => setShareSuccess(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 hover:ring-2 hover:ring-gray-200 flex items-center justify-center text-gray-500 transition-all duration-200"
            >
              ✕
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full bg-[#E6F9EC] flex items-center justify-center mb-6 border-4 border-[#D1F2E0] animate-pulse-once">
                <svg className="w-16 h-16 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-300 mb-3 leading-tight">
                Nilai berhasil dibagikan!
              </h3>
              <p className="text-base text-gray-500 leading-relaxed max-w-xs">
                Sekarang saatnya belajar lebih giat untuk nilai yang lebih tinggi!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pembahasan Soal */}
      <section className="w-full max-w-5xl mt-10">
        <div className="mx-auto w-full max-w-3xl">
          <div className="bg-[#EAF3FF] border border-[#9BC8FF] rounded-2xl p-3 text-center font-semibold text-gray-800">
            Pembahasan Soal
          </div>
        </div>

        <div className="mt-6 bg-white border border-gray-200 rounded-2xl shadow-md p-6">
          {!review?.questions || review.questions.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              Belum ada pembahasan.
            </div>
          ) : (
            <div className="md:flex md:gap-6">
              {/* Daftar Soal */}
              <div className="md:w-1/4 border-r pr-6">
                <h4 className="font-semibold text-gray-700 mb-4">Daftar Soal</h4>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(40px,1fr))] gap-2 mb-4 max-w-xs">
                  {review.questions.map((qi, i) => {
                    const isBlank = !qi.user_answer || qi.user_answer.trim() === '';
                    const cls = qi.is_correct
                      ? "bg-green-600 text-white"
                      : isBlank
                      ? "bg-gray-200 text-gray-700"
                      : "bg-red-600 text-white";
                    return (
                      <button
                        key={i}
                        onClick={() => document.getElementById(`q-${i}`)?.scrollIntoView({ behavior: 'smooth' })}
                        aria-label={`Soal ${i + 1}`}
                        className={`w-10 h-10 rounded-md font-semibold flex items-center justify-center text-sm ${cls} hover:scale-105 transition-transform`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
                <div className="text-sm text-gray-600 mt-3 flex gap-4">
                  <p>
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-sm mr-1"></span>
                    Benar
                  </p>
                  <p>
                    <span className="inline-block w-3 h-3 bg-red-500 rounded-sm mr-1"></span>
                    Salah
                  </p>
                  <p>
                    <span className="inline-block w-3 h-3 bg-gray-200 rounded-sm mr-1"></span>
                    Belum dijawab
                  </p>
                </div>
              </div>

              {/* Isi Soal Aktif */}
              <div className="md:col-span-3">
                <div className="space-y-6">
                  {review.questions.map((qq, i) => {
                    return (
                      <div id={`q-${i}`} key={qq.id ?? i} className="rounded-xl border border-gray-200 p-6">
                        <h4 className="font-semibold text-gray-700 mb-3">Soal No. {i + 1}</h4>
                        {qq.stimulus_type === "image" && (
                          <div className="mb-4 text-center">
                            <div className="inline-block bg-white p-3 rounded-lg border border-[#D7EAFB]">
                              <QuestionImage content={qq.stimulus_content} alt={`Stimulus Soal ${i + 1}`} className="rounded-md mb-0 border max-h-80 w-[460px] object-contain" />
                            </div>
                          </div>
                        )}
                        {qq.stimulus_type === "text" && qq.stimulus_content && (
                          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">{qq.stimulus_content}</p>
                          </div>
                        )}
                        <p className="mb-4 text-gray-800 text-sm leading-relaxed">{qq.question_text}</p>

                        <div className="space-y-2 mb-4">
                          {qq.options.map((opt, idx) => {
                            const optionLetter = String.fromCharCode(65 + idx);
                            const isCorrect = opt === qq.correct_answer;
                            const isUser = opt === qq.user_answer;
                            const cls = isCorrect
                              ? "border-green-500 bg-green-50 text-green-800"
                              : isUser && !isCorrect
                              ? "border-red-500 bg-red-50 text-red-800"
                              : "border-gray-200";
                            return (
                              <div key={idx} className={`flex items-start gap-2 p-3 border rounded-lg text-sm ${cls}`}>
                                <div className="font-semibold min-w-6">{optionLetter}.</div>
                                <div className="flex-1">{opt || 'N/A'}</div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="border-t border-gray-300 pt-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-gray-800">Jawaban kamu : <span className="font-bold text-red-700">{qq.user_answer || "-"}</span></p>
                            {qq.user_answer && !qq.is_correct && (<div className="text-sm text-red-700 font-semibold">✖ Jawaban kamu salah</div>)}
                            {qq.user_answer && qq.is_correct && (<div className="text-sm text-green-700 font-semibold">✓ Jawaban kamu benar</div>)}
                            {!qq.user_answer && (<div className="text-sm text-gray-700 font-semibold">○ Soal belum dijawab</div>)}
                          </div>

                          <p className="font-semibold text-gray-800 mb-1 mt-2">Kunci Jawaban : <span className="font-bold text-green-700">{qq.correct_answer || "-"}</span></p>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mt-3">{qq.explanation || "Pembahasan tidak tersedia."}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function HasilCBTPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>}>
      <HasilCBTContent />
    </Suspense>
  );
}
