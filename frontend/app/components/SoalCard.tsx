import React from 'react';

export default function SoalCard({ no, text }: { no: number; text: string }) {
  return (
    <div className="border border-blue-100 rounded-md p-4">
      <div className="inline-block bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded-full text-sm mb-2">Soal No. {no}</div>
      <p className="text-gray-800">{text}</p>
    </div>
  );
}
