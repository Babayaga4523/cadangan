"use client";
import React from 'react';

type Props = {
  open: boolean;
  total: number;
  answered?: Set<number>;
  activeIndex?: number;
  onClose?: () => void;
  onJump?: (index: number) => void;
};

export default function DaftarSoalModal({ open, total, answered = new Set(), activeIndex = 0, onClose, onJump }: Props) {
  if (!open) return null;

  const items = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl p-5 w-[360px] shadow-lg border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800">Daftar Soal</h3>
          <button onClick={onClose} aria-label="Tutup" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-5 gap-3 mb-4">
          {items.map((n, idx) => {
            const isAnswered = answered.has(idx);
            const isActive = idx === activeIndex;
            return (
              <button
                key={n}
                onClick={() => onJump && onJump(idx)}
                aria-current={isActive}
                className={`w-11 h-11 rounded-md flex items-center justify-center text-sm font-semibold transition-shadow focus:outline-none ${isActive ? 'bg-[#FF661F] text-white shadow-md' : isAnswered ? 'bg-[#FFEDD9] text-[#C24A12] border border-[#EED6C3]' : 'bg-gray-200 text-gray-700'}`}
              >
                {n}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#FF661F]"></span>
            <span>Sudah dikerjakan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-gray-300"></span>
            <span>Belum dikerjakan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
