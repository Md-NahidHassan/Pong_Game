export type GameMode = "ai" | "pvp";

export type Difficulty = "easy" | "medium" | "hard" | "impossible";

export type BallSpeedPreset = "slow" | "normal" | "fast";

export type WinningScore = 5 | 10 | 15;

export type GameStatus =
  | "menu"
  | "countdown"
  | "playing"
  | "paused"
  | "gameover";

export interface GameSettings {
  difficulty: Difficulty;
  winningScore: WinningScore;
  ballSpeed: BallSpeedPreset;
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  musicEnabled: boolean;
  visualEffects: boolean;
}

export interface ScoreState {
  player1: number;
  player2: number;
  rally: number;
  maxRally: number;
  lastScorer: 1 | 2 | null;
}

export interface MatchSummary {
  winner: 1 | 2;
  player1Score: number;
  player2Score: number;
  maxRally: number;
  totalHits: number;
  peakBallSpeed: number;
  durationSeconds: number;
  mode: GameMode;
  difficulty: Difficulty;
}

export interface PaddleInput {
  up: boolean;
  down: boolean;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
  trail: Vector2D[];
  spinFlash: number;
}

export interface PaddleState {
  x: number;
  y: number; // top-left y
  width: number;
  height: number;
  vy: number;
  hitFlash: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

export interface FloatingCallout {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
}

export interface EngineCallbacks {
  onScoreChange: (score: ScoreState) => void;
  onCountdownTick: (value: number | null) => void;
  onGameOver: (summary: MatchSummary) => void;
  onSoundEvent: (event: SoundEvent) => void;
}

export type SoundEvent =
  | { type: "paddleHit"; speedRatio: number; isPlayer1: boolean }
  | { type: "wallHit" }
  | { type: "score"; scorer: 1 | 2 }
  | { type: "countdown"; value: number }
  | { type: "gameStart" }
  | { type: "win" }
  | { type: "lose" };
