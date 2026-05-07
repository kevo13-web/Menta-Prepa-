import type { Metadata } from "next";
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
        description="Méthodes, plans types, vocabulaire, citations, grilles et checklists : tout est présenté en cartes filtrables par matière."
      />
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ResourceLibrary />
        </div>
      </section>
    </>
  );
}
