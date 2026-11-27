"use client";

import React, { useEffect, useRef, useState } from "react";
import { PongEngine } from "@/engine/PongEngine";
import { WORLD_HEIGHT, WORLD_WIDTH } from "@/lib/constants";
import { arcadeAudio } from "@/lib/sound";
import {
  GameMode,
  GameSettings,
  GameStatus,
  MatchSummary,
  PaddleInput,
  ScoreState,
} from "@/types/game";
import { Home, Play, RotateCcw } from "lucide-react";

interface GameCanvasProps {
  mode: GameMode;
  settings: GameSettings;
  status: GameStatus;
  matchSeed: number;
  touchP1Ref: React.MutableRefObject<PaddleInput>;
  touchP2Ref: React.MutableRefObject<PaddleInput>;
  onScoreChange: (score: ScoreState) => void;
  onCountdownEnd: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
  onRequestExit: () => void;
  onImmediateExit: () => void;
  onGameOver: (summary: MatchSummary) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  mode,
  settings,
  status,
  matchSeed,
  touchP1Ref,
  touchP2Ref,
  onScoreChange,
  onCountdownEnd,
  onTogglePause,
  onRestart,
  onRequestExit,
  onImmediateExit,
  onGameOver,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<PongEngine | null>(null);

  const [countdownValue, setCountdownValue] = useState<number | null>(3);

  // Mutable refs for 60fps loop without triggering React re-renders
  const statusRef = useRef<GameStatus>(status);
  statusRef.current = status;

  const modeRef = useRef<GameMode>(mode);
  modeRef.current = mode;

  const keysRef = useRef<Set<string>>(new Set());
  const p1PointerYRef = useRef<number | null>(null);
  const p2PointerYRef = useRef<number | null>(null);
  const activePointersRef = useRef<Map<number, 1 | 2>>(new Map());

  const callbacksRef = useRef({
    onScoreChange,
    onCountdownEnd,
    onGameOver,
  });
  callbacksRef.current = { onScoreChange, onCountdownEnd, onGameOver };

  // Initialize or reset engine on new matchSeed / mode
  useEffect(() => {
    const engine = new PongEngine(mode, settings, {
      onScoreChange: (nextScore) => callbacksRef.current.onScoreChange(nextScore),
      onCountdownTick: (val) => {
        setCountdownValue(val);
        if (val === null) {
          callbacksRef.current.onCountdownEnd();
        }
      },
      onGameOver: (summary) => callbacksRef.current.onGameOver(summary),
      onSoundEvent: (ev) => arcadeAudio.handleSoundEvent(ev),
    });
    engineRef.current = engine;

    return () => {
      engineRef.current = null;
    };
    // Intentionally recreate engine only when matchSeed or mode changes;
    // settings updates are pushed via updateSettings below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchSeed, mode]);

  // Sync live settings changes into running engine
  useEffect(() => {
    engineRef.current?.updateSettings(settings);
  }, [settings]);

  // Responsive HiDPI canvas sizing
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    window.addEventListener("resize", resize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Keyboard listener with scroll prevention & blur cleanup
  useEffect(() => {
    const blockedKeys = new Set([
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Space",
      " ",
    ]);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (blockedKeys.has(e.key) || blockedKeys.has(e.code)) {
        e.preventDefault();
      }

      if (e.repeat) {
        keysRef.current.add(e.code);
        return;
      }

      if (e.code === "Space") {
        if (
          statusRef.current === "playing" ||
          statusRef.current === "paused"
        ) {
          onTogglePause();
        }
        return;
      }

      if (e.code === "Escape") {
        if (statusRef.current === "gameover") {
          onImmediateExit();
        } else {
          onRequestExit();
        }
        return;
      }

      keysRef.current.add(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };

    const handleBlur = () => {
      keysRef.current.clear();
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [onImmediateExit, onRequestExit, onTogglePause]);

  // 60fps requestAnimationFrame loop
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const engine = engineRef.current;
      const canvas = canvasRef.current;

      if (engine && canvas) {
        const currentStatus = statusRef.current;
        if (currentStatus === "playing" || currentStatus === "countdown") {
          const keys = keysRef.current;

          const p1Input: PaddleInput = {
            up:
              keys.has("KeyW") ||
              touchP1Ref.current.up ||
              (modeRef.current === "ai" && keys.has("ArrowUp")),
            down:
              keys.has("KeyS") ||
              touchP1Ref.current.down ||
              (modeRef.current === "ai" && keys.has("ArrowDown")),
          };

          const p2Input: PaddleInput = {
            up: keys.has("ArrowUp") || touchP2Ref.current.up,
            down: keys.has("ArrowDown") || touchP2Ref.current.down,
          };

          engine.step(
            dt,
            p1Input,
            p2Input,
            p1PointerYRef.current,
            p2PointerYRef.current
          );
        }

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.save();
          ctx.setTransform(
            canvas.width / WORLD_WIDTH,
            0,
            0,
            canvas.height / WORLD_HEIGHT,
            0,
            0
          );
          engine.render(ctx);
          ctx.restore();
        }
      }

      rafId = window.requestAnimationFrame(loop);
    };

    rafId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(rafId);
  }, [touchP1Ref, touchP2Ref]);

  // Direct canvas pointer/touch drag for intuitive mobile/mouse control
  const mapPointerToWorld = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return {
      x: ((clientX - rect.left) / rect.width) * WORLD_WIDTH,
      y: ((clientY - rect.top) / rect.height) * WORLD_HEIGHT,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === "mouse") return;
    const pos = mapPointerToWorld(e.clientX, e.clientY);
    if (!pos) return;

    const assignedPlayer: 1 | 2 =
      mode === "ai" || pos.x < WORLD_WIDTH / 2 ? 1 : 2;
    activePointersRef.current.set(e.pointerId, assignedPlayer);

    if (assignedPlayer === 1) {
      p1PointerYRef.current = pos.y;
    } else {
      p2PointerYRef.current = pos.y;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === "mouse") return;
    const assignedPlayer = activePointersRef.current.get(e.pointerId);
    if (!assignedPlayer) return;

    const pos = mapPointerToWorld(e.clientX, e.clientY);
    if (!pos) return;

    if (assignedPlayer === 1) {
      p1PointerYRef.current = pos.y;
    } else {
      p2PointerYRef.current = pos.y;
    }
  };

  const clearPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const assignedPlayer = activePointersRef.current.get(e.pointerId);
    if (!assignedPlayer) return;
    activePointersRef.current.delete(e.pointerId);
    if (assignedPlayer === 1) {
      p1PointerYRef.current = null;
    } else {
      p2PointerYRef.current = null;
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "min(100cqw, calc(100cqh * 12 / 7))",
        height: "min(100cqh, calc(100cqw * 7 / 12))",
      }}
      className="relative overflow-hidden rounded-2xl border border-cyan-400/25 bg-[#040714] shadow-[0_0_50px_rgba(34,211,238,0.12),0_0_80px_rgba(168,85,247,0.1)]"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={clearPointer}
        onPointerCancel={clearPointer}
        className="block h-full w-full touch-none select-none"
      />

      {/* Countdown Overlay */}
      {status === "countdown" && countdownValue !== null && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-slate-950/25">
          <div className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">
            Get Ready
          </div>
          <div
            key={countdownValue}
            className="animate-score-pop neon-text-cyan mt-1 font-mono text-7xl font-black text-white sm:text-8xl"
          >
            {countdownValue}
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {status === "paused" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-xs rounded-2xl p-6 text-center">
            <h3 className="neon-text-cyan text-2xl font-black uppercase tracking-widest text-white">
              PAUSED
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Press <kbd className="font-mono text-slate-200">Space</kbd> to
              resume
            </p>
            <div className="mt-5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onTogglePause}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition hover:brightness-110"
              >
                <Play className="h-4 w-4 fill-current" />
                Resume Match
              </button>
              <button
                type="button"
                onClick={onRestart}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 transition hover:bg-white/10"
              >
                <RotateCcw className="h-4 w-4" />
                Restart Match
              </button>
              <button
                type="button"
                onClick={onRequestExit}
                className="flex items-center justify-center gap-2 rounded-xl border border-rose-400/25 bg-rose-500/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-200 transition hover:bg-rose-500/20"
              >
                <Home className="h-4 w-4" />
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
