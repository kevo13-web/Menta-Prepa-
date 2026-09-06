"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BatteryMedium,
  Brain,
  CalendarClock,
  Camera,
  CheckCircle2,
  Clipboard,
  Clock3,
  FileText,
  GraduationCap,
  Pencil,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Type,
  Upload,
  Zap,
} from "lucide-react";
import { CalendarWeek, type DaySchedule } from "@/components/CalendarWeek";
import { createClient } from "@/lib/supabase/client";
import { getTrackSuggestions, studyTypeLabel, studyTypeOptions, type StudyTypeKey } from "@/data/frenchStudyPrograms";

const workStyles = ["Sessions courtes", "Équilibré", "Blocs profonds"];
const STORAGE_KEY = "menta-ai-planning-v3";
const PROGRESS_KEY = "planning-ai-current";

const fieldClass = "rounded-2xl border border-[#d9e1e8] bg-white/75 px-3.5 py-3 text-sm text-[#294762] outline-none transition placeholder:text-[#98a4b0] focus:border-[#7185f2] focus:ring-4 focus:ring-[#566ff5]/8";

type Plan = {
  summary: string;
  strategy: string;
  weekly_hours: number;
  workload: "légère" | "équilibrée" | "soutenue";
  priority: string;
  coaching: string[];
  days: DaySchedule[];
  source?: string;
  model?: string;
};

type Inputs = {
  studyType: StudyTypeKey;
  track: string;
  subjectsInput: string;
  courseHours: string;
  freeHours: string;
  deadlines: string;
  fatigue: number;
  goal: string;
  workStyle: string;
};

type PersistedPlan = {
  plan: Plan;
  completedIds: string[];
  inputs?: Partial<Inputs>;
};

type TimetableAnalysis = {
  summary: string;
  weekly_text: string;
  subjects: string[];
  confidence: number;
  warnings: string[];
};

type TimetableMode = "text" | "photo" | "file";

function parseSubjects(value: string) {
  return value.split(",").map((subject) => subject.trim()).filter(Boolean);
}

function titleCase(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

export function PlanningGenerator() {
  const [studyType, setStudyType] = useState<StudyTypeKey>("cpge");
  const [track, setTrack] = useState("2e année — Lettres A/L (khâgne)");
  const [subjectsInput, setSubjectsInput] = useState("Philosophie, Histoire, Géographie, Français, Anglais");
  const [courseHours, setCourseHours] = useState("Lun-Ven 8h-16h, khôlle jeudi 14h");
  const [freeHours, setFreeHours] = useState("18h-21h en semaine, samedi 9h-18h, dimanche après-midi");
  const [deadlines, setDeadlines] = useState("DS histoire samedi, dissertation lundi prochain");
  const [fatigue, setFatigue] = useState(3);
  const [goal, setGoal] = useState("Finir une dissertation et revoir deux chapitres prioritaires");
  const [workStyle, setWorkStyle] = useState("Équilibré");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [customizing, setCustomizing] = useState(false);

  const [timetableMode, setTimetableMode] = useState<TimetableMode>("text");
  const [timetableText, setTimetableText] = useState(courseHours);
  const [timetableFile, setTimetableFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<TimetableAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const subjects = useMemo(() => parseSubjects(subjectsInput), [subjectsInput]);
  const trackSuggestions = useMemo(() => getTrackSuggestions(studyType), [studyType]);
  const today = useMemo(() => titleCase(new Date().toLocaleDateString("fr-FR", { weekday: "long" })), []);

  const currentInputs: Inputs = {
    studyType,
    track,
    subjectsInput,
    courseHours,
    freeHours,
    deadlines,
    fatigue,
    goal,
    workStyle,
  };

  function applySaved(value: PersistedPlan) {
    if (!value?.plan?.days?.length) return;
    setPlan(value.plan);
    setCompletedIds(Array.isArray(value.completedIds) ? value.completedIds : []);
    const saved = value.inputs;
    if (!saved) return;
    if (saved.studyType) setStudyType(saved.studyType);
    if (saved.track) setTrack(saved.track);
    if (saved.subjectsInput) setSubjectsInput(saved.subjectsInput);
    if (saved.courseHours) {
      setCourseHours(saved.courseHours);
      setTimetableText(saved.courseHours);
    }
    if (saved.freeHours) setFreeHours(saved.freeHours);
    if (saved.deadlines !== undefined) setDeadlines(saved.deadlines);
    if (saved.fatigue) setFatigue(saved.fatigue);
    if (saved.goal) setGoal(saved.goal);
    if (saved.workStyle) setWorkStyle(saved.workStyle);
  }

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) applySaved(JSON.parse(raw) as PersistedPlan);
    } catch {
      // Supabase remains the account source of truth.
    }

    let cancelled = false;
    const loadAccountPlan = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_progress")
        .select("value")
        .eq("user_id", user.id)
        .eq("key", PROGRESS_KEY)
        .maybeSingle();
      if (!cancelled && data?.value) applySaved(data.value as PersistedPlan);
    };
    void loadAccountPlan();
    return () => { cancelled = true; };
  }, []);

  async function persistPlan(nextPlan: Plan, nextCompletedIds: string[]) {
    const payload: PersistedPlan = { plan: nextPlan, completedIds: nextCompletedIds, inputs: currentInputs };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Continue with account persistence.
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_progress").upsert(
      {
        user_id: user.id,
        key: PROGRESS_KEY,
        value: payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,key" },
    );
  }

  function changeStudyType(value: StudyTypeKey) {
    setStudyType(value);
    const suggestions = getTrackSuggestions(value);
    setTrack(suggestions[0] || "");
  }

  async function analyzeTimetable() {
    setAnalyzing(true);
    setAnalysisError("");
    try {
      const form = new FormData();
      if (timetableMode === "text") form.append("text", timetableText);
      else if (timetableFile) form.append("file", timetableFile);
      else throw new Error("Ajoute d'abord une photo ou un fichier.");

      const response = await fetch("/api/planning/analyze-timetable", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) throw new Error("Connecte-toi à Menta pour analyser ton emploi du temps.");
        if (data?.error === "FILE_TOO_LARGE") throw new Error("Le fichier est trop lourd. Maximum : 20 Mo.");
        if (data?.error === "UNSUPPORTED_FILE") throw new Error("Format non pris en charge. Utilise PDF, JPG, PNG ou WebP.");
        throw new Error("Menta n'a pas réussi à lire cet emploi du temps. Essaie une image plus nette ou écris les horaires.");
      }

      const nextAnalysis = data as TimetableAnalysis;
      setAnalysis(nextAnalysis);
      setCourseHours(nextAnalysis.weekly_text);
      setTimetableText(nextAnalysis.weekly_text);
      if (nextAnalysis.subjects?.length) {
        const merged = Array.from(new Set([...subjects, ...nextAnalysis.subjects]));
        setSubjectsInput(merged.join(", "));
      }
    } catch (cause) {
      setAnalysisError(cause instanceof Error ? cause.message : "Analyse impossible.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function generatePlan() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/planning/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studyType: studyTypeLabel(studyType),
          track,
          subjects,
          courseHours,
          freeHours,
          deadlines,
          fatigue,
          goal,
          workStyle,
          weekAnchor: new Date().toISOString().slice(0, 10),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) throw new Error("Connecte-toi à Menta pour générer ton planning IA personnel.");
        if (data?.error === "AI_PLANNER_NOT_CONFIGURED") throw new Error("Le Planning IA n'est pas encore configuré sur ce déploiement.");
        throw new Error("Menta n'a pas réussi à construire la semaine. Réessaie dans quelques secondes.");
      }

      const nextPlan = data as Plan;
      setPlan(nextPlan);
      setCompletedIds([]);
      setCustomizing(false);
      await persistPlan(nextPlan, []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Une erreur est survenue pendant la génération.");
    } finally {
      setLoading(false);
    }
  }

  function toggleBlock(id: string) {
    if (!plan) return;
    setCompletedIds((previous) => {
      const next = previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id];
      void persistPlan(plan, next);
      return next;
    });
  }

  function updateDays(days: DaySchedule[]) {
    if (!plan) return;
    const next = { ...plan, days };
    setPlan(next);
    void persistPlan(next, completedIds);
  }

  async function copyPlan() {
    if (!plan) return;
    const text = plan.days.map((day) => `${day.day} — ${day.focus}\n${day.blocks.map((block) => `${block.time} · ${block.duration} min · ${block.label}`).join("\n")}`).join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const workBlocks = useMemo(() => plan?.days.flatMap((day) => day.blocks).filter((block) => block.type !== "repos" && block.type !== "cours") ?? [], [plan]);
  const completedWork = workBlocks.filter((block) => completedIds.includes(block.id)).length;
  const progress = workBlocks.length ? Math.round((completedWork / workBlocks.length) * 100) : 0;
  const todayPlan = plan?.days.find((day) => day.day.toLowerCase() === today.toLowerCase());
  const nextTask = todayPlan?.blocks.find((block) => block.type !== "repos" && block.type !== "cours" && !completedIds.includes(block.id));

  return (
    <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
      <aside className="h-fit xl:sticky xl:top-24">
        <div className="overflow-hidden rounded-[2rem] border border-[#566ff5]/14 bg-white/78 shadow-[0_20px_60px_rgba(53,82,110,.08)] backdrop-blur-2xl">
          <div className="bg-gradient-to-br from-[#edf1ff] via-white to-[#e8fbf5] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#566ff5] text-white shadow-[0_10px_26px_rgba(86,111,245,.24)]"><CalendarClock className="h-5 w-5" /></span>
              <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#566ff5]">Menta Planner</p><h2 className="display-serif text-2xl font-semibold text-[#1d3552]">Ta semaine, réellement personnalisée</h2></div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#667b90]">Menta comprend ton cursus, lit ton emploi du temps et arbitre entre contraintes, échéances et énergie.</p>
          </div>

          <div className="grid gap-5 p-5 sm:p-6">
            <section className="rounded-[1.5rem] border border-[#566ff5]/12 bg-[#f7f8ff] p-4">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#5267d9]"><GraduationCap className="h-4 w-4" /> Ton cursus</div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-[#334d68]">Type d’études
                  <select value={studyType} onChange={(event) => changeStudyType(event.target.value as StudyTypeKey)} className={fieldClass}>{studyTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#334d68]">Filière / année
                  <input list="menta-study-tracks" value={track} onChange={(event) => setTrack(event.target.value)} className={fieldClass} placeholder="Ex. L2 — Droit" />
                  <datalist id="menta-study-tracks">{trackSuggestions.map((item) => <option key={item} value={item} />)}</datalist>
                </label>
              </div>
              <p className="mt-2 text-[10px] leading-4 text-[#8493a3]">La filière reste libre : tu peux saisir le nom exact de ton parcours même s’il n’est pas proposé dans les suggestions.</p>
            </section>

            <label className="grid gap-2 text-sm font-semibold text-[#334d68]">Matières / UE principales
              <input value={subjectsInput} onChange={(event) => setSubjectsInput(event.target.value)} className={fieldClass} placeholder="Droit civil, statistiques, anatomie…" />
            </label>

            <section className="rounded-[1.5rem] border border-[#58d6b1]/20 bg-[#f3fcf9] p-4">
              <div className="flex items-start justify-between gap-3">
                <div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#31856f]"><Sparkles className="h-4 w-4" /> Analyse d’emploi du temps</div><p className="mt-1 text-xs leading-5 text-[#6b8179]">Écris-le, photographie-le ou importe un PDF : Menta reconstruit les créneaux fixes.</p></div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <SourceButton active={timetableMode === "text"} onClick={() => setTimetableMode("text")} icon={<Type className="h-4 w-4" />} label="Écrire" />
                <SourceButton active={timetableMode === "photo"} onClick={() => { setTimetableMode("photo"); setTimetableFile(null); }} icon={<Camera className="h-4 w-4" />} label="Photo" />
                <SourceButton active={timetableMode === "file"} onClick={() => { setTimetableMode("file"); setTimetableFile(null); }} icon={<FileText className="h-4 w-4" />} label="PDF" />
              </div>

              {timetableMode === "text" ? (
                <textarea value={timetableText} onChange={(event) => setTimetableText(event.target.value)} rows={4} className={`${fieldClass} mt-3 w-full resize-none`} placeholder="Lundi 8h-10h droit civil, 10h-12h TD…" />
              ) : (
                <label className="mt-3 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#58d6b1]/30 bg-white/65 p-4 text-center transition hover:bg-white">
                  <Upload className="h-5 w-5 text-[#43ae91]" />
                  <span className="mt-2 text-xs font-bold text-[#416e62]">{timetableFile ? timetableFile.name : timetableMode === "photo" ? "Choisir une photo de l’emploi du temps" : "Choisir un PDF"}</span>
                  <span className="mt-1 text-[10px] text-[#82958f]">{timetableMode === "photo" ? "JPG, PNG ou WebP" : "PDF · 20 Mo maximum"}</span>
                  <input type="file" className="hidden" accept={timetableMode === "photo" ? "image/jpeg,image/png,image/webp" : "application/pdf"} onChange={(event) => setTimetableFile(event.target.files?.[0] || null)} />
                </label>
              )}

              <button type="button" onClick={() => void analyzeTimetable()} disabled={analyzing || (timetableMode === "text" ? !timetableText.trim() : !timetableFile)} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#43ae91] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">{analyzing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}{analyzing ? "Menta lit l’emploi du temps…" : "Analyser mon emploi du temps"}</button>

              {analysisError ? <p className="mt-3 rounded-xl bg-[#fff0e9] p-3 text-[11px] leading-5 text-[#96533d]">{analysisError}</p> : null}
              {analysis ? <div className="mt-3 rounded-xl border border-[#58d6b1]/18 bg-white/75 p-3"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#31856f]">Emploi du temps compris</span><span className="text-[10px] font-semibold text-[#71887f]">Confiance {Math.round(analysis.confidence * 100)}%</span></div><p className="mt-2 text-xs leading-5 text-[#60776f]">{analysis.summary}</p>{analysis.warnings?.length ? <p className="mt-2 text-[10px] leading-4 text-[#a76b3e]">À vérifier : {analysis.warnings.join(" · ")}</p> : null}</div> : null}
            </section>

            <label className="grid gap-2 text-sm font-semibold text-[#334d68]">Emploi du temps reconnu / contraintes fixes
              <textarea value={courseHours} onChange={(event) => setCourseHours(event.target.value)} rows={3} className={`${fieldClass} resize-none`} placeholder="Les cours analysés apparaissent ici et restent modifiables." />
            </label>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-[#334d68]">Style de travail
                <select value={workStyle} onChange={(event) => setWorkStyle(event.target.value)} className={fieldClass}>{workStyles.map((item) => <option key={item}>{item}</option>)}</select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#334d68]">Disponibilités de travail
                <textarea value={freeHours} onChange={(event) => setFreeHours(event.target.value)} rows={2} className={`${fieldClass} resize-none`} placeholder="18h-21h, samedi matin…" />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-[#334d68]">Échéances prioritaires
              <textarea value={deadlines} onChange={(event) => setDeadlines(event.target.value)} rows={2} className={`${fieldClass} resize-none`} placeholder="Partiels, DS, khôlles, concours, dossiers…" />
            </label>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-semibold text-[#334d68]"><span>Niveau de fatigue</span><span className="inline-flex items-center gap-1 rounded-full bg-[#fff0e9] px-2.5 py-1 text-xs text-[#a95b40]"><BatteryMedium className="h-3.5 w-3.5" /> {fatigue}/5</span></div>
              <div className="grid grid-cols-5 gap-2">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setFatigue(value)} className={`min-h-10 rounded-xl border text-sm font-bold transition ${fatigue === value ? "border-[#ff9768]/40 bg-[#fff0e9] text-[#ad5b40] shadow-sm" : "border-[#dbe2e8] bg-[#fafbfc] text-[#8290a0] hover:border-[#ffb49d]"}`}>{value}</button>)}</div>
              <div className="mt-1.5 flex justify-between text-[10px] text-[#93a0ad]"><span>Très en forme</span><span>Épuisé</span></div>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-[#334d68]">Objectif de la semaine
              <textarea value={goal} onChange={(event) => setGoal(event.target.value)} rows={3} className={`${fieldClass} resize-none`} placeholder="Ce que tu veux absolument avoir accompli dimanche soir" />
            </label>

            {error ? <div className="rounded-2xl border border-[#ff9768]/30 bg-[#fff0e9] p-3 text-xs leading-5 text-[#96533d]">{error}</div> : null}

            <button type="button" onClick={() => void generatePlan()} disabled={loading || subjects.length === 0 || !freeHours.trim() || !goal.trim() || !track.trim()} className="group inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-[#566ff5] px-5 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(86,111,245,.25)] transition hover:-translate-y-0.5 hover:bg-[#465de4] disabled:cursor-not-allowed disabled:opacity-55">{loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 transition group-hover:rotate-12" />}{loading ? "Menta construit ta semaine…" : plan ? "Réoptimiser ma semaine" : "Générer mon planning IA"}</button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 space-y-5">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="overflow-hidden rounded-[2rem] border border-[#566ff5]/15 bg-gradient-to-br from-[#edf1ff] via-white to-[#e8fbf5] p-7 shadow-[0_20px_60px_rgba(53,82,110,.08)]">
              <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#566ff5] text-white"><Brain className="h-5 w-5 animate-pulse" /></span><div><p className="text-xs font-bold uppercase tracking-[0.17em] text-[#566ff5]">Analyse stratégique</p><h2 className="display-serif text-2xl font-semibold text-[#1d3552]">Menta arbitre tes priorités</h2></div></div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">{["Lecture du cursus et des contraintes", "Priorisation des échéances", "Équilibrage charge / récupération"].map((label, index) => <div key={label} className="rounded-2xl bg-white/75 p-4 text-sm font-semibold text-[#60768c] shadow-sm"><span className="mb-2 block text-xs font-bold text-[#566ff5]">0{index + 1}</span>{label}</div>)}</div>
            </motion.div>
          ) : plan ? (
            <motion.div key="plan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <section className="relative overflow-hidden rounded-[2rem] border border-[#566ff5]/14 bg-gradient-to-br from-[#e9edff] via-white to-[#e8fbf5] p-6 shadow-[0_20px_60px_rgba(53,82,110,.08)] sm:p-7">
                <div className="absolute right-[-80px] top-[-90px] h-64 w-64 rounded-full bg-[#58d6b1]/12 blur-3xl" />
                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl"><div className="flex flex-wrap gap-2"><span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.17em] text-[#5267d9] shadow-sm"><Zap className="h-3.5 w-3.5" /> Stratégie Menta AI</span><span className="rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-bold text-[#557087] shadow-sm">{studyTypeLabel(studyType)} · {track}</span></div><h2 className="mt-4 display-serif text-3xl font-semibold leading-tight text-[#182b49] sm:text-4xl">{plan.summary}</h2><p className="mt-3 text-sm leading-6 text-[#64798e]">{plan.strategy}</p></div>
                  <div className="flex shrink-0 flex-wrap gap-2"><button type="button" onClick={() => void copyPlan()} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#566ff5]/15 bg-white/78 px-4 py-2 text-xs font-bold text-[#5267d9] shadow-sm transition hover:-translate-y-0.5"><Clipboard className="h-3.5 w-3.5" /> {copied ? "Copié" : "Copier"}</button><button type="button" onClick={() => setCustomizing((value) => !value)} className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold shadow-sm transition hover:-translate-y-0.5 ${customizing ? "bg-[#43ae91] text-white" : "border border-[#43ae91]/20 bg-white/78 text-[#31856f]"}`}><Pencil className="h-3.5 w-3.5" /> {customizing ? "Terminer" : "Personnaliser"}</button><button type="button" onClick={() => void generatePlan()} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#566ff5] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5"><RefreshCw className="h-3.5 w-3.5" /> Rééquilibrer</button></div>
                </div>

                <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={<TrendingUp className="h-4 w-4" />} label="Progression" value={`${progress}%`} note={`${completedWork}/${workBlocks.length} blocs`} tone="blue" /><Metric icon={<Clock3 className="h-4 w-4" />} label="Travail prévu" value={`${plan.weekly_hours} h`} note="hors cours" tone="mint" /><Metric icon={<BatteryMedium className="h-4 w-4" />} label="Charge" value={titleCase(plan.workload)} note={`fatigue ${fatigue}/5`} tone="coral" /><Metric icon={<Target className="h-4 w-4" />} label="Priorité absolue" value={plan.priority} note="à sécuriser d’abord" tone="sun" compact /></div>
              </section>

              {customizing ? <div className="rounded-[1.5rem] border border-[#58d6b1]/22 bg-[#eafaf5] px-4 py-3 text-xs leading-5 text-[#397364]"><strong>Mode personnalisation.</strong> Clique sur un jour pour l’ouvrir en grand. Tu peux modifier les heures, durées, matières, types de blocs, objectifs, supprimer des tâches ou en ajouter. Les changements sont sauvegardés.</div> : null}

              <section className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
                <div className="rounded-[1.8rem] border border-[#58d6b1]/22 bg-[#eafaf5] p-5 shadow-[0_14px_40px_rgba(53,82,110,.05)]"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#31856f]"><CheckCircle2 className="h-4 w-4" /> Aujourd’hui · {today}</div>{nextTask ? <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold text-[#5d7a71]">Prochain bloc recommandé</p><h3 className="mt-1 display-serif text-2xl font-semibold text-[#214d43]">{nextTask.label}</h3><p className="mt-2 text-sm text-[#5f776f]">{nextTask.time} · {nextTask.duration} min{nextTask.subject ? ` · ${nextTask.subject}` : ""}</p></div><Link href="/focus" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#42b998] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5"><Zap className="h-4 w-4" /> Commencer en Focus</Link></div> : <p className="mt-4 text-sm leading-6 text-[#587269]">Aucun bloc de travail restant pour aujourd’hui. Garde l’énergie pour la suite de la semaine.</p>}</div>
                <div className="rounded-[1.8rem] border border-[#ffd665]/32 bg-[#fff9e5] p-5 shadow-[0_14px_40px_rgba(53,82,110,.05)]"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#9a7922]"><Brain className="h-4 w-4" /> Coaching de semaine</div><div className="mt-4 space-y-2.5">{plan.coaching.slice(0, 3).map((advice) => <p key={advice} className="rounded-xl bg-white/60 px-3 py-2 text-xs leading-5 text-[#6f654a]">{advice}</p>)}</div></div>
              </section>

              <div><div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#566ff5]">Semaine optimisée</p><h2 className="mt-1 display-serif text-3xl font-semibold text-[#1d3552]">Ton plan d’exécution</h2></div><p className="hidden max-w-sm text-right text-xs leading-5 text-[#8392a1] sm:block">Clique sur un jour : il s’ouvre en grand et remplace la vue de semaine.</p></div><CalendarWeek days={plan.days} completedIds={completedIds} onToggle={toggleBlock} today={today} editable={customizing} onDaysChange={updateDays} /></div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden rounded-[2rem] border border-[#566ff5]/12 bg-white/70 p-6 shadow-[0_18px_55px_rgba(53,82,110,.06)] sm:p-8">
              <div className="max-w-2xl"><div className="inline-flex items-center gap-2 rounded-full bg-[#edf1ff] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.17em] text-[#5267d9]"><Sparkles className="h-3.5 w-3.5" /> Planning réellement personnel</div><h2 className="mt-4 display-serif text-4xl font-semibold leading-tight text-[#1d3552]">Donne à Menta ton vrai rythme de vie.</h2><p className="mt-4 text-sm leading-7 text-[#6b7f93]">Choisis ton cursus, fais analyser ton emploi du temps, indique tes échéances et ton niveau de fatigue. Menta construit ensuite une semaine qui respecte les cours au lieu de les deviner.</p></div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3"><PreviewCard icon={<Camera className="h-5 w-5" />} title="Emploi du temps" text="Photo, PDF ou saisie libre : Menta reconstruit les créneaux fixes." tone="blue" /><PreviewCard icon={<GraduationCap className="h-5 w-5" />} title="Cursus français" text="CPGE, licence, BUT, BTS, master, santé, ingénieur et parcours personnalisés." tone="mint" /><PreviewCard icon={<BatteryMedium className="h-5 w-5" />} title="Énergie" text="Le volume de travail s’adapte réellement à ton niveau de fatigue." tone="coral" /></div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function SourceButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button type="button" onClick={onClick} className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-bold transition ${active ? "border-[#58d6b1]/35 bg-white text-[#287a64] shadow-sm" : "border-transparent bg-[#e9f7f3] text-[#729187] hover:bg-white/80"}`}>{icon}{label}</button>;
}

function Metric({ icon, label, value, note, tone, compact = false }: { icon: React.ReactNode; label: string; value: string; note: string; tone: "blue" | "mint" | "coral" | "sun"; compact?: boolean }) {
  const styles = { blue: "bg-[#edf1ff] text-[#5267d9]", mint: "bg-[#e9faf5] text-[#287a64]", coral: "bg-[#fff0e9] text-[#a85b40]", sun: "bg-[#fff8dd] text-[#8a6e1f]" };
  return <div className="rounded-2xl border border-white/70 bg-white/72 p-4 shadow-sm"><div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${styles[tone]}`}>{icon}{label}</div><p className={`mt-3 font-bold text-[#243e5b] ${compact ? "text-sm leading-5" : "text-2xl"}`}>{value}</p><p className="mt-1 text-[10px] text-[#8795a3]">{note}</p></div>;
}

function PreviewCard({ icon, title, text, tone }: { icon: React.ReactNode; title: string; text: string; tone: "blue" | "mint" | "coral" }) {
  const styles = { blue: "bg-[#edf1ff] text-[#5267d9]", mint: "bg-[#e9faf5] text-[#287a64]", coral: "bg-[#fff0e9] text-[#a85b40]" };
  return <div className="rounded-[1.6rem] border border-[#dfe5eb] bg-white/75 p-5"><span className={`grid h-11 w-11 place-items-center rounded-2xl ${styles[tone]}`}>{icon}</span><h3 className="mt-4 display-serif text-xl font-semibold text-[#294762]">{title}</h3><p className="mt-2 text-xs leading-5 text-[#748699]">{text}</p></div>;
}
