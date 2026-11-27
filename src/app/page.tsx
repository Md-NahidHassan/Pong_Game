"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { ConfirmExitModal } from "@/components/ConfirmExitModal";
import { DifficultySelector } from "@/components/DifficultySelector";
import { GameCanvas } from "@/components/GameCanvas";
import { GameHUD } from "@/components/GameHUD";
import { GameOverScreen } from "@/components/GameOverScreen";
import { HowToPlayModal } from "@/components/HowToPlayModal";
import { MainMenu } from "@/components/MainMenu";
import { MobileControls } from "@/components/MobileControls";
import { SettingsPanel } from "@/components/SettingsPanel";
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from "@/lib/constants";
import { arcadeAudio } from "@/lib/sound";
import {
  Difficulty,
  GameMode,
  GameSettings,
  GameStatus,
  MatchSummary,
  PaddleInput,
  ScoreState,
  WinningScore,
} from "@/types/game";

const INITIAL_SCORE: ScoreState = {
  player1: 0,
  player2: 0,
  rally: 0,
  maxRally: 0,
  lastScorer: null,
};

let visitRequestPromise: Promise<number | null> | null = null;

function trackPageVisit(): Promise<number | null> {
  if (!visitRequestPromise) {
    visitRequestPromise = fetch("/api/visits", {
      method: "POST",
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = (await res.json()) as { visits?: unknown };
        return typeof data.visits === "number" ? data.visits : null;
      })
      .catch(() => null);
  }
  return visitRequestPromise;
}

export default function HomePage() {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [settingsHydrated, setSettingsHydrated] = useState(false);
  const [visitCount, setVisitCount] = useState<number | null>(null);

  const [mode, setMode] = useState<GameMode>("ai");
  const [status, setStatus] = useState<GameStatus>("menu");
  const [score, setScore] = useState<ScoreState>(INITIAL_SCORE);
  const [matchSeed, setMatchSeed] = useState(1);
  const [matchSummary, setMatchSummary] = useState<MatchSummary | null>(null);

  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const arenaRef = useRef<HTMLDivElement | null>(null);
  const touchP1Ref = useRef<PaddleInput>({ up: false, down: false });
  const touchP2Ref = useRef<PaddleInput>({ up: false, down: false });
  const resumeAfterConfirmRef = useRef(false);

  // Hydrate saved settings from localStorage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<GameSettings>;
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch {
      // Ignore storage errors
    } finally {
      setSettingsHydrated(true);
    }
  }, []);

  // Sync audio & persistence whenever settings change
  useEffect(() => {
    arcadeAudio.updateSettings({
      soundEnabled: settings.soundEnabled,
      musicEnabled: settings.musicEnabled,
      soundVolume: settings.soundVolume,
    });

    if (settingsHydrated) {
      try {
        window.localStorage.setItem(
          SETTINGS_STORAGE_KEY,
          JSON.stringify(settings)
        );
      } catch {
        // Ignore storage errors
      }
    }
  }, [settings, settingsHydrated]);

  // Unlock Web Audio & start menu/game music on first user gesture anywhere
  useEffect(() => {
    const unlockAudio = () => {
      arcadeAudio.unlock();
      if (settings.soundEnabled && settings.musicEnabled) {
        arcadeAudio.startMusic();
      }
    };

    window.addEventListener("pointerdown", unlockAudio, { passive: true });
    window.addEventListener("keydown", unlockAudio, { passive: true });
    window.addEventListener("touchstart", unlockAudio, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
  }, [settings.musicEnabled, settings.soundEnabled]);

  // Track total visits (starts from 150) once per page load
  useEffect(() => {
    let active = true;
    trackPageVisit().then((count) => {
      if (active && count !== null) {
        setVisitCount(count);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Track fullscreen changes
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const updateSettings = useCallback((next: GameSettings) => {
    setSettings(next);
  }, []);

  const startMatch = useCallback(
    (selectedMode: GameMode) => {
      arcadeAudio.unlock();
      arcadeAudio.playUiClick();
      if (settings.soundEnabled && settings.musicEnabled) {
        arcadeAudio.startMusic();
      }
      touchP1Ref.current = { up: false, down: false };
      touchP2Ref.current = { up: false, down: false };
      setMode(selectedMode);
      setScore(INITIAL_SCORE);
      setMatchSummary(null);
      setShowDifficultyModal(false);
      setShowConfirmExit(false);
      setMatchSeed((s) => s + 1);
      setStatus("countdown");
    },
    [settings.musicEnabled, settings.soundEnabled]
  );

  const handleRestart = useCallback(() => {
    arcadeAudio.unlock();
    arcadeAudio.playUiClick();
    touchP1Ref.current = { up: false, down: false };
    touchP2Ref.current = { up: false, down: false };
    setScore(INITIAL_SCORE);
    setMatchSummary(null);
    setShowConfirmExit(false);
    setMatchSeed((s) => s + 1);
    setStatus("countdown");
  }, []);

  const handleTogglePause = useCallback(() => {
    arcadeAudio.playUiClick();
    setStatus((prev) => {
      if (prev === "playing") return "paused";
      if (prev === "paused") return "playing";
      return prev;
    });
  }, []);

  const handleRequestExit = useCallback(() => {
    arcadeAudio.playUiClick();
    setStatus((prev) => {
      if (prev === "playing") {
        resumeAfterConfirmRef.current = true;
        return "paused";
      }
      resumeAfterConfirmRef.current = false;
      return prev;
    });
    setShowConfirmExit(true);
  }, []);

  const handleCancelExit = useCallback(() => {
    arcadeAudio.playUiClick();
    setShowConfirmExit(false);
    if (resumeAfterConfirmRef.current) {
      resumeAfterConfirmRef.current = false;
      setStatus("playing");
    }
  }, []);

  const handleConfirmExit = useCallback(() => {
    arcadeAudio.playUiClick();
    resumeAfterConfirmRef.current = false;
    setShowConfirmExit(false);
    setMatchSummary(null);
    setStatus("menu");
  }, []);

  const handleOpenSettingsFromGame = useCallback(() => {
    arcadeAudio.playUiClick();
    setStatus((prev) => (prev === "playing" ? "paused" : prev));
    setShowSettings(true);
  }, []);

  const handleToggleSound = useCallback(() => {
    const nextEnabled = !settings.soundEnabled;
    const next = { ...settings, soundEnabled: nextEnabled };
    arcadeAudio.updateSettings({
      soundEnabled: nextEnabled,
      musicEnabled: next.musicEnabled,
      soundVolume: next.soundVolume,
    });
    arcadeAudio.unlock();
    if (nextEnabled) {
      arcadeAudio.playUiClick();
      if (next.musicEnabled) {
        arcadeAudio.startMusic();
      }
    }
    setSettings(next);
  }, [settings]);

  const handleToggleMusic = useCallback(() => {
    const nextEnabled = !settings.musicEnabled;
    const next = { ...settings, musicEnabled: nextEnabled };
    arcadeAudio.updateSettings({
      soundEnabled: next.soundEnabled,
      musicEnabled: nextEnabled,
      soundVolume: next.soundVolume,
    });
    arcadeAudio.unlock();
    if (next.soundEnabled) {
      arcadeAudio.playUiClick();
      if (nextEnabled) {
        arcadeAudio.startMusic();
      }
    }
    setSettings(next);
  }, [settings]);

  const handleToggleFullscreen = useCallback(async () => {
    arcadeAudio.playUiClick();
    try {
      if (!document.fullscreenElement) {
        const target = arenaRef.current ?? document.documentElement;
        await target.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen may be blocked by browser policy
    }
  }, []);

  const handleTouchInput = useCallback(
    (player: 1 | 2, direction: "up" | "down", active: boolean) => {
      const ref = player === 1 ? touchP1Ref : touchP2Ref;
      ref.current[direction] = active;
    },
    []
  );

  const handleGameOver = useCallback((summary: MatchSummary) => {
    setMatchSummary(summary);
    setStatus("gameover");
  }, []);

  const handleCountdownEnd = useCallback(() => {
    setStatus("playing");
  }, []);

  return (
    <div
      ref={arenaRef}
      className="relative h-dvh w-full overflow-hidden bg-[#030612] text-slate-100"
    >
      <AnimatedBackground visualEffects={settings.visualEffects} />

      {status === "menu" ? (
        <MainMenu
          settings={settings}
          visitCount={visitCount}
          onPlayVsAI={() => {
            arcadeAudio.unlock();
            arcadeAudio.playUiClick();
            setShowDifficultyModal(true);
          }}
          onPlayTwoPlayer={() => startMatch("pvp")}
          onOpenHowToPlay={() => {
            arcadeAudio.unlock();
            arcadeAudio.playUiClick();
            setShowHowToPlay(true);
          }}
          onOpenSettings={() => {
            arcadeAudio.unlock();
            arcadeAudio.playUiClick();
            setShowSettings(true);
          }}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
          onSelectWinningScore={(winningScore: WinningScore) => {
            arcadeAudio.unlock();
            arcadeAudio.playUiClick();
            setSettings((prev) => ({ ...prev, winningScore }));
          }}
        />
      ) : (
        <main className="relative z-10 mx-auto flex h-dvh w-full max-w-6xl flex-col items-center justify-between gap-2 overflow-hidden px-3 py-2.5 sm:px-6 sm:py-3.5">
          <div className="w-full shrink-0">
            <GameHUD
              mode={mode}
              status={status}
              score={score}
              settings={settings}
              isFullscreen={isFullscreen}
              onTogglePause={handleTogglePause}
              onRestart={handleRestart}
              onRequestExit={handleRequestExit}
              onToggleSound={handleToggleSound}
              onToggleMusic={handleToggleMusic}
              onToggleFullscreen={handleToggleFullscreen}
              onOpenSettings={handleOpenSettingsFromGame}
            />
          </div>

          <div
            className="flex min-h-0 w-full max-w-5xl flex-1 items-center justify-center"
            style={{ containerType: "size" }}
          >
            <GameCanvas
              mode={mode}
              settings={settings}
              status={status}
              matchSeed={matchSeed}
              touchP1Ref={touchP1Ref}
              touchP2Ref={touchP2Ref}
              onScoreChange={setScore}
              onCountdownEnd={handleCountdownEnd}
              onTogglePause={handleTogglePause}
              onRestart={handleRestart}
              onRequestExit={handleRequestExit}
              onImmediateExit={handleConfirmExit}
              onGameOver={handleGameOver}
            />
          </div>

          <div className="w-full max-w-5xl shrink-0">
            <MobileControls mode={mode} onPlayerInput={handleTouchInput} />
          </div>

          <div className="hidden shrink-0 items-center gap-5 text-[11px] tracking-wider text-slate-400 md:flex">
            <span>
              <kbd className="rounded border border-white/15 bg-slate-900 px-1.5 py-0.5 font-mono text-slate-200">
                W
              </kbd>{" "}
              /{" "}
              <kbd className="rounded border border-white/15 bg-slate-900 px-1.5 py-0.5 font-mono text-slate-200">
                S
              </kbd>{" "}
              Player 1
            </span>
            {mode === "pvp" && (
              <span>
                <kbd className="rounded border border-white/15 bg-slate-900 px-1.5 py-0.5 font-mono text-slate-200">
                  ↑
                </kbd>{" "}
                /{" "}
                <kbd className="rounded border border-white/15 bg-slate-900 px-1.5 py-0.5 font-mono text-slate-200">
                  ↓
                </kbd>{" "}
                Player 2
              </span>
            )}
            <span>
              <kbd className="rounded border border-white/15 bg-slate-900 px-1.5 py-0.5 font-mono text-slate-200">
                Space
              </kbd>{" "}
              Pause
            </span>
            <span>
              <kbd className="rounded border border-white/15 bg-slate-900 px-1.5 py-0.5 font-mono text-slate-200">
                ESC
              </kbd>{" "}
              Exit
            </span>
            <span className="text-slate-600">·</span>
            <span>
              Built by{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text font-bold text-transparent">
                Nahid
              </span>
            </span>
          </div>
        </main>
      )}

      {/* Modals */}
      {showDifficultyModal && (
        <DifficultySelector
          selectedDifficulty={settings.difficulty}
          winningScore={settings.winningScore}
          onSelectDifficulty={(difficulty: Difficulty) => {
            arcadeAudio.playUiClick();
            setSettings((prev) => ({ ...prev, difficulty }));
          }}
          onSelectWinningScore={(winningScore: WinningScore) => {
            arcadeAudio.playUiClick();
            setSettings((prev) => ({ ...prev, winningScore }));
          }}
          onStartMatch={() => startMatch("ai")}
          onClose={() => {
            arcadeAudio.playUiClick();
            setShowDifficultyModal(false);
          }}
        />
      )}

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onUpdateSettings={updateSettings}
          onClose={() => {
            arcadeAudio.playUiClick();
            setShowSettings(false);
          }}
        />
      )}

      {showHowToPlay && (
        <HowToPlayModal
          onClose={() => {
            arcadeAudio.playUiClick();
            setShowHowToPlay(false);
          }}
        />
      )}

      {showConfirmExit && (
        <ConfirmExitModal
          onConfirm={handleConfirmExit}
          onCancel={handleCancelExit}
        />
      )}

      {status === "gameover" && matchSummary && (
        <GameOverScreen
          summary={matchSummary}
          onPlayAgain={handleRestart}
          onMainMenu={handleConfirmExit}
        />
      )}
    </div>
  );
}
