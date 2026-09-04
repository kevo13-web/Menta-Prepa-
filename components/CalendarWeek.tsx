import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type ScheduleBlock = {
  label: string;
  time: string;
  type: "cours" | "revision" | "fichage" | "dissertation" | "repos";
};

export type DaySchedule = {
  day: string;
  focus: string;
  blocks: ScheduleBlock[];
};

type CalendarWeekProps = {
  days: DaySchedule[];
};

const blockStyles: Record<ScheduleBlock["type"], string> = {
  cours: "border-[#d3dee6] bg-white/75 text-frost",
  revision: "border-[#a7c6dc] bg-[#e6f1f7] text-frost",
  fichage: "border-[#c7d8e4] bg-[#f1f6f9] text-frost",
  dissertation: "border-[#b8cad8] bg-[#edf1f4] text-frost",
  repos: "border-[#dddcd6] bg-[#f4f1ea] text-muted",
};

export function CalendarWeek({ days }: CalendarWeekProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
      {days.map((day, index) => (
        <div
          key={day.day}
          className="min-h-64 rounded-2xl border border-[#d7e0e6] bg-white/60 p-3 shadow-[0_10px_28px_rgba(53,82,110,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-[#9fbdd2] hover:bg-white/80"
        >
          <div className="mb-4 border-b border-[#e3e7e9] pb-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-serif text-base font-semibold text-frost">{day.day}</p>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#84a7c1]">0{index + 1}</span>
            </div>
            <p className="mt-1 min-h-8 text-xs leading-4 text-muted">{day.focus}</p>
          </div>
          <div className="space-y-2">
            {day.blocks.map((block) => (
              <div
                key={`${day.day}-${block.time}-${block.label}`}
                className={cn(
                  "rounded-xl border px-3 py-2 text-xs leading-5 shadow-[0_3px_10px_rgba(53,82,110,0.025)]",
                  blockStyles[block.type],
                )}
              >
                <div className="flex items-center gap-1.5 text-[11px] text-[#71869a]">
                  <Clock className="h-3 w-3" />
                  {block.time}
                </div>
                <p className="mt-1 font-medium">{block.label}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
