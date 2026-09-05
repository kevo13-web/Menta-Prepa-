"use client";

import { useEffect, useMemo, useState } from "react";
import { Coffee, Expand, Pause, Play, RotateCcw, SkipForward, Sparkles, TimerReset } from "lucide-react";

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
    const AudioContextClass = window.AudioContext ||
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
    // Audio feedback is optional; the timer keeps working if the browser blocks it.
  }
}

export default function FocusPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [phase, setPhase] = useState<Phase>("work");
  const [secondsLeft, setSecondsLeft] = useState(DEFAULTS.work * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [ready, setReady] = useState(false);

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
        // Keep defaults when local storage contains invalid data.
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
    if (!running) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current > 1) return current - 1;

        playBell();
        if (phase === "work") {
          const nextCompleted = completed + 1;
          setCompleted(nextCompleted);
          const nextPhase: Phase = nextCompleted % settings.longBreakEvery === 0 ? "longBreak" : "shortBreak";
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
  const progress = useMemo(() => Math.max(0, Math.min(1, 1 - secondsLeft / totalSeconds)), [secondsLeft, totalSeconds]);
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
    if (!running && ((phase === "work" && key === "work") || (phase === "shortBreak" && key === "shortBreak") || (phase === "longBreak" && key === "longBreak"))) {
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
      const nextPhase: Phase = nextCompleted % settings.longBreakEvery === 0 ? "longBreak" : "shortBreak";
      setPhase(nextPhase);
      setSecondsLeft(minutesForPhase(nextPhase, settings) * 60);
      return;
    }
    setPhase("work");
    setSecondsLeft(settings.work * 60);
  }

  async function activateFocus() {
    setRunning(true);
    const element = document.getElementById("menta-focus-shell");
    try {
      if (element && !document.fullscreenElement) await element.requestFullscreen();
    } catch {
      // Fullscreen can be blocked by browser settings; the timer still starts.
    }
  }

  const phaseAccent = phase === "work" ? "#5f8ff7" : phase === "shortBreak" ? "#57c6a9" : "#f1a65a";

  return (
    <section
      id="menta-focus-shell"
      className="focus-shell relative min-h-screen overflow-hidden px-4 pb-14 pt-28 sm:px-6 lg:px-8"
      data-phase={phase}
    >
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#8dc8ff]/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-1/3 h-80 w-80 rounded-full bg-[#ffbf88]/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#7ad8ba]/25 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
        <div className="glass focus-card rounded-[2.2rem] p-5 sm:p-8 lg:p-10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#5a7289]">
                <Sparkles className="h-4 w-4" /> {phaseCopy[phase].eyebrow}
              </div>
              <h1 className="display-serif text-4xl font-semibold text-[#15314f] sm:text-5xl">Menta Focus</h1>
            </div>
            <div className="rounded-full border border-white/70 bg-white/60 px-4 py-2 text-sm font-semibold text-[#47627a] shadow-sm backdrop-blur-xl">
              {completed} pomodoro{completed > 1 ? "s" : ""} terminé{completed > 1 ? "s" : ""}
            </div>
          </div>

          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <div className="relative grid h-[310px] w-[310px] place-items-center sm:h-[350px] sm:w-[350px]">
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
              <div className="relative z-10">
                <div className="mb-2 text-sm font-bold uppercase tracking-[0.28em]" style={{ color: phaseAccent }}>{phaseCopy[phase].label}</div>
                <div className="tabular-nums text-[4.7rem] font-semibold leading-none tracking-[-0.07em] text-[#15314f] sm:text-[5.7rem]">
                  {formatTime(secondsLeft)}
                </div>
                <p className="mx-auto mt-5 max-w-[250px] text-sm leading-6 text-[#647b8f]">{phaseCopy[phase].hint}</p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {!running ? (
                <button onClick={activateFocus} className="focus-primary inline-flex min-h-12 items-center gap-2 rounded-2xl px-6 py-3 font-semibold text-white shadow-lg">
                  <Expand className="h-5 w-5" /> Activer le mode focus
                </button>
              ) : (
                <button onClick={() => setRunning(false)} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#15314f] px-6 py-3 font-semibold text-white shadow-lg">
                  <Pause className="h-5 w-5" /> Pause
                </button>
              )}
              <button onClick={resetTimer} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-[#315b7f]/15 bg-white/70 px-4 py-3 font-semibold text-[#34516c] shadow-sm backdrop-blur-xl">
                <RotateCcw className="h-4 w-4" /> Recommencer
              </button>
              <button onClick={skipPhase} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-[#315b7f]/15 bg-white/70 px-4 py-3 font-semibold text-[#34516c] shadow-sm backdrop-blur-xl">
                <SkipForward className="h-4 w-4" /> Suivant
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="glass rounded-[2rem] p-6 sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#dceaff] text-[#4777de]"><TimerReset className="h-5 w-5" /></div>
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
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-[#4ba68f] shadow-sm"><Coffee className="h-5 w-5" /></div>
              <div>
                <h3 className="font-semibold text-[#24435f]">Le cycle se gère tout seul</h3>
                <p className="mt-1 text-sm leading-6 text-[#667d90]">Après chaque session de travail, Menta lance une pause courte. Tous les {settings.longBreakEvery} pomodoros, la grande pause prend automatiquement le relais.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
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
    yellow: "from-[#fff7d8] to-[#fffdf3] border-[#f1dfa0]",
  };

  return (
    <label className={`rounded-2xl border bg-gradient-to-br p-4 ${tones[tone]} ${disabled ? "opacity-60" : ""}`}>
      <span className="block text-xs font-bold uppercase tracking-[0.16em] text-[#6b8092]">{label}</span>
      <div className="mt-3 flex items-end gap-2">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full bg-transparent text-3xl font-semibold tabular-nums text-[#173a5e] outline-none"
        />
        <span className="pb-1 text-xs font-semibold uppercase tracking-wider text-[#75899a]">{suffix}</span>
      </div>
    </label>
  );
}
