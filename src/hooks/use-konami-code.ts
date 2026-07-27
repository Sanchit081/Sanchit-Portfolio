"use client";

import { useEffect } from "react";
import { useAchievementStore } from "@/stores/achievement-store";
import { useSettingsStore } from "@/stores/settings-store";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function useKonamiCode() {
  useEffect(() => {
    let index = 0;

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

      if (key === KONAMI[index]) {
        index += 1;
        if (index === KONAMI.length) {
          useSettingsStore.getState().setSetting("theme", "matrix");
          useAchievementStore.getState().unlock("konami");
          index = 0;
        }
        return;
      }

      index = key === KONAMI[0] ? 1 : 0;
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
