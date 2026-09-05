"use client";

import { ActiveRecallQuiz } from "@/components/ActiveRecallQuiz";
import type { FocusSheet } from "@/data/evilStudy";
import { createClient } from "@/lib/supabase/client";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Folder,
  Heart,
  ListTree,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SheetMeta = {
  sourceType?: string;
  sourceLabel?: string | null;
  chapter?: string | null;
  folder?: string | null;
  favorite?: boolean;
  mastery?: number;
};

const sourceLabels: Record<string, string> = {
  photo: "Photo de cours",
  pdf: "PDF",
  text: "Texte personnel",
  url: "Source web",
};

function readQuizMastery(sheet: FocusSheet, fallback: number) {
  if (typeof window === "undefined" || !sheet.quiz?.length) return fallback;
  const key = `menta-active-recall-v1:${sheet.quiz.map((question) => question.id).join("|")}`;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const saved = JSON.parse(raw) as { mastered?: number[]; finished?: boolean };
    if (saved.finished) return 100;
    const mastered = Array.isArray(saved.mastered) ? saved.mastered.length : 0;
    return Math.max(fallback, Math.round((mastered / sheet.quiz.length) * 100));
  } catch {
    return fallback;
  }
}

export function GeneratedSheetView({ sheet, meta = {} }: { sheet: FocusSheet; meta?: SheetMeta }) {
  const [mode, setMode] = useState<"read" | "quiz">("read");
  const [favorite, setFavorite] = useState(Boolean(meta.favorite));
  const [mastery, setMastery] = useState(meta.mastery || 0);

  const source = sourceLabels[meta.sourceType || ""] || meta.sourceType || "Source personnelle";
  const sectionCount = sheet.sections?.length || 0;

  const masteryCopy = useMemo(() => {
    if (mastery >= 80) return "Maîtrise solide";
    if (mastery >= 40) return "En progression";
    if (mastery > 0) return "À consolider";
    return "À commencer";
  }, [mastery]);

  async function syncMastery() {
    const next = readQuizMastery(sheet, mastery);
    if (next === mastery) return;
    setMastery(next);
    const supabase = createClient();
    await supabase.from("study_sheets").update({ mastery: next }).eq("id", sheet.id);
  }

  useEffect(() => {
    void syncMastery();
    const onFocus = () => void syncMastery();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // The current mastery value is intentionally synchronized from local quiz progress.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheet.id]);

  function changeMode(next: "read" | "quiz") {
    if (mode === "quiz" && next === "read") void syncMastery();
    setMode(next);
  }

  async function toggleFavorite() {
    const next = !favorite;
    setFavorite(next);
    const supabase = createClient();
    const { error } = await supabase.from("study_sheets").update({ favorite: next }).eq("id", sheet.id);
    if (error) setFavorite(!next);
  }

  return (
    <div className="overflow-hidden rounded-[2.3rem] border border-[#566ff5]/12 bg-white/86 shadow-[0_28px_90px_rgba(45,67,110,.12)] backdrop-blur-2xl">
      <header className="relative overflow-hidden border-b border-[#566ff5]/10 bg-gradient-to-br from-[#eaf0ff] via-white to-[#e8fbf5] p-6 sm:p-9 lg:p-11">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#79c7ff]/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-[36%] h-60 w-60 rounded-full bg-[#58d6b1]/18 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[-110px] right-[8%] h-56 w-56 rounded-full bg-[#ff9a75]/14 blur-3xl" />

        <div className="relative">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#566ff5] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.17em] text-white shadow-[0_8px_22px_rgba(86,111,245,.2)]">
                  <Sparkles className="h-3.5 w-3.5" /> Menta AI
                </span>
                <span className="rounded-full bg-white/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#5267d9] shadow-sm">{sheet.subject}</span>
                <span className="rounded-full bg-white/75 px-3 py-1.5 text-[10px] font-semibold text-[#718397]">{source}</span>
              </div>

              <h1 className="mt-5 display-serif text-4xl font-semibold leading-[1.06] text-[#182b49] sm:text-5xl lg:text-[3.55rem]">{sheet.title}</h1>
              {sheet.subtitle ? <p className="mt-5 max-w-3xl text-[15px] leading-7 text-[#60768d]">{sheet.subtitle}</p> : null}

              <div className="mt-5 flex flex-wrap gap-2">
                {meta.folder ? <span className="inline-flex items-center gap-1.5 rounded-full border border-[#58d6b1]/18 bg-[#e8faf4] px-3 py-1.5 text-xs font-semibold text-[#2f806b]"><Folder className="h-3.5 w-3.5" /> {meta.folder}</span> : null}
                {meta.chapter ? <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ffd665]/28 bg-[#fff8df] px-3 py-1.5 text-xs font-semibold text-[#8e7327]">Chapitre · {meta.chapter}</span> : null}
                {meta.sourceLabel ? <span className="max-w-full truncate rounded-full border border-[#dce4ec] bg-white/72 px-3 py-1.5 text-xs font-medium text-[#78899a]">Source · {meta.sourceLabel}</span> : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 lg:flex-col lg:items-stretch">
              <button
                type="button"
                onClick={() => void toggleFavorite()}
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 ${favorite ? "border-[#ff9c7f]/30 bg-[#fff0ea] text-[#c96649]" : "border-white bg-white/80 text-[#687b90] hover:text-[#c96649]"}`}
              >
                <Heart className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} /> {favorite ? "Favori" : "Ajouter aux favoris"}
              </button>
              <Link href="/focus" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white bg-white/80 px-4 text-sm font-semibold text-[#5267d9] shadow-sm transition hover:-translate-y-0.5 hover:bg-white">
                <Timer className="h-4 w-4" /> Ouvrir en Focus
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/80 bg-white/65 p-4 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-[#6075dc]"><Target className="h-4 w-4" /> Maîtrise</div>
              <div className="mt-3 flex items-end justify-between gap-3"><span className="text-3xl font-bold text-[#1f3b5a]">{mastery}%</span><span className="pb-1 text-xs font-semibold text-[#75879a]">{masteryCopy}</span></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e2e8f2]"><div className="h-full rounded-full bg-gradient-to-r from-[#566ff5] via-[#68a5ed] to-[#58d6b1] transition-all duration-700" style={{ width: `${mastery}%` }} /></div>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/65 p-4 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-[#2f8b72]"><ListTree className="h-4 w-4" /> Structure</div>
              <p className="mt-3 text-3xl font-bold text-[#1f3b5a]">{sectionCount}</p>
              <p className="mt-1 text-xs font-semibold text-[#75879a]">partie{sectionCount > 1 ? "s" : ""} structurée{sectionCount > 1 ? "s" : ""}</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/65 p-4 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-[#b37055]"><Brain className="h-4 w-4" /> Rappel actif</div>
              <p className="mt-3 text-3xl font-bold text-[#1f3b5a]">{sheet.quiz?.length || 0}</p>
              <p className="mt-1 text-xs font-semibold text-[#75879a]">question{(sheet.quiz?.length || 0) > 1 ? "s" : ""} avec correction IA</p>
            </div>
          </div>

          <div className="mt-7 grid max-w-2xl grid-cols-2 gap-2 rounded-2xl bg-white/58 p-1.5 shadow-inner">
            <button type="button" onClick={() => changeMode("read")} className={`min-h-11 rounded-xl px-4 text-sm font-semibold transition ${mode === "read" ? "bg-white text-[#294762] shadow-sm" : "text-[#6d8195] hover:text-[#405b78]"}`}>
              <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4" /> Lire la fiche</span>
            </button>
            <button type="button" onClick={() => changeMode("quiz")} disabled={!sheet.quiz?.length} className={`min-h-11 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${mode === "quiz" ? "bg-[#566ff5] text-white shadow-sm" : "text-[#5267d9] hover:bg-white/60"}`}>
              <span className="inline-flex items-center gap-2"><Brain className="h-4 w-4" /> Tester mes connaissances</span>
            </button>
          </div>
        </div>
      </header>

      {mode === "quiz" && sheet.quiz ? (
        <div className="min-h-[720px] bg-gradient-to-b from-[#fbfcff] to-white p-5 sm:p-8 lg:p-10">
          <div className="mx-auto h-[690px] max-w-3xl rounded-[2rem] border border-[#566ff5]/10 bg-white/85 p-5 shadow-[0_18px_55px_rgba(53,82,110,.07)] sm:p-7">
            <ActiveRecallQuiz questions={sheet.quiz} title={sheet.title} />
          </div>
        </div>
      ) : (
        <div className="grid bg-[#fffefd] lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="hidden border-r border-[#566ff5]/8 bg-[#f8faff]/70 p-6 lg:block">
            <div className="sticky top-28">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5267d9]">Sommaire</p>
              <nav className="mt-4 space-y-1.5">
                {sheet.sections?.map((section, index) => (
                  <a key={section.title} href={`#sheet-section-${index}`} className="block rounded-xl px-3 py-2 text-xs font-medium leading-5 text-[#708297] transition hover:bg-white hover:text-[#294762]">
                    <span className="mr-1.5 font-bold text-[#9aa7b5]">{String(index + 1).padStart(2, "0")}</span>{section.title.replace(/^[IVX]+\.\s*/, "")}
                  </a>
                ))}
              </nav>
              {sheet.quiz?.length ? (
                <button type="button" onClick={() => setMode("quiz")} className="mt-6 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#566ff5] px-3 text-xs font-semibold text-white shadow-sm">
                  <Brain className="h-4 w-4" /> Lancer le quiz
                </button>
              ) : null}
            </div>
          </aside>

          <article className="mx-auto w-full max-w-5xl p-5 text-[#304760] sm:p-8 lg:p-11 xl:p-14">
            {sheet.thesis ? (
              <section className="mb-10 overflow-hidden rounded-[1.8rem] border border-[#58d6b1]/22 bg-gradient-to-br from-[#e8faf4] via-[#f5fffb] to-white p-5 shadow-[0_12px_38px_rgba(65,147,121,.07)] sm:p-7">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#2f8b72]"><CheckCircle2 className="h-4 w-4" /> À retenir</div>
                <p className="mt-4 display-serif text-xl font-medium leading-8 text-[#294960] sm:text-2xl sm:leading-9">{sheet.thesis}</p>
              </section>
            ) : null}

            <div className="space-y-10">
              {sheet.sections?.map((section, index) => (
                <section id={`sheet-section-${index}`} key={section.title} className="scroll-mt-28 rounded-[1.8rem] border border-[#dfe6ed] bg-white p-5 shadow-[0_14px_42px_rgba(53,82,110,.055)] sm:p-7 lg:p-8">
                  <div className="flex items-start gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#edf1ff] text-xs font-bold text-[#566ff5]">{String(index + 1).padStart(2, "0")}</span>
                    <div className="min-w-0">
                      <h2 className="display-serif text-2xl font-semibold leading-snug text-[#1d3552] sm:text-[1.75rem]">{section.title}</h2>
                      <div className="mt-5 space-y-4">{section.paragraphs.map((paragraph) => <p key={paragraph.slice(0, 80)} className="text-[15px] leading-7 text-[#40566e] sm:text-[15.5px] sm:leading-[1.9]">{paragraph}</p>)}</div>
                    </div>
                  </div>

                  {section.points?.length ? (
                    <div className="mt-6 rounded-2xl border border-[#566ff5]/8 bg-[#f7f9fd] p-4 sm:p-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#566ff5]">Points clés</p>
                      <ul className="mt-3 grid gap-2.5 text-sm leading-6 text-[#4d6076]">
                        {section.points.map((point) => <li key={point} className="flex gap-2.5"><span className="mt-1 text-[#566ff5]">◆</span><span>{point}</span></li>)}
                      </ul>
                    </div>
                  ) : null}
                  {section.reference ? <p className="mt-5 border-l-2 border-[#ffd665] pl-3 text-xs italic leading-5 text-[#8190a1]">Références / repères : {section.reference}</p> : null}
                </section>
              ))}
            </div>

            {sheet.distinctions?.length ? (
              <section className="mt-10 rounded-[1.8rem] border border-[#ffd665]/35 bg-gradient-to-br from-[#fff8df] to-[#fffdf4] p-5 sm:p-7">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8c7125]"><Target className="h-4 w-4" /> Distinctions à maîtriser</div>
                <ul className="mt-5 grid gap-3 text-sm leading-6 text-[#5e5a49] sm:grid-cols-2">
                  {sheet.distinctions.map((item) => <li key={item} className="rounded-2xl bg-white/65 p-3.5 shadow-sm"><span className="mr-2 font-bold text-[#d2a62f]">—</span>{item}</li>)}
                </ul>
              </section>
            ) : null}

            {sheet.recall?.length ? (
              <section className="mt-10 rounded-[1.8rem] border border-[#ff8c6b]/20 bg-[#fff2ed] p-5 sm:p-7">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#b65f43]"><Brain className="h-4 w-4" /> Avant le quiz</div>
                <h2 className="mt-2 display-serif text-2xl font-semibold text-[#653f35]">Peux-tu répondre sans regarder ?</h2>
                <ol className="mt-5 space-y-3 text-sm leading-6 text-[#684f47]">
                  {sheet.recall.map((question, index) => <li key={question} className="rounded-xl bg-white/55 p-3"><span className="mr-2 font-bold text-[#d16b4a]">{index + 1}.</span>{question}</li>)}
                </ol>
              </section>
            ) : null}

            {sheet.quiz?.length ? (
              <div className="mt-10 rounded-[2rem] bg-gradient-to-r from-[#566ff5] to-[#6389ed] p-6 text-white shadow-[0_20px_55px_rgba(86,111,245,.24)] sm:p-8">
                <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div><p className="text-xs font-bold uppercase tracking-[0.17em] text-white/70">Passage à l'action</p><h2 className="mt-2 display-serif text-2xl font-semibold sm:text-3xl">Transforme la lecture en maîtrise.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/75">Réponds de mémoire. L'IA distingue les réponses justes, presque justes et réellement à revoir.</p></div>
                  <button type="button" onClick={() => setMode("quiz")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#5267d9] shadow-sm transition hover:scale-[1.02]"><Brain className="h-4 w-4" /> Tester ce que j'ai retenu</button>
                </div>
              </div>
            ) : null}
          </article>
        </div>
      )}
    </div>
  );
}
