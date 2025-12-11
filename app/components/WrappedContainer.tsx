'use client'

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WrappedData } from "@/app/actions/github";
import { Intro } from "./slides/Intro";
import { Volume } from "./slides/Volume";
import { Rhythm } from "./slides/Rhythm";
import { Arsenal } from "./slides/Arsenal";
import { Collaboration } from "./slides/Collaboration";
import { Consistency } from "./slides/Consistency";
import { Evolution } from "./slides/Evolution";
import { Persona } from "./slides/Persona";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface WrappedContainerProps {
  data: WrappedData;
  onReset?: () => void;
  isSharedView?: boolean;
}

export function WrappedContainer({ data, onReset, isSharedView }: WrappedContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slides = [
    Intro,
    Volume,
    Rhythm,
    Arsenal,
    Collaboration,
    Consistency,
    Evolution,  // Year-over-year comparison
    Persona,    // Final card
  ];

  const CurrentSlide = slides[currentIndex];

  const nextSlide = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, slides.length]);

  const prevSlide = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background text-foreground flex items-center justify-center">
      {/* Progress Bar */}
      <div className="absolute top-6 left-0 right-0 flex justify-center gap-2 z-50 px-4">
        {slides.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              idx <= currentIndex ? "bg-neon-blue shadow-[0_0_10px_var(--neon-blue)]" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          transition={{ duration: 0.5, ease: "circOut" }}
          className="w-full h-full flex items-center justify-center p-4"
        >
          <CurrentSlide data={data} onNext={nextSlide} />
        </motion.div>
      </AnimatePresence>

      {/* Controls (visible on hover or touch) */}
      <div className="absolute bottom-8 right-8 flex gap-4 z-50">
        <button
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-glass-bg border border-glass-border hover:bg-white/10 disabled:opacity-30 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          disabled={currentIndex === slides.length - 1}
          className="p-3 rounded-full bg-glass-bg border border-glass-border hover:bg-white/10 disabled:opacity-30 transition-all"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Restart Button (Top Right) */}
       <button
          onClick={() => {
              if (onReset) onReset();
              else window.location.href = "/";
          }}
          className="absolute top-8 right-8 z-50 text-xs text-white/40 hover:text-white transition-colors"
        >
          {onReset ? "START OVER" : "CREATE YOUR OWN"}
        </button>
    </div>
  );
}
