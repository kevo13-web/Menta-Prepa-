"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, Menu, X } from "lucide-react";
import { useState } from "react";
import { navItems } from "@/data/siteData";
import { cn } from "@/lib/utils";
import { PremiumButton } from "@/components/PremiumButton";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-ink/70 backdrop-blur-2xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 bg-white/8 text-mint shadow-glow">
            <BrainCircuit className="h-5 w-5" />
          </span>
          <span className="text-base font-semibold text-frost">Menta Prépa</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm text-muted transition hover:bg-white/8 hover:text-frost",
                pathname === item.href && "bg-white/10 text-frost",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/auth" className="text-sm font-medium text-muted transition hover:text-frost">
            Connexion
          </Link>
          <PremiumButton href="/planning" className="min-h-10 px-4 py-2">
            Essayer
          </PremiumButton>
        </div>

        <button
          type="button"
          aria-label="Ouvrir le menu"
          onClick={() => setOpen((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/12 bg-white/8 text-frost lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-white/8 bg-ink/95 px-4 py-4 backdrop-blur-2xl lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-3 text-sm text-muted transition hover:bg-white/8 hover:text-frost",
                  pathname === item.href && "bg-white/10 text-frost",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/auth"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm text-muted transition hover:bg-white/8 hover:text-frost"
            >
              Connexion / Inscription
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
