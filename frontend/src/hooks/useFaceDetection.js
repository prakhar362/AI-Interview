import { useState, useEffect, useRef, useCallback } from 'react';
import { FaceDetection } from '@mediapipe/face_detection';
import { Camera } from '@mediapipe/camera_utils';

/**
 * useFaceDetection
 * ─────────────────
 * Detects face presence using MediaPipe (primary) with a canvas-brightness
 * fallback when MediaPipe fails to load from CDN.
 *
 * Counting rule: every 2 continuous seconds without a face = +1 to faceMissingCount.
 * missingStartTimeRef is set ONCE when face first disappears, never overwritten
 * on subsequent frames (that was the original bug causing count to never increment).
 */
export function useFaceDetection(webcamRef, isEnabled = true) {
  const [faceMissingCount, setFaceMissingCount] = useState(0);
  const [isFacePresent, setIsFacePresent] = useState(true);
  const [warningMessage, setWarningMessage] = useState(null);

  const isFacePresentRef   = useRef(true);
  const missingStartTimeRef = useRef(null);
  const mediapipeLoadedRef  = useRef(false);   // tracks whether MediaPipe initialised

  // ── Core handler called by MediaPipe on every frame ──────────────────────
  const handleResults = useCallback((results) => {
    mediapipeLoadedRef.current = true;
    const facesDetected = results.detections && results.detections.length > 0;

    if (facesDetected) {
      isFacePresentRef.current = true;
      setIsFacePresent(true);
      setWarningMessage(null);
      missingStartTimeRef.current = null;   // reset timer — face is back
    } else {
      isFacePresentRef.current = false;
      setIsFacePresent(false);

      // Set start time ONCE per absence event — not on every frame
      if (!missingStartTimeRef.current) {
        missingStartTimeRef.current = Date.now();
      }

      const elapsed = (Date.now() - missingStartTimeRef.current) / 1000;
      if (elapsed >= 2) {
        setWarningMessage('⚠️ Face undetected! Please stay centered in camera view.');
      }
    }
  }, []);

  // ── Fallback: canvas brightness check (no CDN needed) ────────────────────
  // If MediaPipe didn't load within 5 seconds, sample the webcam frame
  // brightness every second. A very dark frame = no face / camera covered.
  const startFallback = useCallback((videoElement) => {
    const canvas  = document.createElement('canvas');
    canvas.width  = 64;
    canvas.height = 48;
    const ctx     = canvas.getContext('2d');

    const fallbackInterval = setInterval(() => {
      if (!videoElement || videoElement.readyState < 2) return;
      try {
        ctx.drawImage(videoElement, 0, 0, 64, 48);
        const data         = ctx.getImageData(0, 0, 64, 48).data;
        let   totalBright  = 0;
        for (let i = 0; i < data.length; i += 4) {
          totalBright += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        const avgBrightness = totalBright / (data.length / 4);

        // Frame is nearly black — camera likely covered or person absent
        const facePresent = avgBrightness > 15;

        if (facePresent) {
          isFacePresentRef.current = true;
          setIsFacePresent(true);
          setWarningMessage(null);
          missingStartTimeRef.current = null;
        } else {
          isFacePresentRef.current = false;
          setIsFacePresent(false);
          if (!missingStartTimeRef.current) {
            missingStartTimeRef.current = Date.now();
          }
          const elapsed = (Date.now() - missingStartTimeRef.current) / 1000;
          if (elapsed >= 2) {
            setWarningMessage('⚠️ Face undetected! Please stay centered in camera view.');
          }
        }
      } catch (_) { /* cross-origin canvas errors — ignore */ }
    }, 1000);

    return fallbackInterval;
  }, []);

  useEffect(() => {
    if (!isEnabled || !webcamRef.current || !webcamRef.current.video) return;

    let camera          = null;
    let faceDetection   = null;
    let fallbackInterval = null;

    // ── Attempt MediaPipe init ─────────────────────────────────────────────
    try {
      faceDetection = new FaceDetection({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
      });
      faceDetection.setOptions({ model: 'short', minDetectionConfidence: 0.5 });
      faceDetection.onResults(handleResults);

      const videoElement = webcamRef.current.video;
      camera = new Camera(videoElement, {
        onFrame: async () => {
          if (videoElement && videoElement.readyState === 4) {
            await faceDetection.send({ image: videoElement });
          }
        },
        width: 320,
        height: 240,
      });
      camera.start();
    } catch (e) {
      console.warn('MediaPipe init failed — using brightness fallback:', e);
    }

    // ── After 5s, if MediaPipe never fired a result, start brightness fallback
    const fallbackTimer = setTimeout(() => {
      if (!mediapipeLoadedRef.current && webcamRef.current?.video) {
        console.info('MediaPipe CDN unreachable — activating brightness fallback');
        fallbackInterval = startFallback(webcamRef.current.video);
      }
    }, 5000);

    // ── Counting interval: fires every 2s ─────────────────────────────────
    const checkInterval = setInterval(() => {
      if (missingStartTimeRef.current) {
        const elapsed = (Date.now() - missingStartTimeRef.current) / 1000;
        if (elapsed >= 2.0) {
          setFaceMissingCount((prev) => prev + 1);
          missingStartTimeRef.current = Date.now();  // reset for next 2s window
        }
      }
    }, 2000);

    return () => {
      clearTimeout(fallbackTimer);
      clearInterval(checkInterval);
      if (fallbackInterval) clearInterval(fallbackInterval);
      if (camera) camera.stop();
      if (faceDetection) faceDetection.close();
    };
  }, [webcamRef, isEnabled, handleResults, startFallback]);

  const resetCount = useCallback(() => {
    setFaceMissingCount(0);
  }, []);

  return { faceMissingCount, isFacePresent, warningMessage, resetCount };
}
