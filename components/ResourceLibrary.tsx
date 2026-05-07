"use client";

import { useMemo, useState } from "react";
import { Archive, FileCheck2, Search } from "lucide-react";
import { resources } from "@/data/siteData";
import { cn } from "@/lib/utils";

const subjects = ["Toutes", "Philosophie", "Littérature", "Histoire", "Langues", "Géographie", "Droit"];

export function ResourceLibrary() {
  const [activeSubject, setActiveSubject] = useState("Toutes");
  const [query, setQuery] = useState("");

  const visibleResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSubject = activeSubject === "Toutes" || resource.subject === activeSubject;
      const haystack = `${resource.title} ${resource.type} ${resource.subject}`.toLowerCase();
      return matchesSubject && haystack.includes(query.toLowerCase());
    });
  }, [activeSubject, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
          {subjects.map((subject) => (
            <button
              key={subject}
              type="button"
              onClick={() => setActiveSubject(subject)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm transition",
                activeSubject === subject
                  ? "border-sage/50 bg-sage/15 text-frost"
                  : "border-white/10 bg-white/5 text-muted hover:text-frost",
              )}
            >
              {subject}
            </button>
          ))}
        </div>

        <label className="flex min-h-11 items-center gap-2 rounded-lg border border-white/10 bg-ink/70 px-3 text-sm text-muted focus-within:border-mint/50">
          <Search className="h-4 w-4" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Chercher une ressource"
            className="w-full bg-transparent text-frost outline-none placeholder:text-muted lg:w-64"
          />
        </label>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleResources.map((resource) => (
          <article
            key={`${resource.subject}-${resource.title}`}
            className="group rounded-lg border border-white/10 bg-white/[0.055] p-5 transition duration-300 hover:-translate-y-1 hover:border-sage/40 hover:bg-white/[0.08]"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-mint/12 text-mint">
                {resource.type === "Checklist" || resource.type === "Grille d’évaluation" ? (
                  <FileCheck2 className="h-5 w-5" />
                ) : (
                  <Archive className="h-5 w-5" />
                )}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted">
                {resource.level}
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">
              {resource.type}
            </p>
            <h3 className="mt-3 text-lg font-semibold text-frost">{resource.title}</h3>
            <p className="mt-4 text-sm text-muted">{resource.subject}</p>
            <button
              type="button"
              className="mt-6 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-frost transition group-hover:border-mint/45 group-hover:text-mint"
            >
              Ouvrir
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
