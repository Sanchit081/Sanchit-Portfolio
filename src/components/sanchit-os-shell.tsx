"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useDeferredValue,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Bot,
  Briefcase,
  ChevronRight,
  Command,
  Copy,
  FolderKanban,
  Gamepad2,
  Globe,
  Images,
  Link2,
  Mail,
  Maximize2,
  Minimize2,
  MonitorPlay,
  Music,
  Search,
  Server,
  Settings,
  Sparkles,
  SquareTerminal,
  Star,
  Trophy,
  User,
  Wifi,
  X,
  type LucideIcon,
} from "lucide-react";
import { HomeScene } from "@/components/three/home-scene";
import { useKonamiCode } from "@/hooks/use-konami-code";
import { SnakeGame } from "@/games/snake";
import { PongGame } from "@/games/pong";
import { apps } from "@/lib/apps";
import { aiKnowledgeBase, blogPosts, experiences, profile, projects, skills } from "@/content/portfolio";
import { cn, clamp, generateId } from "@/lib/utils";
import { useAchievementStore } from "@/stores/achievement-store";
import { useWindowStore } from "@/stores/window-store";
import { useSettingsStore } from "@/stores/settings-store";
import type { AppId, CommandPaletteItem, TerminalLine, WindowState } from "@/types";

const BOOT_MESSAGES = [
  "Initializing Sanchit.OS...",
  "Loading Core Modules...",
  "Checking Network...",
  "Mounting Portfolio...",
  "Loading Interactive Engine...",
  "Done.",
  "Boot Successful.",
];

const ICONS: Record<string, LucideIcon> = {
  FolderKanban,
  Briefcase,
  Terminal: SquareTerminal,
  Gamepad2,
  BookOpen: MonitorPlay,
  FileText: MonitorPlay,
  Server,
  Bot,
  Settings,
  User,
  Mail,
  Images,
  Github: Globe,
  Globe,
  Music,
};

const TERMINAL_SUGGESTIONS = [
  "help",
  "projects",
  "neofetch",
  "sudo hire sanchit",
  "cat story.txt",
  "pong",
];

const TERMINAL_THEME_LABELS = {
  default: "Default",
  matrix: "Matrix",
  retro: "Retro",
  wireframe: "Wireframe",
  night: "Night",
} as const;

function getAssistantAnswer(question: string) {
  const normalized = question.toLowerCase();

  if (normalized.includes("project")) {
    return aiKnowledgeBase.projects;
  }

  if (normalized.includes("experience")) {
    return aiKnowledgeBase.experience;
  }

  if (normalized.includes("stack") || normalized.includes("skill")) {
    return aiKnowledgeBase.techStack;
  }

  if (normalized.includes("contact")) {
    return aiKnowledgeBase.contact;
  }

  if (normalized.includes("future")) {
    return aiKnowledgeBase.futureGoals;
  }

  return `${profile.bio}\n\nJourney:\n${aiKnowledgeBase.journey}`;
}

function runTerminalCommand(
  rawInput: string,
  theme: ReturnType<typeof useSettingsStore.getState>["theme"],
  setTheme: ReturnType<typeof useSettingsStore.getState>["setSetting"]
): TerminalLine[] {
  const input = rawInput.trim();
  const lower = input.toLowerCase();

  const baseInput: TerminalLine = {
    id: generateId(),
    type: "input",
    content: `visitor@sanchit:~$ ${rawInput}`,
  };

  const output = (type: TerminalLine["type"], content: string): TerminalLine[] => [
    baseInput,
    { id: generateId(), type, content },
  ];

  if (!input) {
    return [baseInput];
  }

  switch (lower) {
    case "help":
      return output(
        "output",
        "help, whoami, about, skills, projects, experience, contact, resume, github, linkedin, clear, history, theme, music, matrix, sudo hire sanchit, cat story.txt, fortune, date, neofetch, top, weather, snake, pong, exit"
      );
    case "whoami":
      return output("success", `${profile.name} // ${profile.title}`);
    case "about":
      return output("output", profile.bio);
    case "skills":
      return output("output", aiKnowledgeBase.skills);
    case "projects":
      return output("output", aiKnowledgeBase.projects);
    case "experience":
      return output("output", aiKnowledgeBase.experience);
    case "contact":
      return output("output", aiKnowledgeBase.contact);
    case "resume":
      return output("success", "Resume module ready. Open the Resume app from the dock.");
    case "github":
      return output("success", profile.github);
    case "linkedin":
      return output("success", profile.linkedin);
    case "theme":
      return output(
        "output",
        `Current theme: ${TERMINAL_THEME_LABELS[theme]}. Available: ${Object.keys(TERMINAL_THEME_LABELS).join(", ")}`
      );
    case "matrix":
      setTheme("theme", "matrix");
      return output("success", "Matrix mode enabled.");
    case "music":
      return output("output", "Ambient mode is muted by default. Enable Music in Settings.");
    case "sudo hire sanchit":
      return output("success", "Permission granted. Offer letter accepted in advance.");
    case "cat story.txt":
      return output("output", profile.story);
    case "fortune":
      return output("output", "Great interfaces feel inevitable only after the hard engineering is done.");
    case "date":
      return output("output", new Date().toString());
    case "neofetch":
      return output(
        "success",
        `Sanchit.OS\nEngineer: ${profile.name}\nRole: ${profile.title}\nStack: ${aiKnowledgeBase.techStack}\nLocation: ${profile.location}`
      );
    case "top":
      return output("output", "CPU calm • Memory optimized • Curiosity at 100%");
    case "weather":
      return output("output", "Conditions: clear focus, low latency, high craftsmanship.");
    case "snake":
    case "pong":
      return output("success", "Open Arcade from the dock to play.");
    case "exit":
      return output("output", "There is nowhere better to be. Shell retained.");
    case "clear":
      return [];
    default:
      return output("error", `Command not found: ${rawInput}. Try 'help'.`);
  }
}

function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return now;
}

export function SanchitOsShell() {
  const [bootIndex, setBootIndex] = useState(0);
  const [bootDone, setBootDone] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const now = useClock();
  useKonamiCode();

  const onGlobalKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      setCommandPaletteOpen((value) => !value);
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", onGlobalKeyDown);
    return () => window.removeEventListener("keydown", onGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (bootDone) {
      useAchievementStore.getState().unlock("boot");
      return;
    }

    const timer = window.setTimeout(() => {
      setBootIndex((value) => {
        const next = value + 1;
        if (next >= BOOT_MESSAGES.length) {
          window.setTimeout(() => setBootDone(true), 350);
        }
        return next;
      });
    }, 420);

    return () => window.clearTimeout(timer);
  }, [bootDone, bootIndex]);

  if (!bootDone) {
    return (
      <BootScreen
        lines={BOOT_MESSAGES.slice(0, bootIndex)}
        onSkip={() => {
          setBootIndex(BOOT_MESSAGES.length);
          setBootDone(true);
        }}
      />
    );
  }

  return (
    <DesktopShell
      now={now}
      commandPaletteOpen={commandPaletteOpen}
      onCommandPaletteOpenChange={setCommandPaletteOpen}
    />
  );
}

function BootScreen({
  lines,
  onSkip,
}: {
  lines: string[];
  onSkip: () => void;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background px-6 py-8 text-foreground">
      <button
        className="absolute right-6 top-6 rounded-full border border-panel-border bg-white px-4 py-2 text-xs uppercase tracking-[0.28em] text-muted transition hover:border-accent-blue/30 hover:text-foreground"
        onClick={onSkip}
      >
        Skip
      </button>

      <div className="mx-auto flex w-full max-w-5xl flex-1 items-center">
        <div className="glass-panel w-full rounded-[28px] p-6 md:p-10">
          <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-muted">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent-blue" />
            Boot Console
          </div>
          <div className="space-y-3 font-mono text-sm text-foreground/85 md:text-base">
            {lines.map((line) => (
              <div key={line} className="flex items-center gap-3">
                <span className="text-accent-cyan">$</span>
                <span>{line}</span>
              </div>
            ))}
            <div className="h-5 w-3 animate-pulse rounded-sm bg-accent-blue" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopShell({
  now,
  commandPaletteOpen,
  onCommandPaletteOpenChange,
}: {
  now: Date;
  commandPaletteOpen: boolean;
  onCommandPaletteOpenChange: (open: boolean) => void;
}) {
  const { openWindow, windows } = useWindowStore();
  const unlockedCount = useAchievementStore((s) => s.getUnlockedCount());

  const handleOpenApp = useCallback((appId: AppId) => {
    openWindow(appId);
    useAchievementStore.getState().visitApp(appId);
    if (appId === "terminal") {
      useAchievementStore.getState().unlock("terminal");
    }
  }, [openWindow]);

  const time = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(now),
    [now]
  );

  const date = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(now),
    [now]
  );

  const commandItems = useMemo<CommandPaletteItem[]>(
    () => [
      ...apps.map((app) => ({
        id: app.id,
        label: app.name,
        category: "app" as const,
        action: () => handleOpenApp(app.id),
        keywords: [app.description],
      })),
      {
        id: "command-matrix",
        label: "Enable Matrix Theme",
        category: "command",
        action: () => useSettingsStore.getState().setSetting("theme", "matrix"),
      },
      {
        id: "game-snake",
        label: "Launch Snake",
        category: "game",
        action: () => handleOpenApp("arcade"),
      },
    ],
    [handleOpenApp]
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <HomeScene onOpenApp={handleOpenApp} />

      <div className="pointer-events-none relative z-10 flex min-h-screen flex-col">
        <section className="flex flex-1 flex-col px-4 pb-36 pt-4 md:px-6 md:pb-40">
          <TopBar date={date} time={time} achievements={unlockedCount} />

          <div className="mt-auto max-w-2xl pb-4">
            <HeroOverlay
              onOpenProjects={() => handleOpenApp("projects")}
              onOpenTerminal={() => handleOpenApp("terminal")}
            />
          </div>
        </section>
      </div>

      <WindowLayer />
      <Dock onOpenApp={handleOpenApp} />

      <AnimatePresence>
        {commandPaletteOpen ? (
          <CommandPalette
            items={commandItems}
            onClose={() => onCommandPaletteOpenChange(false)}
          />
        ) : null}
      </AnimatePresence>

      {windows.length === 0 ? (
        <div className="pointer-events-none absolute bottom-28 right-6 z-10 hidden rounded-2xl glass-panel px-4 py-3 text-sm text-muted lg:block">
          Click a 3D node, or press{" "}
          <span className="font-mono text-foreground">Cmd/Ctrl + K</span>
        </div>
      ) : null}
    </main>
  );
}

function TopBar({
  date,
  time,
  achievements,
}: {
  date: string;
  time: string;
  achievements: number;
}) {
  return (
    <div className="glass-panel pointer-events-auto flex items-center justify-between rounded-[24px] px-4 py-3">
      <div>
        <div className="font-heading text-lg font-semibold">Sanchit.OS</div>
        <div className="text-sm text-muted">{date}</div>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="hidden items-center gap-2 rounded-full border border-panel-border bg-background-secondary0 px-3 py-1.5 md:inline-flex">
          <Trophy className="h-4 w-4 text-warning" />
          {achievements} badges
        </span>
        <span className="hidden items-center gap-2 rounded-full border border-panel-border bg-background-secondary0 px-3 py-1.5 md:inline-flex">
          <Wifi className="h-4 w-4 text-success" />
          Online
        </span>
        <span className="font-mono text-lg font-medium">{time}</span>
      </div>
    </div>
  );
}

function HeroOverlay({
  onOpenProjects,
  onOpenTerminal,
}: {
  onOpenProjects: () => void;
  onOpenTerminal: () => void;
}) {
  return (
    <div className="glass-panel pointer-events-auto rounded-[34px] p-6 md:p-8">
      <div className="inline-flex items-center gap-2 rounded-full border border-accent-blue/20 bg-accent-blue/8 px-3 py-1 text-xs uppercase tracking-[0.28em] text-accent-blue">
        <Sparkles className="h-3.5 w-3.5" />
        Interactive 3D Portfolio
      </div>

      <div className="mt-5 max-w-xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-5xl">
          Explore my work in three dimensions.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">
          Move your cursor to shift the camera. Click floating nodes to open apps,
          or use the dock below. Every panel is a window you can drag and resize.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          className="rounded-full bg-accent-blue px-5 py-3 text-sm font-medium text-white shadow-soft transition hover:bg-[#1d4ed8]"
          onClick={onOpenProjects}
        >
          Explore Projects
        </button>
        <button
          className="rounded-full border border-panel-border bg-white/80 px-5 py-3 text-sm font-medium transition hover:bg-white"
          onClick={onOpenTerminal}
        >
          Open Terminal
        </button>
      </div>
    </div>
  );
}

function Dock({ onOpenApp }: { onOpenApp: (appId: AppId) => void }) {
  return (
    <div className="fixed bottom-3 left-1/2 z-40 w-[min(calc(100vw-1rem),960px)] -translate-x-1/2 px-1.5 md:bottom-5 md:w-[min(calc(100vw-1.5rem),960px)] md:px-2">
      <div className="glass-panel flex items-center justify-start gap-1.5 overflow-x-auto rounded-[28px] px-2.5 py-2.5 md:justify-center md:gap-2 md:px-4 md:py-3 scrollbar-thin">
        {apps.map((app) => {
          const Icon = ICONS[app.icon] ?? Sparkles;

          return (
            <button
              key={app.id}
              className="group flex min-w-11 shrink-0 flex-col items-center gap-1 rounded-2xl px-2 py-1.5 transition hover:-translate-y-2 hover:bg-accent-blue/8 md:min-w-15 md:gap-2 md:px-2 md:py-2"
              onClick={() => onOpenApp(app.id)}
              aria-label={`Open ${app.name}`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm transition group-hover:scale-110 group-hover:text-accent-blue md:h-11 md:w-11">
                <Icon className="h-4.5 w-4.5 text-foreground md:h-5 md:w-5" />
              </div>
              <span className="hidden text-[11px] text-muted md:block">{app.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WindowLayer() {
  const { windows } = useWindowStore();

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      <AnimatePresence>
        {windows.filter((window) => !window.isMinimized).map((window) => (
          <WindowFrame key={window.id} window={window} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function WindowFrame({ window: windowState }: { window: WindowState }) {
  const {
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    updateWindowPosition,
    updateWindowSize,
    focusedWindowId,
  } = useWindowStore();
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (windowState.isMaximized) return;
    setDragging(true);
    focusWindow(windowState.id);

    const startX = event.clientX;
    const startY = event.clientY;
    const initialX = windowState.x;
    const initialY = windowState.y;

    const handleMove = (moveEvent: PointerEvent) => {
      const x = clamp(initialX + (moveEvent.clientX - startX), 16, globalThis.innerWidth - 280);
      const y = clamp(initialY + (moveEvent.clientY - startY), 16, globalThis.innerHeight - 180);
      updateWindowPosition(windowState.id, x, y);
    };

    const handleUp = () => {
      setDragging(false);
      globalThis.removeEventListener("pointermove", handleMove);
      globalThis.removeEventListener("pointerup", handleUp);
    };

    globalThis.addEventListener("pointermove", handleMove);
    globalThis.addEventListener("pointerup", handleUp);
  };

  const startResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    focusWindow(windowState.id);

    const startX = event.clientX;
    const startY = event.clientY;
    const initialWidth = windowState.width;
    const initialHeight = windowState.height;

    const handleMove = (moveEvent: PointerEvent) => {
      const width = clamp(initialWidth + (moveEvent.clientX - startX), 320, globalThis.innerWidth - 32);
      const height = clamp(initialHeight + (moveEvent.clientY - startY), 240, globalThis.innerHeight - 48);
      updateWindowSize(windowState.id, width, height);
    };

    const handleUp = () => {
      globalThis.removeEventListener("pointermove", handleMove);
      globalThis.removeEventListener("pointerup", handleUp);
    };

    globalThis.addEventListener("pointermove", handleMove);
    globalThis.addEventListener("pointerup", handleUp);
  };

  return (
    <motion.div
      ref={frameRef}
      layout
      initial={{ opacity: 0, scale: 0.94, y: 26, rotateX: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 16, rotateX: -4 }}
      transition={{ type: "spring", stiffness: 180, damping: 22, mass: 0.9 }}
      onMouseDown={() => focusWindow(windowState.id)}
      className="pointer-events-auto absolute overflow-hidden rounded-[28px] border border-panel-border bg-white/95 shadow-2xl shadow-slate-200/60 backdrop-blur-xl"
      style={{
        left: windowState.x,
        top: windowState.y,
        width: windowState.width,
        height: windowState.height,
        zIndex: windowState.zIndex,
      }}
    >
      <div className="flex h-full flex-col">
        <div
          className={cn(
            "flex items-center justify-between border-b border-panel-border bg-background-secondary/50 px-4 py-3",
            dragging && "cursor-grabbing",
            !dragging && "cursor-grab"
          )}
          onPointerDown={startDrag}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                className="h-3 w-3 rounded-full bg-error"
                onClick={() => closeWindow(windowState.id)}
                aria-label={`Close ${windowState.title}`}
              />
              <button
                className="h-3 w-3 rounded-full bg-warning"
                onClick={() => minimizeWindow(windowState.id)}
                aria-label={`Minimize ${windowState.title}`}
              />
              <button
                className="h-3 w-3 rounded-full bg-success"
                onClick={() => maximizeWindow(windowState.id)}
                aria-label={`Maximize ${windowState.title}`}
              />
            </div>
            <div>
              <div className="font-heading text-sm font-medium text-foreground">{windowState.title}</div>
              <div className="text-xs text-muted">
                {focusedWindowId === windowState.id ? "Focused window" : "Background window"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted">
            <button
              className="rounded-lg p-2 transition hover:bg-background-secondary hover:text-foreground"
              onClick={() => minimizeWindow(windowState.id)}
              aria-label="Minimize window"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button
              className="rounded-lg p-2 transition hover:bg-background-secondary hover:text-foreground"
              onClick={() => maximizeWindow(windowState.id)}
              aria-label="Maximize window"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              className="rounded-lg p-2 transition hover:bg-background-secondary hover:text-foreground"
              onClick={() => closeWindow(windowState.id)}
              aria-label="Close window"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="scrollbar-thin flex-1 overflow-auto bg-white/50">
          <WindowContent appId={windowState.appId} />
        </div>

        {!windowState.isMaximized ? (
          <button
            className="absolute bottom-2 right-2 h-5 w-5 cursor-se-resize rounded-md border border-panel-border bg-white/5"
            onPointerDown={startResize}
            aria-label="Resize window"
          />
        ) : null}
      </div>
    </motion.div>
  );
}

function WindowContent({ appId }: { appId: AppId }) {
  switch (appId) {
    case "projects":
      return <ProjectsApp />;
    case "experience":
      return <ExperienceApp />;
    case "terminal":
      return <TerminalApp />;
    case "devops":
      return <DevOpsLabApp />;
    case "ai-assistant":
      return <AiAssistantApp />;
    case "settings":
      return <SettingsApp />;
    case "about":
      return <AboutApp />;
    case "contact":
      return <ContactApp />;
    case "arcade":
      return <ArcadeApp />;
    case "blog":
      return <BlogApp />;
    case "github":
      return <GithubApp />;
    case "gallery":
      return <GalleryApp />;
    case "music":
      return <MusicApp />;
    case "resume":
      return <ResumeApp />;
    default:
      return <PlaceholderApp appId={appId} />;
  }
}

function ProjectsApp() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const filteredProjects = useMemo(() => {
    const value = deferredQuery.toLowerCase();
    return projects.filter((project) => {
      return (
        project.title.toLowerCase().includes(value) ||
        project.description.toLowerCase().includes(value) ||
        project.tags.some((tag) => tag.toLowerCase().includes(value))
      );
    });
  }, [deferredQuery]);

  const featured = filteredProjects[0];

  return (
    <div className="grid h-full gap-0 lg:grid-cols-[0.92fr_1.08fr]">
      <div className="border-b border-panel-border p-5 lg:border-b-0 lg:border-r">
        <div className="rounded-2xl border border-panel-border bg-white/70 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Search className="h-4 w-4" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent outline-none placeholder:text-muted"
              placeholder="Search projects, stacks, lessons..."
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {filteredProjects.map((project) => (
            <div key={project.id} className="rounded-[24px] border border-panel-border bg-background-secondary/50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-heading text-xl font-semibold">{project.title}</div>
                  <p className="mt-2 text-sm leading-6 text-muted">{project.description}</p>
                </div>
                <div className="rounded-full border border-panel-border px-3 py-1 text-xs text-muted">
                  {project.year}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-background-secondary px-3 py-1 text-xs uppercase tracking-[0.22em] text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5">
        {featured ? (
          <div className="space-y-5">
            <div className="rounded-[28px] border border-panel-border bg-[linear-gradient(135deg,rgba(79,156,249,0.18),rgba(124,92,252,0.05))] p-6">
              <div className="text-xs uppercase tracking-[0.28em] text-muted">Featured Build</div>
              <div className="mt-3 font-heading text-3xl font-semibold">{featured.title}</div>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{featured.description}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-panel-border bg-white/70 p-5">
                <div className="font-heading text-lg font-semibold">Highlights</div>
                <div className="mt-4 space-y-3">
                  {featured.highlights.map((item) => (
                    <div key={item} className="flex gap-3 text-sm leading-6 text-muted">
                      <Star className="mt-1 h-4 w-4 shrink-0 text-accent-cyan" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-panel-border bg-white/70 p-5">
                <div className="font-heading text-lg font-semibold">System Notes</div>
                <div className="mt-4 space-y-3 text-sm text-muted">
                  <div className="rounded-2xl border border-panel-border bg-background-secondary/50 px-4 py-3">
                    Window manager with focus-aware z-index and cascading placement.
                  </div>
                  <div className="rounded-2xl border border-panel-border bg-background-secondary/50 px-4 py-3">
                    Commandable UI that keeps resume, contact, and projects easy to reach.
                  </div>
                  <div className="rounded-2xl border border-panel-border bg-background-secondary/50 px-4 py-3">
                    Built to scale into games, blog, and heavier interactive modules progressively.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState title="No matching projects" description="Try a different keyword." />
        )}
      </div>
    </div>
  );
}

function ExperienceApp() {
  return (
    <div className="space-y-4 p-5">
      {experiences.map((experience) => (
        <div
          key={experience.id}
          className="rounded-[28px] border border-panel-border bg-background-secondary/50 p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-heading text-2xl font-semibold">{experience.role}</div>
              <div className="mt-1 text-muted">{experience.company}</div>
            </div>
            <div className="rounded-full border border-panel-border px-4 py-1.5 text-xs uppercase tracking-[0.24em] text-muted">
              {experience.period}
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{experience.description}</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.7fr]">
            <div className="space-y-3">
              {experience.achievements.map((achievement) => (
                <div
                  key={achievement}
                  className="rounded-2xl border border-panel-border bg-white/70 px-4 py-3 text-sm text-muted"
                >
                  {achievement}
                </div>
              ))}
            </div>
            <div className="rounded-[24px] border border-panel-border bg-white/70 p-4">
              <div className="text-sm text-muted">Core Technologies</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {experience.technologies.map((technology) => (
                  <span
                    key={technology}
                    className="rounded-full bg-background-secondary px-3 py-1 text-xs uppercase tracking-[0.22em] text-muted"
                  >
                    {technology}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TerminalApp() {
  const theme = useSettingsStore((state) => state.theme);
  const setSetting = useSettingsStore((state) => state.setSetting);
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: generateId(),
      type: "success",
      content: "Sanchit.OS shell ready. Type 'help' to explore.",
    },
  ]);

  const onSubmit = () => {
    const result = runTerminalCommand(input, theme, setSetting);
    setLines((current) => [...current, ...result]);
    if (input.trim()) {
      setCommandHistory((current) => [...current, input]);
    }
    setHistoryIndex(null);
    setInput("");
  };

  return (
    <div className="flex h-full flex-col bg-[#071018] text-sm text-[#d7f5ff]">
      <div className="border-b border-panel-border px-4 py-3 font-mono text-xs text-[#75d5ff]">
        visitor@sanchit:~$ interactive shell
      </div>
      <div className="scrollbar-thin flex-1 space-y-2 overflow-auto p-4 font-mono">
        {lines.map((line) => (
          <div
            key={line.id}
            className={cn(
              line.type === "input" && "text-white",
              line.type === "error" && "text-error",
              line.type === "success" && "text-success",
              line.type === "output" && "text-[#b9d3df]"
            )}
          >
            {line.content}
          </div>
        ))}
      </div>
      <div className="border-t border-panel-border px-4 py-3">
        <label className="flex items-center gap-3 font-mono">
          <span className="text-[#38f9ff]">visitor@sanchit:~$</span>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSubmit();
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                const nextIndex =
                  historyIndex === null
                    ? commandHistory.length - 1
                    : Math.max(historyIndex - 1, 0);
                const nextValue = commandHistory[nextIndex];
                if (nextValue) {
                  setHistoryIndex(nextIndex);
                  setInput(nextValue);
                }
              }

              if (event.key === "ArrowDown") {
                event.preventDefault();
                if (historyIndex === null) {
                  return;
                }
                const nextIndex = historyIndex + 1;
                if (nextIndex >= commandHistory.length) {
                  setHistoryIndex(null);
                  setInput("");
                  return;
                }
                setHistoryIndex(nextIndex);
                setInput(commandHistory[nextIndex] ?? "");
              }

              if (event.key === "Tab") {
                event.preventDefault();
                const match = TERMINAL_SUGGESTIONS.find((item) => item.startsWith(input));
                if (match) {
                  setInput(match);
                }
              }
            }}
            className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/25"
            placeholder="Try neofetch, projects, or sudo hire sanchit"
            aria-label="Terminal command input"
          />
        </label>
      </div>
    </div>
  );
}

function DevOpsLabApp() {
  const [deploying, setDeploying] = useState(false);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!deploying) return;

    if (stage >= 5) {
      const timer = window.setTimeout(() => {
        setDeploying(false);
        setStage(0);
      }, 1200);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setStage((current) => current + 1);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [deploying, stage]);

  const nodes = ["Internet", "Cloudflare", "Load Balancer", "Docker", "Node.js", "Redis", "MongoDB"];

  return (
    <div className="space-y-5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-heading text-2xl font-semibold">Deployment Architecture</div>
          <div className="mt-2 text-sm text-muted">
            A compact systems map of how requests move through infrastructure.
          </div>
        </div>
        <button
          className="rounded-full bg-accent-purple px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#9479ff]"
          onClick={() => {
            setDeploying(true);
            setStage(0);
          }}
        >
          Trigger Simulated Deploy
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[30px] border border-panel-border bg-background-secondary/50 p-5">
          <div className="space-y-4">
            {nodes.map((node, index) => {
              const active = deploying && stage >= index;
              return (
                <div key={node} className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-13 w-13 items-center justify-center rounded-2xl border border-panel-border bg-white/5",
                      active && "border-accent-cyan/40 bg-accent-cyan/14 text-accent-cyan"
                    )}
                  >
                    <Server className="h-5 w-5" />
                  </div>
                  <div className="flex-1 rounded-2xl border border-panel-border bg-white/70 px-4 py-4">
                    <div className="font-medium text-foreground">{node}</div>
                    <div className="mt-1 text-sm text-muted">
                      {index === 0
                        ? "Ingress traffic and public requests."
                        : index === nodes.length - 1
                          ? "Persistent data and event history."
                          : "Resilient processing layer with observability hooks."}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[30px] border border-panel-border bg-white/70 p-5">
          <div className="font-heading text-lg font-semibold">Pipeline Feed</div>
          <div className="mt-4 space-y-3 text-sm text-muted">
            {[
              "GitHub Actions validates types and linting.",
              "Docker build ships a lean production image.",
              "Traffic is warmed through cache-aware rollout.",
              "Health checks gate the live switch.",
              "Logs and metrics stream into the dashboard.",
            ].map((log, index) => (
              <div
                key={log}
                className={cn(
                  "rounded-2xl border border-panel-border bg-background-secondary/50 px-4 py-3 transition",
                  deploying && stage >= index && "border-success/30 text-foreground"
                )}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AiAssistantApp() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [streaming, setStreaming] = useState(false);

  const ask = (value: string) => {
    const nextAnswer = getAssistantAnswer(value);
    setQuestion(value);
    setAnswer("");
    setStreaming(true);

    let index = 0;
    const timer = window.setInterval(() => {
      index += 3;
      setAnswer(nextAnswer.slice(0, index));
      if (index >= nextAnswer.length) {
        setStreaming(false);
        window.clearInterval(timer);
      }
    }, 24);
  };

  return (
    <div className="flex h-full flex-col p-5">
      <div className="rounded-[28px] border border-panel-border bg-[linear-gradient(135deg,rgba(79,156,249,0.16),rgba(56,249,255,0.05))] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-accent-cyan">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="font-heading text-xl font-semibold">Personal Knowledge Agent</div>
            <div className="text-sm text-muted">Ask about projects, experience, goals, and stack.</div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          "What projects have you built?",
          "Tell me about your experience",
          "What's your tech stack?",
          "What are your future goals?",
        ].map((item) => (
          <button
            key={item}
            className="rounded-full border border-panel-border bg-white/80 px-4 py-2 text-sm text-foreground transition hover:bg-white"
            onClick={() => ask(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-4 flex-1 rounded-[28px] border border-panel-border bg-background-secondary/50 p-5">
        {question ? (
          <>
            <div className="text-sm text-muted">Prompt</div>
            <div className="mt-2 text-foreground">{question}</div>
            <div className="mt-5 text-sm text-muted">Response</div>
            <div className="mt-2 whitespace-pre-line text-sm leading-7 text-foreground/85">
              {answer}
              {streaming ? <span className="animate-pulse">|</span> : null}
            </div>
          </>
        ) : (
          <EmptyState
            title="Start a conversation"
            description="Suggested prompts are ready above, and replies stream locally from the portfolio knowledge base."
          />
        )}
      </div>
    </div>
  );
}

function SettingsApp() {
  const {
    animations,
    sound,
    music,
    cursor,
    reduceMotion,
    performanceMode,
    theme,
    setSetting,
  } = useSettingsStore();

  const toggles = [
    ["animations", "Animations", animations],
    ["sound", "Sound", sound],
    ["music", "Music", music],
    ["cursor", "Cursor Effects", cursor],
    ["reduceMotion", "Reduce Motion", reduceMotion],
    ["performanceMode", "Performance Mode", performanceMode],
  ] as const;

  return (
    <div className="space-y-5 p-5">
      <div className="rounded-[28px] border border-panel-border bg-white/70 p-5">
        <div className="font-heading text-2xl font-semibold">System Preferences</div>
        <div className="mt-2 text-sm text-muted">
          Tune the experience for motion, audio, and theme preference.
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[28px] border border-panel-border bg-background-secondary/50 p-5">
          <div className="font-heading text-lg font-semibold">Toggles</div>
          <div className="mt-4 space-y-3">
            {toggles.map(([key, label, value]) => (
              <button
                key={key}
                className="flex w-full items-center justify-between rounded-2xl border border-panel-border bg-white/70 px-4 py-3 text-left"
                onClick={() => setSetting(key, !value)}
              >
                <span className="text-foreground">{label}</span>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs uppercase tracking-[0.22em]",
                    value ? "bg-success/16 text-success" : "bg-white/8 text-muted"
                  )}
                >
                  {value ? "On" : "Off"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-panel-border bg-background-secondary/50 p-5">
          <div className="font-heading text-lg font-semibold">Themes</div>
          <div className="mt-4 grid gap-3">
            {Object.entries(TERMINAL_THEME_LABELS).map(([value, label]) => (
              <button
                key={value}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition",
                  theme === value
                    ? "border-accent-blue/40 bg-accent-blue/12 text-foreground"
                    : "border-panel-border bg-white/70 text-muted"
                )}
                onClick={() => setSetting("theme", value as typeof theme)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AboutApp() {
  return (
    <div className="grid gap-4 p-5 lg:grid-cols-[0.88fr_1.12fr]">
      <div className="rounded-[28px] border border-panel-border bg-[linear-gradient(135deg,rgba(124,92,252,0.2),rgba(79,156,249,0.06))] p-5">
        <div className="text-xs uppercase tracking-[0.28em] text-muted">Profile</div>
        <div className="mt-3 font-heading text-3xl font-semibold">{profile.name}</div>
        <div className="mt-1 text-muted">{profile.title}</div>
        <p className="mt-5 text-sm leading-7 text-muted">{profile.bio}</p>
        <p className="mt-4 text-sm leading-7 text-muted">{profile.story}</p>
      </div>

      <div className="rounded-[28px] border border-panel-border bg-background-secondary/50 p-5">
        <div className="font-heading text-2xl font-semibold">Skills Constellation</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {skills.map((skill) => (
            <div key={skill.id} className="rounded-2xl border border-panel-border bg-white/70 p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium text-foreground">{skill.name}</div>
                <div className="text-sm text-muted">{skill.years} yrs</div>
              </div>
              <div className="mt-2 text-sm text-muted">{skill.category}</div>
              <div className="mt-4 text-xs uppercase tracking-[0.22em] text-muted">Favorite Features</div>
              <div className="mt-2 text-sm leading-6 text-muted">
                {skill.favoriteFeatures.join(" • ")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContactApp() {
  const [copied, setCopied] = useState(false);
  const contactItems: { icon: LucideIcon; label: string; href: string }[] = [
    { icon: Mail, label: profile.email, href: `mailto:${profile.email}` },
    { icon: Globe, label: "GitHub", href: profile.github },
    { icon: Link2, label: "LinkedIn", href: profile.linkedin },
  ];

  return (
    <div className="grid gap-4 p-5 lg:grid-cols-[1fr_0.9fr]">
      <div className="rounded-[28px] border border-panel-border bg-background-secondary/50 p-5">
        <div className="font-heading text-2xl font-semibold">Let&apos;s build something memorable.</div>
        <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
          The fastest route is still the best route. Use email for serious conversations,
          LinkedIn for quick context, and GitHub if you want to inspect code.
        </p>

        <div className="mt-6 space-y-3">
          {contactItems.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              className="flex items-center justify-between rounded-2xl border border-panel-border bg-white/70 px-4 py-4 transition hover:bg-white/8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8">
                  <Icon className="h-4 w-4" />
                </div>
                <span>{label}</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted" />
            </a>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-panel-border bg-white/70 p-5">
        <div className="font-heading text-lg font-semibold">Quick Action</div>
        <button
          className="mt-4 flex w-full items-center justify-between rounded-2xl border border-accent-cyan/20 bg-accent-cyan/10 px-4 py-4 text-left"
          onClick={async () => {
            await navigator.clipboard.writeText(profile.email);
            setCopied(true);
            useAchievementStore.getState().unlock("contact");
            window.setTimeout(() => setCopied(false), 1400);
          }}
        >
          <div>
            <div className="text-sm text-muted">Copy Email</div>
            <div className="mt-1 text-foreground">{profile.email}</div>
          </div>
          <Copy className="h-4 w-4 text-accent-cyan" />
        </button>
        <div className="mt-4 rounded-2xl border border-panel-border bg-background-secondary/50 px-4 py-3 text-sm text-muted">
          {copied ? "Email copied successfully." : "Response-friendly and happy to collaborate."}
        </div>
      </div>
    </div>
  );
}

function ArcadeApp() {
  const achievements = useAchievementStore((s) => s.achievements);

  useEffect(() => {
    useAchievementStore.getState().unlock("snake");
  }, []);

  return (
    <div className="grid gap-4 p-5 lg:grid-cols-[1fr_0.9fr]">
      <div className="space-y-4">
        <div className="rounded-[28px] border border-panel-border bg-background-secondary/50 p-5">
          <div className="font-heading text-xl font-semibold">Snake</div>
          <div className="mt-2 text-sm text-muted">
            Fully playable with keyboard and touch controls.
          </div>
          <div className="mt-5">
            <SnakeGame />
          </div>
        </div>
        <div className="rounded-[28px] border border-panel-border bg-background-secondary/50 p-5">
          <div className="font-heading text-xl font-semibold">Pong</div>
          <div className="mt-2 text-sm text-muted">
            Classic arcade game against the AI. First to 5 wins.
          </div>
          <div className="mt-5">
            <PongGame />
          </div>
        </div>
      </div>
      <div className="rounded-[28px] border border-panel-border bg-background-secondary0 p-5">
        <div className="font-heading text-lg font-semibold">Achievements</div>
        <div className="mt-4 space-y-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm",
                achievement.unlocked
                  ? "border-success/30 bg-success/5 text-foreground"
                  : "border-panel-border bg-background-secondary/30 text-muted"
              )}
            >
              <span className="text-lg">{achievement.icon}</span>
              <div>
                <div className="font-medium">{achievement.title}</div>
                <div className="text-xs">{achievement.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlogApp() {
  return (
    <div className="space-y-4 p-5">
      {blogPosts.map((post) => (
        <div key={post.slug} className="rounded-[28px] border border-panel-border bg-background-secondary/50 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="font-heading text-2xl font-semibold">{post.title}</div>
            <div className="text-xs uppercase tracking-[0.24em] text-muted">{post.category}</div>
          </div>
          <p className="mt-3 text-sm leading-7 text-muted">{post.excerpt}</p>
          <div className="mt-4 text-sm text-muted">
            {post.date} • {post.readingTime} min read
          </div>
        </div>
      ))}
    </div>
  );
}

function GithubApp() {
  return (
    <div className="grid gap-4 p-5 lg:grid-cols-[1fr_0.85fr]">
      <div className="rounded-[28px] border border-panel-border bg-background-secondary/50 p-5">
        <div className="font-heading text-2xl font-semibold">Open Source Snapshot</div>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {Array.from({ length: 49 }, (_, index) => (
            <div
              key={index}
              className="aspect-square rounded-md"
              style={{
                background:
                  index % 5 === 0
                    ? "rgba(56, 249, 255, 0.88)"
                    : index % 3 === 0
                      ? "rgba(79, 156, 249, 0.48)"
                      : "rgba(255,255,255,0.06)",
              }}
            />
          ))}
        </div>
      </div>
      <div className="rounded-[28px] border border-panel-border bg-white/70 p-5">
        <div className="font-heading text-lg font-semibold">Pinned Themes</div>
        <div className="mt-4 space-y-3 text-sm text-muted">
          <div className="rounded-2xl border border-panel-border bg-background-secondary/50 px-4 py-3">
            Interactive frontend systems
          </div>
          <div className="rounded-2xl border border-panel-border bg-background-secondary/50 px-4 py-3">
            Performance-first React architecture
          </div>
          <div className="rounded-2xl border border-panel-border bg-background-secondary/50 px-4 py-3">
            Developer tooling and automation
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumeApp() {
  return (
    <div className="grid gap-4 p-5 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-[28px] border border-panel-border bg-white/70 p-5">
        <div className="font-heading text-2xl font-semibold">Resume Module</div>
        <p className="mt-3 text-sm leading-7 text-muted">
          This window is designed to host an embedded resume, timeline, and downloadable PDF.
        </p>
        <a
          href={`mailto:${profile.email}`}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent-blue px-4 py-2.5 text-sm font-medium text-white"
        >
          Request Resume
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
      <div className="rounded-[28px] border border-dashed border-panel-border bg-background-secondary/50 p-5">
        <div className="flex h-full min-h-72 items-center justify-center rounded-[22px] border border-panel-border bg-background-secondary/30 text-sm text-muted">
          Embedded viewer placeholder ready for PDF or MDX timeline content.
        </div>
      </div>
    </div>
  );
}

function GalleryApp() {
  return (
    <div className="space-y-4 p-5">
      <div className="rounded-[28px] border border-panel-border bg-[linear-gradient(135deg,rgba(79,156,249,0.16),rgba(124,92,252,0.05))] p-5">
        <div className="font-heading text-2xl font-semibold">Visual Showcase</div>
        <p className="mt-3 text-sm leading-7 text-muted">
          A curated collection of projects and design work.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="group rounded-[28px] border border-panel-border bg-background-secondary/50 overflow-hidden transition hover:border-accent-blue/30"
          >
            <div
              className="aspect-video bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(135deg, ${
                  project.tags[0] === "Next.js"
                    ? "rgba(37,99,235,0.3)"
                    : project.tags[0] === "Node.js"
                      ? "rgba(56,189,248,0.3)"
                      : project.tags[0] === "React"
                        ? "rgba(124,92,252,0.3)"
                        : "rgba(79,156,249,0.3)"
                }, ${
                  project.tags[0] === "Next.js"
                    ? "rgba(124,92,252,0.1)"
                    : project.tags[0] === "Node.js"
                      ? "rgba(37,99,235,0.1)"
                      : project.tags[0] === "React"
                        ? "rgba(56,189,248,0.1)"
                        : "rgba(124,92,252,0.1)"
                })`,
              }}
            >
              <div className="flex h-full items-end p-4">
                <div className="flex gap-2">
                  {project.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="font-heading text-lg font-semibold">{project.title}</div>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{project.description}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                <span>{project.year}</span>
                {project.github && (
                  <span className="rounded-full border border-panel-border px-2 py-0.5">GitHub</span>
                )}
                {project.demo && (
                  <span className="rounded-full border border-panel-border px-2 py-0.5">Demo</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MusicApp() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [waveType, setWaveType] = useState<OscillatorType>("sine");
  const [notes, setNotes] = useState<string[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  const startMusic = useCallback(() => {
    if (audioContextRef.current) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = ctx;

    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(ctx.destination);
    gainNodeRef.current = gainNode;

    const masterFilter = ctx.createBiquadFilter();
    masterFilter.type = "lowpass";
    masterFilter.frequency.value = 2000;
    masterFilter.Q.value = 2;
    masterFilter.connect(gainNode);

    const oscillator = ctx.createOscillator();
    oscillator.type = waveType;
    oscillator.frequency.value = 220;
    oscillator.connect(masterFilter);
    oscillator.start();
    oscillatorRef.current = oscillator;

    setIsPlaying(true);
  }, [volume, waveType]);

  const stopMusic = useCallback(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
      oscillatorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    gainNodeRef.current = null;
    setIsPlaying(false);
    setNotes([]);
  }, []);

  const playNote = useCallback(
    (freq: number, name: string) => {
      if (!audioContextRef.current) startMusic();
      const ctx = audioContextRef.current!;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      osc.type = waveType;
      osc.frequency.value = freq;

      const noteGain = ctx.createGain();
      noteGain.gain.value = 0.15;
      noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);

      osc.connect(noteGain);
      noteGain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 2);

      setNotes((prev) => [...prev.slice(-5), `${name} (${freq}Hz)`]);
    },
    [startMusic, waveType]
  );

  const noteMap = [
    { name: "C4", freq: 261.63 },
    { name: "E4", freq: 329.63 },
    { name: "G4", freq: 392.0 },
    { name: "C5", freq: 523.25 },
    { name: "E5", freq: 659.25 },
    { name: "G5", freq: 783.99 },
  ];

  return (
    <div className="flex h-full flex-col p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-heading text-2xl font-semibold">Ambient Player</div>
          <p className="mt-1 text-sm text-muted">Generative soundscape with Web Audio</p>
        </div>
        <button
          className={cn(
            "rounded-full px-5 py-2.5 text-sm font-medium transition",
            isPlaying
              ? "border border-panel-border bg-white/80 text-foreground"
              : "bg-accent-blue text-white shadow-soft hover:bg-[#1d4ed8]"
          )}
          onClick={isPlaying ? stopMusic : startMusic}
        >
          {isPlaying ? "Stop" : "Play"}
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[28px] border border-panel-border bg-background-secondary/50 p-5">
          <div className="font-heading text-lg font-semibold">Controls</div>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm text-muted">Wave Type</label>
              <div className="mt-2 flex gap-2">
                {(["sine", "triangle", "sawtooth", "square"] as OscillatorType[]).map((type) => (
                  <button
                    key={type}
                    className={cn(
                      "rounded-xl border px-3 py-1.5 text-xs uppercase tracking-wider transition",
                      waveType === type
                        ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                        : "border-panel-border bg-white/70 text-muted hover:bg-white"
                    )}
                    onClick={() => setWaveType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-muted">Volume: {Math.round(volume * 100)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="mt-2 w-full accent-accent-blue"
                onInput={(e) => {
                  if (gainNodeRef.current) {
                    gainNodeRef.current.gain.value = Number((e.target as HTMLInputElement).value);
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-panel-border bg-background-secondary/50 p-5">
          <div className="font-heading text-lg font-semibold">Chord Pad</div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {noteMap.map((note) => (
              <button
                key={note.name}
                className={cn(
                  "rounded-xl border border-panel-border bg-white/70 py-3 text-sm font-medium text-foreground transition hover:bg-white",
                  isPlaying && "animate-pulse"
                )}
                onClick={() => playNote(note.freq, note.name)}
              >
                {note.name}
              </button>
            ))}
          </div>
          {notes.length > 0 && (
            <div className="mt-4 space-y-1">
              <div className="text-xs text-muted">Recent:</div>
              {notes.map((note, i) => (
                <div key={i} className="text-xs font-mono text-muted">{note}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlaceholderApp({ appId }: { appId: AppId }) {
  return (
    <div className="p-5">
      <EmptyState
        title={`${appId} is staged`}
        description="This module has been reserved in the app registry and is ready for deeper implementation."
      />
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-60 flex-col items-center justify-center rounded-[28px] border border-dashed border-panel-border bg-background-secondary/30 px-6 text-center">
      <div className="font-heading text-2xl font-semibold text-foreground">{title}</div>
      <div className="mt-3 max-w-xl text-sm leading-7 text-muted">{description}</div>
    </div>
  );
}

function CommandPalette({
  items,
  onClose,
}: {
  items: CommandPaletteItem[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const value = query.toLowerCase();
    return items.filter((item) => {
      return (
        item.label.toLowerCase().includes(value) ||
        item.keywords?.some((keyword) => keyword.toLowerCase().includes(value))
      );
    });
  }, [items, query]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/20 px-4 pt-[12vh] backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        className="glass-panel w-full max-w-2xl rounded-[30px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-panel-border px-5 py-4">
          <Command className="h-5 w-5 text-accent-blue" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-foreground outline-none placeholder:text-muted"
            placeholder="Search apps, commands, and quick actions..."
          />
        </div>
        <div className="max-h-[60vh] overflow-auto p-3">
          {filtered.map((item) => (
            <button
              key={item.id}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-background-secondary"
              onClick={() => {
                item.action();
                onClose();
              }}
            >
              <div>
                <div className="text-foreground">{item.label}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.22em] text-muted">
                  {item.category}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted" />
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
