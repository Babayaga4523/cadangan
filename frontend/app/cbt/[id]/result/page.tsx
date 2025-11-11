import React from 'react';
import HeaderCBT from '../../../components/HeaderCBT';

export default async function ResultPage({ params, searchParams }: { params: { id: string }, searchParams?: { attemptId?: string } }) {
  const id = params.id;
  const attemptId = searchParams?.attemptId || '';
  type AnswerDetail = { question: string; user_answer?: string | null; correct_answer?: string | null; is_correct?: boolean };
  let data: { score?: number; correct?: number; total?: number; answers?: AnswerDetail[] } | null = null;

  if (attemptId) {
    try {
      const res = await fetch(`/api/backend/tests/${id}/result?attempt_id=${attemptId}`);
      data = await res.json();
    } catch {
      data = null;
    }
  }

  return (
    <div>
      <HeaderCBT title={`Hasil Ujian ${id}`} />
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Hasil Tes</h2>
        {!data && <p className="text-gray-500">Tidak ada data hasil. Pastikan attemptId diberikan.</p>}
        {data && (
          <div className="space-y-4">
            <div className="bg-white rounded p-4 shadow">
              <p className="text-2xl font-bold">Nilai: {Number(data.score).toFixed(2)}</p>
              <p className="text-sm text-gray-500">Benar: {data.correct} / {data.total}</p>
            </div>

            <div className="bg-white rounded p-4 shadow">
              <h3 className="font-semibold mb-3">Pembahasan</h3>
              <div className="space-y-3">
                {data.answers && data.answers.map((a: AnswerDetail, i: number) => (
                  <div key={i} className="border p-3 rounded">
                    <p className="font-medium">{a.question}</p>
                    <p>Jawaban Anda: <span className="font-semibold">{a.user_answer ?? '-'}</span></p>
                    <p>Jawaban Benar: <span className="font-semibold">{a.correct_answer ?? '-'}</span></p>
                    <p className={`mt-2 ${a.is_correct ? 'text-green-600' : 'text-red-600'}`}>{a.is_correct ? 'Benar' : 'Salah'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
