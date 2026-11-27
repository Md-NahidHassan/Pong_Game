"use client";

import React from "react";
import { DIFFICULTY_CONFIG, WINNING_SCORE_OPTIONS } from "@/lib/constants";
import { Difficulty, WinningScore } from "@/types/game";
import { Cpu, Flame, Play, Shield, Sparkles, X, Zap } from "lucide-react";

interface DifficultySelectorProps {
  selectedDifficulty: Difficulty;
  winningScore: WinningScore;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onSelectWinningScore: (score: WinningScore) => void;
  onStartMatch: () => void;
  onClose: () => void;
}

const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard", "impossible"];

const DIFFICULTY_ICONS: Record<Difficulty, React.ReactNode> = {
  easy: <Shield className="h-4 w-4 text-cyan-400" />,
  medium: <Zap className="h-4 w-4 text-blue-400" />,
  hard: <Cpu className="h-4 w-4 text-purple-400" />,
  impossible: <Flame className="h-4 w-4 text-rose-400" />,
};

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selectedDifficulty,
  winningScore,
  onSelectDifficulty,
  onSelectWinningScore,
  onStartMatch,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Select AI Difficulty"
    >
      <div className="glass-panel relative w-full max-w-2xl rounded-2xl p-5 sm:p-7">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:border-cyan-400/40 hover:text-white"
          aria-label="Close difficulty selector"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-wider text-white sm:text-2xl">
              SINGLE PLAYER VS AI
            </h2>
            <p className="text-xs tracking-wide text-slate-400 sm:text-sm">
              Choose opponent intelligence &amp; match target
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {DIFFICULTY_ORDER.map((diff) => {
            const cfg = DIFFICULTY_CONFIG[diff];
            const isSelected = selectedDifficulty === diff;

            return (
              <button
                key={diff}
                type="button"
                onClick={() => onSelectDifficulty(diff)}
                className={`group relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-cyan-400/80 bg-gradient-to-br from-cyan-500/15 via-slate-900/90 to-purple-500/15 shadow-[0_0_24px_rgba(34,211,238,0.2)]"
                    : "border-white/10 bg-slate-900/60 hover:border-white/25 hover:bg-slate-900/90"
                }`}
              >
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-white">
                      {DIFFICULTY_ICONS[diff]}
                      {cfg.label}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cfg.badgeClass}`}
                    >
                      {diff === "impossible" ? "APEX" : `${cfg.reactionDelayMs}ms`}
                    </span>
                  </div>
                  <p className="mb-3 text-xs leading-relaxed text-slate-400">
                    {cfg.tagline}
                  </p>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Prediction</span>
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${cfg.accuracyStat}%`,
                          backgroundColor: cfg.accentColor,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Paddle Speed</span>
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${cfg.speedStat}%`,
                          backgroundColor: cfg.accentColor,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Winning score quick selector */}
        <div className="mt-5 flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/60 p-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Match Target
            </p>
            <p className="text-xs text-slate-400">
              First player to reach target points wins
            </p>
          </div>
          <div className="flex items-center gap-2">
            {WINNING_SCORE_OPTIONS.map((pts) => (
              <button
                key={pts}
                type="button"
                onClick={() => onSelectWinningScore(pts)}
                className={`min-w-[56px] rounded-lg border px-3 py-2 text-xs font-bold tracking-wider transition ${
                  winningScore === pts
                    ? "border-purple-400/80 bg-purple-500/20 text-purple-200 shadow-[0_0_16px_rgba(168,85,247,0.3)]"
                    : "border-white/10 bg-white/5 text-slate-400 hover:border-white/25 hover:text-white"
                }`}
              >
                {pts} PTS
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onStartMatch}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 px-7 py-3 text-sm font-extrabold uppercase tracking-wider text-white shadow-[0_0_28px_rgba(34,211,238,0.4)] transition hover:scale-[1.02] hover:shadow-[0_0_36px_rgba(168,85,247,0.55)] active:scale-[0.98]"
          >
            <Play className="h-4 w-4 fill-current" />
            Launch Match
          </button>
        </div>
      </div>
    </div>
  );
};
