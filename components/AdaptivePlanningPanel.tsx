"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BatteryMedium,
  CalendarSync,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  WandSparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const PROGRESS_KEY = "planning-ai-current";
const PLAN_STORAGE_KEY = "menta-ai-planning-v3";
const AUTO_KEY = "menta-planning-auto-rebalance-enabled";
const AUTO_LAST_KEY = "menta-planning-auto-rebalance-last";
const RESULT_KEY = "menta-planning-rebalance-result";

const DAY_INDEX: Record<string, number> = {
  lundi: 0,
  mardi: 1,
  mercredi: 2,
  jeudi: 3,
  vendredi: 4,
  samedi: 5,
  dimanche: 6,
};

type Block = {
  id: string;
  label: string;
  time: string;
  duration: number;
  type: "cours" | "revision" | "fichage" | "dissertation" | "oral" | "repos";
  subject?: string;
};

type Day = {
  day: string;
  date?: string;
  blocks: Block[];
};

type Plan = {
  days: Day[];
};

type Persisted = {
  plan: Plan;
  completedIds: string[];
  inputs?: {
    fatigue?: number;
  };
};

type Change = {
  block_id: string;
  action: string;
  from_day: string;
  to_day: string;
  to_time: string;
  reason: string;
};

type RebalanceResult = {
  message: string;
  changes: Change[];
};

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayIndex(date = new Date()) {
  return (date.getDay() + 6) % 7;
}

function parseTime(value: string) {
  const match = String(value || "").match(/(\d{1,2})\s*[:hH]\s*(\d{2})?/);
  if (!match) return null;
  const hour = Math.max(0, Math.min(23, Number(match[1])));
  const minute = Math.max(0, Math.min(59, Number(match[2] || 0)));
  return hour * 60 + minute;
}

function dayDateKey(day: Day) {
  const match = String(day.date || "").match(/(20\d{2})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

function isWork(block: Block) {
  return block.type !== "cours" && block.type !== "repos";
}

function blockIsOverdue(day: Day, block: Block, completed: Set<string>, now = new Date()) {
  if (!isWork(block) || completed.has(block.id)) return false;
  const currentKey = localDateKey(now);
  const explicitDate = dayDateKey(day);

  if (explicitDate) {
    if (explicitDate < currentKey) return true;
    if (explicitDate > currentKey) return false;
  } else {
    const index = DAY_INDEX[day.day.toLowerCase()];
    if (index === undefined) return false;
    if (index < todayIndex(now)) return true;
    if (index > todayIndex(now)) return false;
  }

  const blockMinutes = parseTime(block.time);
  if (blockMinutes === null) return false;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return blockMinutes + Math.max(10, block.duration || 0) < currentMinutes;
}

function isToday(day: Day, now = new Date()) {
  const explicit = dayDateKey(day);
  if (explicit) return explicit === localDateKey(now);
  return DAY_INDEX[day.day.toLowerCase()] === todayIndex(now);
}

export function AdaptivePlanningPanel() {
  const [saved, setSaved] = useState<Persisted | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [autoEnabled, setAutoEnabled] = useState(true);
  const [fatigue, setFatigue] = useState(3);
  const [constraint, setConstraint] = useState("");
  const [busyMode, setBusyMode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [lastResult, setLastResult] = useState<RebalanceResult | null>(null);
  const autoTriggered = useRef(false);

  useEffect(() => {
    try {
      const auto = window.localStorage.getItem(AUTO_KEY);
      if (auto !== null) setAutoEnabled(auto === "true");
      const result = window.sessionStorage.getItem(RESULT_KEY);
      if (result) {
        setLastResult(JSON.parse(result) as RebalanceResult);
        window.sessionStorage.removeItem(RESULT_KEY);
      }
    } catch {
      // Optional browser persistence.
    }

    let cancelled = false;
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setLoaded(true);
        return;
      }
      const { data } = await supabase
        .from("user_progress")
        .select("value")
        .eq("user_id", user.id)
        .eq("key", PROGRESS_KEY)
        .maybeSingle();

      if (!cancelled) {
        const value = data?.value as Persisted | null;
        setSaved(value?.plan?.days?.length ? value : null);
        setFatigue(Math.min(5, Math.max(1, Number(value?.inputs?.fatigue) || 3)));
        setLoaded(true);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  const metrics = useMemo(() => {
    if (!saved) return { overdue: 0, todayRemaining: 0, totalRemaining: 0 };
    const completed = new Set(saved.completedIds || []);
    const now = new Date();
    let overdue = 0;
    let todayRemaining = 0;
    let totalRemaining = 0;

    saved.plan.days.forEach((day) => {
      day.blocks.forEach((block) => {
        if (!isWork(block) || completed.has(block.id)) return;
        totalRemaining += 1;
        if (isToday(day, now)) todayRemaining += 1;
        if (blockIsOverdue(day, block, completed, now)) overdue += 1;
      });
    });
    return { overdue, todayRemaining, totalRemaining };
  }, [saved]);

  async function rebalance(mode: "missed" | "no_time_today" | "fatigue" | "constraint" | "manual", reason = "") {
    if (!saved || busyMode) return;
    setBusyMode(mode);
    setError("");
    try {
      const now = new Date();
      const response = await fetch("/api/planning/rebalance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          reason,
          fatigue,
          nowLocal: now.toISOString(),
          today: now.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) throw new Error("Connecte-toi pour rééquilibrer ton planning.");
        if (data?.error === "NO_PLAN") throw new Error("Génère d’abord un planning avant de le rééquilibrer.");
        if (data?.error === "AI_PLANNER_NOT_CONFIGURED") throw new Error("Le rééquilibrage IA n’est pas configuré sur ce déploiement.");
        throw new Error("Menta n’a pas réussi à rééquilibrer la semaine. Réessaie dans quelques secondes.");
      }

      const result: RebalanceResult = {
        message: data.message || "Semaine rééquilibrée.",
        changes: Array.isArray(data.changes) ? data.changes : [],
      };

      try {
        if (data.saved) window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(data.saved));
        window.sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
        if (mode === "missed") window.localStorage.setItem(AUTO_LAST_KEY, localDateKey());
      } catch {
        // The server-side save already succeeded.
      }

      window.location.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Rééquilibrage impossible.");
      setBusyMode(null);
    }
  }

  useEffect(() => {
    if (!loaded || !saved || !autoEnabled || metrics.overdue === 0 || busyMode || autoTriggered.current) return;
    let last = "";
    try { last = window.localStorage.getItem(AUTO_LAST_KEY) || ""; } catch { /* noop */ }
    if (last === localDateKey()) return;
    autoTriggered.current = true;
    void rebalance("missed", `${metrics.overdue} bloc(s) non réalisé(s) sont désormais en retard. Replace-les seulement s’ils restent utiles.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, saved, autoEnabled, metrics.overdue]);

  function toggleAuto() {
    const next = !autoEnabled;
    setAutoEnabled(next);
    try { window.localStorage.setItem(AUTO_KEY, String(next)); } catch { /* noop */ }
  }

  if (!loaded || !saved) return null;

  return (
    <section className="mb-6 overflow-hidden rounded-[2rem] border border-[#566ff5]/16 bg-gradient-to-br from-[#edf1ff] via-white to-[#fff8e7] p-5 shadow-[0_18px_52px_rgba(53,82,110,.07)] sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/82 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#5267d9] shadow-sm">
              <CalendarSync className="h-3.5 w-3.5" /> Planning adaptatif
            </span>
            {metrics.overdue > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0e9] px-3 py-1.5 text-[10px] font-bold text-[#a95b40]">
                <AlertTriangle className="h-3.5 w-3.5" /> {metrics.overdue} bloc{metrics.overdue > 1 ? "s" : ""} en retard
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e9faf5] px-3 py-1.5 text-[10px] font-bold text-[#287a64]">
                <CheckCircle2 className="h-3.5 w-3.5" /> Semaine à jour
              </span>
            )}
          </div>
          <h2 className="mt-3 display-serif text-2xl font-semibold text-[#1d3552] sm:text-3xl">Le planning s’adapte quand ta semaine déraille.</h2>
          <p className="mt-2 text-sm leading-6 text-[#687d91]">Une tâche ratée n’est plus perdue : Menta décide s’il faut la déplacer, la raccourcir ou l’abandonner, sans créer une journée impossible le lendemain.</p>
        </div>

        <button type="button" onClick={toggleAuto} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold shadow-sm transition ${autoEnabled ? "border-[#58d6b1]/28 bg-[#e9faf5] text-[#287a64]" : "border-[#dbe2e8] bg-white/75 text-[#728397]"}`}>
          {autoEnabled ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
          Auto {autoEnabled ? "activé" : "désactivé"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric icon={<AlertTriangle className="h-4 w-4" />} label="En retard" value={metrics.overdue} tone="coral" />
        <Metric icon={<Clock3 className="h-4 w-4" />} label="Aujourd’hui" value={metrics.todayRemaining} tone="blue" />
        <Metric icon={<Sparkles className="h-4 w-4" />} label="Restants" value={metrics.totalRemaining} tone="mint" />
      </div>

      {lastResult ? (
        <div className="mt-5 rounded-[1.5rem] border border-[#58d6b1]/20 bg-[#f2fcf8] p-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#31856f]"><CheckCircle2 className="h-4 w-4" /> Dernier rééquilibrage</div>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#315c51]">{lastResult.message}</p>
          {lastResult.changes.length > 0 ? (
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {lastResult.changes.slice(0, 4).map((change, index) => (
                <div key={`${change.block_id}-${index}`} className="rounded-xl bg-white/75 px-3 py-2 text-[11px] leading-5 text-[#687d75]">
                  <span className="font-bold text-[#397565]">{change.action}</span>{change.from_day ? ` · ${change.from_day}` : ""}{change.to_day ? ` → ${change.to_day}${change.to_time ? ` ${change.to_time}` : ""}` : ""}<br />{change.reason}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[1.5rem] border border-white/80 bg-white/70 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#5267d9]">Actions rapides</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button type="button" disabled={Boolean(busyMode)} onClick={() => void rebalance("manual", "Réoptimise la semaine restante avec les informations déjà connues.")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#566ff5] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 disabled:opacity-50">
              {busyMode === "manual" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />} Rééquilibrer maintenant
            </button>
            <button type="button" disabled={Boolean(busyMode) || metrics.todayRemaining === 0} onClick={() => void rebalance("no_time_today", "Je ne peux plus travailler aujourd’hui. Replace intelligemment ce qui reste.")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#ff9768]/24 bg-[#fff0e9] px-4 py-2.5 text-xs font-bold text-[#a95b40] transition hover:-translate-y-0.5 disabled:opacity-45">
              {busyMode === "no_time_today" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Clock3 className="h-4 w-4" />} Pas le temps aujourd’hui
            </button>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/80 bg-white/70 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#a95b40]">Énergie réelle</p><span className="inline-flex items-center gap-1 rounded-full bg-[#fff0e9] px-2.5 py-1 text-[10px] font-bold text-[#a95b40]"><BatteryMedium className="h-3.5 w-3.5" /> {fatigue}/5</span></div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setFatigue(value)} className={`min-h-9 rounded-xl border text-xs font-bold transition ${fatigue === value ? "border-[#ff9768]/40 bg-[#fff0e9] text-[#a95b40]" : "border-[#dbe2e8] bg-white text-[#8593a1]"}`}>{value}</button>)}
          </div>
          <button type="button" disabled={Boolean(busyMode)} onClick={() => void rebalance("fatigue", `Adapte la semaine au nouveau niveau de fatigue : ${fatigue}/5.`)} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#ff9768]/22 bg-white px-4 py-2 text-xs font-bold text-[#a95b40] transition hover:bg-[#fff7f3] disabled:opacity-50">
            {busyMode === "fatigue" ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <BatteryMedium className="h-3.5 w-3.5" />} Adapter la charge
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-[1.5rem] border border-white/80 bg-white/70 p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#7e6a25]">Nouvelle contrainte ou échéance</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input value={constraint} onChange={(event) => setConstraint(event.target.value)} placeholder="Ex. khôlle déplacée à jeudi 14h, DS ajouté vendredi, rendez-vous mardi soir…" className="min-h-11 flex-1 rounded-xl border border-[#e1dfd2] bg-[#fffdf6] px-3.5 py-2.5 text-xs text-[#4b5870] outline-none focus:border-[#d6b84c] focus:ring-4 focus:ring-[#ffd665]/10" />
          <button type="button" disabled={Boolean(busyMode) || !constraint.trim()} onClick={() => void rebalance("constraint", constraint.trim())} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#ffd665] px-4 py-2.5 text-xs font-extrabold text-[#655019] shadow-sm transition hover:-translate-y-0.5 disabled:opacity-45">
            {busyMode === "constraint" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CalendarSync className="h-4 w-4" />} Recalculer autour de ça
          </button>
        </div>
      </div>

      {busyMode ? <p className="mt-4 text-center text-xs font-semibold text-[#687d91]">Menta vérifie les créneaux, les échéances et la charge avant de déplacer quoi que ce soit…</p> : null}
      {error ? <p className="mt-4 rounded-xl border border-[#ff9768]/25 bg-[#fff0e9] p-3 text-xs leading-5 text-[#96533d]">{error}</p> : null}
    </section>
  );
}

function Metric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "coral" | "blue" | "mint" }) {
  const styles = {
    coral: "bg-[#fff0e9] text-[#a95b40]",
    blue: "bg-[#edf1ff] text-[#5267d9]",
    mint: "bg-[#e9faf5] text-[#287a64]",
  };
  return (
    <div className="rounded-2xl border border-white/80 bg-white/72 p-4 shadow-sm">
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${styles[tone]}`}>{icon}{label}</span>
      <p className="mt-2 text-2xl font-extrabold text-[#243e5b]">{value}</p>
    </div>
  );
}
