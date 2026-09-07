export type PomodoroPhase = "work" | "shortBreak" | "longBreak";

export type PomodoroSettings = {
  work: number;
  shortBreak: number;
  longBreak: number;
  longBreakEvery: number;
};

export type PomodoroClock = {
  settings: PomodoroSettings;
  phase: PomodoroPhase;
  secondsLeft: number;
  running: boolean;
  completed: number;
  endAt: number | null;
};

export const POMODORO_DEFAULTS: PomodoroSettings = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakEvery: 4,
};

export function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function sanitizePomodoroSettings(value?: Partial<PomodoroSettings>): PomodoroSettings {
  return {
    work: clamp(Number(value?.work ?? 25), 5, 120),
    shortBreak: clamp(Number(value?.shortBreak ?? 5), 1, 30),
    longBreak: clamp(Number(value?.longBreak ?? 15), 5, 60),
    longBreakEvery: clamp(Math.floor(Number(value?.longBreakEvery ?? 4)), 2, 8),
  };
}

export function minutesForPomodoroPhase(phase: PomodoroPhase, settings: PomodoroSettings) {
  return settings[phase];
}

export function formatPomodoroTime(totalSeconds: number) {
  const safe = Math.max(0, Math.round(totalSeconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export function nextPomodoroPhase(phase: PomodoroPhase, completed: number, settings: PomodoroSettings) {
  if (phase !== "work") return { phase: "work" as const, completed };
  const nextCompleted = completed + 1;
  return {
    phase: nextCompleted % settings.longBreakEvery === 0 ? "longBreak" as const : "shortBreak" as const,
    completed: nextCompleted,
  };
}

export type ClockAdvance = {
  clock: PomodoroClock;
  transitions: number;
  lastBoundary: number | null;
};

// All transitions are derived from absolute deadlines, never from the number of
// setInterval callbacks. This keeps the timer correct after a sleeping tab wakes.
export function advancePomodoroClock(clock: PomodoroClock, now: number): ClockAdvance {
  if (!clock.running || clock.endAt === null) return { clock, transitions: 0, lastBoundary: null };
  if (now < clock.endAt) {
    return {
      clock: { ...clock, secondsLeft: Math.max(1, Math.ceil((clock.endAt - now) / 1000)) },
      transitions: 0,
      lastBoundary: null,
    };
  }

  const settings = clock.settings;
  let phase = clock.phase;
  let completed = clock.completed;
  let endAt = clock.endAt;
  let transitions = 0;
  let lastBoundary: number | null = null;

  // Skip whole future cycles in constant time when a tab has been asleep for days.
  const cycleMs = (settings.work * settings.longBreakEvery +
    settings.shortBreak * (settings.longBreakEvery - 1) + settings.longBreak) * 60_000;
  if (phase === "work" && completed % settings.longBreakEvery === 0 && now - endAt >= cycleMs) {
    const cycles = Math.floor((now - endAt) / cycleMs);
    completed += cycles * settings.longBreakEvery;
    transitions += cycles * settings.longBreakEvery * 2;
    endAt += cycles * cycleMs;
  }

  while (now >= endAt) {
    lastBoundary = endAt;
    const next = nextPomodoroPhase(phase, completed, settings);
    phase = next.phase;
    completed = next.completed;
    endAt += minutesForPomodoroPhase(phase, settings) * 60_000;
    transitions++;
  }

  return {
    clock: { ...clock, phase, completed, endAt, secondsLeft: Math.max(1, Math.ceil((endAt - now) / 1000)) },
    transitions,
    lastBoundary,
  };
}
