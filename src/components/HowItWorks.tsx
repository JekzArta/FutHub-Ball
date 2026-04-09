"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const steps = [
  {
    number: 1,
    title: "Pilih Lapangan & Waktu",
    description:
      "Pilih arena favorit Anda dan slot waktu yang cocok untuk jadwal tim.",
    gradientFrom: "from-emerald-300",
    gradientTo: "to-emerald-500",
    shadowColor: "shadow-emerald-500/30",
    ringColor: "ring-emerald-300/20",
  },
  {
    number: 2,
    title: "Konfirmasi Booking",
    description:
      "Selesaikan proses checkout yang aman dan terima pass digital instan Anda.",
    gradientFrom: "from-emerald-400",
    gradientTo: "to-emerald-600",
    shadowColor: "shadow-emerald-600/30",
    ringColor: "ring-emerald-400/20",
  },
  {
    number: 3,
    title: "Main!",
    description:
      "Tunjukkan ID booking ke admin dan langsung mulai pertandingan. Tanpa antre, tanpa kerumitan.",
    gradientFrom: "from-emerald-600",
    gradientTo: "to-emerald-900",
    shadowColor: "shadow-emerald-900/40",
    ringColor: "ring-emerald-700/20",
  },
];

export default function HowItWorks() {
  const { ref: titleRef, isVisible } = useScrollReveal({ threshold: 0.2 });
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  // Control flags
  const maxStepRef = useRef(0);
  const userClickedRef = useRef(false);       // true = user clicked a step → kill all auto
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoStepRef = useRef(0);              // tracks auto-play progress

  // ─── SCROLL-DRIVEN (forward only, disabled after user click) ───
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      // If user clicked manually, scroll no longer controls steps
      if (userClickedRef.current) return;

      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionHeight = rect.height;

      const scrolledIn = windowHeight - rect.top;
      const totalScrollable = sectionHeight + windowHeight;
      const rawProgress = scrolledIn / totalScrollable;
      const progress = Math.min(1, Math.max(0, rawProgress));

      let newStep = 0;
      if (progress >= 0.65) newStep = 2;
      else if (progress >= 0.35) newStep = 1;

      // Only advance, never retreat
      if (newStep > maxStepRef.current) {
        maxStepRef.current = newStep;
        setActiveStep(newStep);
        autoStepRef.current = newStep; // sync auto-play so it doesn't go backward
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ─── AUTO-PLAY (2.5s interval, disabled after user click OR if scroll already advanced) ───
  useEffect(() => {
    if (!isVisible) return;
    if (userClickedRef.current) return;

    const startAutoPlay = () => {
      autoTimerRef.current = setInterval(() => {
        if (userClickedRef.current) {
          // User clicked during the interval — stop
          if (autoTimerRef.current) clearInterval(autoTimerRef.current);
          return;
        }

        const nextStep = autoStepRef.current + 1;
        if (nextStep <= 2) {
          // Only advance if scroll hasn't already gone further
          if (nextStep > maxStepRef.current) {
            maxStepRef.current = nextStep;
          }
          autoStepRef.current = nextStep;
          setActiveStep(nextStep);
        } else {
          // Reached end, stop auto-play
          if (autoTimerRef.current) clearInterval(autoTimerRef.current);
        }
      }, 2500);
    };

    // Small delay before starting auto-play (let scroll have a chance first)
    const initDelay = setTimeout(startAutoPlay, 1500);

    return () => {
      clearTimeout(initDelay);
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [isVisible]);

  // ─── MANUAL CLICK (kills both scroll and auto-play permanently) ───
  const handleStepClick = useCallback((index: number) => {
    userClickedRef.current = true;

    // Stop auto-play timer
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }

    setActiveStep(index);
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-secondary w-full overflow-hidden">
      <div className="container">
        {/* Title */}
        <div
          ref={titleRef}
          className="text-center mb-20 transition-all duration-700 ease-out"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(30px)",
          }}
        >
          <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">
            Panduan Singkat
          </p>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white uppercase">
            Command The{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Pitch
            </span>
          </h2>
        </div>

        {/* Steps Container */}
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-12 md:gap-0">
          {/* Background Track Line */}
          <div className="hidden md:block absolute top-10 left-[16.5%] right-[16.5%] h-0.5 bg-slate-700 rounded-full" />

          {/* Animated Progress Fill */}
          <div
            className="hidden md:block absolute top-10 left-[16.5%] h-0.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-full transition-all duration-700 ease-out"
            style={{
              width:
                activeStep === 0
                  ? "0%"
                  : activeStep === 1
                  ? "calc(67% * 0.5)"
                  : "67%",
            }}
          />

          {steps.map((step, index) => {
            const isActive = index === activeStep;
            const isPast = index < activeStep;

            return (
              <div
                key={step.number}
                className="flex flex-col items-center text-center md:w-1/3 px-6 cursor-pointer group transition-all duration-500 ease-out"
                onClick={() => handleStepClick(index)}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(50px)",
                  transitionDelay: `${index * 200}ms`,
                }}
              >
                {/* Number Circle */}
                <div
                  className={`
                    relative z-10 flex h-20 w-20 items-center justify-center rounded-full
                    text-3xl font-extrabold mb-8 ring-4 select-none
                    transition-all duration-500 ease-out
                    ${
                      isActive
                        ? `bg-gradient-to-br ${step.gradientFrom} ${step.gradientTo} text-white shadow-xl ${step.shadowColor} ${step.ringColor} scale-110`
                        : isPast
                        ? `bg-gradient-to-br ${step.gradientFrom} ${step.gradientTo} text-white/60 shadow-md ${step.shadowColor} ${step.ringColor} scale-100 opacity-50`
                        : `bg-slate-800 text-slate-500 ring-slate-700/30 scale-95`
                    }
                    group-hover:scale-110
                  `}
                >
                  {step.number}
                  {/* Pulse ring on active only */}
                  {isActive && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400/20 pointer-events-none" />
                  )}
                </div>

                {/* Text */}
                <h3
                  className={`text-xl font-bold mb-3 transition-all duration-500 ${
                    isActive
                      ? "text-white"
                      : isPast
                      ? "text-slate-400"
                      : "text-slate-600"
                  }`}
                >
                  {step.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed transition-all duration-500 max-w-xs ${
                    isActive ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {step.description}
                </p>

                {/* Active dot indicator */}
                <div
                  className={`mt-4 w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                    isActive ? "bg-emerald-400 scale-100 opacity-100" : "scale-0 opacity-0"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
