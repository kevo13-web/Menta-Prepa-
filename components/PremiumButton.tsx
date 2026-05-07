"use client";

import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type PremiumButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  icon?: LucideIcon;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
};

const variantClasses = {
  primary:
    "bg-frost text-ink shadow-glow hover:bg-white hover:shadow-[0_0_90px_rgba(157,255,215,0.2)]",
  secondary:
    "border border-white/14 bg-white/8 text-frost hover:border-mint/50 hover:bg-white/12",
  ghost: "text-frost hover:bg-white/8",
};

export function PremiumButton({
  children,
  href,
  variant = "primary",
  icon: Icon = ArrowRight,
  className,
  type = "button",
  onClick,
}: PremiumButtonProps) {
  const classes = cn(
    "group inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300",
    variantClasses[variant],
    className,
  );

  const content = (
    <>
      <span>{children}</span>
      <Icon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
    </>
  );

  if (href) {
    return (
      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
        <Link href={href} className={classes}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={classes}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {content}
    </motion.button>
  );
}
