"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FocusAudioEngine, type FocusCue } from "@/lib/focus/audio";
import {
  POMODORO_DEFAULTS,
  advancePomodoroClock,
  clamp,
  nextPomodoroPhase,
  sanitizePomodoroSettings,
  minutesForPomodoroPhase,
  type PomodoroClock,
  type PomodoroPhase,
  type PomodoroSettings,
} from "@/lib/focus/clock";

export { POMODORO_DEFAULTS, minutesForPomodoroPhase, formatPomodoroTime } from "@/lib/focus/clock";
export type { PomodoroPhase, PomodoroSettings } from "@/lib/focus/clock";

export type FocusAudioSettings = { enabled: boolean; warningSeconds: number; volume: number };
export type FocusAnnouncement = { id: number; message: string; kind: "warning" | "transition" };

export type PomodoroContextValue = PomodoroClock & {
  ready: boolean;
  audioSettings: FocusAudioSettings;
  audioReady: boolean;
  announcement: FocusAnnouncement | null;
  countdown: number | null;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  updateSetting: (key: keyof PomodoroSettings, value: number) => void;
  updateAudioSetting: (key: keyof FocusAudioSettings, value: boolean | number) => void;
  enableAudio: () => Promise<boolean>;
  testAudio: () => Promise<boolean>;
};

const STORAGE_KEY = "menta-pomodoro-state-v2";
const LEGACY_SETTINGS_KEY = "menta-pomodoro-settings";
const AUDIO_KEY = "menta-pomodoro-audio-v1";
const AUDIO_DEFAULTS: FocusAudioSettings = { enabled: true, warningSeconds: 10, volume: 45 };
const PomodoroContext = createContext<PomodoroContextValue | null>(null);

function sanitizeAudio(value?: Partial<FocusAudioSettings>): FocusAudioSettings {
  const warning = Number(value?.warningSeconds ?? 10);
  return {
    enabled: value?.enabled !== false,
    warningSeconds: [0, 3, 5, 10, 15, 30].includes(warning) ? warning : 10,
    volume: clamp(Number(value?.volume ?? 45), 0, 100),
  };
}

function initialClock(): PomodoroClock {
  return { settings: POMODORO_DEFAULTS, phase: "work", secondsLeft: 1500, running: false, completed: 0, endAt: null };
}

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [clock, setClock] = useState<PomodoroClock>(initialClock);
  const clockRef = useRef(clock);
  const [ready, setReady] = useState(false);
  const [audioSettings, setAudioSettings] = useState<FocusAudioSettings>(AUDIO_DEFAULTS);
  const audioSettingsRef = useRef(audioSettings);
  const audioRef = useRef<FocusAudioEngine | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [announcement, setAnnouncement] = useState<FocusAnnouncement | null>(null);
  const announcementId = useRef(0);
  const warnedBoundary = useRef<number | null>(null);
  const tickedSecond = useRef<string | null>(null);
  const hydrated = useRef(false);

  const commit = useCallback((next: PomodoroClock) => {
    clockRef.current = next;
    setClock(next);
  }, []);

  const announce = useCallback((message: string, kind: FocusAnnouncement["kind"]) => {
    setAnnouncement({ id: ++announcementId.current, message, kind });
  }, []);

  const enableAudio = useCallback(async () => {
    const engine = audioRef.current ?? new FocusAudioEngine();
    audioRef.current = engine;
    const ok = await engine.unlock();
    setAudioReady(ok);
    return ok;
  }, []);

  const play = useCallback((cue: FocusCue) => {
    const options = audioSettingsRef.current;
    if (!options.enabled) return;
    const engine = audioRef.current;
    if (!engine?.ready) {
      setAudioReady(false);
      return;
    }
    engine.play(cue, options.volume);
  }, []);

  const testAudio = useCallback(async () => {
    const ok = await enableAudio();
    if (ok) audioRef.current?.play("workStart", audioSettingsRef.current.volume);
    return ok;
  }, [enableAudio]);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    let loaded = initialClock();
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<PomodoroClock>;
        const settings = sanitizePomodoroSettings(parsed.settings);
        const phase: PomodoroPhase = parsed.phase === "shortBreak" || parsed.phase === "longBreak" ? parsed.phase : "work";
        const completed = Math.max(0, Math.floor(Number(parsed.completed) || 0));
        const fallback = minutesForPomodoroPhase(phase, settings) * 60;
        const endAt = Number(parsed.endAt);
        loaded = {
          settings, phase, completed,
          secondsLeft: clamp(Number(parsed.secondsLeft ?? fallback), 1, fallback),
          running: Boolean(parsed.running && Number.isFinite(endAt) && endAt > 0),
          endAt: parsed.running && Number.isFinite(endAt) && endAt > 0 ? endAt : null,
        };
        loaded = advancePomodoroClock(loaded, Date.now()).clock;
      } else {
        const legacy = window.localStorage.getItem(LEGACY_SETTINGS_KEY);
        if (legacy) {
          const settings = sanitizePomodoroSettings(JSON.parse(legacy) as Partial<PomodoroSettings>);
          loaded = { ...loaded, settings, secondsLeft: settings.work * 60 };
        }
      }
    } catch { loaded = initialClock(); }
    try {
      const saved = window.localStorage.getItem(AUDIO_KEY);
      if (saved) {
        const options = sanitizeAudio(JSON.parse(saved) as Partial<FocusAudioSettings>);
        audioSettingsRef.current = options;
        setAudioSettings(options);
      }
    } catch { /* Keep the default sound preferences. */ }
    commit(loaded);
    setReady(true);
  }, [commit]);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clock)); } catch { /* Storage may be unavailable. */ }
  }, [ready, clock]);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(AUDIO_KEY, JSON.stringify(audioSettings)); } catch { /* Storage may be unavailable. */ }
  }, [ready, audioSettings]);

  const tick = useCallback(() => {
    const previous = clockRef.current;
    if (!previous.running || previous.endAt === null) return;
    const now = Date.now();
    const result = advancePomodoroClock(previous, now);
    const next = result.clock;
    if (result.transitions) {
      warnedBoundary.current = null;
      tickedSecond.current = null;
      announce(next.phase === "work" ? "La pause est terminée. C’est le moment de reprendre." : next.phase === "longBreak" ? "Grande pause : tu peux déconnecter quelques minutes." : "Pause courte : prends le temps de souffler.", "transition");
      // Never replay a burst of old sounds after a suspended browser tab wakes.
      if (result.transitions === 1 && result.lastBoundary !== null && now - result.lastBoundary < 2000) {
        play(next.phase === "work" ? "workStart" : "breakStart");
      }
    }
    if (next.secondsLeft !== previous.secondsLeft || result.transitions) commit(next);

    const options = audioSettingsRef.current;
    if (!options.warningSeconds || !next.running || next.endAt === null) return;
    const remaining = next.secondsLeft;
    if (remaining > options.warningSeconds) return;
    if (warnedBoundary.current !== next.endAt) {
      warnedBoundary.current = next.endAt;
      announce(next.phase === "work" ? `Pause dans ${remaining} secondes.` : `Reprise dans ${remaining} secondes.`, "warning");
      // A late wake-up still displays the countdown, but does not play a late warning.
      if (remaining >= 3 && !result.transitions) play("warning");
    }
    if (remaining <= 3 && remaining > 0) {
      const key = `${next.endAt}:${remaining}`;
      if (tickedSecond.current !== key) {
        tickedSecond.current = key;
        // Suppress catch-up pips if several seconds were skipped by the browser.
        if (previous.endAt === next.endAt && previous.secondsLeft - remaining <= 1) play("tick");
      }
    }
  }, [announce, commit, play]);

  useEffect(() => {
    if (!ready || !clock.running) return;
    tick();
    const interval = window.setInterval(tick, 250);
    const onWake = () => tick();
    window.addEventListener("focus", onWake);
    document.addEventListener("visibilitychange", onWake);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onWake);
      document.removeEventListener("visibilitychange", onWake);
    };
  }, [ready, clock.running, tick]);

  useEffect(() => () => { void audioRef.current?.close(); }, []);

  const start = useCallback(() => {
    if (audioSettingsRef.current.enabled) void enableAudio();
    const previous = clockRef.current;
    if (previous.running) return;
    const now = Date.now();
    const next = { ...previous, running: true, endAt: now + previous.secondsLeft * 1000 };
    warnedBoundary.current = null;
    tickedSecond.current = null;
    commit(next);
  }, [commit, enableAudio]);

  const pause = useCallback(() => {
    const previous = clockRef.current;
    const current = advancePomodoroClock(previous, Date.now()).clock;
    commit({ ...current, running: false, endAt: null });
    audioRef.current?.stop();
    warnedBoundary.current = null;
    tickedSecond.current = null;
  }, [commit]);

  const reset = useCallback(() => {
    const previous = clockRef.current;
    commit({ ...previous, running: false, endAt: null, secondsLeft: minutesForPomodoroPhase(previous.phase, previous.settings) * 60 });
    audioRef.current?.stop();
    warnedBoundary.current = null;
    tickedSecond.current = null;
  }, [commit]);

  const skip = useCallback(() => {
    const previous = clockRef.current;
    const next = nextPomodoroPhase(previous.phase, previous.completed, previous.settings);
    const secondsLeft = minutesForPomodoroPhase(next.phase, previous.settings) * 60;
    const endAt = previous.running ? Date.now() + secondsLeft * 1000 : null;
    commit({ ...previous, ...next, secondsLeft, endAt });
    audioRef.current?.stop();
    warnedBoundary.current = null;
    tickedSecond.current = null;
    announce(next.phase === "work" ? "Retour à la concentration." : "La pause commence.", "transition");
    if (previous.running) play(next.phase === "work" ? "workStart" : "breakStart");
  }, [announce, commit, play]);

  const updateSetting = useCallback((key: keyof PomodoroSettings, value: number) => {
    const previous = clockRef.current;
    const limits: Record<keyof PomodoroSettings, [number, number]> = {
      work: [5, 120], shortBreak: [1, 30], longBreak: [5, 60], longBreakEvery: [2, 8],
    };
    const settings = { ...previous.settings, [key]: clamp(value, ...limits[key]) };
    const active = (previous.phase === "work" && key === "work") || (previous.phase === "shortBreak" && key === "shortBreak") || (previous.phase === "longBreak" && key === "longBreak");
    commit({ ...previous, settings, secondsLeft: !previous.running && active ? settings[key] * 60 : previous.secondsLeft });
  }, [commit]);

  const updateAudioSetting = useCallback((key: keyof FocusAudioSettings, value: boolean | number) => {
    const options = sanitizeAudio({ ...audioSettingsRef.current, [key]: value });
    audioSettingsRef.current = options;
    setAudioSettings(options);
    if (!options.enabled) audioRef.current?.stop();
    else if (key === "enabled" && options.enabled) void enableAudio();
    if (key === "warningSeconds") warnedBoundary.current = null;
  }, [enableAudio]);

  const countdown = clock.running && audioSettings.warningSeconds > 0 && clock.secondsLeft <= audioSettings.warningSeconds ? clock.secondsLeft : null;
  const value = useMemo<PomodoroContextValue>(() => ({
    ...clock, ready, audioSettings, audioReady, announcement, countdown,
    start, pause, reset, skip, updateSetting, updateAudioSetting, enableAudio, testAudio,
  }), [clock, ready, audioSettings, audioReady, announcement, countdown, start, pause, reset, skip, updateSetting, updateAudioSetting, enableAudio, testAudio]);

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (!context) throw new Error("usePomodoro doit être utilisé dans PomodoroProvider.");
  return context;
}
