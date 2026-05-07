import { cn } from "@/lib/utils";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-lg p-5 transition duration-300 hover:-translate-y-1 hover:border-mint/30",
        className,
      )}
    >
      {children}
    </div>
  );
}
