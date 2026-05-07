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
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm transition",
              active === category
                ? "border-mint/60 bg-mint/12 text-frost"
                : "border-white/10 bg-white/5 text-muted hover:border-white/20 hover:text-frost",
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleArticles.map((article, index) => (
          <motion.article
            key={`${article.category}-${article.title}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.035 }}
            className="group rounded-lg border border-white/10 bg-white/[0.055] p-5 transition duration-300 hover:-translate-y-1 hover:border-mint/35 hover:bg-white/[0.08]"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <span className="rounded-full border border-white/10 bg-ink/70 px-3 py-1 text-xs text-mint">
                {article.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted">
                <Clock className="h-3.5 w-3.5" />
                {article.readTime}
              </span>
            </div>
            <BookOpen className="mb-5 h-6 w-6 text-sage" />
            <h3 className="text-lg font-semibold text-frost">{article.title}</h3>
            <p className="mt-3 min-h-20 text-sm leading-6 text-muted">{article.summary}</p>
            <button
              type="button"
              onClick={() => setSelected(article)}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-frost transition group-hover:text-mint"
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
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/80 px-4 backdrop-blur-xl"
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
              className="relative w-full max-w-2xl rounded-lg border border-white/12 bg-[#0c0c12] p-6 shadow-sage"
            >
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted transition hover:text-frost"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-mint">
                {selected.category}
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-frost">{selected.title}</h2>
              <p className="mt-4 text-muted">{selected.summary}</p>
              <div className="mt-6 space-y-4 text-sm leading-7 text-frost/85">
                <p>
                  Commence par isoler le problème exact. Un étudiant ambitieux perd souvent du
                  temps parce qu’il traite tout le chapitre comme s’il avait la même valeur.
                </p>
                <p>
                  La bonne méthode consiste à choisir un angle, produire une réponse imparfaite,
                  puis la corriger avec une grille précise : clarté, exemples, transitions,
                  objections possibles.
                </p>
                <p>
                  Pour cette semaine, applique ce principe sur une seule séance longue et deux
                  rappels courts. Le progrès vient de la répétition lucide, pas de la surcharge.
                </p>
              </div>
            </motion.article>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
