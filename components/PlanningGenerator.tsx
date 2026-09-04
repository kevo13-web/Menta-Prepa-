"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BatteryMedium, CalendarClock, GraduationCap, Sparkles } from "lucide-react";
import { CalendarWeek, type DaySchedule } from "@/components/CalendarWeek";
import { GlassCard } from "@/components/GlassCard";
import { PremiumButton } from "@/components/PremiumButton";

const levels = ["Lycée", "Prépa scientifique", "Prépa ECG", "Prépa littéraire", "Fac", "Droit"];
const fallbackSubjects = ["Philosophie", "Mathématiques", "Histoire"];

function parseSubjects(value: string) {
  const subjects = value.split(",").map((subject) => subject.trim()).filter(Boolean);
  return subjects.length > 0 ? subjects : fallbackSubjects;
}

function buildSchedule(subjects: string[], fatigue: number, goal: string): DaySchedule[] {
  const lightMode = fatigue >= 4;
  const main = subjects[0] ?? "Matière prioritaire";
  const second = subjects[1] ?? subjects[0] ?? "Méthode";
  const third = subjects[2] ?? subjects[1] ?? "Culture générale";

  return [
    { day: "Lundi", focus: `Démarrer avec ${main}`, blocks: [
      { time: "08:00", label: "Cours + prise de notes active", type: "cours" },
      { time: "18:15", label: `Révision ciblée : ${main}`, type: "revision" },
      { time: "20:30", label: lightMode ? "Repos cadré" : "Fichage express", type: lightMode ? "repos" : "fichage" },
    ]},
    { day: "Mardi", focus: `Stabiliser ${second}`, blocks: [
      { time: "07:30", label: `Rappel mémoire : ${second}`, type: "fichage" },
      { time: "17:45", label: "Exercices ou exemples corrigés", type: "revision" },
      { time: "21:00", label: "Lecture légère", type: "repos" },
    ]},
    { day: "Mercredi", focus: "Milieu de semaine sans dispersion", blocks: [
      { time: "09:00", label: "Cours et consolidation", type: "cours" },
      { time: "16:00", label: `Plan détaillé : ${third}`, type: "dissertation" },
      { time: "19:00", label: "Correction des erreurs", type: "revision" },
    ]},
    { day: "Jeudi", focus: "Préparer l’oral", blocks: [
      { time: "08:15", label: "Cours + questions à poser", type: "cours" },
      { time: "18:30", label: `Khôlle simulée : ${main}`, type: "dissertation" },
      { time: "20:15", label: "Décompression courte", type: "repos" },
    ]},
    { day: "Vendredi", focus: "Fermer les boucles ouvertes", blocks: [
      { time: "17:30", label: `Révision mixte : ${subjects.slice(0, 2).join(" + ")}`, type: "revision" },
      { time: "19:15", label: "Fiches à trous", type: "fichage" },
    ]},
    { day: "Samedi", focus: goal || "Bloc long de progression", blocks: [
      { time: "09:30", label: `Bloc profond : ${main}`, type: "revision" },
      { time: "14:30", label: "Dissertation / sujet blanc", type: "dissertation" },
      { time: "18:00", label: "Marche ou récupération", type: "repos" },
    ]},
    { day: "Dimanche", focus: "Bilan et semaine suivante", blocks: [
      { time: "10:00", label: "Relecture espacée", type: "fichage" },
      { time: "17:00", label: "Planifier les priorités", type: "revision" },
      { time: "20:00", label: "Repos sans négociation", type: "repos" },
    ]},
  ];
}

const fieldClass = "rounded-xl border border-[#d8e0e6] bg-[#faf7f1] px-3 py-3 text-sm text-frost outline-none transition placeholder:text-[#8a98a5] focus:border-[#79a6cb] focus:ring-2 focus:ring-[#8db5d8]/20";

export function PlanningGenerator() {
  const [level, setLevel] = useState("Prépa littéraire");
  const [subjectsInput, setSubjectsInput] = useState("Philosophie, Histoire, Littérature");
  const [courseHours, setCourseHours] = useState("Lun-Ven 8h-16h, khôlle jeudi 14h");
  const [freeHours, setFreeHours] = useState("18h-21h en semaine, samedi matin");
  const [deadlines, setDeadlines] = useState("DS histoire samedi, dissertation lundi prochain");
  const [fatigue, setFatigue] = useState(3);
  const [goal, setGoal] = useState("Finir une dissertation et revoir deux chapitres prioritaires");
  const [generated, setGenerated] = useState(false);

  const subjects = useMemo(() => parseSubjects(subjectsInput), [subjectsInput]);
  const schedule = useMemo(() => buildSchedule(subjects, fatigue, goal), [subjects, fatigue, goal]);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
      <GlassCard className="h-fit rounded-[26px]">
        <div className="mb-6 flex items-center gap-3 border-b border-[#dce3e7] pb-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dceaf4] text-[#4f83b6]">
            <CalendarClock className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-serif text-2xl font-semibold text-frost">Données de semaine</h2>
            <p className="text-sm text-muted">Un formulaire simple, une simulation immédiate.</p>
          </div>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-frost">Niveau d’étude
            <select value={level} onChange={(event) => setLevel(event.target.value)} className={fieldClass}>
              {levels.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-frost">Matières
            <input value={subjectsInput} onChange={(event) => setSubjectsInput(event.target.value)} className={fieldClass} placeholder="Philosophie, Maths, Histoire" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-frost">Horaires de cours
            <textarea value={courseHours} onChange={(event) => setCourseHours(event.target.value)} rows={3} className={`${fieldClass} resize-none`} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-frost">Heures libres
            <input value={freeHours} onChange={(event) => setFreeHours(event.target.value)} className={fieldClass} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-frost">Devoirs, khôlles, examens
            <textarea value={deadlines} onChange={(event) => setDeadlines(event.target.value)} rows={3} className={`${fieldClass} resize-none`} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-frost">
            <span className="flex items-center justify-between">Niveau de fatigue
              <span className="inline-flex items-center gap-1 rounded-full border border-[#d5dfe6] bg-white/65 px-2 py-1 text-xs text-muted"><BatteryMedium className="h-3 w-3" />{fatigue}/5</span>
            </span>
            <input type="range" min="1" max="5" value={fatigue} onChange={(event) => setFatigue(Number(event.target.value))} className="accent-[#4f83b6]" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-frost">Objectif hebdomadaire
            <textarea value={goal} onChange={(event) => setGoal(event.target.value)} rows={3} className={`${fieldClass} resize-none`} />
          </label>
          <PremiumButton onClick={() => setGenerated(true)} icon={Sparkles} className="mt-2 w-full">Générer mon planning</PremiumButton>
        </div>
      </GlassCard>

      <div className="space-y-5">
        <motion.div
          initial={false}
          animate={generated ? { opacity: 1, y: 0 } : { opacity: 0.92, y: 0 }}
          className="rounded-[26px] border border-[#d6e0e7] bg-white/65 p-5 shadow-[0_14px_40px_rgba(53,82,110,0.05)]"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4f83b6]">Planning {generated ? "personnalisé" : "exemple"}</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-frost">{level}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {subjects.slice(0, 4).map((subject) => (
                <span key={subject} className="rounded-full border border-[#d3dee6] bg-[#eef5f9] px-3 py-1 text-xs text-[#5d7589]">{subject}</span>
              ))}
            </div>
          </div>
          <div className="mt-5 grid gap-3 text-sm text-muted md:grid-cols-3">
            <div className="rounded-2xl border border-[#e0e5e7] bg-[#faf7f1] p-4"><GraduationCap className="mb-2 h-4 w-4 text-[#4f83b6]" />{courseHours}</div>
            <div className="rounded-2xl border border-[#e0e5e7] bg-[#faf7f1] p-4">{freeHours}</div>
            <div className="rounded-2xl border border-[#e0e5e7] bg-[#faf7f1] p-4">{deadlines}</div>
          </div>
        </motion.div>

        <CalendarWeek days={schedule} />
      </div>
    </div>
  );
}
