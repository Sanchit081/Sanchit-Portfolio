export type AppId =
  | "projects"
  | "experience"
  | "terminal"
  | "arcade"
  | "blog"
  | "resume"
  | "devops"
  | "ai-assistant"
  | "settings"
  | "about"
  | "contact"
  | "gallery"
  | "github"
  | "music";

export type ThemeMode = "default" | "matrix" | "retro" | "wireframe" | "night";

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  prevBounds?: { x: number; y: number; width: number; height: number };
}

export interface AppDefinition {
  id: AppId;
  name: string;
  icon: string;
  description: string;
  defaultWidth: number;
  defaultHeight: number;
  badge?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  github?: string;
  demo?: string;
  year: string;
  highlights: string[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
  achievements: string[];
  technologies: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  years: number;
  projects: string[];
  favoriteFeatures: string[];
  x: number;
  y: number;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readingTime: number;
}

export interface TerminalLine {
  id: string;
  type: "input" | "output" | "error" | "success";
  content: string;
}

export interface GameId {
  snake: "snake";
  pong: "pong";
  breakout: "breakout";
  "2048": "2048";
  memory: "memory";
  typing: "typing";
  reaction: "reaction";
  minesweeper: "minesweeper";
}

export type GameType = keyof GameId;

export interface CommandPaletteItem {
  id: string;
  label: string;
  category: "app" | "command" | "game" | "setting";
  action: () => void;
  keywords?: string[];
}
