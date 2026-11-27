import { BallSpeedPreset, Difficulty, GameSettings, WinningScore } from "@/types/game";

export const WORLD_WIDTH = 1200;
export const WORLD_HEIGHT = 700;

export const PADDLE_WIDTH = 16;
export const PADDLE_HEIGHT = 116;
export const PADDLE_MARGIN = 38;
export const PADDLE_SPEED = 660; // logical px/sec for human players

export const BALL_RADIUS = 10;
export const MAX_BOUNCE_ANGLE_RAD = (54 * Math.PI) / 180;
export const SPEED_ESCALATION_PER_HIT = 1.036;
export const MAX_BALL_SPEED_MULTIPLIER = 1.95;

export const BALL_SPEED_CONFIG: Record<
  BallSpeedPreset,
  { label: string; baseSpeed: number; serveFactor: number; description: string }
> = {
  slow: {
    label: "Chill",
    baseSpeed: 520,
    serveFactor: 0.85,
    description: "Relaxed pace for casual rallies",
  },
  normal: {
    label: "Arcade",
    baseSpeed: 680,
    serveFactor: 0.82,
    description: "Balanced classic arcade tempo",
  },
  fast: {
    label: "Hyper",
    baseSpeed: 860,
    serveFactor: 0.8,
    description: "High-velocity reflex challenge",
  },
};

export interface DifficultyConfig {
  label: string;
  tagline: string;
  accentColor: string;
  badgeClass: string;
  reactionDelayMs: number;
  maxSpeed: number;
  predictionErrorPx: number;
  idleCenterSpeedFactor: number;
  edgeAimStrength: number;
  reactionStat: number; // 1-100 for UI display
  accuracyStat: number; // 1-100 for UI display
  speedStat: number; // 1-100 for UI display
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: "Easy",
    tagline: "Slow reaction with human-like mistakes",
    accentColor: "#22d3ee",
    badgeClass: "text-cyan-300 border-cyan-400/40 bg-cyan-500/10",
    reactionDelayMs: 280,
    maxSpeed: 370,
    predictionErrorPx: 86,
    idleCenterSpeedFactor: 0.35,
    edgeAimStrength: 0,
    reactionStat: 35,
    accuracyStat: 40,
    speedStat: 42,
  },
  medium: {
    label: "Medium",
    tagline: "Balanced trajectory reads and pacing",
    accentColor: "#3b82f6",
    badgeClass: "text-blue-300 border-blue-400/40 bg-blue-500/10",
    reactionDelayMs: 145,
    maxSpeed: 540,
    predictionErrorPx: 38,
    idleCenterSpeedFactor: 0.55,
    edgeAimStrength: 0.15,
    reactionStat: 65,
    accuracyStat: 68,
    speedStat: 65,
  },
  hard: {
    label: "Hard",
    tagline: "Sharp bounce prediction and fast recovery",
    accentColor: "#a855f7",
    badgeClass: "text-purple-300 border-purple-400/40 bg-purple-500/10",
    reactionDelayMs: 60,
    maxSpeed: 740,
    predictionErrorPx: 14,
    idleCenterSpeedFactor: 0.8,
    edgeAimStrength: 0.35,
    reactionStat: 86,
    accuracyStat: 88,
    speedStat: 85,
  },
  impossible: {
    label: "Impossible",
    tagline: "Near-instant prediction — beat it with sharp angles",
    accentColor: "#f43f5e",
    badgeClass: "text-rose-300 border-rose-400/40 bg-rose-500/10",
    reactionDelayMs: 18,
    maxSpeed: 930,
    predictionErrorPx: 5,
    idleCenterSpeedFactor: 0.95,
    edgeAimStrength: 0.55,
    reactionStat: 98,
    accuracyStat: 97,
    speedStat: 95,
  },
};

export const WINNING_SCORE_OPTIONS: WinningScore[] = [5, 10, 15];

export const DEFAULT_SETTINGS: GameSettings = {
  difficulty: "medium",
  winningScore: 10,
  ballSpeed: "normal",
  soundEnabled: true,
  soundVolume: 0.7,
  musicEnabled: true,
  visualEffects: true,
};

export const SETTINGS_STORAGE_KEY = "neon-pong-settings-v1";
