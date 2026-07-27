import { create } from "zustand";
import { generateId } from "@/lib/utils";
import { getApp } from "@/lib/apps";
import type { AppId, WindowState } from "@/types";

interface WindowStore {
  windows: WindowState[];
  focusedWindowId: string | null;
  nextZIndex: number;
  openWindow: (appId: AppId) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;
  getWindowByAppId: (appId: AppId) => WindowState | undefined;
}

const CASCADE_OFFSET = 30;
const VIEWPORT_PADDING = 16;
const DESKTOP_TOP_OFFSET = 96;
const DESKTOP_BOTTOM_OFFSET = 132;

function getViewportBounds() {
  if (typeof window === "undefined") {
    return {
      width: 1280,
      height: 820,
    };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  focusedWindowId: null,
  nextZIndex: 1,

  openWindow: (appId) => {
    const existing = get().getWindowByAppId(appId);
    if (existing) {
      if (existing.isMinimized) {
        set((s) => ({
          windows: s.windows.map((w) =>
            w.id === existing.id ? { ...w, isMinimized: false } : w
          ),
        }));
      }
      get().focusWindow(existing.id);
      return;
    }

    const app = getApp(appId);
    const openCount = get().windows.length;
    const id = generateId();
    const zIndex = get().nextZIndex;
    const viewport = getViewportBounds();
    const maxWidth = Math.max(320, viewport.width - VIEWPORT_PADDING * 2);
    const maxHeight = Math.max(
      260,
      viewport.height - DESKTOP_TOP_OFFSET - DESKTOP_BOTTOM_OFFSET
    );
    const width = Math.min(app.defaultWidth, maxWidth);
    const height = Math.min(app.defaultHeight, maxHeight);
    const centeredX = Math.max(
      VIEWPORT_PADDING,
      Math.round((viewport.width - width) / 2)
    );
    const centeredY = Math.max(
      DESKTOP_TOP_OFFSET,
      Math.round((viewport.height - height - DESKTOP_BOTTOM_OFFSET) / 2)
    );
    const cascadeX = (openCount % 5) * CASCADE_OFFSET;
    const cascadeY = (openCount % 4) * CASCADE_OFFSET;

    const newWindow: WindowState = {
      id,
      appId,
      title: app.name,
      x: Math.min(
        centeredX + cascadeX,
        viewport.width - width - VIEWPORT_PADDING
      ),
      y: Math.min(
        centeredY + cascadeY,
        viewport.height - height - DESKTOP_BOTTOM_OFFSET
      ),
      width,
      height,
      zIndex,
      isMinimized: false,
      isMaximized: false,
    };

    set((s) => ({
      windows: [...s.windows, newWindow],
      focusedWindowId: id,
      nextZIndex: zIndex + 1,
    }));
  },

  closeWindow: (id) =>
    set((s) => ({
      windows: s.windows.filter((w) => w.id !== id),
      focusedWindowId:
        s.focusedWindowId === id
          ? s.windows.filter((w) => w.id !== id).at(-1)?.id ?? null
          : s.focusedWindowId,
    })),

  focusWindow: (id) =>
    set((s) => {
      const zIndex = s.nextZIndex;
      return {
        windows: s.windows.map((w) =>
          w.id === id ? { ...w, zIndex } : w
        ),
        focusedWindowId: id,
        nextZIndex: zIndex + 1,
      };
    }),

  minimizeWindow: (id) =>
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true } : w
      ),
      focusedWindowId:
        s.focusedWindowId === id ? null : s.focusedWindowId,
    })),

  maximizeWindow: (id) =>
    set((s) => ({
      windows: s.windows.map((w) => {
        if (w.id !== id) return w;
        if (w.isMaximized) {
          return {
            ...w,
            isMaximized: false,
            ...(w.prevBounds ?? {}),
          };
        }
        return {
          ...w,
          isMaximized: true,
          prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
          x: VIEWPORT_PADDING,
          y: DESKTOP_TOP_OFFSET - 16,
          width:
            typeof window !== "undefined"
              ? window.innerWidth - VIEWPORT_PADDING * 2
              : 1200,
          height:
            typeof window !== "undefined"
              ? window.innerHeight - DESKTOP_TOP_OFFSET - 24
              : 700,
        };
      }),
    })),

  updateWindowPosition: (id, x, y) =>
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, x, y } : w)),
    })),

  updateWindowSize: (id, width, height) =>
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, width, height } : w
      ),
    })),

  getWindowByAppId: (appId) => get().windows.find((w) => w.appId === appId),
}));
