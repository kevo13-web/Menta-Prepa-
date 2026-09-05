"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Check, ChevronRight, Circle, Clock, Play, Plus, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ScheduleBlock = {
  id: string;
  label: string;
  time: string;
  duration: number;
  type: "cours" | "revision" | "fichage" | "dissertation" | "oral" | "repos";
  subject?: string;
  reason?: string;
};

export type DaySchedule = {
  day: string;
  date?: string;
  focus: string;
  energy?: "léger" | "modéré" | "intense";
  blocks: ScheduleBlock[];
};

type CalendarWeekProps = {
  days: DaySchedule[];
  completedIds?: string[];
  onToggle?: (id: string) => void;
  today?: string;
  editable?: boolean;
  onDaysChange?: (days: DaySchedule[]) => void;
};

const blockStyles: Record<ScheduleBlock["type"], string> = {
  cours: "border-[#cfd9e4] bg-white/80 text-[#294762]",
  revision: "border-[#566ff5]/20 bg-[#edf1ff] text-[#263d78]",
  fichage: "border-[#58d6b1]/28 bg-[#e9faf5] text-[#276c5b]",
  dissertation: "border-[#ff9768]/28 bg-[#fff0e9] text-[#8a4d35]",
  oral: "border-[#ffd665]/42 bg-[#fff8dd] text-[#77601e]",
  repos: "border-[#d9dde3] bg-[#f5f3ee] text-[#718091]",
};

const energyStyles = {
  léger: "bg-[#e9faf5] text-[#287a64]",
  modéré: "bg-[#edf1ff] text-[#5267d9]",
  intense: "bg-[#fff0e9] text-[#bb6245]",
};

const editField = "rounded-xl border border-[#dbe2e9] bg-white/85 px-3 py-2 text-xs text-[#294762] outline-none focus:border-[#7185f2] focus:ring-3 focus:ring-[#566ff5]/8";

export function CalendarWeek({ days, completedIds = [], onToggle, today, editable = false, onDaysChange }: CalendarWeekProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  function changeDay(index: number, patch: Partial<DaySchedule>) {
    if (!onDaysChange) return;
    onDaysChange(days.map((day, dayIndex) => dayIndex === index ? { ...day, ...patch } : day));
  }

  function changeBlock(dayIndex: number, blockIndex: number, patch: Partial<ScheduleBlock>) {
    if (!onDaysChange) return;
    onDaysChange(days.map((day, index) => index !== dayIndex ? day : {
      ...day,
      blocks: day.blocks.map((block, indexBlock) => indexBlock === blockIndex ? { ...block, ...patch } : block),
    }));
  }

  function deleteBlock(dayIndex: number, blockIndex: number) {
    if (!onDaysChange) return;
    onDaysChange(days.map((day, index) => index !== dayIndex ? day : {
      ...day,
      blocks: day.blocks.filter((_, indexBlock) => indexBlock !== blockIndex),
    }));
  }

  function addBlock(dayIndex: number) {
    if (!onDaysChange) return;
    const newBlock: ScheduleBlock = {
      id: `custom-${Date.now()}-${dayIndex}`,
      time: "18:00",
      duration: 45,
      label: "Nouveau bloc de travail",
      type: "revision",
      subject: "",
      reason: "Ajouté manuellement",
    };
    onDaysChange(days.map((day, index) => index === dayIndex ? { ...day, blocks: [...day.blocks, newBlock] } : day));
  }

  if (selectedIndex !== null && days[selectedIndex]) {
    const day = days[selectedIndex];
    const isToday = today?.toLowerCase() === day.day.toLowerCase();
    const done = day.blocks.filter((block) => block.type !== "repos" && completedIds.includes(block.id)).length;
    const workBlocks = day.blocks.filter((block) => block.type !== "repos").length;
    const dayProgress = workBlocks ? Math.round((done / workBlocks) * 100) : 0;

    return (
      <section className="overflow-hidden rounded-[2rem] border border-[#566ff5]/18 bg-gradient-to-br from-[#edf1ff] via-white to-[#e9faf5] p-5 shadow-[0_20px_58px_rgba(53,82,110,.09)] sm:p-7">
        <div className="flex flex-col gap-5 border-b border-[#566ff5]/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <button type="button" onClick={() => setSelectedIndex(null)} className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-[#5267d9] shadow-sm transition hover:-translate-y-0.5"><ArrowLeft className="h-3.5 w-3.5" /> Toute la semaine</button>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <h3 className="display-serif text-4xl font-semibold text-[#1d3552]">{day.day}</h3>
              {day.date ? <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#7d8d9d]">{day.date}</span> : null}
              {isToday ? <span className="rounded-full bg-[#566ff5] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-white">Aujourd’hui</span> : null}
              {day.energy ? <span className={cn("rounded-full px-3 py-1 text-[10px] font-bold", energyStyles[day.energy])}>{day.energy}</span> : null}
            </div>
            {editable ? (
              <input value={day.focus} onChange={(event) => changeDay(selectedIndex, { focus: event.target.value })} className={`${editField} mt-4 w-full min-w-[280px] sm:min-w-[480px]`} aria-label="Objectif de la journée" />
            ) : <p className="mt-3 max-w-2xl text-sm leading-6 text-[#657b90]">{day.focus}</p>}
          </div>
          <div className="min-w-40 rounded-2xl bg-white/75 p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-[#748699]"><span>Journée réalisée</span><span>{dayProgress}%</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e8edf2]"><div className="h-full rounded-full bg-[#58d6b1] transition-all" style={{ width: `${dayProgress}%` }} /></div>
            <p className="mt-2 text-[10px] text-[#8a99a8]">{done}/{workBlocks} blocs terminés</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {day.blocks.map((block, blockIndex) => {
            const completed = completedIds.includes(block.id);
            const canFocus = block.type !== "repos" && block.type !== "cours";
            return (
              <div key={block.id} className={cn("rounded-[1.5rem] border p-4 shadow-[0_8px_24px_rgba(53,82,110,.04)]", blockStyles[block.type], completed && "opacity-60")}>
                {editable ? (
                  <div className="grid gap-3">
                    <div className="grid grid-cols-[1fr_90px_auto] gap-2">
                      <input value={block.time} onChange={(event) => changeBlock(selectedIndex, blockIndex, { time: event.target.value })} className={editField} aria-label="Heure" />
                      <input type="number" min={10} max={180} value={block.duration} onChange={(event) => changeBlock(selectedIndex, blockIndex, { duration: Math.max(10, Number(event.target.value) || 10) })} className={editField} aria-label="Durée" />
                      <button type="button" onClick={() => deleteBlock(selectedIndex, blockIndex)} className="grid h-9 w-9 place-items-center rounded-xl border border-[#ff9768]/25 bg-white/80 text-[#b35c42] transition hover:bg-[#fff0e9]" aria-label="Supprimer le bloc"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <input value={block.label} onChange={(event) => changeBlock(selectedIndex, blockIndex, { label: event.target.value })} className={editField} aria-label="Nom du bloc" />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input value={block.subject || ""} onChange={(event) => changeBlock(selectedIndex, blockIndex, { subject: event.target.value })} className={editField} placeholder="Matière" aria-label="Matière" />
                      <select value={block.type} onChange={(event) => changeBlock(selectedIndex, blockIndex, { type: event.target.value as ScheduleBlock["type"] })} className={editField} aria-label="Type de bloc">
                        <option value="cours">Cours</option><option value="revision">Révision</option><option value="fichage">Fichage</option><option value="dissertation">Dissertation / devoir</option><option value="oral">Oral</option><option value="repos">Repos</option>
                      </select>
                    </div>
                    <input value={block.reason || ""} onChange={(event) => changeBlock(selectedIndex, blockIndex, { reason: event.target.value })} className={editField} placeholder="Pourquoi ce bloc ?" aria-label="Raison" />
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    {block.type !== "repos" && onToggle ? (
                      <button type="button" onClick={() => onToggle(block.id)} aria-label={completed ? "Marquer comme non réalisé" : "Marquer comme réalisé"} className="mt-1 shrink-0 transition hover:scale-110">{completed ? <Check className="h-5 w-5 rounded-full bg-[#58d6b1] p-0.5 text-white" /> : <Circle className="h-5 w-5 text-[#9aa8b6]" />}</button>
                    ) : <Sparkles className="mt-1 h-5 w-5 shrink-0 opacity-45" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#75889a]"><span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{block.time}</span><span>· {block.duration} min</span>{block.subject ? <span className="rounded-full bg-white/70 px-2 py-0.5">{block.subject}</span> : null}</div>
                      <h4 className={cn("mt-2 text-base font-bold leading-6", completed && "line-through")}>{block.label}</h4>
                      {block.reason ? <p className="mt-2 text-xs leading-5 opacity-70">{block.reason}</p> : null}
                      {canFocus && !completed ? <Link href="/focus" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 text-xs font-bold shadow-sm transition hover:-translate-y-0.5"><Play className="h-3.5 w-3.5" /> Lancer en Focus</Link> : null}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {editable ? <button type="button" onClick={() => addBlock(selectedIndex)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-2xl border border-dashed border-[#566ff5]/35 bg-white/65 px-4 py-2.5 text-sm font-bold text-[#5267d9] transition hover:bg-white"><Plus className="h-4 w-4" /> Ajouter un bloc</button> : null}
      </section>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {days.map((day, index) => {
        const isToday = today?.toLowerCase() === day.day.toLowerCase();
        const done = day.blocks.filter((block) => block.type !== "repos" && completedIds.includes(block.id)).length;
        const workBlocks = day.blocks.filter((block) => block.type !== "repos").length;
        const dayProgress = workBlocks ? Math.round((done / workBlocks) * 100) : 0;

        return (
          <section key={`${day.day}-${day.date || index}`} className={cn("relative overflow-hidden rounded-[1.75rem] border bg-white/72 p-4 shadow-[0_14px_38px_rgba(53,82,110,.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(53,82,110,.10)]", isToday ? "border-[#566ff5]/32 ring-4 ring-[#566ff5]/6" : "border-[#d9e1e8]")}>
            {isToday ? <div className="absolute right-[-35px] top-[-35px] h-28 w-28 rounded-full bg-[#566ff5]/10 blur-2xl" /> : null}
            <div className="relative">
              <button type="button" onClick={() => setSelectedIndex(index)} className="mb-4 flex w-full items-start justify-between gap-3 border-b border-[#e7ebef] pb-4 text-left transition hover:opacity-80">
                <div>
                  <div className="flex items-center gap-2"><h3 className="display-serif text-xl font-semibold text-[#1d3552]">{day.day}</h3>{isToday ? <span className="rounded-full bg-[#566ff5] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.13em] text-white">Aujourd’hui</span> : null}</div>
                  {day.date ? <p className="mt-0.5 text-[11px] font-medium text-[#8b98a5]">{day.date}</p> : null}
                  <p className="mt-2 text-xs leading-5 text-[#687b8e]">{day.focus}</p>
                </div>
                <div className="flex flex-col items-end gap-2"><ChevronRight className="h-4 w-4 text-[#7185f2]" />{day.energy ? <span className={cn("rounded-full px-2 py-1 text-[10px] font-bold", energyStyles[day.energy])}>{day.energy}</span> : null}</div>
              </button>

              {workBlocks > 0 ? <div className="mb-4"><div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold text-[#8090a0]"><span>{done}/{workBlocks} blocs réalisés</span><span>{dayProgress}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#e9edf2]"><div className="h-full rounded-full bg-[#58d6b1] transition-all" style={{ width: `${dayProgress}%` }} /></div></div> : null}

              <div className="space-y-2.5">
                {day.blocks.slice(0, 4).map((block) => {
                  const completed = completedIds.includes(block.id);
                  return <div key={block.id} className={cn("rounded-2xl border p-3 text-xs shadow-[0_4px_14px_rgba(53,82,110,.025)]", blockStyles[block.type], completed && "opacity-60")}><div className="flex items-center justify-between gap-2"><span className="inline-flex items-center gap-1 text-[10px] font-semibold opacity-70"><Clock className="h-3 w-3" />{block.time} · {block.duration} min</span>{completed ? <Check className="h-4 w-4 rounded-full bg-[#58d6b1] p-0.5 text-white" /> : null}</div><p className={cn("mt-1.5 font-semibold leading-5", completed && "line-through")}>{block.label}</p></div>;
                })}
                {day.blocks.length > 4 ? <button type="button" onClick={() => setSelectedIndex(index)} className="w-full rounded-xl bg-[#edf1ff] px-3 py-2 text-[10px] font-bold text-[#5267d9]">+ {day.blocks.length - 4} bloc{day.blocks.length - 4 > 1 ? "s" : ""} · ouvrir la journée</button> : null}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
