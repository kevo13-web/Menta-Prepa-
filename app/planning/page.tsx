import type { Metadata } from "next";
import { LibraryPlanningInsight } from "@/components/LibraryPlanningInsight";
import { PageHero } from "@/components/PageHero";
import { PlanningGenerator } from "@/components/PlanningGenerator";

export const metadata: Metadata = {
  title: "Planning IA | Menta Prépa",
};

export default function PlanningPage() {
  return (
    <>
      <PageHero
        eyebrow="Planning IA"
        title="Ton emploi du temps devient une stratégie de travail, pas une contrainte à subir."
        description="Choisis ton cursus, importe ou photographie ton emploi du temps, indique tes échéances et ton niveau de fatigue. Menta analyse ta vraie semaine, croise aussi tes fiches et leur maîtrise, puis construit des priorités que tu peux personnaliser."
      />
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <LibraryPlanningInsight />
          <PlanningGenerator />
        </div>
      </section>
    </>
  );
}
