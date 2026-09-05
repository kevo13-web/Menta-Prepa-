"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  Coffee,
  Expand,
  LibraryBig,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Search,
  SkipForward,
  Sparkles,
  TimerReset,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  formatPomodoroTime,
  minutesForPomodoroPhase,
  type PomodoroPhase,
  type PomodoroSettings,
  usePomodoro,
} from "@/components/PomodoroProvider";
import { resources } from "@/data/siteData";

const phaseCopy: Record<PomodoroPhase, { label: string; eyebrow: string; hint: string }> = {
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

export default function FocusPage() {
  const {
    settings,
    phase,
    secondsLeft,
    running,
    completed,
    ready,
    start,
    pause,
    reset,
    skip,
    updateSetting,
  } = usePomodoro();

  const [immersive, setImmersive] = useState(false);
  const [sheetsOpen, setSheetsOpen] = useState(false);
  const [sheetQuery, setSheetQuery] = useState("");
  const [selectedSheet, setSelectedSheet] = useState<(typeof resources)[number] | null>(null);

  useEffect(() => {
    document.title = running ? `${formatPomodoroTime(secondsLeft)} · Menta Focus` : "Focus · Menta Prépa";
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

  const totalSeconds = minutesForPomodoroPhase(phase, settings) * 60;
  const progress = useMemo(
    () => Math.max(0, Math.min(1, 1 - secondsLeft / totalSeconds)),
    [secondsLeft, totalSeconds],
  );
  const circumference = 2 * Math.PI * 132;
  const dashOffset = circumference * (1 - progress);

  const visibleSheets = useMemo(() => {
    const normalized = sheetQuery.trim().toLowerCase();
    if (!normalized) return resources;
    return resources.filter((resource) =>
      `${resource.title} ${resource.subject} ${resource.type}`.toLowerCase().includes(normalized),
    );
  }, [sheetQuery]);

  async function activateFocus() {
    setImmersive(true);
    if (!running) start();

    const shell = document.getElementById("menta-focus-shell");
    try {
      if (shell && !document.fullscreenElement) await shell.requestFullscreen();
    } catch {
      // Le mode immersif CSS reste disponible si le navigateur refuse le plein écran natif.
    }
  }

  async function leaveFocus() {
    setImmersive(false);
    setSheetsOpen(false);
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      // Le timer continue dans le provider global, même si la sortie native échoue.
    }
  }

  const phaseAccent =
    phase === "work" ? "#566ff5" : phase === "shortBreak" ? "#58d6b1" : "#ff9768";

  if (!ready) {
    return <section className="min-h-screen px-4 pb-14 pt-28" />;
  }

  return (
    <section
      id="menta-focus-shell"
      data-phase={phase}
      className={`focus-shell relative overflow-hidden transition-colors duration-700 ${
        immersive
          ? "fixed inset-0 z-[100] min-h-screen bg-[#f7fbff] p-0"
          : "min-h-screen px-4 pb-14 pt-28 sm:px-6 lg:px-8"
      }`}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full bg-[#79c7ff]/30 blur-3xl"
        animate={
          immersive
            ? { width: "52vw", height: "52vw", left: "-12vw", top: "-18vw", opacity: 0.7 }
            : { width: 288, height: 288, left: -96, top: 80, opacity: 1 }
        }
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full bg-[#ff8c6b]/22 blur-3xl"
        animate={
          immersive
            ? { width: "46vw", height: "46vw", right: "-12vw", top: "14vh", opacity: 0.72 }
            : { width: 320, height: 320, right: -64, top: "33%", opacity: 1 }
        }
        transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full bg-[#58d6b1]/25 blur-3xl"
        animate={
          immersive
            ? { width: "42vw", height: "42vw", left: "28vw", bottom: "-22vw", opacity: 0.75 }
            : { width: 256, height: 256, left: "33%", bottom: 0, opacity: 1 }
        }
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />

      <motion.div
        layout
        className={`relative mx-auto w-full ${
          immersive
            ? `grid min-h-screen max-w-none items-stretch ${sheetsOpen ? "lg:grid-cols-[minmax(0,1fr)_minmax(330px,430px)]" : "grid-cols-1"}`
            : "grid max-w-6xl gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center"
        }`}
        transition={{ layout: { duration: 0.68, ease: [0.22, 1, 0.36, 1] } }}
      >
        <motion.div
          layout
          className={`focus-card ${
            immersive
              ? "relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white/16 px-5 py-8 backdrop-blur-[2px] sm:px-10"
              : "glass rounded-[2.2rem] p-5 sm:p-8 lg:p-10"
          }`}
          transition={{ layout: { duration: 0.68, ease: [0.22, 1, 0.36, 1] } }}
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
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#60778f]">
                    <Sparkles className="h-4 w-4 text-[#566ff5]" /> {phaseCopy[phase].eyebrow}
                  </div>
                  <h1 className="display-serif text-4xl font-semibold text-[#182b49] sm:text-5xl">
                    Menta Focus
                  </h1>
                </motion.div>
              ) : (
                <motion.div
                  key="focus-status"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#5b7087] shadow-sm backdrop-blur-xl sm:text-sm"
                >
                  {phaseCopy[phase].eyebrow}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2">
              <div className="rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-semibold text-[#45617b] shadow-sm backdrop-blur-xl">
                {completed} pomodoro{completed > 1 ? "s" : ""} terminé{completed > 1 ? "s" : ""}
              </div>

              {immersive ? (
                <>
                  <button
                    type="button"
                    onClick={() => setSheetsOpen((value) => !value)}
                    className={`inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 ${
                      sheetsOpen
                        ? "border-[#58d6b1]/45 bg-[#dff9f0] text-[#287863]"
                        : "border-white/80 bg-white/70 text-[#38536c]"
                    }`}
                  >
                    <LibraryBig className="h-4 w-4" /> Fiches
                  </button>
                  <button
                    type="button"
                    onClick={leaveFocus}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3.5 text-sm font-semibold text-[#38536c] shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    <Minimize2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Quitter le plein écran</span>
                  </button>
                </>
              ) : null}
            </div>
          </motion.div>

          <motion.div
            layout
            className={`mx-auto flex flex-col items-center text-center ${immersive ? "w-full" : "max-w-xl"}`}
            transition={{ layout: { duration: 0.68, ease: [0.22, 1, 0.36, 1] } }}
          >
            <motion.div
              layout
              className="relative grid place-items-center"
              animate={
                immersive
                  ? sheetsOpen
                    ? { width: "min(56vmin, 610px)", height: "min(56vmin, 610px)", scale: 1 }
                    : { width: "min(72vmin, 720px)", height: "min(72vmin, 720px)", scale: 1 }
                  : { width: "min(82vw, 350px)", height: "min(82vw, 350px)", scale: 1 }
              }
              transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                aria-hidden="true"
                className="absolute inset-[4%] rounded-full"
                animate={{
                  boxShadow: immersive
                    ? `0 0 0 1px ${phaseAccent}25, 0 0 90px ${phaseAccent}30, inset 0 0 80px ${phaseAccent}12`
                    : `0 0 0 0px ${phaseAccent}00`,
                  backgroundColor: immersive ? "rgba(255,255,255,.34)" : "rgba(255,255,255,0)",
                }}
                transition={{ duration: 0.8 }}
              />

              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 300 300" aria-hidden="true">
                <circle cx="150" cy="150" r="132" fill="none" stroke="rgba(24,43,73,.08)" strokeWidth="10" />
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
                animate={immersive ? { scale: sheetsOpen ? 1.02 : 1.18 } : { scale: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className={`mb-2 font-bold uppercase tracking-[0.28em] ${immersive ? "text-base sm:text-lg" : "text-sm"}`}
                  style={{ color: phaseAccent }}
                >
                  {phaseCopy[phase].label}
                </div>
                <div
                  className={`tabular-nums font-semibold leading-none tracking-[-0.07em] text-[#182b49] ${
                    immersive
                      ? sheetsOpen
                        ? "text-[clamp(4.3rem,12vmin,8.5rem)]"
                        : "text-[clamp(5.5rem,17vmin,11.5rem)]"
                      : "text-[4.7rem] sm:text-[5.7rem]"
                  }`}
                >
                  {formatPomodoroTime(secondsLeft)}
                </div>
                <p className="mx-auto mt-5 max-w-[360px] leading-6 text-[#647b8f]">
                  {phaseCopy[phase].hint}
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              layout
              className={`flex flex-wrap justify-center gap-3 ${immersive ? "mt-2 sm:mt-4" : "mt-7"}`}
            >
              {!running ? (
                immersive ? (
                  <button type="button" onClick={start} className="focus-primary inline-flex min-h-12 items-center gap-2 rounded-2xl px-6 py-3 font-semibold shadow-lg">
                    <Play className="h-5 w-5" /> Reprendre
                  </button>
                ) : (
                  <button type="button" onClick={activateFocus} className="focus-primary inline-flex min-h-12 items-center gap-2 rounded-2xl px-6 py-3 font-semibold shadow-lg">
                    <Expand className="h-5 w-5" /> Activer le mode focus
                  </button>
                )
              ) : (
                <button type="button" onClick={pause} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#182b49] px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.03]">
                  <Pause className="h-5 w-5" /> Pause
                </button>
              )}

              <button type="button" onClick={reset} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-[#566ff5]/15 bg-white/75 px-4 py-3 font-semibold text-[#38536c] shadow-sm backdrop-blur-xl transition hover:scale-[1.03] hover:bg-white">
                <RotateCcw className="h-4 w-4" /> Recommencer
              </button>
              <button type="button" onClick={skip} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-[#566ff5]/15 bg-white/75 px-4 py-3 font-semibold text-[#38536c] shadow-sm backdrop-blur-xl transition hover:scale-[1.03] hover:bg-white">
                <SkipForward className="h-4 w-4" /> Suivant
              </button>
            </motion.div>

            {immersive ? (
              <p className="mt-4 text-xs font-medium text-[#75879a]">
                Tu peux quitter ce mode et naviguer ailleurs : le chrono continuera en arrière-plan.
              </p>
            ) : null}
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {immersive && sheetsOpen ? (
            <motion.aside
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-30 min-h-screen border-l border-[#566ff5]/10 bg-white/78 p-5 shadow-[-20px_0_60px_rgba(55,76,123,.10)] backdrop-blur-2xl sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#eaf0ff] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#5267d9]">
                    <BookOpen className="h-3.5 w-3.5" /> Réviser sans quitter Focus
                  </div>
                  <h2 className="display-serif text-3xl font-semibold text-[#182b49]">Mes fiches</h2>
                </div>
                <button type="button" onClick={() => setSheetsOpen(false)} aria-label="Fermer les fiches" className="grid h-10 w-10 place-items-center rounded-full bg-[#f2f5ff] text-[#50637d] transition hover:bg-[#e8edff]">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <label className="mt-5 flex min-h-11 items-center gap-2 rounded-2xl border border-[#566ff5]/12 bg-[#f8faff] px-3 text-sm text-[#62758b] focus-within:border-[#566ff5]/35 focus-within:ring-2 focus-within:ring-[#566ff5]/10">
                <Search className="h-4 w-4 text-[#566ff5]" />
                <input
                  value={sheetQuery}
                  onChange={(event) => setSheetQuery(event.target.value)}
                  placeholder="Chercher une fiche"
                  className="w-full bg-transparent text-[#253d5b] outline-none placeholder:text-[#93a0b0]"
                />
              </label>

              <div className="mt-5 max-h-[calc(100vh-235px)] space-y-3 overflow-y-auto pr-1">
                {visibleSheets.map((resource, index) => {
                  const tones = [
                    "border-[#566ff5]/16 bg-[#edf1ff]",
                    "border-[#58d6b1]/18 bg-[#e8fbf5]",
                    "border-[#ff8c6b]/18 bg-[#fff0ea]",
                    "border-[#ffd665]/26 bg-[#fff8dc]",
                  ];
                  const selected = selectedSheet?.title === resource.title;

                  return (
                    <button
                      type="button"
                      key={`${resource.subject}-${resource.title}`}
                      onClick={() => setSelectedSheet(resource)}
                      className={`w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${tones[index % tones.length]} ${selected ? "ring-2 ring-[#566ff5]/25" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#65778c]">{resource.subject} · {resource.type}</p>
                          <h3 className="mt-1 text-sm font-semibold leading-5 text-[#213955]">{resource.title}</h3>
                        </div>
                        <span className="shrink-0 rounded-full bg-white/75 px-2.5 py-1 text-[10px] font-semibold text-[#6c7d90]">{resource.level}</span>
                      </div>
                    </button>
                  );
                })}

                {visibleSheets.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#566ff5]/20 bg-white/55 p-5 text-center text-sm text-[#6a7e93]">
                    Aucune fiche ne correspond à ta recherche.
                  </div>
                ) : null}
              </div>

              <AnimatePresence>
                {selectedSheet ? (
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-5 left-5 right-5 rounded-2xl border border-[#566ff5]/14 bg-white/95 p-4 shadow-[0_18px_50px_rgba(46,70,116,.16)] backdrop-blur-xl sm:bottom-7 sm:left-7 sm:right-7"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#566ff5]">Fiche sélectionnée</p>
                        <p className="mt-1 text-sm font-semibold text-[#213955]">{selectedSheet.title}</p>
                      </div>
                      <button type="button" onClick={() => setSelectedSheet(null)} className="text-[#8291a2]" aria-label="Fermer la sélection"><X className="h-4 w-4" /></button>
                    </div>
                    <Link
                      href="/fiches"
                      className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#566ff5] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#465de4]"
                    >
                      <BookOpen className="h-4 w-4" /> Ouvrir la bibliothèque complète
                    </Link>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.aside>
          ) : null}
        </AnimatePresence>

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
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e8edff] text-[#566ff5]">
                    <TimerReset className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-[#182b49]">Ton rythme</h2>
                    <p className="text-sm text-[#6a8092]">Personnalise le Pomodoro selon ta séance.</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <Setting label="Travail" value={settings.work} suffix="min" min={5} max={120} onChange={(value) => updateSetting("work", value)} disabled={running} tone="blue" />
                  <Setting label="Pause courte" value={settings.shortBreak} suffix="min" min={1} max={30} onChange={(value) => updateSetting("shortBreak", value)} disabled={running} tone="mint" />
                  <Setting label="Grande pause" value={settings.longBreak} suffix="min" min={5} max={60} onChange={(value) => updateSetting("longBreak", value)} disabled={running} tone="coral" />
                  <Setting label="Grande pause après" value={settings.longBreakEvery} suffix="cycles" min={2} max={8} onChange={(value) => updateSetting("longBreakEvery", value)} disabled={running} tone="sun" />
                </div>
              </div>

              <div className="rounded-[2rem] border border-[#58d6b1]/20 bg-gradient-to-br from-[#e6faf4] via-white/85 to-[#edf1ff] p-6 shadow-[0_18px_55px_rgba(52,77,101,.09)]">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-[#43ae91] shadow-sm">
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
  tone: "blue" | "mint" | "coral" | "sun";
  onChange: (value: number) => void;
}) {
  const tones = {
    blue: "from-[#e9edff] to-[#f8f9ff] border-[#cbd4ff]",
    mint: "from-[#e5faf3] to-[#f7fffc] border-[#bfeede]",
    coral: "from-[#ffede7] to-[#fff9f6] border-[#ffd1c4]",
    sun: "from-[#fff6d4] to-[#fffdf4] border-[#f6e4a3]",
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
