import type { Metadata } from "next";
import { CoachChat } from "@/components/CoachChat";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Coaching IA | Menta Prépa",
};

export default function CoachingPage() {
  return (
    <>
      <PageHero
        eyebrow="Coaching IA"
        title="Un copilote mental simulé pour clarifier tes prochaines décisions."
        description="Choisis une posture de coaching, pose ton problème et reçois une réponse automatique. Aucun backend, aucune API réelle : tout est simulé côté interface."
      />
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <CoachChat />
        </div>
      </section>
    </>
  );
}
