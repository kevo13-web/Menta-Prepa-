import type { Metadata } from "next";
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
        title="Transforme un emploi du temps dense en stratégie de semaine."
        description="Renseigne tes matières, tes contraintes, tes échéances et ton niveau de fatigue. La démo structure ensuite un planning hebdomadaire personnalisé côté frontend."
      />
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <PlanningGenerator />
        </div>
      </section>
    </>
  );
}
