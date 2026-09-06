import type { Metadata } from "next";
import { AdaptivePlanningPanel } from "@/components/AdaptivePlanningPanel";
import { DailyPlanningPanel } from "@/components/DailyPlanningPanel";
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
        description="Menta te montre d’abord quoi faire aujourd’hui, puis adapte la semaine selon ton cursus, ton emploi du temps, tes échéances, ta fatigue et ce que tu maîtrises réellement."
      />
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <DailyPlanningPanel />
          <AdaptivePlanningPanel />
          <LibraryPlanningInsight />
          <PlanningGenerator />
        </div>
      </section>
    </>
  );
}
