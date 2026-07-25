import React from 'react';
import { UserCheck, UserX } from 'lucide-react';

export function FaceDetectionOverlay({ isFacePresent, faceMissingCount }) {
  return (
    <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
      <div
        className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-sm ${
          isFacePresent
            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
            : 'bg-red-100 text-red-900 border-red-300 animate-bounce'
        }`}
      >
        {isFacePresent ? (
          <>
            <UserCheck className="w-3 h-3 text-emerald-700" /> Present
          </>
        ) : (
          <>
            <UserX className="w-3 h-3 text-red-600" /> Missing ({faceMissingCount})
          </>
        )}
      </div>
    </div>
  );
}
