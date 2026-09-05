"use client";

import Link from "next/link";
import { Menu, Timer, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navItems } from "@/data/siteData";
import { cn } from "@/lib/utils";
import { PremiumButton } from "@/components/PremiumButton";
import { formatPomodoroTime, usePomodoro } from "@/components/PomodoroProvider";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { running, secondsLeft, ready } = usePomodoro();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#315b7f]/10 bg-[#f8f4ed]/82 backdrop-blur-2xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-end gap-2" onClick={() => setOpen(false)}>
          <span className="display-serif text-2xl font-semibold italic text-[#15314f]">Menta</span>
          <span className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.35em] text-[#6f8395]">Prépa</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={cn("rounded-full px-3 py-2 text-sm text-[#607486] transition hover:-translate-y-0.5 hover:bg-[#dceaf2] hover:text-[#173a5e]", pathname === item.href && "bg-[#dceaf2] text-[#173a5e]")}>{item.label}</Link>
          ))}
          <Link href="/focus" className={cn("ml-1 inline-flex items-center gap-1.5 rounded-full border border-[#86a9ef]/30 bg-gradient-to-r from-[#e6efff] to-[#e8f8f2] px-3 py-2 text-sm font-semibold text-[#315a8d] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md", pathname === "/focus" && "ring-2 ring-[#6e98ef]/25")}>
            {ready && running ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#55b79b] opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#459f85]" />
              </span>
            ) : (
              <Timer className="h-4 w-4" />
            )}
            {ready && running ? formatPomodoroTime(secondsLeft) : "Focus"}
          </Link>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/account" className="text-sm font-medium text-[#617688] transition hover:text-[#173a5e]">Mon compte</Link>
          <PremiumButton href="/#tarifs" className="min-h-10 px-4 py-2">Voir les offres</PremiumButton>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {ready && running ? (
            <Link
              href="/focus"
              onClick={() => setOpen(false)}
              aria-label={`Focus en cours, ${formatPomodoroTime(secondsLeft)} restantes`}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#9ac8ba]/55 bg-[#e3f6ef]/90 px-3 text-xs font-bold tabular-nums text-[#2f6d5e]"
            >
              <span className="h-2 w-2 rounded-full bg-[#459f85]" />
              {formatPomodoroTime(secondsLeft)}
            </Link>
          ) : null}
          <button type="button" aria-label="Ouvrir le menu" onClick={() => setOpen((value) => !value)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#315b7f]/15 bg-white/65 text-[#173a5e] shadow-sm">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-[#315b7f]/10 bg-[#f8f4ed]/96 px-4 py-4 backdrop-blur-2xl lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={cn("rounded-xl px-3 py-3 text-sm text-[#607486] transition hover:bg-[#dceaf2] hover:text-[#173a5e]", pathname === item.href && "bg-[#dceaf2] text-[#173a5e]")}>{item.label}</Link>)}
            <Link href="/focus" onClick={() => setOpen(false)} className={cn("inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#e6efff] to-[#e8f8f2] px-3 py-3 text-sm font-semibold text-[#315a8d]", pathname === "/focus" && "ring-2 ring-[#6e98ef]/25")}>
              <Timer className="h-4 w-4" /> {ready && running ? `Focus · ${formatPomodoroTime(secondsLeft)}` : "Focus Pomodoro"}
            </Link>
            <Link href="/account" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm text-[#607486] transition hover:bg-[#dceaf2] hover:text-[#173a5e]">Mon compte</Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
