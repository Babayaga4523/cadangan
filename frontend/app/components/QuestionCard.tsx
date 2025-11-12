"use client";

import type { Question } from "@/app/types/cbt";
import Image from 'next/image';

type QuestionCardProps = {
  question: Question;
  questionNumber: number;
  selectedAnswerId: string | null;
  onSelectAnswer: (questionId: string, answerId: string, answerText: string) => void;
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
          {/* Handle both full URLs and relative paths */}
          <Image
            src={question.stimulus.startsWith('http') 
              ? question.stimulus 
              : question.stimulus.startsWith('/storage/') 
                ? `${apiBaseUrl}${question.stimulus}` 
                : question.stimulus.startsWith('/images/') 
                  ? `${apiBaseUrl}/storage${question.stimulus}` 
                  : `${apiBaseUrl}/storage/images/${question.stimulus}`}
            alt="Stimulus Gambar"
            width={800}
            height={320}
            className="rounded-xl border border-gray-200 shadow-sm object-contain max-w-full bg-slate-50"
            onError={(e) => {
              console.error('Image failed to load:', question.stimulus);
              e.currentTarget.style.display = 'none';
            }}
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
              checked={selectedAnswerId === String(opt.id)}
              onChange={() => onSelectAnswer(String(question.id), String(opt.id), opt.answer_text)}
            />
            {opt.answer_text || <span className="text-gray-400 italic">(Pilihan kosong)</span>}
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