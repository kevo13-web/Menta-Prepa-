import type { Metadata } from "next";
import Link from "next/link";
import { Camera, FileText, Link2, Sparkles, Type } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { ResourceLibrary } from "@/components/ResourceLibrary";

export const metadata: Metadata = {
  title: "Fiches & Méthodes | Menta Prépa",
};

export default function FichesPage() {
  return (
    <>
      <PageHero
        eyebrow="Fiches & Méthodes"
        title="Une bibliothèque pour ficher moins, retenir mieux et répondre plus précisément."
        description="Crée tes propres fiches à partir de tes vrais cours, puis transforme-les en rappel actif et en quiz de maîtrise."
      />
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 overflow-hidden rounded-[2rem] border border-[#566ff5]/15 bg-gradient-to-r from-[#edf1ff] via-white to-[#e8fbf5] p-6 shadow-[0_18px_55px_rgba(53,82,110,.08)] sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#5267d9] shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" /> Créer avec Menta AI
                </div>
                <h2 className="mt-4 display-serif text-3xl font-semibold text-[#182b49] sm:text-4xl">Transforme ton cours en vraie fiche de révision.</h2>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#62778e]">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5"><Camera className="h-3.5 w-3.5 text-[#566ff5]" /> Photo</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5"><FileText className="h-3.5 w-3.5 text-[#e87958]" /> PDF</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5"><Type className="h-3.5 w-3.5 text-[#43ae91]" /> Texte</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5"><Link2 className="h-3.5 w-3.5 text-[#c79820]" /> URL</span>
                </div>
              </div>
              <Link href="/fiches/creer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#566ff5] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(86,111,245,.25)] transition hover:-translate-y-0.5 hover:bg-[#465de4]">
                <Sparkles className="h-4 w-4" /> Créer une fiche
              </Link>
            </div>
          </div>

          <ResourceLibrary />
        </div>
      </section>
    </>
  );
}
