"use client";

import type { Question } from "@/app/types/cbt";

type QuestionCardProps = {
  question: Question;
  questionNumber: number;
  selectedAnswerId: number | null;
  onSelectAnswer: (questionId: string, answerId: number, answerText: string) => void;
  apiBaseUrl: string;
};

export default function QuestionCard({
  question,
  questionNumber,
  selectedAnswerId,
  onSelectAnswer,
  apiBaseUrl,
}: QuestionCardProps) {
  return (
    <div>
      <div className="mb-5">
        <span className="bg-blue-100 border border-blue-200 text-blue-700 px-4 py-1 rounded-full text-sm font-medium">
          Soal No. {questionNumber}
        </span>
      </div>

      {/* STIMULUS */}

      {/* Stimulus Teks */}
      {question.stimulus && question.stimulus_type === "text" && (
        <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl mb-6 leading-relaxed text-gray-700 text-[15px]">
          {question.stimulus}
        </div>
      )}

      {/* Stimulus Gambar */}
      {question.stimulus && question.stimulus_type === "image" && (
        <div className="flex justify-center mb-6">
          {/* Gunakan path langsung, bukan /storage/ */}
          <img
            src={`${apiBaseUrl}${question.stimulus}`}
            alt="Stimulus Gambar"
            className="rounded-xl border border-gray-200 shadow-sm object-contain max-w-full"
            style={{ maxHeight: '320px', backgroundColor: '#f8fafc' }}
          />
        </div>
      )}

      {/* TEKS SOAL */}
      <p className="text-gray-800 text-[16px] font-medium mb-6 leading-relaxed">
        {question.question_text}
      </p>

      {/* PILIHAN JAWABAN */}
      <div role="radiogroup">
        {question.answers.map((opt) => (
          <label
            key={opt.id}
            className={`block border rounded-xl px-5 py-3 mb-3 cursor-pointer text-gray-700 text-[15px] transition ${
              selectedAnswerId === opt.id
                ? "bg-orange-50 border-orange-400 text-orange-600 ring-2 ring-orange-200"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              className="mr-3 accent-orange-500"
              checked={selectedAnswerId === opt.id}
              onChange={() => onSelectAnswer(String(question.id), Number(opt.id), opt.answer_text)}
            />
            {opt.answer_text}
          </label>
        ))}
      </div>

      {/* Pembahasan (explanation) */}
      {question.explanation && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
          <div className="font-semibold mb-2">Pembahasan:</div>
          <div className="text-[15px]">{question.explanation}</div>
        </div>
      )}
    </div>
  );
}