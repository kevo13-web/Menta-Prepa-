import { cn } from "@/lib/utils";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-5 transition duration-300 hover:-translate-y-1 hover:border-[#5d8cb3]/30 hover:shadow-[0_22px_60px_rgba(55,85,110,0.13)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
