import React from 'react';
import Timer from './Timer';

type Props = {
  title: string;
  description?: string;
  durationMinutes?: number;
  attemptStartTime?: string;
  onTimeUp?: () => void;
};

export default function HeaderCBT({ title, description, durationMinutes, attemptStartTime, onTimeUp }: Props) {
  return (
    <div className="bg-blue-100 border border-blue-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="bg-orange-100 text-orange-500 rounded-full p-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12h14M5 6h14M5 18h14" stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div>
          <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      </div>
      {durationMinutes && (
        <Timer 
          durationMinutes={durationMinutes} 
          attemptStartTime={attemptStartTime}
          onTimeUp={onTimeUp}
        />
      )}
    </div>
  );
}
