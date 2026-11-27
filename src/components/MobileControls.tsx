"use client";

import React from "react";
import { GameMode } from "@/types/game";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MobileControlsProps {
  mode: GameMode;
  onPlayerInput: (
    player: 1 | 2,
    direction: "up" | "down",
    active: boolean
  ) => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  mode,
  onPlayerInput,
}) => {
  const bindTouch = (player: 1 | 2, direction: "up" | "down") => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Ignore capture failure on unsupported browsers
      }
      onPlayerInput(player, direction, true);
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onPlayerInput(player, direction, false);
    },
    onPointerCancel: () => onPlayerInput(player, direction, false),
    onLostPointerCapture: () => onPlayerInput(player, direction, false),
  });

  if (mode === "ai") {
    return (
      <div className="mt-2 flex w-full items-center justify-between gap-3 md:hidden">
        <button
          type="button"
          {...bindTouch(1, "up")}
          aria-label="Move Paddle Up"
          className="flex h-14 flex-1 touch-none select-none items-center justify-center gap-2 rounded-2xl border border-cyan-400/35 bg-cyan-500/15 text-xs font-extrabold uppercase tracking-wider text-cyan-200 active:scale-[0.98] active:bg-cyan-500/35"
        >
          <ChevronUp className="h-6 w-6" />
          Up
        </button>
        <button
          type="button"
          {...bindTouch(1, "down")}
          aria-label="Move Paddle Down"
          className="flex h-14 flex-1 touch-none select-none items-center justify-center gap-2 rounded-2xl border border-cyan-400/35 bg-cyan-500/15 text-xs font-extrabold uppercase tracking-wider text-cyan-200 active:scale-[0.98] active:bg-cyan-500/35"
        >
          <ChevronDown className="h-6 w-6" />
          Down
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 grid w-full grid-cols-2 gap-3 lg:hidden">
      {/* Player 1 Left Touch Pad */}
      <div className="flex items-center gap-2 rounded-2xl border border-cyan-400/25 bg-slate-900/75 p-2">
        <span className="px-1 text-[10px] font-black uppercase tracking-widest text-cyan-400">
          P1
        </span>
        <button
          type="button"
          {...bindTouch(1, "up")}
          aria-label="Player 1 Move Up"
          className="flex h-12 flex-1 touch-none select-none items-center justify-center rounded-xl border border-cyan-400/35 bg-cyan-500/15 text-cyan-200 active:bg-cyan-500/35"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
        <button
          type="button"
          {...bindTouch(1, "down")}
          aria-label="Player 1 Move Down"
          className="flex h-12 flex-1 touch-none select-none items-center justify-center rounded-xl border border-cyan-400/35 bg-cyan-500/15 text-cyan-200 active:bg-cyan-500/35"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      </div>

      {/* Player 2 Right Touch Pad */}
      <div className="flex items-center gap-2 rounded-2xl border border-purple-400/25 bg-slate-900/75 p-2">
        <button
          type="button"
          {...bindTouch(2, "up")}
          aria-label="Player 2 Move Up"
          className="flex h-12 flex-1 touch-none select-none items-center justify-center rounded-xl border border-purple-400/35 bg-purple-500/15 text-purple-200 active:bg-purple-500/35"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
        <button
          type="button"
          {...bindTouch(2, "down")}
          aria-label="Player 2 Move Down"
          className="flex h-12 flex-1 touch-none select-none items-center justify-center rounded-xl border border-purple-400/35 bg-purple-500/15 text-purple-200 active:bg-purple-500/35"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
        <span className="px-1 text-[10px] font-black uppercase tracking-widest text-purple-400">
          P2
        </span>
      </div>
    </div>
  );
};
