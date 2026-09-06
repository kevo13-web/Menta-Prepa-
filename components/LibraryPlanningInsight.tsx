"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, Brain, ChevronRight, Sparkles, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Sheet = {
  id: string;
  title: string;
  subject: string;
  chapter: string | null;
  mastery: number | null;
  favorite: boolean | null;
};

function clamp(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

export function LibraryPlanningInsight() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setLoaded(true);
        return;
      }

      const { data } = await supabase
        .from("study_sheets")
        .select("id, title, subject, chapter, mastery, favorite")
        .eq("user_id", user.id)
        .order("mastery", { ascending: true })
        .limit(60);

      if (!cancelled) {
        setSheets((data || []) as Sheet[]);
        setLoaded(true);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => {
    const total = sheets.length;
    const toMaster = sheets.filter((sheet) => clamp(sheet.mastery) < 80).length;
    const average = total ? Math.round(sheets.reduce((sum, sheet) => sum + clamp(sheet.mastery), 0) / total) : 0;
    const priorities = [...sheets]
      .filter((sheet) => clamp(sheet.mastery) < 80)
      .sort((a, b) => {
        const mastery = clamp(a.mastery) - clamp(b.mastery);
        if (mastery !== 0) return mastery;
        if (Boolean(a.favorite) !== Boolean(b.favorite)) return a.favorite ? -1 : 1;
        return 0;
      })
      .slice(0, 3);
    return { total, toMaster, average, priorities };
  }, [sheets]);

  if (!loaded || stats.total === 0) return null;

  return (
    <section className="mb-6 overflow-hidden rounded-[2rem] border border-[#58d6b1]/20 bg-gradient-to-r from-[#eafaf5] via-white to-[#edf1ff] p-5 shadow-[0_16px_48px_rgba(53,82,110,.06)] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#31856f] shadow-sm">
            <Brain className="h-3.5 w-3.5" /> Bibliothèque connectée au Planning IA
          </div>
          <h2 className="mt-3 display-serif text-2xl font-semibold text-[#1d3552] sm:text-3xl">Menta sait déjà ce que tu maîtrises — et ce qui mérite du temps.</h2>
          <p className="mt-2 text-sm leading-6 text-[#687d91]">À chaque génération, le planner croise automatiquement tes échéances avec tes fiches, leur matière et leur niveau de maîtrise. Une faiblesse pertinente peut donc être programmée sans que tu aies à la ressaisir.</p>
        </div>

        <div className="grid min-w-[290px] grid-cols-3 gap-2">
          <Stat icon={<BookOpenCheck className="h-4 w-4" />} value={stats.total} label="fiches" tone="blue" />
          <Stat icon={<Target className="h-4 w-4" />} value={stats.toMaster} label="à maîtriser" tone="coral" />
          <Stat icon={<Sparkles className="h-4 w-4" />} value={`${stats.average}%`} label="moyenne" tone="mint" />
        </div>
      </div>

      {stats.priorities.length > 0 ? (
        <div className="mt-5 grid gap-3 border-t border-[#58d6b1]/14 pt-5 md:grid-cols-3">
          {stats.priorities.map((sheet) => (
            <Link key={sheet.id} href={`/fiches/${sheet.id}`} className="group rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#5267d9]">{sheet.subject}</p>
                  <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-[#294762]">{sheet.title}</h3>
                  {sheet.chapter ? <p className="mt-1 line-clamp-1 text-[10px] text-[#8795a3]">{sheet.chapter}</p> : null}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#8a99a9] transition group-hover:translate-x-0.5" />
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] font-semibold text-[#7b8c9e]"><span>Maîtrise</span><span>{clamp(sheet.mastery)}%</span></div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#e9edf2]"><div className="h-full rounded-full bg-[#58d6b1]" style={{ width: `${clamp(sheet.mastery)}%` }} /></div>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function Stat({ icon, value, label, tone }: { icon: React.ReactNode; value: string | number; label: string; tone: "blue" | "coral" | "mint" }) {
  const tones = {
    blue: "bg-[#edf1ff] text-[#5267d9]",
    coral: "bg-[#fff0e9] text-[#a95b40]",
    mint: "bg-[#e9faf5] text-[#287a64]",
  };
  return (
    <div className="rounded-2xl border border-white/80 bg-white/70 p-3 text-center shadow-sm">
      <span className={`mx-auto grid h-8 w-8 place-items-center rounded-xl ${tones[tone]}`}>{icon}</span>
      <p className="mt-2 text-xl font-extrabold text-[#243e5b]">{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-[#8997a6]">{label}</p>
    </div>
  );
}
