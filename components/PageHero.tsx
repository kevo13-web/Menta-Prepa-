import { SectionHeader } from "@/components/SectionHeader";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden px-4 pb-12 pt-32 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 subtle-grid opacity-35" />
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      </div>
    </section>
  );
}
