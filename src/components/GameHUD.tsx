"use client";

import React from "react";
import { DIFFICULTY_CONFIG } from "@/lib/constants";
import { GameMode, GameSettings, GameStatus, ScoreState } from "@/types/game";
import {
  Home,
  Maximize2,
  Minimize2,
  Music,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";

interface GameHUDProps {
  mode: GameMode;
  status: GameStatus;
  score: ScoreState;
  settings: GameSettings;
  isFullscreen: boolean;
  onTogglePause: () => void;
  onRestart: () => void;
  onRequestExit: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  mode,
  status,
  score,
  settings,
  isFullscreen,
  onTogglePause,
  onRestart,
  onRequestExit,
  onToggleSound,
  onToggleMusic,
  onToggleFullscreen,
  onOpenSettings,
}) => {
  const diffCfg = DIFFICULTY_CONFIG[settings.difficulty];
  const isPaused = status === "paused";

  return (
    <div className="w-full space-y-2.5">
      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRequestExit}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 backdrop-blur-md transition hover:border-rose-400/50 hover:text-white"
            title="Exit to Main Menu (ESC)"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Menu</span>
          </button>

          <span className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-300 backdrop-blur-md">
            {mode === "ai" ? (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                VS AI ·{" "}
                <span style={{ color: diffCfg.accentColor }}>
                  {diffCfg.label}
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                2P LOCAL
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onTogglePause}
            disabled={status === "gameover"}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-400/35 bg-cyan-500/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-cyan-200 backdrop-blur-md transition hover:bg-cyan-500/25 disabled:opacity-40"
            title="Pause / Resume (Space)"
          >
            {isPaused ? (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span className="hidden sm:inline">Resume</span>
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Pause</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 backdrop-blur-md transition hover:border-purple-400/40 hover:text-white"
            title="Restart Match"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Restart</span>
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            className={`rounded-xl border p-2 backdrop-blur-md transition ${
              settings.soundEnabled
                ? "border-cyan-400/35 bg-cyan-500/15 text-cyan-200"
                : "border-white/10 bg-slate-900/80 text-slate-400 hover:text-white"
            }`}
            title={settings.soundEnabled ? "Mute Sound" : "Unmute Sound"}
            aria-label={settings.soundEnabled ? "Mute Sound" : "Unmute Sound"}
          >
            {settings.soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={onToggleMusic}
            className={`rounded-xl border p-2 backdrop-blur-md transition ${
              settings.musicEnabled && settings.soundEnabled
                ? "border-purple-400/35 bg-purple-500/15 text-purple-200"
                : "border-white/10 bg-slate-900/80 text-slate-400 hover:text-white"
            }`}
            title={settings.musicEnabled ? "Mute Music" : "Enable Music"}
            aria-label={settings.musicEnabled ? "Mute Music" : "Enable Music"}
          >
            <Music className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="rounded-xl border border-white/10 bg-slate-900/80 p-2 text-slate-300 backdrop-blur-md transition hover:border-white/25 hover:text-white"
            title="Settings"
            aria-label="Open Settings"
          >
            <Settings className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            className="rounded-xl border border-white/10 bg-slate-900/80 p-2 text-slate-300 backdrop-blur-md transition hover:border-white/25 hover:text-white"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Scoreboard Bar */}
      <div className="glass-panel flex items-center justify-between rounded-2xl px-4 py-2.5 sm:px-7 sm:py-3">
        {/* Player 1 */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden h-9 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] sm:block" />
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-400 sm:text-xs">
              Player 1
            </div>
            <div className="hidden text-[11px] text-slate-400 sm:block">
              W / S Keys
            </div>
          </div>
          <div
            key={`p1-${score.player1}`}
            className="animate-score-pop neon-text-cyan font-mono text-3xl font-black text-cyan-300 sm:text-5xl"
          >
            {score.player1}
          </div>
        </div>

        {/* Center Info */}
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
            First to {settings.winningScore}
          </div>
          <div className="mt-1 flex items-center gap-1.5 font-mono text-xs font-bold text-slate-400">
            <Zap
              className={`h-3.5 w-3.5 ${
                score.rally >= 5 ? "text-amber-400" : "text-slate-500"
              }`}
            />
            <span>
              RALLY{" "}
              <strong
                className={
                  score.rally >= 5 ? "text-amber-300" : "text-slate-200"
                }
              >
                {score.rally}
              </strong>
            </span>
          </div>
        </div>

        {/* Player 2 / AI */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            key={`p2-${score.player2}`}
            className="animate-score-pop neon-text-purple font-mono text-3xl font-black text-purple-300 sm:text-5xl"
          >
            {score.player2}
          </div>
          <div className="text-right">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-purple-400 sm:text-xs">
              {mode === "ai" ? `AI (${diffCfg.label})` : "Player 2"}
            </div>
            <div className="hidden text-[11px] text-slate-400 sm:block">
              {mode === "ai" ? "Predictive Bot" : "↑ / ↓ Arrows"}
            </div>
          </div>
          <div className="hidden h-9 w-1.5 rounded-full bg-purple-400 shadow-[0_0_12px_#c084fc] sm:block" />
        </div>
      </div>
    </div>
  );
};
