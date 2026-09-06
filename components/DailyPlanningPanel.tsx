"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FastForward,
  Play,
  RefreshCw,
  Sparkles,
  Target,
  TimerReset,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const PROGRESS_KEY = "planning-ai-current";
const STORAGE_KEY = "menta-ai-planning-v3";

type Block = {
  id: string;
  label: string;
  time: string;
  duration: number;
  type: "cours" | "revision" | "fichage" | "dissertation" | "oral" | "repos";
  subject?: string;
  reason?: string;
  sheet_id?: string;
};

type Day = {
  day: string;
  date?: string;
  focus: string;
  energy?: "léger" | "modéré" | "intense";
  blocks: Block[];
};

type Persisted = {
  plan: {
    priority?: string;
    days: Day[];
  };
  completedIds: string[];
  inputs?: Record<string, unknown>;
};

const dayIndex: Record<string, number> = {
  lundi: 0,
  mardi: 1,
  mercredi: 2,
  jeudi: 3,
  vendredi: 4,
  samedi: 5,
  dimanche: 6,
};

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function planDayDate(day: Day) {
  const match = String(day.date || "").match(/(20\d{2})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

function todayIndex(date = new Date()) {
  return (date.getDay() + 6) % 7;
}

function isToday(day: Day, now = new Date()) {
  const explicit = planDayDate(day);
  if (explicit) return explicit === localDateKey(now);
  return dayIndex[day.day.toLowerCase()] === todayIndex(now);
}

function timeMinutes(value: string) {
  const match = String(value || "").match(/(\d{1,2})\s*[:hH]\s*(\d{2})?/);
  if (!match) return 24 * 60;
  return Math.max(0, Math.min(23, Number(match[1]))) * 60 + Math.max(0, Math.min(59, Number(match[2] || 0)));
}

function isWork(block: Block) {
  return block.type !== "cours" && block.type !== "repos";
}

export function DailyPlanningPanel() {
  const [saved, setSaved] = useState<Persisted | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw) as Persisted);
    } catch {
      // Account persistence remains authoritative.
    }

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
        if (value?.plan?.days?.length) setSaved(value);
        setLoaded(true);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, []);

  const today = useMemo(() => saved?.plan?.days?.find((day) => isToday(day)) || null, [saved]);
  const completed = useMemo(() => new Set(saved?.completedIds || []), [saved]);
  const tasks = useMemo(
    () => (today?.blocks || []).filter(isWork).sort((a, b) => timeMinutes(a.time) - timeMinutes(b.time)),
    [today],
  );
  const remaining = tasks.filter((block) => !completed.has(block.id));
  const done = tasks.length - remaining.length;
  const remainingMinutes = remaining.reduce((sum, block) => sum + Math.max(0, Number(block.duration) || 0), 0);
  const priority = remaining[0] || null;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 100;

  async function persist(next: Persisted) {
    setSaved(next);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* optional */ }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Connecte-toi pour enregistrer ta progression.");
    const { error: saveError } = await supabase.from("user_progress").upsert(
      { user_id: user.id, key: PROGRESS_KEY, value: next, updated_at: new Date().toISOString() },
      { onConflict: "user_id,key" },
    );
    if (saveError) throw new Error("La progression n'a pas pu être enregistrée.");
  }

  async function complete(block: Block) {
    if (!saved || busy) return;
    setBusy(`complete-${block.id}`);
    setError("");
    try {
      const next: Persisted = {
        ...saved,
        completedIds: Array.from(new Set([...(saved.completedIds || []), block.id])),
      };
      await persist(next);
      window.setTimeout(() => window.location.reload(), 180);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible d'enregistrer cette tâche.");
      setBusy(null);
    }
  }

  async function postpone(block: Block) {
    if (!saved || busy) return;
    setBusy(`postpone-${block.id}`);
    setError("");
    try {
      const now = new Date();
      const response = await fetch("/api/planning/postpone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockId: block.id,
          nowLocal: now.toISOString(),
          today: now.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) throw new Error("Connecte-toi pour reporter une tâche.");
        if (data?.error === "AI_POSTPONE_CONFLICT") throw new Error("Menta n'a pas trouvé un créneau sans conflit. Réessaie une fois.");
        throw new Error("Menta n'a pas réussi à reporter cette tâche.");
      }
      if (data.saved) {
        try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data.saved)); } catch { /* optional */ }
      }
      window.location.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Report impossible.");
      setBusy(null);
    }
  }

  async function noTimeToday() {
    if (!saved || busy || remaining.length === 0) return;
    setBusy("no-time");
    setError("");
    try {
      const now = new Date();
      const response = await fetch("/api/planning/rebalance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "no_time_today",
          reason: "L'étudiant indique depuis son cockpit quotidien qu'il ne peut plus travailler aujourd'hui. Replace seulement les tâches encore non terminées d'aujourd'hui.",
          nowLocal: now.toISOString(),
          today: now.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error("Menta n'a pas réussi à libérer ta journée.");
      if (data.saved) {
        try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data.saved)); } catch { /* optional */ }
      }
      window.location.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Réorganisation impossible.");
      setBusy(null);
    }
  }

  if (!loaded || !saved || !today) return null;

  return (
    <section className="mb-6 overflow-hidden rounded-[2rem] border border-[#566ff5]/16 bg-gradient-to-br from-[#172c4c] via-[#233d66] to-[#31577a] p-5 text-white shadow-[0_22px_65px_rgba(30,52,82,.18)] sm:p-6 lg:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.17em] text-[#dbe5ff]"><CalendarDays className="h-3.5 w-3.5" /> Aujourd’hui · {today.day}</span>
            <span className="rounded-full bg-[#58d6b1]/18 px-3 py-1.5 text-[10px] font-bold text-[#9be8d2]">{remainingMinutes} min restantes</span>
          </div>
          <h2 className="mt-4 display-serif text-3xl font-semibold leading-tight sm:text-4xl">{remaining.length ? `${remaining.length} objectif${remaining.length > 1 ? "s" : ""} pour avancer sans te disperser.` : "Journée terminée. Tu peux couper sans culpabiliser."}</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#d5dfeb]">{today.focus}</p>
        </div>

        <div className="min-w-[220px] rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-[#d7e2ef]"><span>Journée accomplie</span><span>{progress}%</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#58d6b1] transition-all" style={{ width: `${progress}%` }} /></div>
          <p className="mt-2 text-[10px] text-[#afbdcc]">{done}/{tasks.length} blocs de travail terminés</p>
        </div>
      </div>

      {priority ? (
        <div className="mt-6 rounded-[1.8rem] border border-white/12 bg-white/10 p-5 backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#ffd665]"><Target className="h-4 w-4" /> Priorité n°1 {saved.plan.priority ? <span className="normal-case tracking-normal text-[#dbe4ef]">· {saved.plan.priority}</span> : null}</div>
              <h3 className="mt-3 display-serif text-2xl font-semibold sm:text-3xl">{priority.label}</h3>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#d5dfeb]"><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {priority.time}</span><span>· {priority.duration} min</span>{priority.subject ? <span>· {priority.subject}</span> : null}</div>
              {priority.reason ? <p className="mt-3 text-xs leading-5 text-[#b9c8d8]">{priority.reason}</p> : null}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link href="/focus" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#58d6b1] px-4 py-2.5 text-sm font-extrabold text-[#163d35] shadow-sm transition hover:-translate-y-0.5"><Play className="h-4 w-4" /> Commencer en Focus</Link>
              <button type="button" disabled={Boolean(busy)} onClick={() => void complete(priority)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-[#294762] transition hover:-translate-y-0.5 disabled:opacity-50">{busy === `complete-${priority.id}` ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Terminé</button>
              <button type="button" disabled={Boolean(busy)} onClick={() => void postpone(priority)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/16 bg-white/8 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/14 disabled:opacity-50">{busy === `postpone-${priority.id}` ? <RefreshCw className="h-4 w-4 animate-spin" /> : <TimerReset className="h-4 w-4" />} Reporter</button>
            </div>
          </div>
        </div>
      ) : null}

      {tasks.length > 0 ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {tasks.map((block) => {
            const isDone = completed.has(block.id);
            return (
              <div key={block.id} className={`rounded-[1.35rem] border p-4 transition ${isDone ? "border-[#58d6b1]/18 bg-[#58d6b1]/8 opacity-75" : "border-white/10 bg-white/7"}`}>
                <div className="flex items-start gap-3">
                  <button type="button" disabled={isDone || Boolean(busy)} onClick={() => void complete(block)} className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border transition ${isDone ? "border-[#58d6b1] bg-[#58d6b1] text-[#173d35]" : "border-white/25 bg-white/8 text-white hover:bg-white/14"}`} aria-label={isDone ? "Tâche terminée" : "Marquer comme terminée"}>{isDone ? <Check className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-white/70" />}</button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-[#afbdcc]"><span>{block.time}</span><span>· {block.duration} min</span>{block.subject ? <span className="rounded-full bg-white/8 px-2 py-0.5">{block.subject}</span> : null}</div>
                    <p className={`mt-1 text-sm font-bold leading-5 ${isDone ? "line-through text-[#9fcaba]" : "text-white"}`}>{block.label}</p>
                  </div>
                  {!isDone ? <button type="button" disabled={Boolean(busy)} onClick={() => void postpone(block)} className="inline-flex items-center gap-1 rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-bold text-[#d9e4ef] transition hover:bg-white/14 disabled:opacity-50"><FastForward className="h-3 w-3" /> Reporter</button> : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-[#b9c7d6]"><Sparkles className="h-4 w-4 text-[#ffd665]" /> Menta adapte la suite quand ta journée change réellement.</div>
        <button type="button" disabled={Boolean(busy) || remaining.length === 0} onClick={() => void noTimeToday()} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#ff9768]/30 bg-[#ff9768]/12 px-4 py-2 text-xs font-bold text-[#ffd0c1] transition hover:bg-[#ff9768]/18 disabled:opacity-40">{busy === "no-time" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FastForward className="h-4 w-4" />} Je n’ai pas le temps aujourd’hui</button>
      </div>

      {error ? <p className="mt-4 rounded-xl border border-[#ff9768]/24 bg-[#ff9768]/12 p-3 text-xs leading-5 text-[#ffd2c4]">{error}</p> : null}
    </section>
  );
}
