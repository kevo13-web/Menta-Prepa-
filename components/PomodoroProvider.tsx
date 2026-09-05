"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const POMODORO_DEFAULTS = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakEvery: 4,
};

export type PomodoroPhase = "work" | "shortBreak" | "longBreak";
export type PomodoroSettings = typeof POMODORO_DEFAULTS;

type PersistedState = {
  settings: PomodoroSettings;
  phase: PomodoroPhase;
  secondsLeft: number;
  running: boolean;
  completed: number;
  endAt: number | null;
};

type PomodoroContextValue = PersistedState & {
  ready: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  updateSetting: (key: keyof PomodoroSettings, value: number) => void;
};

const STORAGE_KEY = "menta-pomodoro-state-v2";
const LEGACY_SETTINGS_KEY = "menta-pomodoro-settings";

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function minutesForPomodoroPhase(phase: PomodoroPhase, settings: PomodoroSettings) {
  if (phase === "work") return settings.work;
  if (phase === "shortBreak") return settings.shortBreak;
  return settings.longBreak;
}

export function formatPomodoroTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function sanitizeSettings(value?: Partial<PomodoroSettings>): PomodoroSettings {
  return {
    work: clamp(Number(value?.work ?? POMODORO_DEFAULTS.work), 5, 120),
    shortBreak: clamp(Number(value?.shortBreak ?? POMODORO_DEFAULTS.shortBreak), 1, 30),
    longBreak: clamp(Number(value?.longBreak ?? POMODORO_DEFAULTS.longBreak), 5, 60),
    longBreakEvery: clamp(Number(value?.longBreakEvery ?? POMODORO_DEFAULTS.longBreakEvery), 2, 8),
  };
}

function nextPhase(phase: PomodoroPhase, completed: number, settings: PomodoroSettings) {
  if (phase === "work") {
    const nextCompleted = completed + 1;
    return {
      phase: nextCompleted % settings.longBreakEvery === 0 ? ("longBreak" as const) : ("shortBreak" as const),
      completed: nextCompleted,
    };
  }

  return { phase: "work" as const, completed };
}

function syncExpiredState(
  phase: PomodoroPhase,
  completed: number,
  endAt: number,
  settings: PomodoroSettings,
  now: number,
) {
  let nextEndAt = endAt;
  let nextCurrentPhase = phase;
  let nextCompleted = completed;
  let transitions = 0;

  while (now >= nextEndAt && transitions < 500) {
    const next = nextPhase(nextCurrentPhase, nextCompleted, settings);
    nextCurrentPhase = next.phase;
    nextCompleted = next.completed;
    nextEndAt += minutesForPomodoroPhase(nextCurrentPhase, settings) * 60_000;
    transitions += 1;
  }

  return {
    phase: nextCurrentPhase,
    completed: nextCompleted,
    endAt: nextEndAt,
    secondsLeft: Math.max(1, Math.ceil((nextEndAt - now) / 1000)),
    transitioned: transitions > 0,
  };
}

function playBell() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(740, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(520, context.currentTime + 0.45);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.7);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.72);
  } catch {
    // Le chronomètre continue même lorsque l'audio est bloqué.
  }
}

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PomodoroSettings>(POMODORO_DEFAULTS);
  const [phase, setPhase] = useState<PomodoroPhase>("work");
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_DEFAULTS.work * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let loadedSettings = POMODORO_DEFAULTS;

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<PersistedState>;
        loadedSettings = sanitizeSettings(parsed.settings);
        const loadedPhase: PomodoroPhase =
          parsed.phase === "shortBreak" || parsed.phase === "longBreak" ? parsed.phase : "work";
        const loadedCompleted = Math.max(0, Math.floor(Number(parsed.completed ?? 0)));
        const loadedRunning = Boolean(parsed.running && parsed.endAt);
        const loadedEndAt = loadedRunning ? Number(parsed.endAt) : null;

        setSettings(loadedSettings);
        setPhase(loadedPhase);
        setCompleted(loadedCompleted);

        if (loadedRunning && loadedEndAt && Number.isFinite(loadedEndAt)) {
          const synced = syncExpiredState(loadedPhase, loadedCompleted, loadedEndAt, loadedSettings, Date.now());
          setPhase(synced.phase);
          setCompleted(synced.completed);
          setEndAt(synced.endAt);
          setSecondsLeft(synced.secondsLeft);
          setRunning(true);
        } else {
          const fallback = minutesForPomodoroPhase(loadedPhase, loadedSettings) * 60;
          setSecondsLeft(clamp(Number(parsed.secondsLeft ?? fallback), 1, fallback));
        }
      } else {
        const legacy = window.localStorage.getItem(LEGACY_SETTINGS_KEY);
        if (legacy) loadedSettings = sanitizeSettings(JSON.parse(legacy) as Partial<PomodoroSettings>);
        setSettings(loadedSettings);
        setSecondsLeft(loadedSettings.work * 60);
      }
    } catch {
      setSettings(POMODORO_DEFAULTS);
      setSecondsLeft(POMODORO_DEFAULTS.work * 60);
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ settings, phase, secondsLeft, running, completed, endAt }),
    );
  }, [ready, settings, phase, secondsLeft, running, completed, endAt]);

  useEffect(() => {
    if (!running || !endAt) return;

    const sync = () => {
      const now = Date.now();
      if (now < endAt) {
        setSecondsLeft(Math.max(1, Math.ceil((endAt - now) / 1000)));
        return;
      }

      const synced = syncExpiredState(phase, completed, endAt, settings, now);
      if (synced.transitioned) playBell();
      setPhase(synced.phase);
      setCompleted(synced.completed);
      setEndAt(synced.endAt);
      setSecondsLeft(synced.secondsLeft);
    };

    sync();
    const interval = window.setInterval(sync, 500);
    return () => window.clearInterval(interval);
  }, [running, endAt, phase, completed, settings]);

  const start = useCallback(() => {
    setRunning(true);
    setEndAt(Date.now() + secondsLeft * 1000);
  }, [secondsLeft]);

  const pause = useCallback(() => {
    if (endAt) setSecondsLeft(Math.max(1, Math.ceil((endAt - Date.now()) / 1000)));
    setRunning(false);
    setEndAt(null);
  }, [endAt]);

  const reset = useCallback(() => {
    setRunning(false);
    setEndAt(null);
    setSecondsLeft(minutesForPomodoroPhase(phase, settings) * 60);
  }, [phase, settings]);

  const skip = useCallback(() => {
    const next = nextPhase(phase, completed, settings);
    const nextSeconds = minutesForPomodoroPhase(next.phase, settings) * 60;
    setPhase(next.phase);
    setCompleted(next.completed);
    setSecondsLeft(nextSeconds);
    if (running) setEndAt(Date.now() + nextSeconds * 1000);
    else setEndAt(null);
  }, [phase, completed, settings, running]);

  const updateSetting = useCallback(
    (key: keyof PomodoroSettings, value: number) => {
      const limits: Record<keyof PomodoroSettings, [number, number]> = {
        work: [5, 120],
        shortBreak: [1, 30],
        longBreak: [5, 60],
        longBreakEvery: [2, 8],
      };
      const nextValue = clamp(value, ...limits[key]);
      const nextSettings = { ...settings, [key]: nextValue };
      setSettings(nextSettings);

      if (
        !running &&
        ((phase === "work" && key === "work") ||
          (phase === "shortBreak" && key === "shortBreak") ||
          (phase === "longBreak" && key === "longBreak"))
      ) {
        setSecondsLeft(nextValue * 60);
      }
    },
    [settings, running, phase],
  );

  const value = useMemo<PomodoroContextValue>(
    () => ({
      settings,
      phase,
      secondsLeft,
      running,
      completed,
      endAt,
      ready,
      start,
      pause,
      reset,
      skip,
      updateSetting,
    }),
    [settings, phase, secondsLeft, running, completed, endAt, ready, start, pause, reset, skip, updateSetting],
  );

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (!context) throw new Error("usePomodoro doit être utilisé dans PomodoroProvider.");
  return context;
}
