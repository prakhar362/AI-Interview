import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Card({ className, children, ...props }) {
  return (
    <div className={cn("bg-white rounded-3xl p-6 border border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.05)] relative overflow-hidden text-zinc-900", className)} {...props}>
      {children}
    </div>
  );
}

export function Button({ className, variant = 'primary', size = 'md', disabled, children, ...props }) {
  const baseStyle = "inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-95";
  
  const variants = {
    primary: "bg-[#22F5B5] hover:bg-[#1de0a4] text-[#111111] font-black shadow-[0_4px_14px_rgba(34,245,181,0.35)] border border-[#22F5B5]/30",
    secondary: "bg-white hover:bg-zinc-100 text-[#111111] border border-black/10 shadow-sm",
    outline: "border border-black/15 hover:bg-zinc-100 text-zinc-800 bg-white",
    ghost: "text-zinc-600 hover:text-zinc-900 hover:bg-black/5",
    danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/80 shadow-sm"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs gap-1.5",
    md: "px-6 py-2.5 text-sm gap-2",
    lg: "px-8 py-3.5 text-base gap-3 font-extrabold"
  };

  return (
    <button className={cn(baseStyle, variants[variant], sizes[size], className)} disabled={disabled} {...props}>
      {children}
    </button>
  );
}

export function Badge({ className, variant = 'default', children }) {
  const variants = {
    default: "bg-zinc-100 text-zinc-700 border-black/10",
    primary: "bg-[#22F5B5]/20 text-zinc-900 border-[#22F5B5]/40 font-bold",
    cyan: "bg-[#22F5B5]/25 text-zinc-900 border-[#22F5B5]/50 font-bold",
    emerald: "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold",
    amber: "bg-amber-100 text-amber-900 border-amber-300 font-bold",
    rose: "bg-red-100 text-red-900 border-red-300 font-bold",
  };

  return (
    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border", variants[variant], className)}>
      {children}
    </span>
  );
}

export function Progress({ value = 0, className }) {
  return (
    <div className={cn("w-full bg-zinc-200 rounded-full h-2.5 overflow-hidden border border-black/5", className)}>
      <div
        className="bg-[#22F5B5] h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function CircularProgress({ value = 0, current = 1, total = 22, size = 110, strokeWidth = 9, className }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#22F5B5"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-black text-[#111111] leading-none">{current}<span className="text-xs font-extrabold text-zinc-400">/{total}</span></span>
        <span className="text-[9px] font-extrabold uppercase text-[#666666] tracking-wider mt-1">Questions</span>
      </div>
    </div>
  );
}
