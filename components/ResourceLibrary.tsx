"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Archive, Brain, FileCheck2, Search, Sparkles } from "lucide-react";
import { resources } from "@/data/siteData";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const subjects = ["Toutes", "Philosophie", "Littérature", "Histoire", "Langues", "Géographie", "Droit"];

type GeneratedSheet = {
  id: string;
  title: string;
  subject: string;
  source_type: string;
  source_label: string | null;
  created_at: string;
};

export function ResourceLibrary() {
  const [activeSubject, setActiveSubject] = useState("Toutes");
  const [query, setQuery] = useState("");
  const [generated, setGenerated] = useState<GeneratedSheet[]>([]);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("study_sheets")
      .select("id, title, subject, source_type, source_label, created_at")
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (!cancelled && data) setGenerated(data as GeneratedSheet[]);
      });
    return () => { cancelled = true; };
  }, []);

  const visibleGenerated = useMemo(() => generated.filter((sheet) => {
    const matchesSubject = activeSubject === "Toutes" || sheet.subject === activeSubject;
    const haystack = `${sheet.title} ${sheet.subject} ${sheet.source_label || ""}`.toLowerCase();
    return matchesSubject && haystack.includes(query.toLowerCase());
  }), [generated, activeSubject, query]);

  const visibleResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSubject = activeSubject === "Toutes" || resource.subject === activeSubject;
      const haystack = `${resource.title} ${resource.type} ${resource.subject}`.toLowerCase();
      return matchesSubject && haystack.includes(query.toLowerCase());
    });
  }, [activeSubject, query]);

  const showEvilDemo = useMemo(() => {
    const subjectMatches = activeSubject === "Toutes" || activeSubject === "Philosophie";
    const haystack = "le mal philosophie privation positivité liberté augustin kant schelling arendt fiche conceptuelle doctorat quiz rappel actif";
    return subjectMatches && haystack.includes(query.toLowerCase().trim());
  }, [activeSubject, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-2xl border border-[#d6dfe6] bg-white/65 p-4 shadow-[0_12px_35px_rgba(53,82,110,0.06)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
          {subjects.map((subject) => (
            <button
              key={subject}
              type="button"
              onClick={() => setActiveSubject(subject)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm transition",
                activeSubject === subject
                  ? "border-[#7aa5c8] bg-[#dceaf4] text-frost"
                  : "border-[#d7dfe5] bg-[#faf7f1] text-muted hover:border-[#a9c2d6] hover:text-frost",
              )}
            >
              {subject}
            </button>
          ))}
        </div>

        <label className="flex min-h-11 items-center gap-2 rounded-xl border border-[#d6dfe6] bg-[#fbf8f2] px-3 text-sm text-muted focus-within:border-[#79a6cb] focus-within:ring-2 focus-within:ring-[#8db5d8]/20">
          <Search className="h-4 w-4" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Chercher une ressource"
            className="w-full bg-transparent text-frost outline-none placeholder:text-[#8b99a6] lg:w-64"
          />
        </label>
      </div>

      {visibleGenerated.length > 0 ? (
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#5267d9]"><Sparkles className="h-4 w-4" /> Mes fiches Menta AI</div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleGenerated.map((sheet) => (
              <article key={sheet.id} className="group rounded-2xl border border-[#566ff5]/18 bg-gradient-to-br from-[#edf1ff] via-white to-[#e8fbf5] p-5 shadow-[0_14px_38px_rgba(53,82,110,.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(53,82,110,.11)]">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#566ff5] text-white shadow-sm"><Sparkles className="h-5 w-5" /></span>
                  <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#5267d9]">{sheet.source_type}</span>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#43ae91]">{sheet.subject}</p>
                <h3 className="mt-3 font-serif text-xl font-semibold text-frost">{sheet.title}</h3>
                <p className="mt-3 text-xs text-muted">{sheet.source_label || "Source personnelle"}</p>
                <Link href={`/fiches/${sheet.id}`} className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#566ff5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#465de4]"><Brain className="h-4 w-4" /> Lire & se tester</Link>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {showEvilDemo ? (
          <article className="group rounded-2xl border border-[#566ff5]/22 bg-gradient-to-br from-[#edf1ff] via-white to-[#e8fbf5] p-5 shadow-[0_16px_42px_rgba(53,82,110,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(53,82,110,0.12)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#566ff5] text-white shadow-sm"><Brain className="h-5 w-5" /></span>
              <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-[#5267d9] shadow-sm">Doctorat</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#566ff5]">Fiche conceptuelle</p>
              <span className="rounded-full bg-[#58d6b1]/18 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#287a64]">Quiz actif</span>
            </div>
            <h3 className="mt-3 font-serif text-xl font-semibold text-frost">Le mal : privation, positivité, liberté et scandale de la raison</h3>
            <p className="mt-4 text-sm text-muted">Philosophie · fiche test Menta</p>
            <Link href="/fiches/mal" className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#566ff5] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#465de4]"><Brain className="h-4 w-4" /> Lire & se tester</Link>
          </article>
        ) : null}

        {visibleResources.map((resource) => (
          <article key={`${resource.subject}-${resource.title}`} className="group rounded-2xl border border-[#d7e0e6] bg-[#fbf8f2]/95 p-5 shadow-[0_12px_35px_rgba(53,82,110,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[#9ebed5] hover:shadow-[0_18px_45px_rgba(53,82,110,0.09)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dceaf4] text-[#4f83b6]">{resource.type === "Checklist" || resource.type === "Grille d’évaluation" ? <FileCheck2 className="h-5 w-5" /> : <Archive className="h-5 w-5" />}</span>
              <span className="rounded-full border border-[#d6dfe6] bg-white/70 px-3 py-1 text-xs text-muted">{resource.level}</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f83b6]">{resource.type}</p>
            <h3 className="mt-3 font-serif text-xl font-semibold text-frost">{resource.title}</h3>
            <p className="mt-4 text-sm text-muted">{resource.subject}</p>
            <button type="button" className="mt-6 rounded-full border border-[#cbd9e3] bg-white/55 px-4 py-2 text-sm font-semibold text-frost transition group-hover:border-[#79a6cb] group-hover:bg-[#eaf3f8]">Ouvrir</button>
          </article>
        ))}
      </div>
    </div>
  );
}
