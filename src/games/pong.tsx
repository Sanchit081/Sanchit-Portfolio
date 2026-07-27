"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface PongBall {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface PongPaddle {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
}

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 60;
const BALL_RADIUS = 6;
const PADDLE_SPEED = 6;
const BALL_SPEED = 4;

function createBall(): PongBall {
  return {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    vx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    vy: BALL_SPEED * (Math.random() * 2 - 1),
    radius: BALL_RADIUS,
  };
}

export function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const animRef = useRef<number | null>(null);
  const stateRef = useRef<{
    ball: PongBall;
    leftPaddle: PongPaddle;
    rightPaddle: PongPaddle;
  } | null>(null);
  const keysRef = useRef<Set<string>>(new Set());

  const initState = useCallback(() => {
    const ball = createBall();
    const leftPaddle: PongPaddle = {
      x: 20,
      y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      score: 0,
    };
    const rightPaddle: PongPaddle = {
      x: CANVAS_WIDTH - 20 - PADDLE_WIDTH,
      y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      score: 0,
    };
    stateRef.current = { ball, leftPaddle, rightPaddle };
    setGameOver(false);
  }, []);

  const resetBall = useCallback((dir: number) => {
    if (!stateRef.current) return;
    const ball = createBall();
    ball.vx = BALL_SPEED * dir;
    ball.vy = BALL_SPEED * (Math.random() * 2 - 1);
    stateRef.current.ball = ball;
  }, []);

  const startGame = useCallback(() => {
    initState();
    setGameActive(true);
  }, [initState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (e.key === " " && !gameActive && !gameOver) {
        startGame();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameActive, gameOver, startGame]);

  useEffect(() => {
    if (!gameActive || gameOver) return;

    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const state = stateRef.current;
      if (!state) return;

      const keys = keysRef.current;
      const leftP = state.leftPaddle;
      const rightP = state.rightPaddle;
      const ball = state.ball;

      if (keys.has("w") || keys.has("W") || keys.has("ArrowUp")) {
        leftP.y = Math.max(0, leftP.y - PADDLE_SPEED);
      }
      if (keys.has("s") || keys.has("S") || keys.has("ArrowDown")) {
        leftP.y = Math.min(CANVAS_HEIGHT - leftP.height, leftP.y + PADDLE_SPEED);
      }

      const botY = ball.y + ball.vy * 2;
      if (botY < rightP.y + rightP.height / 2 && rightP.y > 0) {
        rightP.y -= PADDLE_SPEED * 0.7;
      }
      if (botY > rightP.y + rightP.height / 2 && rightP.y < CANVAS_HEIGHT - rightP.height) {
        rightP.y += PADDLE_SPEED * 0.7;
      }

      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= CANVAS_HEIGHT) {
        ball.vy *= -1;
        ball.y = Math.max(ball.radius, Math.min(CANVAS_HEIGHT - ball.radius, ball.y));
      }

      const leftHit =
        ball.x - ball.radius <= leftP.x + leftP.width &&
        ball.y >= leftP.y &&
        ball.y <= leftP.y + leftP.height &&
        ball.vx < 0;
      const rightHit =
        ball.x + ball.radius >= rightP.x &&
        ball.y >= rightP.y &&
        ball.y <= rightP.y + rightP.height &&
        ball.vx > 0;

      if (leftHit || rightHit) {
        ball.vx *= -1.05;
        ball.vy *= 1.05;
        const speed = Math.min(Math.hypot(ball.vx, ball.vy), 12);
        const angle = Math.atan2(ball.vy, Math.abs(ball.vx));
        ball.vx = speed * Math.cos(angle) * (ball.vx > 0 ? 1 : -1);
        ball.vy = speed * Math.sin(angle);
      }

      if (ball.x < -ball.radius) {
        rightP.score++;
        if (rightP.score >= 5) {
          setGameOver(true);
          setGameActive(false);
          return;
        }
        resetBall(1);
      }
      if (ball.x > CANVAS_WIDTH + ball.radius) {
        leftP.score++;
        if (leftP.score >= 5) {
          setGameOver(true);
          setGameActive(false);
          return;
        }
        resetBall(-1);
      }

      ctx.fillStyle = "#071018";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.font = "bold 28px monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(state.leftPaddle.score), CANVAS_WIDTH / 4, 40);
      ctx.fillText(String(state.rightPaddle.score), (3 * CANVAS_WIDTH) / 4, 40);

      ctx.fillStyle = "#2563eb";
      ctx.shadowColor = "rgba(37,99,235,0.6)";
      ctx.shadowBlur = 12;
      ctx.fillRect(leftP.x, leftP.y, leftP.width, leftP.height);
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#7c3aed";
      ctx.shadowColor = "rgba(124,58,237,0.6)";
      ctx.shadowBlur = 12;
      ctx.fillRect(rightP.x, rightP.y, rightP.width, rightP.height);
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius);
      grad.addColorStop(0, "#38f9ff");
      grad.addColorStop(1, "#2563eb");
      ctx.fillStyle = grad;
      ctx.shadowColor = "rgba(56,249,255,0.5)";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [gameActive, gameOver, resetBall]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between text-sm">
        <span className="font-medium text-foreground">Pong</span>
        <span className="text-muted">First to 5 wins</span>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="rounded-2xl border border-panel-border bg-[#071018] shadow-lg"
        style={{ maxWidth: "100%", height: "auto" }}
      />

      <div className="flex w-full items-center justify-between text-sm text-muted">
        <span>WASD or Arrow keys to move</span>
        {!gameActive && !gameOver && <span className="text-accent-cyan">Press Space to start</span>}
      </div>

      {gameOver ? (
        <div className="flex items-center gap-3">
          <span className="font-heading text-lg font-semibold text-foreground">Game Over</span>
          <button
            className="rounded-full border border-panel-border bg-white/80 px-4 py-1.5 text-sm font-medium transition hover:bg-white"
            onClick={startGame}
          >
            Play Again
          </button>
        </div>
      ) : null}
    </div>
  );
}