import React, { useState } from "react";
import {
  ResetIcon,
  TimerIcon,
  MovesIcon,
  IntersectIcon,
  VolumeUpIcon,
  VolumeOffIcon,
  CutIcon,
  FreezeIcon,
  KeyIcon,
  ThemeIcon,
} from "./icons";
import type { PowerUpState, PowerUpType, Theme } from "../types";

interface HUDProps {
  level: number;
  moves: number;
  parMoves: number;
  timeRemaining: number;
  intersections: number;
  onReset: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  powerUps: PowerUpState;
  activePowerUp: PowerUpType | null;
  onPowerUpClick: (type: PowerUpType) => void;
  isTimeFrozen: boolean;
  currentTheme: Theme;
  onSetTheme: (theme: Theme) => void;
}

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  colorClass: string;
  isFrozen?: boolean;
}> = ({ icon, label, value, colorClass, isFrozen }) => (
  <div
    className={`relative overflow-hidden bg-gradient-to-br from-slate-800/90 via-slate-700/90 to-slate-800/90 p-3 rounded-lg flex items-center gap-3 shadow-lg border-t-2 backdrop-blur-sm ${colorClass} ${
      isFrozen ? "border-blue-400 shadow-blue-400/30" : ""
    }`}
  >
    <div
      className={`text-2xl relative z-10 ${
        isFrozen ? "text-blue-400" : "text-slate-200"
      }`}
    >
      {icon}
    </div>
    <div className="relative z-10">
      <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">
        {label}
      </div>
      <div
        className={`text-xl font-bold ${
          isFrozen ? "text-blue-300" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  </div>
);

const PowerUpButton: React.FC<{
  type: PowerUpType;
  icon: React.ReactNode;
  count: number;
  isActive: boolean;
  onClick: () => void;
}> = ({ type, icon, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    disabled={count === 0}
    className={`relative flex-1 flex flex-col items-center justify-center gap-1 p-3 rounded-lg transition-all duration-200 shadow-md
            ${
              isActive
                ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg"
                : "bg-gradient-to-br from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white hover:shadow-lg"
            }
            ${count === 0 ? "opacity-40 cursor-not-allowed" : ""}
        `}
    aria-label={`Use ${type}`}
  >
    <div className="relative z-10">{icon}</div>
    <span
      className={`absolute top-1 right-1 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 transition-all duration-200
            ${
              isActive
                ? "bg-white/90 text-amber-600 border-amber-300"
                : "bg-slate-800 text-white border-slate-400"
            }
        `}
    >
      {count}
    </span>
  </button>
);

export const HUD: React.FC<HUDProps> = ({
  level,
  moves,
  parMoves,
  timeRemaining,
  intersections,
  onReset,
  isMuted,
  onToggleMute,
  powerUps,
  activePowerUp,
  onPowerUpClick,
  isTimeFrozen,
  currentTheme,
  onSetTheme,
}) => {
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const themes: Theme[] = ["default", "noel", "halloween", "raining"];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const getMovesColorClass = () => {
    if (moves > parMoves) return "border-red-500";
    const movesLeft = parMoves - moves;
    if (movesLeft <= 2) return "border-yellow-500";
    return "border-slate-700";
  };

  const powerUpIcons: Record<PowerUpType, React.ReactNode> = {
    cut: <CutIcon className="w-6 h-6 text-red-500" />,
    freeze: <FreezeIcon className="w-6 h-6 text-blue-500" />,
    unlock: <KeyIcon className="w-6 h-6 text-yellow-500" />,
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 via-slate-700/80 to-slate-800/80 p-6 rounded-xl shadow-xl border border-slate-600/30 w-full flex flex-col gap-4 backdrop-blur-sm">
      <div className="relative z-10 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Level {level}</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowThemeSelector((s) => !s)}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold p-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
              aria-label="Select theme"
            >
              <ThemeIcon />
            </button>
            {showThemeSelector && (
              <div className="absolute right-0 bottom-full mb-2 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-1 z-20">
                {themes.map((theme) => (
                  <button
                    key={theme}
                    onClick={() => {
                      onSetTheme(theme);
                      setShowThemeSelector(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-sm capitalize ${
                      currentTheme === theme
                        ? "bg-blue-600 text-white"
                        : "hover:bg-slate-700 text-slate-200"
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onToggleMute}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold p-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </button>
          <button
            onClick={onReset}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-3 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <ResetIcon />
            Reset
          </button>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-3">
        <StatCard
          icon={<TimerIcon />}
          label="Time"
          value={formatTime(timeRemaining)}
          colorClass={
            timeRemaining < 10 && !isTimeFrozen
              ? "border-red-500"
              : "border-slate-600"
          }
          isFrozen={isTimeFrozen}
        />
        <StatCard
          icon={<MovesIcon />}
          label="Moves"
          value={`${moves} / ${parMoves}`}
          colorClass={getMovesColorClass()}
        />
        <StatCard
          icon={<IntersectIcon />}
          label="Intersections"
          value={intersections}
          colorClass={
            intersections > 0 ? "border-purple-500" : "border-green-500"
          }
        />
      </div>

      <div className="relative z-10 bg-slate-800 p-2 rounded-lg flex items-center gap-2 shadow-md border-t-2 border-slate-700">
        {(Object.keys(powerUps) as PowerUpType[]).map((type) => (
          <PowerUpButton
            key={type}
            type={type}
            icon={powerUpIcons[type]}
            count={powerUps[type]}
            isActive={activePowerUp === type}
            onClick={() => onPowerUpClick(type)}
          />
        ))}
      </div>
    </div>
  );
};
