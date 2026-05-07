"use client";

import { useState } from "react";
import { CalendarDays, CheckCircle2, Flame, Target, TimerReset, TrendingUp } from "lucide-react";
import { dashboardData } from "@/data/siteData";
import { GlassCard } from "@/components/GlassCard";
import { cn } from "@/lib/utils";

export function StudentDashboard() {
  const [checked, setChecked] = useState<boolean[]>(
    dashboardData.todayGoals.map((_, index) => index === 0),
  );

  const maxHours = Math.max(...dashboardData.bars.map((bar) => bar.hours));

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-3">
          <GlassCard>
            <TrendingUp className="mb-5 h-6 w-6 text-mint" />
            <p className="text-sm text-muted">Progression hebdomadaire</p>
            <p className="mt-2 text-4xl font-semibold text-frost">{dashboardData.weeklyProgress}%</p>
            <div className="mt-5 h-2 rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-mint to-sage"
                style={{ width: `${dashboardData.weeklyProgress}%` }}
              />
            </div>
          </GlassCard>
          <GlassCard>
            <TimerReset className="mb-5 h-6 w-6 text-aurora" />
            <p className="text-sm text-muted">Heures travaillées</p>
            <p className="mt-2 text-4xl font-semibold text-frost">{dashboardData.hoursWorked}h</p>
            <p className="mt-5 text-sm text-muted">+3h vs semaine dernière</p>
          </GlassCard>
          <GlassCard>
            <Flame className="mb-5 h-6 w-6 text-sage" />
            <p className="text-sm text-muted">Série active</p>
            <p className="mt-2 text-4xl font-semibold text-frost">6 jours</p>
            <p className="mt-5 text-sm text-muted">Le rythme compte plus que le volume brut.</p>
          </GlassCard>
        </div>

        <GlassCard>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-mint">
                Travail réel
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-frost">Heures par jour</h2>
            </div>
            <p className="text-sm text-muted">Objectif : régularité, puis intensité.</p>
          </div>
          <div className="mt-8 flex h-72 items-end gap-3 rounded-lg border border-white/8 bg-ink/50 p-4">
            {dashboardData.bars.map((bar, index) => (
              <div key={`${bar.day}-${index}`} className="flex h-full flex-1 flex-col justify-end gap-3">
                <div
                  className="min-h-8 rounded-t-lg bg-gradient-to-t from-sage to-mint transition duration-300 hover:brightness-125"
                  style={{ height: `${(bar.hours / maxHours) * 100}%` }}
                  title={`${bar.hours}h`}
                />
                <div className="text-center text-xs text-muted">{bar.day}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="mb-5 flex items-center gap-3">
            <Target className="h-5 w-5 text-sage" />
            <h2 className="text-xl font-semibold text-frost">Matières prioritaires</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {dashboardData.priorities.map((priority, index) => (
              <div key={priority} className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <p className="text-xs text-muted">Priorité {index + 1}</p>
                <p className="mt-2 font-semibold text-frost">{priority}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <aside className="grid gap-5">
        <GlassCard>
          <div className="mb-5 flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-mint" />
            <h2 className="text-xl font-semibold text-frost">Prochaines échéances</h2>
          </div>
          <div className="grid gap-3">
            {dashboardData.deadlines.map((deadline) => (
              <div key={deadline.label} className="rounded-lg border border-white/10 bg-ink/50 p-4">
                <p className="font-medium text-frost">{deadline.label}</p>
                <p className="mt-1 text-sm text-muted">{deadline.date}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="mb-5 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-aurora" />
            <h2 className="text-xl font-semibold text-frost">Objectifs du jour</h2>
          </div>
          <div className="grid gap-3">
            {dashboardData.todayGoals.map((goal, index) => (
              <button
                key={goal}
                type="button"
                onClick={() =>
                  setChecked((current) =>
                    current.map((value, itemIndex) => (itemIndex === index ? !value : value)),
                  )
                }
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.045] p-3 text-left text-sm text-frost transition hover:border-mint/30"
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    checked[index] ? "border-aurora bg-aurora text-ink" : "border-white/20",
                  )}
                >
                  {checked[index] ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                </span>
                <span className={cn(checked[index] && "text-muted line-through")}>{goal}</span>
              </button>
            ))}
          </div>
        </GlassCard>
      </aside>
    </div>
  );
}
