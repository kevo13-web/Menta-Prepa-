"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Coffee,
  Expand,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Sparkles,
  TimerReset,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const DEFAULTS = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakEvery: 4,
};

type Phase = "work" | "shortBreak" | "longBreak";
type Settings = typeof DEFAULTS;

const phaseCopy: Record<Phase, { label: string; eyebrow: string; hint: string }> = {
  work: {
    label: "Concentration",
    eyebrow: "Mode profond",
    hint: "Une seule tâche. Tout le reste peut attendre.",
  },
  shortBreak: {
    label: "Pause courte",
    eyebrow: "Respire",
    hint: "Lève-toi, regarde au loin et laisse ton cerveau souffler.",
  },
  longBreak: {
    label: "Grande pause",
    eyebrow: "Recharge complète",
    hint: "Tu as terminé un cycle complet. Coupe vraiment quelques minutes.",
  },
};

function minutesForPhase(phase: Phase, settings: Settings) {
  if (phase === "work") return settings.work;
  if (phase === "shortBreak") return settings.shortBreak;
  return settings.longBreak;
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
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
    // Le timer reste fonctionnel même si l'audio est bloqué.
  }
}

export default function FocusPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [phase, setPhase] = useState<Phase>("work");
  const [secondsLeft, setSecondsLeft] = useState(DEFAULTS.work * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [ready, setReady] = useState(false);
  const [immersive, setImmersive] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("menta-pomodoro-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<Settings>;
        const next = {
          work: clamp(Number(parsed.work ?? DEFAULTS.work), 5, 120),
          shortBreak: clamp(Number(parsed.shortBreak ?? DEFAULTS.shortBreak), 1, 30),
          longBreak: clamp(Number(parsed.longBreak ?? DEFAULTS.longBreak), 5, 60),
          longBreakEvery: clamp(Number(parsed.longBreakEvery ?? DEFAULTS.longBreakEvery), 2, 8),
        };
        setSettings(next);
        setSecondsLeft(next.work * 60);
      } catch {
        // Valeurs par défaut en cas de données invalides.
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem("menta-pomodoro-settings", JSON.stringify(settings));
  }, [ready, settings]);

  useEffect(() => {
    document.title = running ? `${formatTime(secondsLeft)} · Menta Focus` : "Focus · Menta Prépa";
    return () => {
      document.title = "Menta Prépa | Stratégie mentale du travail étudiant";
    };
  }, [running, secondsLeft]);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) setImmersive(false);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!running) return;

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current > 1) return current - 1;

        playBell();
        if (phase === "work") {
          const nextCompleted = completed + 1;
          setCompleted(nextCompleted);
          const nextPhase: Phase =
            nextCompleted % settings.longBreakEvery === 0 ? "longBreak" : "shortBreak";
          setPhase(nextPhase);
          return minutesForPhase(nextPhase, settings) * 60;
        }

        setPhase("work");
        return settings.work * 60;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [running, phase, completed, settings]);

  const totalSeconds = minutesForPhase(phase, settings) * 60;
  const progress = useMemo(
    () => Math.max(0, Math.min(1, 1 - secondsLeft / totalSeconds)),
    [secondsLeft, totalSeconds],
  );
  const circumference = 2 * Math.PI * 132;
  const dashOffset = circumference * (1 - progress);

  function updateSetting(key: keyof Settings, value: number) {
    const limits: Record<keyof Settings, [number, number]> = {
      work: [5, 120],
      shortBreak: [1, 30],
      longBreak: [5, 60],
      longBreakEvery: [2, 8],
    };
    const nextValue = clamp(value, ...limits[key]);
    const next = { ...settings, [key]: nextValue };
    setSettings(next);

    if (
      !running &&
      ((phase === "work" && key === "work") ||
        (phase === "shortBreak" && key === "shortBreak") ||
        (phase === "longBreak" && key === "longBreak"))
    ) {
      setSecondsLeft(nextValue * 60);
    }
  }

  function resetTimer() {
    setRunning(false);
    setSecondsLeft(minutesForPhase(phase, settings) * 60);
  }

  function skipPhase() {
    setRunning(false);
    if (phase === "work") {
      const nextCompleted = completed + 1;
      setCompleted(nextCompleted);
      const nextPhase: Phase =
        nextCompleted % settings.longBreakEvery === 0 ? "longBreak" : "shortBreak";
      setPhase(nextPhase);
      setSecondsLeft(minutesForPhase(nextPhase, settings) * 60);
      return;
    }
    setPhase("work");
    setSecondsLeft(settings.work * 60);
  }

  async function activateFocus() {
    setImmersive(true);
    setRunning(true);

    const shell = document.getElementById("menta-focus-shell");
    try {
      if (shell && !document.fullscreenElement) await shell.requestFullscreen();
    } catch {
      // Le mode immersif CSS fonctionne même si le navigateur refuse le plein écran natif.
    }
  }

  async function leaveFocus() {
    setImmersive(false);
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      // Rien à faire : on revient tout de même à l'interface normale.
    }
  }

  const phaseAccent =
    phase === "work" ? "#5f8ff7" : phase === "shortBreak" ? "#57c6a9" : "#f1a65a";

  return (
    <section
      id="menta-focus-shell"
      data-phase={phase}
      className={`focus-shell relative overflow-hidden transition-colors duration-700 ${
        immersive
          ? "fixed inset-0 z-[100] min-h-screen bg-[#f7f4ef] p-0"
          : "min-h-screen px-4 pb-14 pt-28 sm:px-6 lg:px-8"
      }`}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full bg-[#8dc8ff]/30 blur-3xl"
        animate={immersive ? { width: "52vw", height: "52vw", left: "-12vw", top: "-18vw", opacity: 0.7 } : { width: 288, height: 288, left: -96, top: 80, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full bg-[#ffbf88]/25 blur-3xl"
        animate={immersive ? { width: "48vw", height: "48vw", right: "-12vw", top: "18vh", opacity: 0.75 } : { width: 320, height: 320, right: -64, top: "33%", opacity: 1 }}
        transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full bg-[#7ad8ba]/25 blur-3xl"
        animate={immersive ? { width: "42vw", height: "42vw", left: "28vw", bottom: "-22vw", opacity: 0.75 } : { width: 256, height: 256, left: "33%", bottom: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />

      <motion.div
        layout
        className={`relative mx-auto w-full ${
          immersive
            ? "flex min-h-screen max-w-none items-center justify-center"
            : "grid max-w-6xl gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center"
        }`}
        transition={{ layout: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } }}
      >
        <motion.div
          layout
          className={`focus-card ${
            immersive
              ? "relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white/20 px-5 py-8 backdrop-blur-[2px] sm:px-10"
              : "glass rounded-[2.2rem] p-5 sm:p-8 lg:p-10"
          }`}
          transition={{ layout: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } }}
        >
          <motion.div
            layout
            className={`flex flex-wrap items-center gap-3 ${
              immersive
                ? "absolute left-5 right-5 top-5 z-20 justify-between sm:left-8 sm:right-8 sm:top-7"
                : "mb-8 justify-between"
            }`}
          >
            <AnimatePresence mode="wait">
              {!immersive ? (
                <motion.div
                  key="focus-title"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28 }}
                >
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#5a7289]">
                    <Sparkles className="h-4 w-4" /> {phaseCopy[phase].eyebrow}
                  </div>
                  <h1 className="display-serif text-4xl font-semibold text-[#15314f] sm:text-5xl">
                    Menta Focus
                  </h1>
                </motion.div>
              ) : (
                <motion.div
                  key="focus-status"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-full border border-white/70 bg-white/55 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#5b7288] backdrop-blur-xl sm:text-sm"
                >
                  {phaseCopy[phase].eyebrow}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2">
              <div className="rounded-full border border-white/70 bg-white/60 px-4 py-2 text-sm font-semibold text-[#47627a] shadow-sm backdrop-blur-xl">
                {completed} pomodoro{completed > 1 ? "s" : ""} terminé{completed > 1 ? "s" : ""}
              </div>
              {immersive ? (
                <button
                  type="button"
                  onClick={leaveFocus}
                  aria-label="Quitter le plein écran"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/60 text-[#38536c] shadow-sm backdrop-blur-xl transition hover:scale-105 hover:bg-white"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </motion.div>

          <motion.div
            layout
            className={`mx-auto flex flex-col items-center text-center ${immersive ? "w-full" : "max-w-xl"}`}
            transition={{ layout: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } }}
          >
            <motion.div
              layout
              className="relative grid place-items-center"
              animate={
                immersive
                  ? { width: "min(72vmin, 720px)", height: "min(72vmin, 720px)", scale: 1 }
                  : { width: "min(82vw, 350px)", height: "min(82vw, 350px)", scale: 1 }
              }
              transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                aria-hidden="true"
                className="absolute inset-[4%] rounded-full"
                animate={{
                  boxShadow: immersive
                    ? `0 0 0 1px ${phaseAccent}22, 0 0 90px ${phaseAccent}30, inset 0 0 80px ${phaseAccent}12`
                    : `0 0 0 0px ${phaseAccent}00`,
                  backgroundColor: immersive ? "rgba(255,255,255,.28)" : "rgba(255,255,255,0)",
                }}
                transition={{ duration: 0.8 }}
              />

              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 300 300" aria-hidden="true">
                <circle cx="150" cy="150" r="132" fill="none" stroke="rgba(21,49,79,.08)" strokeWidth="10" />
                <circle
                  cx="150"
                  cy="150"
                  r="132"
                  fill="none"
                  stroke={phaseAccent}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="transition-[stroke-dashoffset,stroke] duration-700 ease-out"
                />
              </svg>

              <motion.div
                layout
                className="relative z-10"
                animate={immersive ? { scale: 1.18 } : { scale: 1 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className={`mb-2 font-bold uppercase tracking-[0.28em] ${immersive ? "text-base sm:text-lg" : "text-sm"}`}
                  style={{ color: phaseAccent }}
                >
                  {phaseCopy[phase].label}
                </div>
                <div
                  className={`tabular-nums font-semibold leading-none tracking-[-0.07em] text-[#15314f] ${
                    immersive
                      ? "text-[clamp(5.5rem,17vmin,11.5rem)]"
                      : "text-[4.7rem] sm:text-[5.7rem]"
                  }`}
                >
                  {formatTime(secondsLeft)}
                </div>
                <motion.p
                  className="mx-auto mt-5 max-w-[360px] leading-6 text-[#647b8f]"
                  animate={{ opacity: immersive ? 0.88 : 1 }}
                >
                  {phaseCopy[phase].hint}
                </motion.p>
              </motion.div>
            </motion.div>

            <motion.div
              layout
              className={`flex flex-wrap justify-center gap-3 ${immersive ? "mt-2 sm:mt-4" : "mt-7"}`}
            >
              {!running ? (
                immersive ? (
                  <button
                    type="button"
                    onClick={() => setRunning(true)}
                    className="focus-primary inline-flex min-h-12 items-center gap-2 rounded-2xl px-6 py-3 font-semibold text-white shadow-lg"
                  >
                    <Play className="h-5 w-5" /> Reprendre
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={activateFocus}
                    className="focus-primary inline-flex min-h-12 items-center gap-2 rounded-2xl px-6 py-3 font-semibold text-white shadow-lg"
                  >
                    <Expand className="h-5 w-5" /> Activer le mode focus
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => setRunning(false)}
                  className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#15314f] px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.03]"
                >
                  <Pause className="h-5 w-5" /> Pause
                </button>
              )}

              <button
                type="button"
                onClick={resetTimer}
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-[#315b7f]/15 bg-white/70 px-4 py-3 font-semibold text-[#34516c] shadow-sm backdrop-blur-xl transition hover:scale-[1.03] hover:bg-white"
              >
                <RotateCcw className="h-4 w-4" /> Recommencer
              </button>
              <button
                type="button"
                onClick={skipPhase}
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-[#315b7f]/15 bg-white/70 px-4 py-3 font-semibold text-[#34516c] shadow-sm backdrop-blur-xl transition hover:scale-[1.03] hover:bg-white"
              >
                <SkipForward className="h-4 w-4" /> Suivant
              </button>
            </motion.div>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {!immersive ? (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              className="space-y-5"
            >
              <div className="glass rounded-[2rem] p-6 sm:p-7">
                <div className="mb-6 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#dceaff] text-[#4777de]">
                    <TimerReset className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-[#15314f]">Ton rythme</h2>
                    <p className="text-sm text-[#6a8092]">Personnalise le Pomodoro selon ta séance.</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <Setting label="Travail" value={settings.work} suffix="min" min={5} max={120} onChange={(value) => updateSetting("work", value)} disabled={running} tone="blue" />
                  <Setting label="Pause courte" value={settings.shortBreak} suffix="min" min={1} max={30} onChange={(value) => updateSetting("shortBreak", value)} disabled={running} tone="mint" />
                  <Setting label="Grande pause" value={settings.longBreak} suffix="min" min={5} max={60} onChange={(value) => updateSetting("longBreak", value)} disabled={running} tone="peach" />
                  <Setting label="Grande pause après" value={settings.longBreakEvery} suffix="cycles" min={2} max={8} onChange={(value) => updateSetting("longBreakEvery", value)} disabled={running} tone="yellow" />
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/70 bg-gradient-to-br from-[#dff6ef] via-white/80 to-[#e7efff] p-6 shadow-[0_18px_55px_rgba(52,77,101,.09)]">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-[#4ba68f] shadow-sm">
                    <Coffee className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#24435f]">Le cycle se gère tout seul</h3>
                    <p className="mt-1 text-sm leading-6 text-[#667d90]">
                      Après chaque session de travail, Menta lance une pause courte. Tous les {settings.longBreakEvery} pomodoros, la grande pause prend automatiquement le relais.
                    </p>
                  </div>
                </div>
              </div>
            </motion.aside>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

function Setting({
  label,
  value,
  suffix,
  min,
  max,
  disabled,
  tone,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  min: number;
  max: number;
  disabled: boolean;
  tone: "blue" | "mint" | "peach" | "yellow";
  onChange: (value: number) => void;
}) {
  const tones = {
    blue: "from-[#e4efff] to-[#f6f9ff] border-[#bdd2fa]",
    mint: "from-[#e1f7ef] to-[#f6fffb] border-[#bfe7d8]",
    peach: "from-[#fff0e4] to-[#fffaf5] border-[#f4d0b2]",
    yellow: "from-[#fff7d8] to-[#fffdf3] border-[#f0dfa5]",
  };

  return (
    <label className={`rounded-2xl border bg-gradient-to-br p-4 ${tones[tone]} ${disabled ? "opacity-60" : ""}`}>
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#62798d]">{label}</span>
      <div className="flex items-end gap-2">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full min-w-0 bg-transparent text-3xl font-semibold text-[#183650] outline-none disabled:cursor-not-allowed"
        />
        <span className="pb-1 text-sm font-semibold text-[#75899a]">{suffix}</span>
      </div>
    </label>
  );
}
