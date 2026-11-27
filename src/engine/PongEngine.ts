import { AIController } from "@/engine/AIController";
import {
  BALL_RADIUS,
  BALL_SPEED_CONFIG,
  MAX_BALL_SPEED_MULTIPLIER,
  MAX_BOUNCE_ANGLE_RAD,
  PADDLE_HEIGHT,
  PADDLE_MARGIN,
  PADDLE_SPEED,
  PADDLE_WIDTH,
  SPEED_ESCALATION_PER_HIT,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "@/lib/constants";
import {
  BallState,
  EngineCallbacks,
  FloatingCallout,
  GameMode,
  GameSettings,
  PaddleInput,
  PaddleState,
  Particle,
  ScoreState,
} from "@/types/game";

/**
 * Deterministic 60fps HTML5 Canvas Pong physics engine and neon renderer.
 * All mutable simulation state stays inside this class so React never
 * re-renders per animation frame.
 */
export class PongEngine {
  private mode: GameMode;
  private settings: GameSettings;
  private callbacks: EngineCallbacks;
  private ai = new AIController();

  private paddle1!: PaddleState;
  private paddle2!: PaddleState;
  private ball!: BallState;
  private score!: ScoreState;

  private particles: Particle[] = [];
  private callouts: FloatingCallout[] = [];

  private shakeIntensity = 0;
  private goalFlashAlpha = 0;
  private goalFlashColor = "#22d3ee";
  private elapsedSeconds = 0;
  private totalHits = 0;
  private peakBallSpeed = 0;

  private servePauseTimer = 0;
  private nextServeDirection: 1 | -1 = 1;
  private countdownTimer = 0;
  private countdownStep: number | null = null;
  private isMatchOver = false;
  private bgPulseTime = 0;

  constructor(
    mode: GameMode,
    settings: GameSettings,
    callbacks: EngineCallbacks
  ) {
    this.mode = mode;
    this.settings = settings;
    this.callbacks = callbacks;
    this.resetMatch(true);
  }

  public updateSettings(settings: GameSettings): void {
    const prevBase = BALL_SPEED_CONFIG[this.settings.ballSpeed].baseSpeed;
    const nextBase = BALL_SPEED_CONFIG[settings.ballSpeed].baseSpeed;
    this.settings = settings;

    if (prevBase !== nextBase && this.ball.speed > 0) {
      const ratio = nextBase / prevBase;
      this.ball.speed *= ratio;
      this.ball.vx *= ratio;
      this.ball.vy *= ratio;
    }
  }

  public setMode(mode: GameMode): void {
    this.mode = mode;
  }

  public resetMatch(withCountdown: boolean): void {
    this.paddle1 = {
      x: PADDLE_MARGIN,
      y: WORLD_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      vy: 0,
      hitFlash: 0,
    };

    this.paddle2 = {
      x: WORLD_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
      y: WORLD_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      vy: 0,
      hitFlash: 0,
    };

    this.score = {
      player1: 0,
      player2: 0,
      rally: 0,
      maxRally: 0,
      lastScorer: null,
    };

    this.particles = [];
    this.callouts = [];
    this.shakeIntensity = 0;
    this.goalFlashAlpha = 0;
    this.elapsedSeconds = 0;
    this.totalHits = 0;
    this.peakBallSpeed = BALL_SPEED_CONFIG[this.settings.ballSpeed].baseSpeed;
    this.isMatchOver = false;
    this.nextServeDirection = Math.random() < 0.5 ? 1 : -1;

    this.ai.reset();
    this.spawnBall(this.nextServeDirection);
    this.callbacks.onScoreChange({ ...this.score });

    if (withCountdown) {
      this.countdownStep = 3;
      this.countdownTimer = 0.72;
      this.servePauseTimer = 0;
      this.callbacks.onCountdownTick(3);
      this.callbacks.onSoundEvent({ type: "countdown", value: 3 });
    } else {
      this.countdownStep = null;
      this.servePauseTimer = 0.4;
      this.callbacks.onCountdownTick(null);
      this.callbacks.onSoundEvent({ type: "gameStart" });
    }
  }

  private spawnBall(direction: 1 | -1): void {
    const speedCfg = BALL_SPEED_CONFIG[this.settings.ballSpeed];
    const serveSpeed = speedCfg.baseSpeed * speedCfg.serveFactor;
    // Launch between -26 deg and +26 deg, avoiding flat 0 deg serves
    const sign = Math.random() < 0.5 ? 1 : -1;
    const angle = sign * ((8 + Math.random() * 18) * (Math.PI / 180));

    this.ball = {
      x: WORLD_WIDTH / 2,
      y: WORLD_HEIGHT / 2,
      vx: Math.cos(angle) * serveSpeed * direction,
      vy: Math.sin(angle) * serveSpeed,
      radius: BALL_RADIUS,
      speed: serveSpeed,
      trail: [],
      spinFlash: 0,
    };
  }

  public isCountingDown(): boolean {
    return this.countdownStep !== null;
  }

  /**
   * Advances simulation by `rawDt` seconds.
   */
  public step(
    rawDt: number,
    p1Input: PaddleInput,
    p2Input: PaddleInput,
    p1PointerY: number | null,
    p2PointerY: number | null
  ): void {
    const dt = Math.min(rawDt, 0.05);
    this.bgPulseTime += dt;

    this.updateVisualEffects(dt);

    if (this.isMatchOver) {
      return;
    }

    // Handle initial 3-2-1 countdown
    if (this.countdownStep !== null) {
      this.updateHumanPaddle(this.paddle1, p1Input, p1PointerY, dt);
      if (this.mode === "pvp") {
        this.updateHumanPaddle(this.paddle2, p2Input, p2PointerY, dt);
      }

      this.countdownTimer -= dt;
      if (this.countdownTimer <= 0) {
        this.countdownStep -= 1;
        if (this.countdownStep > 0) {
          this.countdownTimer = 0.72;
          this.callbacks.onCountdownTick(this.countdownStep);
          this.callbacks.onSoundEvent({
            type: "countdown",
            value: this.countdownStep,
          });
        } else {
          this.countdownStep = null;
          this.callbacks.onCountdownTick(null);
          this.callbacks.onSoundEvent({ type: "gameStart" });
        }
      }
      return;
    }

    this.elapsedSeconds += dt;

    // Always allow paddle movement even during brief post-score serve delay
    this.updateHumanPaddle(this.paddle1, p1Input, p1PointerY, dt);
    if (this.mode === "pvp") {
      this.updateHumanPaddle(this.paddle2, p2Input, p2PointerY, dt);
    } else {
      this.ai.update(dt, this.ball, this.paddle2, this.settings.difficulty);
    }

    if (this.servePauseTimer > 0) {
      this.servePauseTimer -= dt;
      return;
    }

    // Sub-stepped ball movement to guarantee zero collision tunneling
    const frameDistance = this.ball.speed * dt;
    const subSteps = Math.max(1, Math.min(12, Math.ceil(frameDistance / 6)));
    const subDt = dt / subSteps;

    for (let i = 0; i < subSteps; i++) {
      this.ball.x += this.ball.vx * subDt;
      this.ball.y += this.ball.vy * subDt;

      this.handleWallCollisions();
      this.handlePaddleCollisions();

      if (this.checkGoal()) {
        break;
      }
    }

    // Update ball trail
    if (this.settings.visualEffects) {
      this.ball.trail.push({ x: this.ball.x, y: this.ball.y });
      if (this.ball.trail.length > 14) {
        this.ball.trail.shift();
      }
    } else if (this.ball.trail.length > 0) {
      this.ball.trail = [];
    }
  }

  private updateHumanPaddle(
    paddle: PaddleState,
    input: PaddleInput,
    pointerTargetY: number | null,
    dt: number
  ): void {
    const prevY = paddle.y;

    if (pointerTargetY !== null) {
      const targetTop = pointerTargetY - paddle.height / 2;
      const diff = targetTop - paddle.y;
      const maxMove = PADDLE_SPEED * 1.35 * dt;
      const delta = Math.abs(diff) <= maxMove ? diff : Math.sign(diff) * maxMove;
      paddle.y = Math.max(
        0,
        Math.min(WORLD_HEIGHT - paddle.height, paddle.y + delta)
      );
    } else {
      let dir = 0;
      if (input.up) dir -= 1;
      if (input.down) dir += 1;
      paddle.y = Math.max(
        0,
        Math.min(WORLD_HEIGHT - paddle.height, paddle.y + dir * PADDLE_SPEED * dt)
      );
    }

    paddle.vy = dt > 0 ? (paddle.y - prevY) / dt : 0;
  }

  private handleWallCollisions(): void {
    const r = this.ball.radius;
    if (this.ball.y - r <= 0) {
      this.ball.y = r;
      this.ball.vy = Math.abs(this.ball.vy);
      this.emitBurst(this.ball.x, r, "#60a5fa", 9, 220);
      this.callbacks.onSoundEvent({ type: "wallHit" });
    } else if (this.ball.y + r >= WORLD_HEIGHT) {
      this.ball.y = WORLD_HEIGHT - r;
      this.ball.vy = -Math.abs(this.ball.vy);
      this.emitBurst(this.ball.x, WORLD_HEIGHT - r, "#60a5fa", 9, 220);
      this.callbacks.onSoundEvent({ type: "wallHit" });
    }
  }

  private handlePaddleCollisions(): void {
    const r = this.ball.radius;

    // Player 1 (Left Paddle)
    if (this.ball.vx < 0) {
      const p1 = this.paddle1;
      const hitX =
        this.ball.x - r <= p1.x + p1.width && this.ball.x + r >= p1.x;
      const hitY =
        this.ball.y + r >= p1.y - 2 &&
        this.ball.y - r <= p1.y + p1.height + 2;

      if (hitX && hitY) {
        this.ball.x = p1.x + p1.width + r + 0.5;
        this.bounceOffPaddle(p1, 1);
        return;
      }
    }

    // Player 2 / AI (Right Paddle)
    if (this.ball.vx > 0) {
      const p2 = this.paddle2;
      const hitX =
        this.ball.x + r >= p2.x && this.ball.x - r <= p2.x + p2.width;
      const hitY =
        this.ball.y + r >= p2.y - 2 &&
        this.ball.y - r <= p2.y + p2.height + 2;

      if (hitX && hitY) {
        this.ball.x = p2.x - r - 0.5;
        this.bounceOffPaddle(p2, -1);
      }
    }
  }

  private bounceOffPaddle(paddle: PaddleState, outgoingDirX: 1 | -1): void {
    const center = paddle.y + paddle.height / 2;
    const rawRel = (this.ball.y - center) / (paddle.height / 2);
    const rel = Math.max(-1, Math.min(1, rawRel));

    // Blend hit position angle with subtle paddle velocity English
    const paddleSpinRad = Math.max(-0.14, Math.min(0.14, paddle.vy * 0.0002));
    const angle = Math.max(
      -MAX_BOUNCE_ANGLE_RAD,
      Math.min(MAX_BOUNCE_ANGLE_RAD, rel * MAX_BOUNCE_ANGLE_RAD + paddleSpinRad)
    );

    const baseSpeed = BALL_SPEED_CONFIG[this.settings.ballSpeed].baseSpeed;
    const maxSpeed = baseSpeed * MAX_BALL_SPEED_MULTIPLIER;

    // On first return after a serve, ramp straight to at least baseSpeed
    const nextSpeed = Math.min(
      maxSpeed,
      Math.max(baseSpeed, this.ball.speed * SPEED_ESCALATION_PER_HIT)
    );

    this.ball.speed = nextSpeed;
    this.ball.vx = Math.cos(angle) * nextSpeed * outgoingDirX;
    this.ball.vy = Math.sin(angle) * nextSpeed;
    this.ball.spinFlash = 1;
    paddle.hitFlash = 1;

    this.totalHits += 1;
    if (nextSpeed > this.peakBallSpeed) {
      this.peakBallSpeed = nextSpeed;
    }

    this.score.rally += 1;
    if (this.score.rally > this.score.maxRally) {
      this.score.maxRally = this.score.rally;
    }

    const isPlayer1 = outgoingDirX === 1;
    const color = isPlayer1 ? "#22d3ee" : "#c084fc";
    const speedRatio = (nextSpeed - baseSpeed) / (maxSpeed - baseSpeed);

    this.emitBurst(
      isPlayer1 ? paddle.x + paddle.width : paddle.x,
      this.ball.y,
      color,
      16 + Math.floor(speedRatio * 10),
      320 + speedRatio * 180
    );

    if (this.settings.visualEffects && speedRatio > 0.45) {
      this.shakeIntensity = Math.max(this.shakeIntensity, 3.5);
    }

    if (
      this.settings.visualEffects &&
      this.score.rally > 0 &&
      this.score.rally % 5 === 0
    ) {
      this.addCallout(
        WORLD_WIDTH / 2,
        WORLD_HEIGHT * 0.22,
        `${this.score.rally}x RALLY!`,
        "#22d3ee"
      );
    }

    this.callbacks.onScoreChange({ ...this.score });
    this.callbacks.onSoundEvent({
      type: "paddleHit",
      speedRatio,
      isPlayer1,
    });
  }

  private checkGoal(): boolean {
    let scorer: 1 | 2 | null = null;
    if (this.ball.x + this.ball.radius < 0) {
      scorer = 2;
    } else if (this.ball.x - this.ball.radius > WORLD_WIDTH) {
      scorer = 1;
    }

    if (!scorer) return false;

    if (scorer === 1) {
      this.score.player1 += 1;
    } else {
      this.score.player2 += 1;
    }
    this.score.rally = 0;
    this.score.lastScorer = scorer;

    const goalX = scorer === 1 ? WORLD_WIDTH - 12 : 12;
    const color = scorer === 1 ? "#22d3ee" : "#c084fc";
    this.emitBurst(goalX, this.ball.y, color, 42, 520);

    if (this.settings.visualEffects) {
      this.shakeIntensity = 13;
      this.goalFlashAlpha = 0.32;
      this.goalFlashColor = color;
      this.addCallout(
        WORLD_WIDTH / 2,
        WORLD_HEIGHT * 0.35,
        scorer === 1
          ? "PLAYER 1 SCORES!"
          : this.mode === "ai"
            ? "AI SCORES!"
            : "PLAYER 2 SCORES!",
        color
      );
    }

    this.callbacks.onScoreChange({ ...this.score });
    this.callbacks.onSoundEvent({ type: "score", scorer });

    // Check match victory
    if (
      this.score.player1 >= this.settings.winningScore ||
      this.score.player2 >= this.settings.winningScore
    ) {
      this.isMatchOver = true;
      const winner: 1 | 2 =
        this.score.player1 >= this.settings.winningScore ? 1 : 2;

      if (this.mode === "ai") {
        this.callbacks.onSoundEvent({
          type: winner === 1 ? "win" : "lose",
        });
      } else {
        this.callbacks.onSoundEvent({ type: "win" });
      }

      this.callbacks.onGameOver({
        winner,
        player1Score: this.score.player1,
        player2Score: this.score.player2,
        maxRally: this.score.maxRally,
        totalHits: this.totalHits,
        peakBallSpeed: Math.round(this.peakBallSpeed),
        durationSeconds: Math.max(1, Math.round(this.elapsedSeconds)),
        mode: this.mode,
        difficulty: this.settings.difficulty,
      });
      return true;
    }

    // Serve toward the player who just conceded
    this.nextServeDirection = scorer === 1 ? 1 : -1;
    this.spawnBall(this.nextServeDirection);
    this.servePauseTimer = 0.65;
    return true;
  }

  private emitBurst(
    x: number,
    y: number,
    color: string,
    count: number,
    maxSpeed: number
  ): void {
    if (!this.settings.visualEffects) return;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * maxSpeed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.8 + Math.random() * 3.4,
        alpha: 1,
        decay: 1.5 + Math.random() * 1.4,
        color,
      });
    }
  }

  private addCallout(x: number, y: number, text: string, color: string): void {
    this.callouts.push({
      x,
      y,
      vy: -36,
      text,
      color,
      alpha: 1,
      scale: 1,
    });
  }

  private updateVisualEffects(dt: number): void {
    this.paddle1.hitFlash = Math.max(0, this.paddle1.hitFlash - dt * 5);
    this.paddle2.hitFlash = Math.max(0, this.paddle2.hitFlash - dt * 5);
    this.ball.spinFlash = Math.max(0, this.ball.spinFlash - dt * 4);
    this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 32);
    this.goalFlashAlpha = Math.max(0, this.goalFlashAlpha - dt * 1.2);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.alpha -= p.decay * dt;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.callouts.length - 1; i >= 0; i--) {
      const c = this.callouts[i];
      c.y += c.vy * dt;
      c.alpha -= dt * 0.95;
      c.scale += dt * 0.14;
      if (c.alpha <= 0) {
        this.callouts.splice(i, 1);
      }
    }
  }

  /**
   * Renders the full neon arcade frame into the logical 1200x700 coordinate system.
   * The caller sets the canvas DPR transform before calling `render`.
   */
  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Screen shake transform
    if (this.settings.visualEffects && this.shakeIntensity > 0.1) {
      const sx = (Math.random() * 2 - 1) * this.shakeIntensity;
      const sy = (Math.random() * 2 - 1) * this.shakeIntensity;
      ctx.translate(sx, sy);
    }

    // Court background
    const bgGrad = ctx.createLinearGradient(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    bgGrad.addColorStop(0, "#040714");
    bgGrad.addColorStop(0.5, "#070c22");
    bgGrad.addColorStop(1, "#0b0720");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Ambient corner glows
    const leftGlow = ctx.createRadialGradient(
      80,
      WORLD_HEIGHT / 2,
      20,
      80,
      WORLD_HEIGHT / 2,
      420
    );
    leftGlow.addColorStop(0, "rgba(34, 211, 238, 0.08)");
    leftGlow.addColorStop(1, "rgba(34, 211, 238, 0)");
    ctx.fillStyle = leftGlow;
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    const rightGlow = ctx.createRadialGradient(
      WORLD_WIDTH - 80,
      WORLD_HEIGHT / 2,
      20,
      WORLD_WIDTH - 80,
      WORLD_HEIGHT / 2,
      420
    );
    rightGlow.addColorStop(0, "rgba(168, 85, 247, 0.09)");
    rightGlow.addColorStop(1, "rgba(168, 85, 247, 0)");
    ctx.fillStyle = rightGlow;
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Subtle animated grid
    this.renderCourtGrid(ctx);

    // Top & bottom neon rails
    this.renderRails(ctx);

    // Center court markings
    this.renderCenterCourt(ctx);

    // Subtle background score watermark
    ctx.save();
    ctx.font = "800 130px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(34, 211, 238, 0.055)";
    ctx.fillText(String(this.score.player1), WORLD_WIDTH * 0.25, WORLD_HEIGHT / 2);
    ctx.fillStyle = "rgba(192, 132, 252, 0.055)";
    ctx.fillText(String(this.score.player2), WORLD_WIDTH * 0.75, WORLD_HEIGHT / 2);
    ctx.restore();

    // Goal edge flash
    if (this.goalFlashAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = this.goalFlashAlpha;
      ctx.fillStyle = this.goalFlashColor;
      ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      ctx.restore();
    }

    // Ball motion trail
    if (this.settings.visualEffects && this.ball.trail.length > 1) {
      const len = this.ball.trail.length;
      for (let i = 0; i < len; i++) {
        const pt = this.ball.trail[i];
        const t = (i + 1) / len;
        ctx.save();
        ctx.globalAlpha = t * 0.35;
        ctx.fillStyle = i % 2 === 0 ? "#22d3ee" : "#a855f7";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, this.ball.radius * (0.35 + t * 0.55), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Paddles
    this.renderPaddle(ctx, this.paddle1, "#22d3ee", "#06b6d4");
    this.renderPaddle(ctx, this.paddle2, "#c084fc", "#9333ea");

    // Ball
    if (!this.isMatchOver) {
      this.renderBall(ctx);
    }

    // Particles
    if (this.settings.visualEffects && this.particles.length > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const p of this.particles) {
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Floating callouts
    if (this.settings.visualEffects && this.callouts.length > 0) {
      for (const c of this.callouts) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, c.alpha);
        ctx.translate(c.x, c.y);
        ctx.scale(c.scale, c.scale);
        ctx.font = "800 24px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = c.color;
        ctx.shadowColor = c.color;
        ctx.shadowBlur = 16;
        ctx.fillText(c.text, 0, 0);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  private renderCourtGrid(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    const gridSize = 50;
    const pulse = 0.032 + Math.sin(this.bgPulseTime * 1.6) * 0.008;
    ctx.strokeStyle = `rgba(99, 102, 241, ${pulse.toFixed(4)})`;
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let x = gridSize; x < WORLD_WIDTH; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, WORLD_HEIGHT);
    }
    for (let y = gridSize; y < WORLD_HEIGHT; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(WORLD_WIDTH, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  private renderRails(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, WORLD_WIDTH, 0);
    grad.addColorStop(0, "rgba(34, 211, 238, 0.75)");
    grad.addColorStop(0.5, "rgba(59, 130, 246, 0.6)");
    grad.addColorStop(1, "rgba(192, 132, 252, 0.75)");

    ctx.fillStyle = grad;
    if (this.settings.visualEffects) {
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 12;
    }
    ctx.fillRect(0, 0, WORLD_WIDTH, 3);
    ctx.fillRect(0, WORLD_HEIGHT - 3, WORLD_WIDTH, 3);
    ctx.restore();
  }

  private renderCenterCourt(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 14]);
    ctx.beginPath();
    ctx.moveTo(WORLD_WIDTH / 2, 16);
    ctx.lineTo(WORLD_WIDTH / 2, WORLD_HEIGHT - 16);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = "rgba(56, 189, 248, 0.16)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 74, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(56, 189, 248, 0.32)";
    ctx.beginPath();
    ctx.arc(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private renderPaddle(
    ctx: CanvasRenderingContext2D,
    paddle: PaddleState,
    glowColor: string,
    edgeColor: string
  ): void {
    ctx.save();
    const radius = paddle.width / 2;

    if (this.settings.visualEffects) {
      ctx.shadowColor = paddle.hitFlash > 0.1 ? "#ffffff" : glowColor;
      ctx.shadowBlur = 18 + paddle.hitFlash * 20;
    }

    const grad = ctx.createLinearGradient(
      paddle.x,
      paddle.y,
      paddle.x + paddle.width,
      paddle.y + paddle.height
    );
    grad.addColorStop(0, glowColor);
    grad.addColorStop(1, edgeColor);

    ctx.fillStyle = paddle.hitFlash > 0.45 ? "#f8fafc" : grad;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, radius);
    ctx.fill();

    // Bright inner neon spine
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
    ctx.beginPath();
    ctx.roundRect(
      paddle.x + 4,
      paddle.y + 8,
      paddle.width - 8,
      paddle.height - 16,
      4
    );
    ctx.fill();
    ctx.restore();
  }

  private renderBall(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    const baseSpeed = BALL_SPEED_CONFIG[this.settings.ballSpeed].baseSpeed;
    const speedRatio = Math.max(
      0,
      Math.min(1, (this.ball.speed - baseSpeed) / (baseSpeed * 0.9))
    );

    const haloColor =
      speedRatio > 0.65 ? "#f43f5e" : this.ball.vx >= 0 ? "#22d3ee" : "#c084fc";

    if (this.settings.visualEffects) {
      ctx.shadowColor = haloColor;
      ctx.shadowBlur = 22 + speedRatio * 14;
    }

    // Outer plasma ring
    ctx.fillStyle = haloColor;
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ball.radius + 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Bright white core
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ball.radius * 0.72, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
