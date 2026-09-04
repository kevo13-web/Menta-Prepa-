"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Clock, X } from "lucide-react";
import { adviceSections } from "@/data/siteData";
import { cn } from "@/lib/utils";

type Article = (typeof adviceSections)[number]["articles"][number] & {
  category: string;
};

export function AdviceExplorer() {
  const categories = ["Tous", ...adviceSections.map((section) => section.category)];
  const [active, setActive] = useState("Tous");
  const [selected, setSelected] = useState<Article | null>(null);

  const articles = useMemo(() => {
    return adviceSections.flatMap((section) =>
      section.articles.map((article) => ({ ...article, category: section.category })),
    );
  }, []);

  const visibleArticles = active === "Tous" ? articles : articles.filter((article) => article.category === active);

  return (
    <>
      <div className="rounded-2xl border border-[#d6e0e7] bg-white/60 p-3 shadow-[0_12px_35px_rgba(53,82,110,0.05)]">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm transition",
                active === category
                  ? "border-[#79a6cb] bg-[#dceaf4] text-frost"
                  : "border-[#d8e0e6] bg-[#faf7f1] text-muted hover:border-[#a8c0d2] hover:text-frost",
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleArticles.map((article, index) => (
          <motion.article
            key={`${article.category}-${article.title}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.035 }}
            className="group rounded-[24px] border border-[#d7e0e6] bg-[#fbf8f2]/95 p-6 shadow-[0_12px_35px_rgba(53,82,110,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[#9ebed5] hover:shadow-[0_18px_45px_rgba(53,82,110,0.09)]"
          >
            <div className="mb-6 flex items-center justify-between gap-3">
              <span className="rounded-full border border-[#d1dee7] bg-[#eaf3f8] px-3 py-1 text-xs font-medium text-[#4f83b6]">
                {article.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted">
                <Clock className="h-3.5 w-3.5" />
                {article.readTime}
              </span>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dceaf4] text-[#4f83b6]">
              <BookOpen className="h-5 w-5" />
            </span>
            <h3 className="mt-5 font-serif text-2xl font-semibold leading-tight text-frost">{article.title}</h3>
            <p className="mt-4 min-h-20 text-sm leading-6 text-muted">{article.summary}</p>
            <button
              type="button"
              onClick={() => setSelected(article)}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#cad8e2] bg-white/60 px-4 py-2 text-sm font-semibold text-frost transition group-hover:border-[#79a6cb] group-hover:bg-[#eaf3f8]"
            >
              Lire
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </motion.article>
        ))}
      </div>

      <AnimatePresence>
        {selected ? (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#17324f]/28 px-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.article
              role="dialog"
              aria-modal="true"
              initial={{ scale: 0.96, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 20 }}
              className="relative w-full max-w-2xl rounded-[28px] border border-[#d4dfe6] bg-[#fbf8f2] p-7 shadow-[0_30px_100px_rgba(31,57,82,0.2)] sm:p-9"
            >
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#d6e0e6] bg-white text-muted transition hover:text-frost"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4f83b6]">{selected.category}</p>
              <h2 className="mt-4 max-w-xl font-serif text-3xl font-semibold text-frost">{selected.title}</h2>
              <p className="mt-4 text-muted">{selected.summary}</p>
              <div className="mt-7 space-y-4 border-t border-[#dce3e7] pt-6 text-sm leading-7 text-frost/85">
                <p>Commence par isoler le problème exact. Un étudiant ambitieux perd souvent du temps parce qu’il traite tout le chapitre comme s’il avait la même valeur.</p>
                <p>La bonne méthode consiste à choisir un angle, produire une réponse imparfaite, puis la corriger avec une grille précise : clarté, exemples, transitions, objections possibles.</p>
                <p>Pour cette semaine, applique ce principe sur une seule séance longue et deux rappels courts. Le progrès vient de la répétition lucide, pas de la surcharge.</p>
              </div>
            </motion.article>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
