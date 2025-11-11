"use client";
import React, { useEffect, useState } from 'react';
import HasilCard from '../../components/HasilCard';
import HeaderCBT from '../../components/HeaderCBT';

export default function RiwayatPage() {
  const [history, setHistory] = useState<{ title: string; score: number; date?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/backend/history`)
      .then((r) => r.json())
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => setHistory([{ title: 'Latihan: Kenampakan Alam', score: 85, date: '2025-11-07' }]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <HeaderCBT title="Riwayat Nilai" />
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Riwayat Nilai</h2>
        {loading && <div className="text-gray-500">Memuat…</div>}
        <div className="space-y-4">
          {history.map((h, i) => (
            <HasilCard key={i} title={h.title} score={h.score} />
          ))}
        </div>
      </div>
    </div>
  );
}
