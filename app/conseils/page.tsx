import type { Metadata } from "next";
import { AdviceExplorer } from "@/components/AdviceExplorer";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Conseils | Menta Prépa",
};

export default function ConseilsPage() {
  return (
    <>
      <PageHero
        eyebrow="Conseils"
        title="Des méthodes nettes pour travailler avec plus de lucidité."
        description="Dissertation, khôlles, stress, mémorisation et productivité : des articles fictifs, pensés comme une base méthodologique sérieuse."
      />
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <AdviceExplorer />
        </div>
      </section>
    </>
  );
}
