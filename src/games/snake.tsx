"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Point = { x: number; y: number };

const GRID = 16;
const CELL = 18;
const TICK = 120;

function randomFood(snake: Point[]): Point {
  let food: Point;
  do {
    food = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
    };
  } while (snake.some((s) => s.x === food.x && s.y === food.y));
  return food;
}

export function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>([{ x: 8, y: 8 }]);
  const [food, setFood] = useState<Point>(() => randomFood([{ x: 8, y: 8 }]));
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const directionRef = useRef<Direction>("RIGHT");

  const reset = useCallback(() => {
    const start = [{ x: 8, y: 8 }];
    setSnake(start);
    setFood(randomFood(start));
    setDirection("RIGHT");
    directionRef.current = "RIGHT";
    setScore(0);
    setPaused(false);
    setGameOver(false);
  }, []);

  const changeDirection = useCallback((next: Direction) => {
    const current = directionRef.current;
    const opposites: Record<Direction, Direction> = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT",
    };
    if (opposites[current] !== next) {
      directionRef.current = next;
      setDirection(next);
    }
  }, []);

  useEffect(() => {
    if (paused || gameOver) return;

    const timer = window.setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        const dir = directionRef.current;
        const next: Point = {
          x: head.x + (dir === "LEFT" ? -1 : dir === "RIGHT" ? 1 : 0),
          y: head.y + (dir === "UP" ? -1 : dir === "DOWN" ? 1 : 0),
        };

        if (
          next.x < 0 ||
          next.x >= GRID ||
          next.y < 0 ||
          next.y >= GRID ||
          prev.some((s) => s.x === next.x && s.y === next.y)
        ) {
          setGameOver(true);
          setHighScore((h) => Math.max(h, score));
          return prev;
        }

        const ate = next.x === food.x && next.y === food.y;
        const nextSnake = [next, ...prev];
        if (!ate) nextSnake.pop();
        else {
          setScore((s) => s + 10);
          setFood(randomFood(nextSnake));
        }
        return nextSnake;
      });
    }, TICK);

    return () => window.clearInterval(timer);
  }, [paused, gameOver, food, score]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const map: Record<string, Direction> = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        w: "UP",
        s: "DOWN",
        a: "LEFT",
        d: "RIGHT",
      };
      const next = map[event.key];
      if (next) {
        event.preventDefault();
        changeDirection(next);
      }
      if (event.key === " ") {
        event.preventDefault();
        if (gameOver) reset();
        else setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [changeDirection, gameOver, reset]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between text-sm">
        <span className="font-medium text-foreground">Score: {score}</span>
        <span className="text-muted">High: {highScore}</span>
        <button
          className="rounded-full border border-panel-border bg-white px-3 py-1 text-xs font-medium"
          onClick={() => (gameOver ? reset() : setPaused((p) => !p))}
        >
          {gameOver ? "Restart" : paused ? "Resume" : "Pause"}
        </button>
      </div>

      <div
        className="relative rounded-2xl border border-panel-border bg-[#0f172a] p-2 shadow-lg"
        style={{ width: GRID * CELL + 16, height: GRID * CELL + 16 }}
      >
        {Array.from({ length: GRID * GRID }, (_, i) => {
          const x = i % GRID;
          const y = Math.floor(i / GRID);
          const isSnake = snake.some((s) => s.x === x && s.y === y);
          const isHead = snake[0]?.x === x && snake[0]?.y === y;
          const isFood = food.x === x && food.y === y;

          return (
            <div
              key={i}
              className={cn(
                "absolute rounded-sm transition-colors",
                isHead && "bg-accent-cyan shadow-[0_0_8px_rgba(8,145,178,0.8)]",
                isSnake && !isHead && "bg-accent-blue",
                isFood && "bg-warning shadow-[0_0_8px_rgba(217,119,6,0.8)]"
              )}
              style={{
                left: x * CELL + 8,
                top: y * CELL + 8,
                width: CELL - 2,
                height: CELL - 2,
              }}
            />
          );
        })}

        {(paused || gameOver) && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 backdrop-blur-sm">
            <div className="text-center text-white">
              <div className="font-heading text-xl font-semibold">
                {gameOver ? "Game Over" : "Paused"}
              </div>
              <div className="mt-1 text-sm opacity-80">
                {gameOver ? "Press Restart or Space" : "Press Space to resume"}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 md:hidden">
        {(["UP", "LEFT", "DOWN", "RIGHT"] as Direction[]).map((dir) => (
          <button
            key={dir}
            className="rounded-xl border border-panel-border bg-white px-4 py-2 text-sm font-medium shadow-sm"
            onClick={() => changeDirection(dir)}
          >
            {dir === "UP" ? "↑" : dir === "DOWN" ? "↓" : dir === "LEFT" ? "←" : "→"}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted">
        Arrow keys or WASD to move • Space to pause
      </p>
    </div>
  );
}
