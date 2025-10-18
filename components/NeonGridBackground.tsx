import React from "react";

interface NeonGridBackgroundProps {
  width: number;
  height: number;
  rows: number;
  cols: number;
  cellSize: number;
}

export const NeonGridBackground: React.FC<NeonGridBackgroundProps> = ({
  width,
  height,
  rows,
  cols,
  cellSize,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Dark background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

      {/* Neon Grid Lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        width={width}
        height={height}
        style={{
          filter: "drop-shadow(0 0 8px #00ffff) drop-shadow(0 0 16px #00ffff)",
        }}
      >
        <defs>
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ffff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#00ffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#00ffff" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Vertical lines */}
        {Array.from({ length: cols + 1 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * cellSize}
            y1={0}
            x2={i * cellSize}
            y2={height}
            stroke="url(#neonGradient)"
            strokeWidth="2"
            filter="url(#neonGlow)"
            className="animate-pulse"
            style={{
              animation: "neonPulse 3s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}

        {/* Horizontal lines */}
        {Array.from({ length: rows + 1 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1={0}
            y1={i * cellSize}
            x2={width}
            y2={i * cellSize}
            stroke="url(#neonGradient)"
            strokeWidth="2"
            filter="url(#neonGlow)"
            className="animate-pulse"
            style={{
              animation: "neonPulse 3s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}

        {/* Corner highlights */}
        <circle
          cx={0}
          cy={0}
          r="6"
          fill="#00ffff"
          filter="url(#neonGlow)"
          style={{
            animation: "cornerGlow 2s ease-in-out infinite",
          }}
        />
        <circle
          cx={width}
          cy={0}
          r="6"
          fill="#00ffff"
          filter="url(#neonGlow)"
          style={{
            animation: "cornerGlow 2s ease-in-out infinite",
            animationDelay: "0.5s",
          }}
        />
        <circle
          cx={0}
          cy={height}
          r="6"
          fill="#00ffff"
          filter="url(#neonGlow)"
          style={{
            animation: "cornerGlow 2s ease-in-out infinite",
            animationDelay: "1s",
          }}
        />
        <circle
          cx={width}
          cy={height}
          r="6"
          fill="#00ffff"
          filter="url(#neonGlow)"
          style={{
            animation: "cornerGlow 2s ease-in-out infinite",
            animationDelay: "1.5s",
          }}
        />
      </svg>

      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent" />

      <style jsx>{`
        @keyframes neonPulse {
          0%,
          100% {
            opacity: 0.7;
            filter: drop-shadow(0 0 6px #00ffff) drop-shadow(0 0 12px #00ffff);
          }
          25% {
            opacity: 0.9;
            filter: drop-shadow(0 0 10px #00ffff) drop-shadow(0 0 20px #00ffff);
          }
          50% {
            opacity: 1;
            filter: drop-shadow(0 0 15px #00ffff) drop-shadow(0 0 30px #00ffff);
          }
          75% {
            opacity: 0.9;
            filter: drop-shadow(0 0 10px #00ffff) drop-shadow(0 0 20px #00ffff);
          }
        }

        @keyframes neonFlicker {
          0%,
          100% {
            opacity: 1;
          }
          98% {
            opacity: 1;
          }
          99% {
            opacity: 0.8;
          }
        }

        @keyframes cornerGlow {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
