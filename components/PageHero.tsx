import { SectionHeader } from "@/components/SectionHeader";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden px-4 pb-10 pt-28 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(215,232,244,0.56)_0%,rgba(248,245,238,0.7)_72%,transparent_100%)]" />
      <div className="pointer-events-none absolute -left-20 top-12 -z-10 h-64 w-64 rounded-full bg-[#c8e1f1]/55 blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] top-10 -z-10 h-56 w-80 rounded-full bg-white/70 blur-3xl" />

      <div className="mx-auto max-w-7xl">
        <div className="max-w-4xl rounded-[28px] border border-[#d6e1e8] bg-white/55 px-6 py-8 shadow-[0_18px_55px_rgba(53,82,110,0.07)] backdrop-blur-sm sm:px-8 sm:py-10">
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
            className="max-w-3xl"
          />
          <div className="mt-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#6c8498]">
            <span className="h-px w-10 bg-[#8db5d8]" />
            Discipline · méthode · progression
          </div>
        </div>
      </div>
    </section>
  );
}
