"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navItems } from "@/data/siteData";
import { cn } from "@/lib/utils";
import { PremiumButton } from "@/components/PremiumButton";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#315b7f]/10 bg-[#f8f4ed]/88 backdrop-blur-2xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-end gap-2" onClick={() => setOpen(false)}>
          <span className="display-serif text-2xl font-semibold italic text-[#15314f]">Menta</span>
          <span className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.35em] text-[#6f8395]">Prépa</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={cn("rounded-full px-3 py-2 text-sm text-[#607486] transition hover:bg-[#dceaf2] hover:text-[#173a5e]", pathname === item.href && "bg-[#dceaf2] text-[#173a5e]")}>{item.label}</Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/auth" className="text-sm font-medium text-[#617688] transition hover:text-[#173a5e]">Connexion</Link>
          <PremiumButton href="/planning" className="min-h-10 px-4 py-2">Essayer</PremiumButton>
        </div>

        <button type="button" aria-label="Ouvrir le menu" onClick={() => setOpen((value) => !value)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#315b7f]/15 bg-white/65 text-[#173a5e] lg:hidden">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-[#315b7f]/10 bg-[#f8f4ed]/96 px-4 py-4 backdrop-blur-2xl lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={cn("rounded-xl px-3 py-3 text-sm text-[#607486] transition hover:bg-[#dceaf2] hover:text-[#173a5e]", pathname === item.href && "bg-[#dceaf2] text-[#173a5e]")}>{item.label}</Link>)}
            <Link href="/auth" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm text-[#607486] transition hover:bg-[#dceaf2] hover:text-[#173a5e]">Connexion / Inscription</Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
