"use client";

import React from "react";
import { DIFFICULTY_CONFIG, WINNING_SCORE_OPTIONS } from "@/lib/constants";
import { GameSettings, WinningScore } from "@/types/game";
import {
  Bot,
  Eye,
  HelpCircle,
  Music,
  Settings,
  Users,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";

interface MainMenuProps {
  settings: GameSettings;
  visitCount: number | null;
  onPlayVsAI: () => void;
  onPlayTwoPlayer: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onSelectWinningScore: (score: WinningScore) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  settings,
  visitCount,
  onPlayVsAI,
  onPlayTwoPlayer,
  onOpenHowToPlay,
  onOpenSettings,
  onToggleSound,
  onToggleMusic,
  onSelectWinningScore,
}) => {
  const diffCfg = DIFFICULTY_CONFIG[settings.difficulty];

  return (
    <div className="relative z-10 flex h-dvh flex-col items-center justify-between overflow-y-auto px-4 py-3 sm:overflow-hidden sm:px-6 sm:py-4">
      {/* Top utility bar */}
      <header className="flex w-full max-w-4xl shrink-0 flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-slate-900/70 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-300 backdrop-blur-md sm:px-3.5 sm:py-1.5 sm:text-[11px]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            60 FPS Arcade Engine
          </div>

          <div
            className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/30 bg-slate-900/75 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-purple-200 backdrop-blur-md sm:px-3.5 sm:py-1.5 sm:text-[11px]"
            title="Total Arena Visits"
          >
            <Eye className="h-3.5 w-3.5 text-purple-400" />
            <span className="tabular-nums text-white">
              {visitCount !== null ? visitCount.toLocaleString() : "---"}
            </span>
            <span className="text-purple-300/80">Visits</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleMusic}
            title={settings.musicEnabled ? "Mute Music" : "Enable Music"}
            aria-label={settings.musicEnabled ? "Mute Music" : "Enable Music"}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md transition sm:py-2 ${
              settings.musicEnabled && settings.soundEnabled
                ? "border-purple-400/40 bg-purple-500/15 text-purple-200 hover:bg-purple-500/25"
                : "border-white/10 bg-slate-900/70 text-slate-400 hover:border-white/25 hover:text-white"
            }`}
          >
            <Music className="h-4 w-4" />
            <span className="hidden sm:inline">Music</span>
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            title={settings.soundEnabled ? "Mute Sound" : "Enable Sound"}
            aria-label={settings.soundEnabled ? "Mute Sound" : "Enable Sound"}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md transition sm:py-2 ${
              settings.soundEnabled
                ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25"
                : "border-white/10 bg-slate-900/70 text-slate-400 hover:border-white/25 hover:text-white"
            }`}
          >
            {settings.soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {settings.soundEnabled ? "Sound On" : "Muted"}
            </span>
          </button>
        </div>
      </header>

      {/* Center hero & arcade controls */}
      <main className="my-auto flex w-full max-w-3xl flex-col items-center py-2 text-center">
        {/* Animated Logo */}
        <div className="animate-neon-pulse mb-1.5 select-none">
          <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-purple-400/30 bg-purple-500/10 px-3.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.26em] text-purple-200">
            <Zap className="h-3 w-3 text-cyan-300" />
            Hyper-Reflex Arena
          </div>
          <h1 className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-4xl font-black italic leading-none tracking-[0.14em] text-transparent sm:text-6xl lg:text-[4.25rem]">
            NEON PONG
          </h1>
        </div>

        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.3em] text-slate-300/90 sm:mb-5 sm:text-xs">
          THE ULTIMATE ARCADE EXPERIENCE
        </p>

        {/* Main Glass Panel */}
        <div className="glass-panel w-full max-w-xl rounded-3xl p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Play vs AI */}
            <button
              type="button"
              onClick={onPlayVsAI}
              className="group relative overflow-hidden rounded-2xl border border-cyan-400/45 bg-gradient-to-br from-cyan-500/20 via-blue-600/15 to-slate-900/90 p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[0_0_32px_rgba(34,211,238,0.35)] active:translate-y-0 sm:p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/20 text-cyan-300 ring-1 ring-cyan-400/40 transition group-hover:scale-110">
                  <Bot className="h-5 w-5" />
                </div>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${diffCfg.badgeClass}`}
                >
                  AI: {diffCfg.label}
                </span>
              </div>
              <div className="text-base font-black uppercase tracking-wider text-white sm:text-lg">
                Play vs AI
              </div>
              <div className="mt-0.5 text-[11px] leading-snug text-slate-300/80">
                Predictive neural paddles across 4 difficulty tiers
              </div>
            </button>

            {/* Two Player */}
            <button
              type="button"
              onClick={onPlayTwoPlayer}
              className="group relative overflow-hidden rounded-2xl border border-purple-400/45 bg-gradient-to-br from-purple-500/20 via-fuchsia-600/15 to-slate-900/90 p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-[0_0_32px_rgba(168,85,247,0.35)] active:translate-y-0 sm:p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-400/20 text-purple-300 ring-1 ring-purple-400/40 transition group-hover:scale-110">
                  <Users className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-purple-400/40 bg-purple-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-200">
                  Local 1v1
                </span>
              </div>
              <div className="text-base font-black uppercase tracking-wider text-white sm:text-lg">
                Two Player
              </div>
              <div className="mt-0.5 text-[11px] leading-snug text-slate-300/80">
                One keyboard (W/S vs ↑/↓) or dual touch pads
              </div>
            </button>
          </div>

          {/* Quick Match Target Strip */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-3.5 py-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Match Points
            </span>
            <div className="flex items-center gap-1.5">
              {WINNING_SCORE_OPTIONS.map((pts) => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => onSelectWinningScore(pts)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold tracking-wider transition ${
                    settings.winningScore === pts
                      ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-[0_0_12px_rgba(34,211,238,0.35)]"
                      : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {pts} PTS
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Action Buttons */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onOpenHowToPlay}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 transition hover:border-cyan-400/40 hover:bg-white/10 hover:text-white"
            >
              <HelpCircle className="h-4 w-4 text-cyan-400" />
              How to Play
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 transition hover:border-purple-400/40 hover:bg-white/10 hover:text-white"
            >
              <Settings className="h-4 w-4 text-purple-400" />
              Settings
            </button>
          </div>
        </div>

        {/* Inline How-To-Play Quick Strip */}
        <div className="mt-3 grid w-full max-w-xl grid-cols-3 gap-2 text-left">
          <div className="rounded-xl border border-white/10 bg-slate-900/55 px-3 py-2 backdrop-blur-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
              Player 1
            </div>
            <div className="mt-0.5 text-[11px] text-slate-300">
              <kbd className="font-mono font-bold text-white">W</kbd> /{" "}
              <kbd className="font-mono font-bold text-white">S</kbd> or Touch
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/55 px-3 py-2 backdrop-blur-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
              Player 2
            </div>
            <div className="mt-0.5 text-[11px] text-slate-300">
              <kbd className="font-mono font-bold text-white">↑</kbd> /{" "}
              <kbd className="font-mono font-bold text-white">↓</kbd> or Touch
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/55 px-3 py-2 backdrop-blur-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
              Shortcuts
            </div>
            <div className="mt-0.5 text-[11px] text-slate-300">
              <kbd className="font-mono font-bold text-white">Space</kbd> Pause ·{" "}
              <kbd className="font-mono font-bold text-white">ESC</kbd> Menu
            </div>
          </div>
        </div>
      </main>

      <footer className="shrink-0 text-center text-sm font-semibold tracking-wider text-slate-300 sm:text-base">
        Built by{" "}
        <span className="neon-text-cyan bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-base font-black tracking-wide text-transparent sm:text-lg">
          Nahid
        </span>
      </footer>
    </div>
  );
};
