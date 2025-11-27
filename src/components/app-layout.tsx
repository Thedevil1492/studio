"use client";

import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';

const themes = ['light', 'dark', 'cosmic'];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [themeIndex, setThemeIndex] = useState(0);

  useEffect(() => {
    const currentTheme = themes[themeIndex];
    document.documentElement.classList.remove(...themes);
    document.documentElement.classList.add(currentTheme);
  }, [themeIndex]);

  const cycleTheme = () => {
    setThemeIndex((prevIndex) => (prevIndex + 1) % themes.length);
  };
  
  // This is a bit of a trick to pass the cycleTheme function down
  // to where it can be used, without prop drilling everywhere.
  // A more robust solution would use React Context.
  useEffect(() => {
    (window as any).cycleTheme = cycleTheme;
    // Add a cleanup function to avoid memory leaks
    return () => {
      delete (window as any).cycleTheme;
    };
  }, [cycleTheme]);

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
