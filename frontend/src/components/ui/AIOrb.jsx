import React from "react";
import { motion } from "framer-motion";

export function AIOrb({ state = "speaking" }) {
  // Define colors for the 3 states
  const colors = {
    speaking: "rgba(56, 189, 248, 1)", // Light Blue
    listening: "rgba(168, 85, 247, 1)", // Purple
    processing: "rgba(139, 92, 246, 1)", // Violet
  };

  const activeColor = colors[state] || colors.speaking;

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-0 bg-[#0a0a0a] rounded-3xl">
      {/* Background radial gradient to give it a dark tech vibe */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black/50 via-[#0a0a0a]/90 to-[#0a0a0a]"></div>
      
      {/* The Ripples/Orbits */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ 
            border: `1px ${state === "processing" ? "dashed" : "solid"} ${activeColor}`,
            width: "600px", 
            height: "600px",
          }}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{
            duration: 10, // Even slower and more majestic
            repeat: Infinity,
            ease: "easeOut",
            delay: i * 2.5, // 10 / 4 = 2.5 seconds spacing
          }}
        />
      ))}
    </div>
  );
}
