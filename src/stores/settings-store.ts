import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeMode } from "@/types";

interface SettingsState {
  animations: boolean;
  sound: boolean;
  music: boolean;
  cursor: boolean;
  reduceMotion: boolean;
  performanceMode: boolean;
  theme: ThemeMode;
  language: string;
  setSetting: <K extends keyof Omit<SettingsState, "setSetting">>(
    key: K,
    value: SettingsState[K]
  ) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      animations: true,
      sound: false,
      music: false,
      cursor: true,
      reduceMotion: false,
      performanceMode: false,
      theme: "default",
      language: "en",
      setSetting: (key, value) =>
        set((state) => ({
          ...state,
          [key]: value,
        })),
    }),
    {
      name: "sanchit-os-settings",
    }
  )
);
