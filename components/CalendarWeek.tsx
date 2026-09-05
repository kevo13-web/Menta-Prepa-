import Link from "next/link";
import { Check, Circle, Clock, Play, Sparkles } from "lucide-react";
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

export function CalendarWeek({ days, completedIds = [], onToggle, today }: CalendarWeekProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {days.map((day, index) => {
        const isToday = today?.toLowerCase() === day.day.toLowerCase();
        const done = day.blocks.filter((block) => block.type !== "repos" && completedIds.includes(block.id)).length;
        const workBlocks = day.blocks.filter((block) => block.type !== "repos").length;
        const dayProgress = workBlocks ? Math.round((done / workBlocks) * 100) : 0;

        return (
          <section
            key={`${day.day}-${day.date || index}`}
            className={cn(
              "relative overflow-hidden rounded-[1.75rem] border bg-white/72 p-4 shadow-[0_14px_38px_rgba(53,82,110,.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(53,82,110,.10)]",
              isToday ? "border-[#566ff5]/32 ring-4 ring-[#566ff5]/6" : "border-[#d9e1e8]",
            )}
          >
            {isToday ? <div className="absolute right-[-35px] top-[-35px] h-28 w-28 rounded-full bg-[#566ff5]/10 blur-2xl" /> : null}

            <div className="relative">
              <div className="mb-4 flex items-start justify-between gap-3 border-b border-[#e7ebef] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="display-serif text-xl font-semibold text-[#1d3552]">{day.day}</h3>
                    {isToday ? <span className="rounded-full bg-[#566ff5] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.13em] text-white">Aujourd’hui</span> : null}
                  </div>
                  {day.date ? <p className="mt-0.5 text-[11px] font-medium text-[#8b98a5]">{day.date}</p> : null}
                  <p className="mt-2 text-xs leading-5 text-[#687b8e]">{day.focus}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#9aabb9]">0{index + 1}</span>
                  {day.energy ? <span className={cn("rounded-full px-2 py-1 text-[10px] font-bold", energyStyles[day.energy])}>{day.energy}</span> : null}
                </div>
              </div>

              {workBlocks > 0 ? (
                <div className="mb-4">
                  <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold text-[#8090a0]">
                    <span>{done}/{workBlocks} blocs réalisés</span><span>{dayProgress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#e9edf2]"><div className="h-full rounded-full bg-[#58d6b1] transition-all" style={{ width: `${dayProgress}%` }} /></div>
                </div>
              ) : null}

              <div className="space-y-2.5">
                {day.blocks.map((block) => {
                  const completed = completedIds.includes(block.id);
                  const canFocus = block.type !== "repos" && block.type !== "cours";
                  return (
                    <div
                      key={block.id}
                      className={cn(
                        "rounded-2xl border p-3 text-xs shadow-[0_4px_14px_rgba(53,82,110,.025)] transition",
                        blockStyles[block.type],
                        completed && "opacity-60",
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        {block.type !== "repos" && onToggle ? (
                          <button type="button" onClick={() => onToggle(block.id)} aria-label={completed ? "Marquer comme non réalisé" : "Marquer comme réalisé"} className="mt-0.5 shrink-0 transition hover:scale-110">
                            {completed ? <Check className="h-4 w-4 rounded-full bg-[#58d6b1] p-0.5 text-white" /> : <Circle className="h-4 w-4 text-[#9aa8b6]" />}
                          </button>
                        ) : <Sparkles className="mt-0.5 h-4 w-4 shrink-0 opacity-45" />}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold text-[#788b9d]">
                            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{block.time}</span>
                            <span>· {block.duration} min</span>
                            {block.subject ? <span className="rounded-full bg-white/65 px-2 py-0.5">{block.subject}</span> : null}
                          </div>
                          <p className={cn("mt-1.5 font-semibold leading-5", completed && "line-through")}>{block.label}</p>
                          {block.reason ? <p className="mt-1 text-[10px] leading-4 opacity-70">{block.reason}</p> : null}

                          {canFocus && !completed ? (
                            <Link href="/focus" className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/72 px-2.5 py-1 text-[10px] font-bold shadow-sm transition hover:-translate-y-0.5">
                              <Play className="h-3 w-3" /> Lancer en Focus
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
