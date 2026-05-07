import type { Metadata } from "next";
import Link from "next/link";
import { BrainCircuit, Chrome, Lock, Mail } from "lucide-react";
import { PremiumButton } from "@/components/PremiumButton";

export const metadata: Metadata = {
  title: "Connexion | Menta Prépa",
};

export default function AuthPage() {
  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 subtle-grid opacity-35" />
      <div className="absolute left-1/2 top-24 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-mint/10 blur-3xl" />

      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-frost">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/12 bg-white/8 text-mint">
              <BrainCircuit className="h-5 w-5" />
            </span>
            <span className="font-semibold">Menta Prépa</span>
          </Link>
          <h1 className="text-balance text-4xl font-semibold tracking-normal text-frost sm:text-5xl">
            Entre dans ton espace de travail.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
            Connexion fictive, pensée pour montrer l’expérience produit : propre, sombre,
            directe, sans backend.
          </p>
          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
            {["Planning IA", "Coach scolaire", "Fiches méthode"].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/[0.045] p-4 text-sm text-frost">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-white/12 bg-white/[0.065] p-5 shadow-sage backdrop-blur-2xl sm:p-8">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-mint">
              Connexion / Inscription
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-frost">Continue avec ton compte</h2>
          </div>

          <form className="grid gap-4">
            <label className="grid gap-2 text-sm text-frost">
              Email
              <span className="flex items-center gap-2 rounded-lg border border-white/10 bg-ink/75 px-3 focus-within:border-mint/50">
                <Mail className="h-4 w-4 text-muted" />
                <input
                  type="email"
                  placeholder="toi@ecole.fr"
                  className="min-h-12 flex-1 bg-transparent text-sm text-frost outline-none placeholder:text-muted"
                />
              </span>
            </label>

            <label className="grid gap-2 text-sm text-frost">
              Mot de passe
              <span className="flex items-center gap-2 rounded-lg border border-white/10 bg-ink/75 px-3 focus-within:border-mint/50">
                <Lock className="h-4 w-4 text-muted" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="min-h-12 flex-1 bg-transparent text-sm text-frost outline-none placeholder:text-muted"
                />
              </span>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <PremiumButton type="submit" className="w-full">
                Connexion
              </PremiumButton>
              <PremiumButton type="button" variant="secondary" className="w-full">
                Inscription
              </PremiumButton>
            </div>

            <button
              type="button"
              className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-frost transition hover:border-white/20 hover:bg-white/8"
            >
              <Chrome className="h-4 w-4" />
              Login Google fictif
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-muted">
            En continuant, tu rejoins une démo locale. Aucune donnée n’est envoyée.
          </p>
        </div>
      </div>
    </section>
  );
}
