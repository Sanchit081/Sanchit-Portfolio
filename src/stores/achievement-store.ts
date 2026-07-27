import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Achievement } from "@/types";

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "boot",
    title: "Boot Complete",
    description: "Successfully booted Sanchit.OS",
    icon: "🚀",
    unlocked: false,
  },
  {
    id: "terminal",
    title: "Shell Explorer",
    description: "Opened the interactive terminal",
    icon: "💻",
    unlocked: false,
  },
  {
    id: "snake",
    title: "Snake Charmer",
    description: "Played Snake in the Arcade",
    icon: "🐍",
    unlocked: false,
  },
  {
    id: "all-apps",
    title: "Power User",
    description: "Visited every application",
    icon: "⭐",
    unlocked: false,
  },
  {
    id: "konami",
    title: "Secret Agent",
    description: "Discovered a hidden easter egg",
    icon: "🎮",
    unlocked: false,
  },
  {
    id: "contact",
    title: "Let's Connect",
    description: "Copied contact information",
    icon: "📬",
    unlocked: false,
  },
];

interface AchievementStore {
  achievements: Achievement[];
  visitedApps: string[];
  unlock: (id: string) => void;
  visitApp: (appId: string) => void;
  getUnlockedCount: () => number;
}

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      achievements: DEFAULT_ACHIEVEMENTS,
      visitedApps: [],

      unlock: (id) =>
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === id && !a.unlocked
              ? { ...a, unlocked: true, unlockedAt: Date.now() }
              : a
          ),
        })),

      visitApp: (appId) => {
        const visited = get().visitedApps.includes(appId)
          ? get().visitedApps
          : [...get().visitedApps, appId];

        set({ visitedApps: visited });

        if (visited.length >= 8) {
          get().unlock("all-apps");
        }
      },

      getUnlockedCount: () =>
        get().achievements.filter((a) => a.unlocked).length,
    }),
    { name: "sanchit-os-achievements" }
  )
);
