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
  cours: "border-white/16 bg-white/[0.055] text-frost",
  revision: "border-mint/35 bg-mint/10 text-frost",
  fichage: "border-sage/35 bg-sage/10 text-frost",
  dissertation: "border-frost/20 bg-frost/[0.07] text-frost",
  repos: "border-white/10 bg-steel/45 text-muted",
};

export function CalendarWeek({ days }: CalendarWeekProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
      {days.map((day) => (
        <div
          key={day.day}
          className="min-h-64 rounded-lg border border-white/10 bg-white/[0.045] p-3 transition duration-300 hover:border-mint/35 hover:bg-white/[0.07]"
        >
          <div className="mb-3">
            <p className="text-sm font-semibold text-frost">{day.day}</p>
            <p className="mt-1 text-xs text-muted">{day.focus}</p>
          </div>
          <div className="space-y-2">
            {day.blocks.map((block) => (
              <div
                key={`${day.day}-${block.time}-${block.label}`}
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs leading-5",
                  blockStyles[block.type],
                )}
              >
                <div className="flex items-center gap-1.5 text-[11px] opacity-80">
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
