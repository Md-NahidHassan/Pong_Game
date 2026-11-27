"use client";

import React from "react";
import { DIFFICULTY_CONFIG } from "@/lib/constants";
import { MatchSummary } from "@/types/game";
import { Home, RotateCcw, Trophy, Zap } from "lucide-react";

interface GameOverScreenProps {
  summary: MatchSummary;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  summary,
  onPlayAgain,
  onMainMenu,
}) => {
  const isAiLoss = summary.mode === "ai" && summary.winner === 2;
  const winnerLabel =
    summary.winner === 1
      ? "PLAYER 1 VICTORY"
      : summary.mode === "ai"
        ? "AI DOMINATES"
        : "PLAYER 2 VICTORY";

  const accentGradient =
    summary.winner === 1
      ? "from-cyan-400 via-blue-400 to-cyan-300"
      : "from-purple-400 via-fuchsia-400 to-rose-400";

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Match Results"
    >
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 text-center sm:p-8">
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border ${
            isAiLoss
              ? "border-purple-400/40 bg-purple-500/15 text-purple-300 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
              : "border-cyan-400/40 bg-cyan-500/15 text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.35)]"
          }`}
        >
          <Trophy className="h-8 w-8" />
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
          {summary.mode === "ai"
            ? `VS AI • ${DIFFICULTY_CONFIG[summary.difficulty].label}`
            : "LOCAL TWO PLAYER"}
        </p>

        <h2
          className={`mt-1 bg-gradient-to-r ${accentGradient} bg-clip-text text-3xl font-black tracking-wider text-transparent sm:text-4xl`}
        >
          {winnerLabel}
        </h2>

        {/* Final Score Display */}
        <div className="my-6 flex items-center justify-center gap-6 rounded-2xl border border-white/10 bg-slate-950/70 px-6 py-4">
          <div className="text-center">
            <div className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
              Player 1
            </div>
            <div className="mt-1 font-mono text-4xl font-black text-white sm:text-5xl">
              {summary.player1Score}
            </div>
          </div>
          <div className="text-xl font-black text-slate-600">:</div>
          <div className="text-center">
            <div className="text-[11px] font-bold uppercase tracking-widest text-purple-400">
              {summary.mode === "ai" ? "AI" : "Player 2"}
            </div>
            <div className="mt-1 font-mono text-4xl font-black text-white sm:text-5xl">
              {summary.player2Score}
            </div>
          </div>
        </div>

        {/* Match Stats */}
        <div className="mb-6 grid grid-cols-3 gap-2.5 text-left">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Max Rally
            </div>
            <div className="mt-1 flex items-center gap-1 font-mono text-lg font-bold text-cyan-300">
              <Zap className="h-3.5 w-3.5" />
              {summary.maxRally}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Total Hits
            </div>
            <div className="mt-1 font-mono text-lg font-bold text-purple-300">
              {summary.totalHits}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Duration
            </div>
            <div className="mt-1 font-mono text-lg font-bold text-blue-300">
              {formatDuration(summary.durationSeconds)}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 px-6 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(34,211,238,0.35)] transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" />
            Play Again
          </button>
          <button
            type="button"
            onClick={onMainMenu}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-slate-200 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
          >
            <Home className="h-4 w-4" />
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
