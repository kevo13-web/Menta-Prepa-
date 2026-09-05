"use client";

import { ActiveRecallQuiz } from "@/components/ActiveRecallQuiz";
import type { FocusSheet } from "@/data/evilStudy";
import { BookOpen, Brain } from "lucide-react";
import { useState } from "react";

export function GeneratedSheetView({ sheet }: { sheet: FocusSheet }) {
  const [mode, setMode] = useState<"read" | "quiz">("read");

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#566ff5]/12 bg-white/82 shadow-[0_24px_70px_rgba(45,67,110,.10)] backdrop-blur-2xl">
      <div className="border-b border-[#566ff5]/10 bg-gradient-to-r from-[#edf1ff] via-white to-[#e8fbf5] p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#566ff5]">
          <span>{sheet.subject}</span><span>·</span><span>Fiche générée par Menta</span>
        </div>
        <h1 className="mt-3 display-serif max-w-4xl text-4xl font-semibold leading-tight text-[#182b49] sm:text-5xl">{sheet.title}</h1>
        {sheet.subtitle ? <p className="mt-4 max-w-3xl text-sm leading-6 text-[#62778e]">{sheet.subtitle}</p> : null}
        <div className="mt-6 grid max-w-xl grid-cols-2 gap-2 rounded-2xl bg-white/60 p-1.5">
          <button type="button" onClick={() => setMode("read")} className={`min-h-11 rounded-xl px-4 text-sm font-semibold transition ${mode === "read" ? "bg-white text-[#294762] shadow-sm" : "text-[#6d8195]"}`}>
            <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4" /> Lire la fiche</span>
          </button>
          <button type="button" onClick={() => setMode("quiz")} className={`min-h-11 rounded-xl px-4 text-sm font-semibold transition ${mode === "quiz" ? "bg-[#566ff5] text-white shadow-sm" : "text-[#5267d9]"}`}>
            <span className="inline-flex items-center gap-2"><Brain className="h-4 w-4" /> Tester mes connaissances</span>
          </button>
        </div>
      </div>

      {mode === "quiz" && sheet.quiz ? (
        <div className="min-h-[650px] p-6 sm:p-8">
          <div className="mx-auto h-[640px] max-w-3xl"><ActiveRecallQuiz questions={sheet.quiz} title={sheet.title} /></div>
        </div>
      ) : (
        <article className="mx-auto max-w-4xl p-6 text-[#304760] sm:p-8">
          {sheet.thesis ? (
            <div className="mb-8 rounded-2xl border border-[#58d6b1]/22 bg-[#eafaf5] p-5">
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#2f8b72]">Idée directrice</div>
              <p className="text-sm leading-7">{sheet.thesis}</p>
            </div>
          ) : null}
          {sheet.sections?.map((section) => (
            <section key={section.title} className="mb-9">
              <h2 className="display-serif text-2xl font-semibold leading-snug text-[#1d3552]">{section.title}</h2>
              <div className="mt-4 space-y-4">{section.paragraphs.map((paragraph) => <p key={paragraph.slice(0, 80)} className="text-[15px] leading-7 text-[#40566e]">{paragraph}</p>)}</div>
              {section.points?.length ? <ul className="mt-5 space-y-2 rounded-2xl bg-[#f7f9fd] p-5 text-sm leading-6 text-[#4d6076]">{section.points.map((point) => <li key={point} className="flex gap-2"><span className="mt-1 text-[#566ff5]">◆</span><span>{point}</span></li>)}</ul> : null}
              {section.reference ? <p className="mt-3 text-xs italic leading-5 text-[#8190a1]">Références / repères : {section.reference}</p> : null}
            </section>
          ))}
          {sheet.distinctions?.length ? (
            <section className="mb-8 rounded-2xl border border-[#ffd665]/35 bg-[#fff9e4] p-5">
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[#8c7125]">Distinctions et points à maîtriser</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[#5e5a49]">{sheet.distinctions.map((item) => <li key={item} className="flex gap-2"><span className="text-[#d2a62f]">—</span><span>{item}</span></li>)}</ul>
            </section>
          ) : null}
          {sheet.quiz ? <button type="button" onClick={() => setMode("quiz")} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#566ff5] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#465de4]"><Brain className="h-4 w-4" /> Tester ce que j'ai retenu</button> : null}
        </article>
      )}
    </div>
  );
}
