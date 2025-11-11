"use client";
import React from 'react';

type Props = {
  open: boolean;
  unansweredQuestions: number[];
  onClose: () => void;
  onConfirm: () => void;
};

export default function UnansweredQuestionsModal({ open, unansweredQuestions, onClose, onConfirm }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl p-6 w-[400px] shadow-lg border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Peringatan</h3>
          <button onClick={onClose} aria-label="Tutup" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-3">
            Anda masih memiliki soal yang belum dijawab. Apakah Anda yakin ingin mengumpulkan jawaban?
          </p>
          {unansweredQuestions.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Soal yang belum dijawab:</p>
              <div className="flex flex-wrap gap-2">
                {unansweredQuestions.map((num) => (
                  <span key={num} className="inline-block px-2 py-1 bg-red-100 text-red-700 text-sm rounded-md">
                    Soal {num}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Kembali
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-[#24B26B] text-white rounded-lg font-medium hover:bg-[#1A8E56] transition"
          >
            Kumpulkan Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}