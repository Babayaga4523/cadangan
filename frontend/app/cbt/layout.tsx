import React from 'react';

export default function CBLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">{children}</div>
    </div>
  );
}
