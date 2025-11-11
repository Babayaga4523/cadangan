"use client";

import { useEffect, useState } from 'react';

type Props = {
  durationMinutes: number;
  onTimeUp?: () => void;
  attemptStartTime?: string;
};

export default function Timer({ durationMinutes, onTimeUp, attemptStartTime }: Props) {
  // Calculate initial time from attempt start if available, otherwise use full duration
  const getInitialTime = () => {
    if (attemptStartTime) {
      const startTime = new Date(attemptStartTime).getTime();
      const now = new Date().getTime();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = (durationMinutes * 60) - elapsed;
      return Math.max(0, remaining);
    }
    return durationMinutes * 60;
  };

  const [timeLeft, setTimeLeft] = useState<number>(getInitialTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
      <span className={`${timeLeft < 300 ? 'text-red-500' : 'text-blue-500'}`}>
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}