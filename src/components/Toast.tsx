//Toast.tsx
import React, { useEffect } from 'react';

type Props = {
  message: string;
  onClose: () => void;
  duration?: number;
  type?: 'success' | 'info';
};

export default function Toast({ message, onClose, duration = 2000, type = 'success' }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 flex items-center bg-white border px-4 py-3 rounded-lg shadow-lg animate-fade-in">
      {type === 'success' ? (
        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M5 13l4 4L19 7"></path>
        </svg>
      ) : (
        <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )}
      <span className={type === 'success' ? 'text-green-700' : 'text-blue-700'}>{message}</span>
    </div>
  );
}
