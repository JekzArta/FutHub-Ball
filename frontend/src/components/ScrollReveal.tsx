"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

type AnimationDirection = "up" | "down" | "left" | "right" | "fade";

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: AnimationDirection;
  delay?: number;
  duration?: number;
  className?: string;
}

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 600,
  className = "",
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  const directionStyles: Record<AnimationDirection, string> = {
    up: "translate-y-12",
    down: "-translate-y-12",
    left: "translate-x-12",
    right: "-translate-x-12",
    fade: "",
  };

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translate(0, 0)" : undefined,
      }}
      // Apply the initial hidden transform via className when not visible
      {...(!isVisible && {
        className: `transition-all ease-out ${directionStyles[direction]} opacity-0 ${className}`,
      })}
    >
      {children}
    </div>
  );
}
