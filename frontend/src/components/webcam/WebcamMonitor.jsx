import React, { useRef } from 'react';
import Webcam from 'react-webcam';
import { Camera, AlertCircle } from 'lucide-react';
import { useFaceDetection } from '../../hooks/useFaceDetection';
import { FaceDetectionOverlay } from './FaceDetectionOverlay';

export function WebcamMonitor({ onMissingCountUpdate }) {
  const webcamRef = useRef(null);
  const { faceMissingCount, isFacePresent, warningMessage } = useFaceDetection(webcamRef, true);

  React.useEffect(() => {
    if (onMissingCountUpdate) {
      onMissingCountUpdate(faceMissingCount);
    }
  }, [faceMissingCount, onMissingCountUpdate]);

  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.08)] bg-white group">
      <Webcam
        ref={webcamRef}
        audio={false}
        mirrored={true}
        screenshotFormat="image/jpeg"
        className="w-full h-full object-cover"
        videoConstraints={{
          width: 320,
          height: 240,
          facingMode: 'user'
        }}
      />

      <FaceDetectionOverlay
        isFacePresent={isFacePresent}
        faceMissingCount={faceMissingCount}
      />

      {warningMessage && (
        <div className="absolute inset-x-0 bottom-0 bg-red-600/90 text-white text-[10px] font-bold px-2 py-1 flex items-center justify-center gap-1 backdrop-blur-sm animate-pulse">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">Face Undetected</span>
        </div>
      )}

      <div className="absolute top-2 left-2 bg-white/90 p-1.5 rounded-xl text-[#111111] border border-black/5 shadow-sm">
        <Camera className="w-3.5 h-3.5 text-[#111111]" />
      </div>
    </div>
  );
}
