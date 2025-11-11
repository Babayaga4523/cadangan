"use client";
import React, { useState } from 'react';
import DaftarSoalModal from './DaftarSoalModal';

type AnswerDetail = { question: string; user_answer?: string | null; correct_answer?: string | null; is_correct?: boolean };

interface Props {
  result: { title: string; score: number; correct?: number; total?: number } | null;
  totalQuestions?: number;
  answers?: AnswerDetail[];
}

export default function HasilDetailClient({ result, totalQuestions = 10, answers }: Props) {
  const [open, setOpen] = useState(false);

  if (!result) return <div className="text-gray-600 text-sm">Tidak ada hasil.</div>;

  return (
    <div className="space-y-5">
      <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{result.title}</h2>
            {typeof result.correct === 'number' && typeof result.total === 'number' && (
              <p className="mt-1 text-sm text-gray-600">Benar <span className="font-semibold text-gray-800">{result.correct}</span> dari <span className="font-semibold text-gray-800">{result.total}</span> soal</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#E65100] leading-none">{result.score.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Skor akhir</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400"
          >
            Lihat Pembahasan
          </button>
        </div>
      </div>

      {answers && answers.length > 0 && (
        <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Daftar Soal</h3>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-600 inline-block" /> Benar</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-600 inline-block" /> Salah</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-gray-300 inline-block" /> Kosong</span>
            </div>
          </div>
          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 mb-6">
            {Array.from({ length: totalQuestions }).map((_, i) => {
              const a = answers[i];
              const state = a ? (a.is_correct ? 'correct' : (a.user_answer ? 'wrong' : 'blank')) : 'blank';
              const color = state === 'correct' ? 'bg-green-600 text-white' : state === 'wrong' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700';
              return (
                <div key={i} className={`text-xs font-semibold rounded-md px-2 py-2 text-center ${color}`}>{i + 1}</div>
              );
            })}
          </div>

          {/* Pembahasan per soal */}
          <div className="space-y-6">
            {answers.map((a, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-sm font-semibold text-gray-800 mb-2">Soal No. {i + 1}</p>
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">{a.question}</p>
                <div className="flex flex-wrap gap-4 text-sm mb-2">
                  <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">Jawaban Anda: {a.user_answer ?? '-'}</span>
                  <span className="px-2 py-1 rounded bg-green-100 text-green-700 font-medium">Jawaban Benar: {a.correct_answer ?? '-'}</span>
                  <span className={`px-2 py-1 rounded font-semibold ${a.is_correct ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{a.is_correct ? 'Benar' : 'Salah'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <DaftarSoalModal open={open} total={totalQuestions} onClose={() => setOpen(false)} answered={new Set()} />
    </div>
  );
}
