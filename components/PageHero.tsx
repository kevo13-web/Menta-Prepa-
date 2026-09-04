import Image from "next/image";
import { SectionHeader } from "@/components/SectionHeader";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#d8e0e6] px-4 pb-14 pt-32 sm:px-6 lg:px-8">
      <Image
        src="/menta-prepa-hero.png"
        alt="Atmosphère lumineuse et studieuse Menta Prépa"
        fill
        className="absolute inset-0 -z-20 object-cover object-center opacity-30"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(248,245,238,0.98)_0%,rgba(248,245,238,0.94)_48%,rgba(235,243,248,0.78)_100%)]" />
      <div className="absolute -bottom-20 right-[8%] -z-10 h-60 w-60 rounded-full bg-[#9dc3df]/25 blur-3xl" />
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      </div>
    </section>
  );
}
