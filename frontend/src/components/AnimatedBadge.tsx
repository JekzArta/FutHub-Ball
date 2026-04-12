"use client";

export default function AnimatedBadge() {
  return (
    <>
      <style>{`
        @keyframes waterSweep {
          0%   { background-position: 100% 0; }
          100% { background-position: 0% 0; }
        }

        @keyframes dotPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          50%       { opacity: 0.6; box-shadow: 0 0 0 5px rgba(16, 185, 129, 0); }
        }

        .water-sweep-text {
          /* 3x wide gradient: dark → dark → bright → dark → dark */
          /* The bright strip sweeps from LEFT to RIGHT as bg-position animates 100%→0% */
          background: linear-gradient(
            90deg,
            #475569 0%,
            #475569 36%,
            #10b981 44%,
            #ffffff 50%,
            #10b981 56%,
            #475569 64%,
            #475569 100%
          );
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          display: inline-block;
          animation: waterSweep 4s linear infinite;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          flex-shrink: 0;
          animation: dotPulse 4s ease-in-out infinite;
        }
      `}</style>

      <div style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "9999px",
        border: "1px solid rgba(16, 185, 129, 0.4)",
        background: "rgba(16, 185, 129, 0.08)",
        padding: "4px 14px",
        marginBottom: "24px",
        backdropFilter: "blur(8px)",
        fontSize: "14px",
        fontWeight: 600,
        gap: "8px",
      }}>
        <span className="pulse-dot" />
        <span className="water-sweep-text">Booking Cepat &amp; Mudah</span>
      </div>
    </>
  );
}
