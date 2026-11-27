import { DIFFICULTY_CONFIG, WORLD_HEIGHT } from "@/lib/constants";
import { BallState, Difficulty, PaddleState } from "@/types/game";

/**
 * Predictive Pong AI controller.
 *
 * Predicts the ball's future intercept coordinate (including top/bottom wall
 * reflections), applies difficulty-calibrated reaction latency and controlled
 * prediction error, and moves the AI paddle smoothly within physical speed limits.
 */
export class AIController {
  private reactionTimerMs = 0;
  private targetCenterY = WORLD_HEIGHT / 2;
  private currentErrorOffset = 0;
  private lastBallDirection = 0;

  public reset(): void {
    this.reactionTimerMs = 0;
    this.targetCenterY = WORLD_HEIGHT / 2;
    this.currentErrorOffset = 0;
    this.lastBallDirection = 0;
  }

  /**
   * Analytically predicts where the ball will cross `targetX`, accounting for
   * elastic reflections off the top and bottom walls.
   */
  public predictInterceptY(ball: BallState, targetX: number): number {
    if (ball.vx <= 0) {
      return WORLD_HEIGHT / 2;
    }

    const minY = ball.radius;
    const maxY = WORLD_HEIGHT - ball.radius;
    const span = maxY - minY;
    if (span <= 0) return WORLD_HEIGHT / 2;

    const distanceX = Math.max(0, targetX - ball.x);
    const timeToReach = distanceX / ball.vx;
    const rawDisplacement = ball.y - minY + ball.vy * timeToReach;

    const period = 2 * span;
    const folded = ((rawDisplacement % period) + period) % period;

    if (folded <= span) {
      return minY + folded;
    }
    return maxY - (folded - span);
  }

  public update(
    dt: number,
    ball: BallState,
    paddle: PaddleState,
    difficulty: Difficulty
  ): void {
    const config = DIFFICULTY_CONFIG[difficulty];
    const ballMovingTowardAI = ball.vx > 0;
    const currentDirection = ball.vx > 0 ? 1 : ball.vx < 0 ? -1 : 0;

    // Reset reaction timer when ball switches direction toward AI
    if (currentDirection !== this.lastBallDirection) {
      this.lastBallDirection = currentDirection;
      if (ballMovingTowardAI) {
        // Trigger an initial delayed read based on difficulty
        this.reactionTimerMs = config.reactionDelayMs * 0.6;
      }
    }

    this.reactionTimerMs -= dt * 1000;

    if (this.reactionTimerMs <= 0) {
      this.reactionTimerMs = config.reactionDelayMs;

      if (ballMovingTowardAI) {
        const interceptX = paddle.x - ball.radius;
        const idealY = this.predictInterceptY(ball, interceptX);

        // Controlled error scaled slightly by ball velocity for realism
        const randomError =
          (Math.random() * 2 - 1) * config.predictionErrorPx;

        // Strategic edge offset on higher difficulties to return sharper angles
        let strategicOffset = 0;
        if (config.edgeAimStrength > 0) {
          const aimSign = idealY > WORLD_HEIGHT / 2 ? -1 : 1;
          strategicOffset =
            aimSign * (paddle.height * 0.24) * config.edgeAimStrength;
        }

        this.currentErrorOffset = randomError + strategicOffset;
        this.targetCenterY = Math.max(
          paddle.height / 2,
          Math.min(
            WORLD_HEIGHT - paddle.height / 2,
            idealY + this.currentErrorOffset
          )
        );
      } else {
        // Ball moving away: drift smoothly back near center with slight offset
        const idleJitter = (Math.random() * 2 - 1) * 28;
        this.targetCenterY = WORLD_HEIGHT / 2 + idleJitter;
      }
    }

    const paddleCenter = paddle.y + paddle.height / 2;
    const deltaY = this.targetCenterY - paddleCenter;
    const deadzone = 6;

    if (Math.abs(deltaY) <= deadzone) {
      paddle.vy = 0;
      return;
    }

    const speedLimit = ballMovingTowardAI
      ? config.maxSpeed
      : config.maxSpeed * config.idleCenterSpeedFactor;

    const step = Math.sign(deltaY) * Math.min(Math.abs(deltaY) / dt, speedLimit);
    const prevY = paddle.y;
    paddle.y = Math.max(
      0,
      Math.min(WORLD_HEIGHT - paddle.height, paddle.y + step * dt)
    );
    paddle.vy = dt > 0 ? (paddle.y - prevY) / dt : 0;
  }
}
