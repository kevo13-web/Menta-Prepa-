import type { Metadata } from "next";
import Link from "next/link";
import { BrainCircuit, Chrome, Lock, Mail } from "lucide-react";
import { signIn, signInWithGoogle, signUp } from "@/app/auth/actions";

export const metadata: Metadata = {
  title: "Connexion | Menta Prépa",
};

type AuthPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;

  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#eaf3f8_0%,#f7f3eb_100%)]" />
      <div className="absolute left-1/2 top-24 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-[#9dc3df]/30 blur-3xl" />

      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-frost">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#cbd9e3] bg-white/70 text-mint">
              <BrainCircuit className="h-5 w-5" />
            </span>
            <span className="font-semibold">Menta Prépa</span>
          </Link>
          <h1 className="display-serif text-balance text-5xl font-medium leading-tight text-frost sm:text-6xl">
            Ton espace de travail, vraiment personnel.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
            Connecte-toi pour retrouver tes plannings, ta progression, tes fiches et ton abonnement sur tous tes appareils.
          </p>
          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
            {["Progression sauvegardée", "Planning personnel", "Accès Premium"].map((item) => (
              <div key={item} className="rounded-2xl border border-[#d8e0e6] bg-white/65 p-4 text-sm text-frost shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#d4dee5] bg-white/75 p-5 shadow-[0_24px_70px_rgba(44,78,108,0.12)] backdrop-blur-xl sm:p-8">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-mint">Connexion / Inscription</p>
            <h2 className="display-serif mt-3 text-3xl font-medium text-frost">Entre dans Menta</h2>
          </div>

          {params.error ? (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</p>
          ) : null}
          {params.message ? (
            <p className="mb-4 rounded-xl border border-[#bfd7c9] bg-[#eef7f1] px-4 py-3 text-sm text-[#315c43]">{params.message}</p>
          ) : null}

          <form className="grid gap-4">
            <label className="grid gap-2 text-sm text-frost">
              Email
              <span className="flex items-center gap-2 rounded-xl border border-[#d6dfe6] bg-[#fbf8f2] px-3 focus-within:border-mint/60">
                <Mail className="h-4 w-4 text-muted" />
                <input name="email" type="email" required autoComplete="email" placeholder="toi@ecole.fr" className="min-h-12 flex-1 bg-transparent text-sm text-frost outline-none placeholder:text-muted" />
              </span>
            </label>

            <label className="grid gap-2 text-sm text-frost">
              Mot de passe
              <span className="flex items-center gap-2 rounded-xl border border-[#d6dfe6] bg-[#fbf8f2] px-3 focus-within:border-mint/60">
                <Lock className="h-4 w-4 text-muted" />
                <input name="password" type="password" required minLength={8} autoComplete="current-password" placeholder="8 caractères minimum" className="min-h-12 flex-1 bg-transparent text-sm text-frost outline-none placeholder:text-muted" />
              </span>
            </label>

            <div className="mt-1 grid gap-3 sm:grid-cols-2">
              <button formAction={signIn} className="min-h-11 rounded-full bg-[#173f66] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#245783]">
                Connexion
              </button>
              <button formAction={signUp} className="min-h-11 rounded-full border border-[#bfd0dc] bg-white/70 px-5 py-2.5 text-sm font-semibold text-frost transition hover:bg-[#edf5f9]">
                Créer mon compte
              </button>
            </div>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted">
            <span className="h-px flex-1 bg-[#d8e0e6]" /> ou <span className="h-px flex-1 bg-[#d8e0e6]" />
          </div>

          <form action={signInWithGoogle}>
            <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#d1dce4] bg-white/75 text-sm font-semibold text-frost transition hover:bg-white">
              <Chrome className="h-4 w-4" />
              Continuer avec Google
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-muted">
            En créant un compte, tu acceptes les futures conditions d’utilisation et la politique de confidentialité de Menta Prépa.
          </p>
        </div>
      </div>
    </section>
  );
}
