"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BatteryMedium,
  Brain,
  CalendarClock,
  Camera,
  CheckCircle2,
  Clipboard,
  Clock3,
  FileText,
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
import { suggestedSubjectsForProfile } from "@/data/academicSubjectSuggestions";
import { studyTypeLabel, type StudyTypeKey } from "@/data/frenchStudyPrograms";

const workStyles = ["Sessions courtes", "Équilibré", "Blocs profonds"];
const PROGRESS_KEY = "planning-ai-current";
const fieldClass = "rounded-2xl border border-[#d9e1e8] bg-white/75 px-3.5 py-3 text-sm text-[#294762] outline-none transition placeholder:text-[#98a4b0] focus:border-[#7185f2] focus:ring-4 focus:ring-[#566ff5]/8";

const LEGACY_DEFAULTS = {
  subjectsInput: "Philosophie, Histoire, Géographie, Français, Anglais",
  courseHours: "Lun-Ven 8h-16h, khôlle jeudi 14h",
  freeHours: "18h-21h en semaine, samedi 9h-18h, dimanche après-midi",
  deadlines: "DS histoire samedi, dissertation lundi prochain",
  goal: "Finir une dissertation et revoir deux chapitres prioritaires",
};

type AcademicProfile = {
  user_id: string;
  study_type: string | null;
  study_track: string | null;
  school_level: string | null;
  specialties: string[] | null;
  study_options: string[] | null;
};

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
  studyType?: StudyTypeKey;
  track?: string;
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

function cleanedSavedValue(value: string | undefined, legacy: string) {
  if (!value || value === legacy) return "";
  return value;
}

export function PersonalizedPlanningGenerator({ profile }: { profile: AcademicProfile }) {
  const profileSubjects = useMemo(() => suggestedSubjectsForProfile(profile), [profile]);
  const profileType = profile.study_type
    ? studyTypeLabel(profile.study_type as StudyTypeKey)
    : "Cursus à compléter";
  const profileTrack = [profile.school_level, profile.study_track].filter(Boolean).join(" · ");
  const scopedStorageKey = `menta-ai-planning-v4:${profile.user_id}`;

  const [subjectsInput, setSubjectsInput] = useState(profileSubjects.join(", "));
  const [courseHours, setCourseHours] = useState("");
  const [freeHours, setFreeHours] = useState("");
  const [deadlines, setDeadlines] = useState("");
  const [fatigue, setFatigue] = useState(3);
  const [goal, setGoal] = useState("");
  const [workStyle, setWorkStyle] = useState("Équilibré");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [customizing, setCustomizing] = useState(false);

  const [timetableMode, setTimetableMode] = useState<TimetableMode>("text");
  const [timetableText, setTimetableText] = useState("");
  const [timetableFile, setTimetableFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<TimetableAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const subjects = useMemo(() => parseSubjects(subjectsInput), [subjectsInput]);
  const today = useMemo(() => titleCase(new Date().toLocaleDateString("fr-FR", { weekday: "long" })), []);

  useEffect(() => {
    if (!subjectsInput.trim() && profileSubjects.length) {
      setSubjectsInput(profileSubjects.join(", "));
    }
  }, [profileSubjects, subjectsInput]);

  function applySaved(value: PersistedPlan) {
    if (!value?.plan?.days?.length) return;
    setPlan(value.plan);
    setCompletedIds(Array.isArray(value.completedIds) ? value.completedIds : []);

    const saved = value.inputs;
    if (!saved) return;

    const savedSubjects = cleanedSavedValue(saved.subjectsInput, LEGACY_DEFAULTS.subjectsInput);
    setSubjectsInput(savedSubjects || profileSubjects.join(", "));

    const savedCourses = cleanedSavedValue(saved.courseHours, LEGACY_DEFAULTS.courseHours);
    setCourseHours(savedCourses);
    setTimetableText(savedCourses);
    setFreeHours(cleanedSavedValue(saved.freeHours, LEGACY_DEFAULTS.freeHours));
    setDeadlines(cleanedSavedValue(saved.deadlines, LEGACY_DEFAULTS.deadlines));
    if (saved.fatigue) setFatigue(saved.fatigue);
    setGoal(cleanedSavedValue(saved.goal, LEGACY_DEFAULTS.goal));
    if (saved.workStyle) setWorkStyle(saved.workStyle);
  }

  useEffect(() => {
    let cancelled = false;

    try {
      const raw = window.localStorage.getItem(scopedStorageKey);
      if (raw) applySaved(JSON.parse(raw) as PersistedPlan);
    } catch {
      // Supabase reste la source de vérité du compte.
    }

    const loadAccountPlan = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("user_progress")
        .select("value")
        .eq("user_id", profile.user_id)
        .eq("key", PROGRESS_KEY)
        .maybeSingle();
      if (!cancelled && data?.value) applySaved(data.value as PersistedPlan);
    };

    void loadAccountPlan();
    return () => { cancelled = true; };
  }, [profile.user_id, scopedStorageKey]);

  const currentInputs: Inputs = {
    studyType: (profile.study_type || "autre") as StudyTypeKey,
    track: profileTrack,
    subjectsInput,
    courseHours,
    freeHours,
    deadlines,
    fatigue,
    goal,
    workStyle,
  };

  async function persistPlan(nextPlan: Plan, nextCompletedIds: string[]) {
    const payload: PersistedPlan = { plan: nextPlan, completedIds: nextCompletedIds, inputs: currentInputs };

    try {
      window.localStorage.setItem(scopedStorageKey, JSON.stringify(payload));
    } catch {
      // Continue avec la sauvegarde liée au compte.
    }

    const supabase = createClient();
    await supabase.from("user_progress").upsert(
      {
        user_id: profile.user_id,
        key: PROGRESS_KEY,
        value: payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,key" },
    );
  }

  async function analyzeTimetable() {
    setAnalyzing(true);
    setAnalysisError("");
    try {
      const form = new FormData();
      if (timetableMode === "text") form.append("text", timetableText);
      else if (timetableFile) form.append("file", timetableFile);
      else throw new Error("Ajoute d’abord une photo ou un fichier.");

      const response = await fetch("/api/planning/analyze-timetable", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) throw new Error("Connecte-toi à Menta pour analyser ton emploi du temps.");
        if (data?.error === "FILE_TOO_LARGE") throw new Error("Le fichier est trop lourd. Maximum : 20 Mo.");
        if (data?.error === "UNSUPPORTED_FILE") throw new Error("Format non pris en charge. Utilise PDF, JPG, PNG ou WebP.");
        throw new Error("Menta n’a pas réussi à lire cet emploi du temps. Essaie une image plus nette ou écris les horaires.");
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
          studyType: profileType,
          track: profileTrack,
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
        if (data?.error === "AI_PLANNER_NOT_CONFIGURED") throw new Error("Le Planning IA n’est pas encore configuré sur ce déploiement.");
        throw new Error("Menta n’a pas réussi à construire la semaine. Réessaie dans quelques secondes.");
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
            <p className="mt-4 text-sm leading-6 text-[#667b90]">Ton cursus vient de ton compte. Ici, tu ajoutes seulement ce qui change cette semaine : emploi du temps, disponibilités, échéances, fatigue et objectif.</p>
          </div>

          <div className="grid gap-5 p-5 sm:p-6">
            <section className="rounded-[1.5rem] border border-[#566ff5]/12 bg-[#f7f8ff] p-4">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5267d9]">Matières reconnues pour ton profil</p><p className="mt-1 text-xs leading-5 text-[#718397]">Menta les déduit de ton cursus et de tes options. Tu peux corriger ou compléter la liste.</p></div>
                <Link href="/account/cursus" className="shrink-0 text-[10px] font-bold text-[#5267d9] hover:underline">Modifier le cursus</Link>
              </div>
              <input value={subjectsInput} onChange={(event) => setSubjectsInput(event.target.value)} className={`${fieldClass} mt-3 w-full`} placeholder="Ajoute ici les matières réellement suivies" />
            </section>

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
                <textarea value={timetableText} onChange={(event) => setTimetableText(event.target.value)} rows={4} className={`${fieldClass} mt-3 w-full resize-none`} placeholder="Indique tes cours et créneaux fixes de la semaine" />
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
                <textarea value={freeHours} onChange={(event) => setFreeHours(event.target.value)} rows={2} className={`${fieldClass} resize-none`} placeholder="Indique les créneaux où tu peux réellement travailler" />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-[#334d68]">Échéances prioritaires
              <textarea value={deadlines} onChange={(event) => setDeadlines(event.target.value)} rows={2} className={`${fieldClass} resize-none`} placeholder="Contrôles, devoirs, oraux, concours, dossiers ou autres échéances" />
            </label>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-semibold text-[#334d68]"><span>Niveau de fatigue</span><span className="inline-flex items-center gap-1 rounded-full bg-[#fff0e9] px-2.5 py-1 text-xs text-[#a95b40]"><BatteryMedium className="h-3.5 w-3.5" /> {fatigue}/5</span></div>
              <div className="grid grid-cols-5 gap-2">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setFatigue(value)} className={`min-h-10 rounded-xl border text-sm font-bold transition ${fatigue === value ? "border-[#ff9768]/40 bg-[#fff0e9] text-[#ad5b40] shadow-sm" : "border-[#dbe2e8] bg-[#fafbfc] text-[#8290a0] hover:border-[#ffb49d]"}`}>{value}</button>)}</div>
              <div className="mt-1.5 flex justify-between text-[10px] text-[#93a0ad]"><span>Très en forme</span><span>Épuisé</span></div>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-[#334d68]">Objectif de la semaine
              <textarea value={goal} onChange={(event) => setGoal(event.target.value)} rows={3} className={`${fieldClass} resize-none`} placeholder="Ce que tu veux absolument avoir accompli d’ici la fin de la semaine" />
            </label>

            {error ? <div className="rounded-2xl border border-[#ff9768]/30 bg-[#fff0e9] p-3 text-xs leading-5 text-[#96533d]">{error}</div> : null}

            <button type="button" onClick={() => void generatePlan()} disabled={loading || subjects.length === 0 || !freeHours.trim() || !goal.trim() || !profileTrack.trim()} className="group inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-[#566ff5] px-5 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(86,111,245,.25)] transition hover:-translate-y-0.5 hover:bg-[#465de4] disabled:cursor-not-allowed disabled:opacity-55">{loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 transition group-hover:rotate-12" />}{loading ? "Menta construit ta semaine…" : plan ? "Réoptimiser ma semaine" : "Générer mon planning IA"}</button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 space-y-5">
        {loading ? (
          <div className="overflow-hidden rounded-[2rem] border border-[#566ff5]/15 bg-gradient-to-br from-[#edf1ff] via-white to-[#e8fbf5] p-7 shadow-[0_20px_60px_rgba(53,82,110,.08)]">
            <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#566ff5] text-white"><Brain className="h-5 w-5 animate-pulse" /></span><div><p className="text-xs font-bold uppercase tracking-[0.17em] text-[#566ff5]">Analyse stratégique</p><h2 className="display-serif text-2xl font-semibold text-[#1d3552]">Menta arbitre tes priorités</h2></div></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">{["Lecture de ton profil", "Priorisation de tes échéances", "Équilibrage charge / récupération"].map((label, index) => <div key={label} className="rounded-2xl bg-white/75 p-4 text-sm font-semibold text-[#60768c] shadow-sm"><span className="mb-2 block text-xs font-bold text-[#566ff5]">0{index + 1}</span>{label}</div>)}</div>
          </div>
        ) : plan ? (
          <div className="space-y-5">
            <section className="relative overflow-hidden rounded-[2rem] border border-[#566ff5]/14 bg-gradient-to-br from-[#e9edff] via-white to-[#e8fbf5] p-6 shadow-[0_20px_60px_rgba(53,82,110,.08)] sm:p-7">
              <div className="absolute right-[-80px] top-[-90px] h-64 w-64 rounded-full bg-[#58d6b1]/12 blur-3xl" />
              <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl"><div className="flex flex-wrap gap-2"><span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.17em] text-[#5267d9] shadow-sm"><Zap className="h-3.5 w-3.5" /> Stratégie Menta AI</span><span className="rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-bold text-[#557087] shadow-sm">{profileType}{profileTrack ? ` · ${profileTrack}` : ""}</span></div><h2 className="mt-4 display-serif text-3xl font-semibold leading-tight text-[#182b49] sm:text-4xl">{plan.summary}</h2><p className="mt-3 text-sm leading-6 text-[#64798e]">{plan.strategy}</p></div>
                <div className="flex shrink-0 flex-wrap gap-2"><button type="button" onClick={() => void copyPlan()} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#566ff5]/15 bg-white/78 px-4 py-2 text-xs font-bold text-[#5267d9] shadow-sm transition hover:-translate-y-0.5"><Clipboard className="h-3.5 w-3.5" /> {copied ? "Copié" : "Copier"}</button><button type="button" onClick={() => setCustomizing((value) => !value)} className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold shadow-sm transition hover:-translate-y-0.5 ${customizing ? "bg-[#43ae91] text-white" : "border border-[#43ae91]/20 bg-white/78 text-[#31856f]"}`}><Pencil className="h-3.5 w-3.5" /> {customizing ? "Terminer" : "Personnaliser"}</button><button type="button" onClick={() => void generatePlan()} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#566ff5] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5"><RefreshCw className="h-3.5 w-3.5" /> Rééquilibrer</button></div>
              </div>

              <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={<TrendingUp className="h-4 w-4" />} label="Progression" value={`${progress}%`} note={`${completedWork}/${workBlocks.length} blocs`} /><Metric icon={<Clock3 className="h-4 w-4" />} label="Travail prévu" value={`${plan.weekly_hours} h`} note="hors cours" /><Metric icon={<BatteryMedium className="h-4 w-4" />} label="Charge" value={titleCase(plan.workload)} note={`fatigue ${fatigue}/5`} /><Metric icon={<Target className="h-4 w-4" />} label="Priorité absolue" value={plan.priority} note="à sécuriser d’abord" compact /></div>
            </section>

            {customizing ? <div className="rounded-[1.5rem] border border-[#58d6b1]/22 bg-[#eafaf5] px-4 py-3 text-xs leading-5 text-[#397364]"><strong>Mode personnalisation.</strong> Clique sur un jour pour modifier les blocs. Les changements restent liés à ton compte.</div> : null}

            <section className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
              <div className="rounded-[1.8rem] border border-[#58d6b1]/22 bg-[#eafaf5] p-5 shadow-[0_14px_40px_rgba(53,82,110,.05)]"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#31856f]"><CheckCircle2 className="h-4 w-4" /> Aujourd’hui · {today}</div>{nextTask ? <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold text-[#5d7a71]">Prochain bloc recommandé</p><h3 className="mt-1 display-serif text-2xl font-semibold text-[#214d43]">{nextTask.label}</h3><p className="mt-2 text-sm text-[#5f776f]">{nextTask.time} · {nextTask.duration} min{nextTask.subject ? ` · ${nextTask.subject}` : ""}</p></div><Link href="/focus" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#42b998] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5"><Zap className="h-4 w-4" /> Commencer en Focus</Link></div> : <p className="mt-4 text-sm leading-6 text-[#587269]">Aucun bloc de travail restant pour aujourd’hui.</p>}</div>
              <div className="rounded-[1.8rem] border border-[#ffd665]/32 bg-[#fff9e5] p-5 shadow-[0_14px_40px_rgba(53,82,110,.04)]"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#9d8127]"><Sparkles className="h-4 w-4" /> Coaching</div><div className="mt-3 space-y-2">{plan.coaching.map((item) => <p key={item} className="text-xs leading-5 text-[#746536]">• {item}</p>)}</div></div>
            </section>

            <CalendarWeek days={plan.days} completedIds={completedIds} onToggle={toggleBlock} today={today} editable={customizing} onDaysChange={updateDays} />
          </div>
        ) : (
          <div className="rounded-[2rem] border border-[#566ff5]/12 bg-white/70 p-8 text-center shadow-[0_18px_50px_rgba(53,82,110,.06)]">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#edf1ff] text-[#566ff5]"><Brain className="h-6 w-6" /></span>
            <h2 className="mt-4 display-serif text-2xl font-semibold text-[#1d3552]">Menta connaît déjà ton cursus.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#6f8296]">Renseigne seulement ta semaine réelle. Le planning sera construit à partir de ton profil académique, de tes matières, de tes échéances et de ta bibliothèque Menta.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function SourceButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button type="button" onClick={onClick} className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-[11px] font-bold transition ${active ? "border-[#43ae91]/35 bg-white text-[#31856f] shadow-sm" : "border-[#dce8e4] bg-white/45 text-[#7b9089] hover:bg-white"}`}>{icon}{label}</button>;
}

function Metric({ icon, label, value, note, compact = false }: { icon: React.ReactNode; label: string; value: string; note: string; compact?: boolean }) {
  return <div className="rounded-2xl border border-white/80 bg-white/72 p-4 shadow-sm"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#7a8da1]">{icon}{label}</div><p className={`mt-2 font-bold text-[#294762] ${compact ? "text-sm leading-5" : "text-2xl"}`}>{value}</p><p className="mt-1 text-[10px] text-[#8c9aa8]">{note}</p></div>;
}
