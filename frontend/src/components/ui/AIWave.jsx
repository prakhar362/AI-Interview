import React from 'react';
import Siriwave from 'react-siriwave';

const STATE_CONFIG = {
  idle:      { color: '#00F0FF', speed: 0.1, amplitude: 1.2 },  // Vibrant Cyan
  speaking:  { color: '#FFB800', speed: 0.25, amplitude: 2.2 }, // Vibrant Amber
  listening: { color: '#A855F7', speed: 0.18, amplitude: 1.8 }, // Vibrant Purple
};

export function AIWave({ state = 'idle' }) {
  const config = STATE_CONFIG[state] || STATE_CONFIG.idle;
  
  return (
    <div className="w-full flex items-center justify-center overflow-hidden pointer-events-none py-1">
      <Siriwave 
        theme="ios9" 
        autostart={true} 
        width={640} 
        height={100} 
        {...config} 
      />
    </div>
  );
}
