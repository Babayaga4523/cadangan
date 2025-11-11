import React from 'react';

export default function HasilCard({ title, score }: { title: string; score: number }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-lg font-semibold">Skor: {score}</div>
        </div>
      </div>
    </div>
  );
}
