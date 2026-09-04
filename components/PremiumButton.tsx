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
    "bg-[#173A5E] text-white shadow-[0_10px_28px_rgba(28,64,99,0.18)] hover:bg-[#214C77]",
  secondary:
    "border border-[#2E5E89]/25 bg-white/70 text-[#173A5E] hover:border-[#2E5E89]/45 hover:bg-white",
  ghost: "text-[#173A5E] hover:bg-[#DDEAF2]/70",
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
    "group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300",
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
    <motion.button type={type} onClick={onClick} className={classes} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
      {content}
    </motion.button>
  );
}
