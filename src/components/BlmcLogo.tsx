"use client";

import React from 'react';

interface BlmcLogoProps {
  size?: number;
  className?: string;
}

export function BlmcLogo({ size = 48, className = '' }: BlmcLogoProps) {
  return (
    <img
      src="/blmc-logo.png"
      alt="Bansud Livestock Multipurpose Cooperative"
      width={size}
      height={size}
      className={`object-contain rounded-xl ${className}`}
      onError={(e) => {
        // Fallback if image not found
        const target = e.currentTarget;
        target.style.display = 'none';
        const fallback = target.nextElementSibling as HTMLElement;
        if (fallback) fallback.style.display = 'flex';
      }}
    />
  );
}

// Fallback placeholder shown when image is missing
export function BlmcLogoFallback({ size = 48, className = '' }: BlmcLogoProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-xl border-2 border-blue-200 bg-white flex items-center justify-center shrink-0 ${className}`}
    >
      <div className="w-[75%] h-[75%] rounded-full border-2 border-red-500 flex items-center justify-center">
        <span className="text-[#5b4fa8] font-extrabold text-xs leading-none">B</span>
      </div>
    </div>
  );
}
