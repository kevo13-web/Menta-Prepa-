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
        title="Ton emploi du temps devient une stratégie d’exécution."
        description="Menta AI arbitre tes priorités à partir de tes cours, disponibilités, échéances et niveau de fatigue, puis suit ce que tu accomplis réellement pendant la semaine."
      />
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <PlanningGenerator />
        </div>
      </section>
    </>
  );
}
