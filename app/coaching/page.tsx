import type { Metadata } from "next";
import { CoachChat } from "@/components/CoachChat";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Coaching IA | Menta Prépa",
  description: "Un accompagnement académique personnalisé selon ton cursus, tes objectifs et tes ressources de révision.",
};

export default function CoachingPage() {
  return (
    <>
      <PageHero
        eyebrow="Coaching IA"
        title="Un coach qui comprend ton parcours et t’aide à progresser."
        description="Méthode, concours, oraux, organisation : reçois des conseils adaptés à ton cursus et retrouve tes échanges dans un espace personnel. Les ressources officielles sont indiquées lorsqu’elles sont pertinentes."
      />
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <CoachChat />
        </div>
      </section>
    </>
  );
}
