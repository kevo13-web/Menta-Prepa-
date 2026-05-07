import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { StudentDashboard } from "@/components/StudentDashboard";

export const metadata: Metadata = {
  title: "Tableau de bord | Menta Prépa",
};

export default function DashboardPage() {
  return (
    <>
      <PageHero
        eyebrow="Tableau de bord"
        title="Mesure ta semaine comme un système de progression."
        description="Progression, heures travaillées, priorités, échéances et checklist quotidienne : un cockpit étudiant sobre pour garder le cap."
      />
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <StudentDashboard />
        </div>
      </section>
    </>
  );
}
