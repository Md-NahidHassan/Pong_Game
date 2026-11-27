"use client";

import React from "react";
import {
  Gamepad2,
  Keyboard,
  Smartphone,
  Trophy,
  X,
  Zap,
} from "lucide-react";

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="How to Play"
    >
      <div className="glass-panel relative max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl p-5 sm:p-7">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:border-cyan-400/40 hover:text-white"
          aria-label="Close how to play"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-wider text-white sm:text-2xl">
              HOW TO PLAY
            </h2>
            <p className="text-xs text-slate-400 sm:text-sm">
              Master angles, rallies, and controls in seconds
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-cyan-300">
              <Keyboard className="h-4 w-4" />
              Player 1 Controls
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span>Move Paddle Up</span>
                <kbd className="rounded border border-cyan-400/30 bg-slate-900 px-2 py-0.5 font-mono text-cyan-200">
                  W
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Move Paddle Down</span>
                <kbd className="rounded border border-cyan-400/30 bg-slate-900 px-2 py-0.5 font-mono text-cyan-200">
                  S
                </kbd>
              </div>
              <p className="pt-1 text-[11px] text-slate-400">
                In 1P vs AI mode, you can also drag directly on the court.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-purple-400/20 bg-purple-500/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-purple-300">
              <Keyboard className="h-4 w-4" />
              Player 2 Controls (2P)
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span>Move Paddle Up</span>
                <kbd className="rounded border border-purple-400/30 bg-slate-900 px-2 py-0.5 font-mono text-purple-200">
                  ↑ Arrow
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Move Paddle Down</span>
                <kbd className="rounded border border-purple-400/30 bg-slate-900 px-2 py-0.5 font-mono text-purple-200">
                  ↓ Arrow
                </kbd>
              </div>
              <p className="pt-1 text-[11px] text-slate-400">
                Full simultaneous key input supported on one keyboard.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-300">
              <Zap className="h-4 w-4" />
              Shortcuts &amp; Physics
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center justify-between">
                <span>Pause / Resume</span>
                <kbd className="rounded border border-white/15 bg-slate-950 px-2 py-0.5 font-mono text-slate-200">
                  SPACE
                </kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Exit to Menu</span>
                <kbd className="rounded border border-white/15 bg-slate-950 px-2 py-0.5 font-mono text-slate-200">
                  ESC
                </kbd>
              </li>
              <li className="pt-1 text-[11px] text-slate-400">
                Hitting near the paddle edges creates sharp angled returns, and
                ball speed escalates on every rally hit.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-300">
              <Smartphone className="h-4 w-4" />
              Touch &amp; Scoring
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Trophy className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                <span>Default match is first to 10 points (5 / 10 / 15 in settings).</span>
              </li>
              <li className="text-[11px] text-slate-400">
                On phones and tablets, virtual Up/Down arcade buttons appear for
                both 1P and 2P modes in portrait or landscape.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white transition hover:scale-[1.02]"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
