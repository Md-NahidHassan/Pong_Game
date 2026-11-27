"use client";

import React from "react";
import {
  BALL_SPEED_CONFIG,
  DEFAULT_SETTINGS,
  DIFFICULTY_CONFIG,
  WINNING_SCORE_OPTIONS,
} from "@/lib/constants";
import {
  BallSpeedPreset,
  Difficulty,
  GameSettings,
  WinningScore,
} from "@/types/game";
import {
  Music,
  RotateCcw,
  Sliders,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

interface SettingsPanelProps {
  settings: GameSettings;
  onUpdateSettings: (next: GameSettings) => void;
  onClose: () => void;
}

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "impossible"];
const SPEED_PRESETS: BallSpeedPreset[] = ["slow", "normal", "fast"];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const update = <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K]
  ) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Game Settings"
    >
      <div className="glass-panel relative max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-2xl p-5 sm:p-7">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:border-cyan-400/40 hover:text-white"
          aria-label="Close settings"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/30 bg-purple-500/10 text-purple-300">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-wider text-white sm:text-2xl">
              ARCADE SETTINGS
            </h2>
            <p className="text-xs text-slate-400 sm:text-sm">
              Tune AI intelligence, speed, audio, and neon FX
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* AI Difficulty */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
              AI Difficulty
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DIFFICULTIES.map((diff) => {
                const active = settings.difficulty === diff;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => update("difficulty", diff)}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                      active
                        ? "border-cyan-400/80 bg-cyan-500/20 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.25)]"
                        : "border-white/10 bg-slate-900/60 text-slate-400 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    {DIFFICULTY_CONFIG[diff].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Winning Score */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
              Winning Score
            </label>
            <div className="grid grid-cols-3 gap-2">
              {WINNING_SCORE_OPTIONS.map((score: WinningScore) => {
                const active = settings.winningScore === score;
                return (
                  <button
                    key={score}
                    type="button"
                    onClick={() => update("winningScore", score)}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                      active
                        ? "border-purple-400/80 bg-purple-500/20 text-purple-200 shadow-[0_0_16px_rgba(168,85,247,0.25)]"
                        : "border-white/10 bg-slate-900/60 text-slate-400 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    First to {score}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ball Speed */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
              Ball Speed
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SPEED_PRESETS.map((preset) => {
                const active = settings.ballSpeed === preset;
                const cfg = BALL_SPEED_CONFIG[preset];
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => update("ballSpeed", preset)}
                    className={`rounded-xl border px-3 py-2.5 text-left transition ${
                      active
                        ? "border-blue-400/80 bg-blue-500/20 text-blue-200 shadow-[0_0_16px_rgba(59,130,246,0.25)]"
                        : "border-white/10 bg-slate-900/60 text-slate-400 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-bold uppercase tracking-wider">
                      {cfg.label}
                    </div>
                    <div className="mt-0.5 text-[10px] opacity-75">
                      {preset.toUpperCase()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sound Volume & Mute */}
          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {settings.soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-cyan-400" />
                ) : (
                  <VolumeX className="h-4 w-4 text-slate-500" />
                )}
                <span className="text-sm font-semibold text-white">
                  Master Sound Effects
                </span>
              </div>
              <button
                type="button"
                onClick={() => update("soundEnabled", !settings.soundEnabled)}
                className={`rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider transition ${
                  settings.soundEnabled
                    ? "bg-cyan-500/25 text-cyan-300 ring-1 ring-cyan-400/50"
                    : "bg-slate-800 text-slate-400 ring-1 ring-white/10"
                }`}
              >
                {settings.soundEnabled ? "ON" : "OFF"}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-14 text-xs text-slate-400">Volume</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(settings.soundVolume * 100)}
                onChange={(e) =>
                  update("soundVolume", Number(e.target.value) / 100)
                }
                disabled={!settings.soundEnabled}
                aria-label="Sound volume"
                className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
              />
              <span className="w-10 text-right font-mono text-xs text-cyan-300">
                {Math.round(settings.soundVolume * 100)}%
              </span>
            </div>
          </div>

          {/* Music & Visual FX Toggles */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => update("musicEnabled", !settings.musicEnabled)}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 p-4 text-left transition hover:border-white/25"
            >
              <div className="flex items-center gap-2.5">
                <Music
                  className={`h-4 w-4 ${
                    settings.musicEnabled ? "text-purple-400" : "text-slate-500"
                  }`}
                />
                <div>
                  <div className="text-sm font-semibold text-white">
                    Arcade Music
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Synthwave loop
                  </div>
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${
                  settings.musicEnabled
                    ? "bg-purple-500/25 text-purple-200 ring-1 ring-purple-400/50"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {settings.musicEnabled ? "ON" : "OFF"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => update("visualEffects", !settings.visualEffects)}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 p-4 text-left transition hover:border-white/25"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles
                  className={`h-4 w-4 ${
                    settings.visualEffects ? "text-cyan-400" : "text-slate-500"
                  }`}
                />
                <div>
                  <div className="text-sm font-semibold text-white">
                    Visual FX
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Particles &amp; shake
                  </div>
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${
                  settings.visualEffects
                    ? "bg-cyan-500/25 text-cyan-200 ring-1 ring-cyan-400/50"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {settings.visualEffects ? "ON" : "OFF"}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => onUpdateSettings(DEFAULT_SETTINGS)}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] transition hover:scale-[1.02]"
          >
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
