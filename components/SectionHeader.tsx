import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeader({ eyebrow, title, description, align = "left", className }: SectionHeaderProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? <p className="mb-3 text-xs font-semibold uppercase tracking-[0.26em] text-[#5b7e9c]">{eyebrow}</p> : null}
      <h2 className="display-serif text-balance text-4xl font-medium leading-tight text-[#15314f] sm:text-5xl lg:text-6xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-[#667b8d] sm:text-lg">{description}</p> : null}
    </div>
  );
}
