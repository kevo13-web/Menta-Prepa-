import type { Metadata } from "next";
import Link from "next/link";
import { BrainCircuit, Chrome, Lock, Mail } from "lucide-react";
import { signIn, signInWithGoogle, signUp } from "@/app/auth/actions";
import { CurriculumFields } from "@/components/CurriculumFields";

export const metadata: Metadata = {
  title: "Connexion | Menta Prépa",
};

type AuthPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

function EmailField({ name = "email", autoComplete = "email" }: { name?: string; autoComplete?: string }) {
  return (
    <label className="grid gap-2 text-sm text-frost">
      Email
      <span className="flex items-center gap-2 rounded-xl border border-[#d6dfe6] bg-[#fbf8f2] px-3 focus-within:border-mint/60">
        <Mail className="h-4 w-4 text-muted" />
        <input name={name} type="email" required autoComplete={autoComplete} placeholder="toi@ecole.fr" className="min-h-12 flex-1 bg-transparent text-sm text-frost outline-none placeholder:text-muted" />
      </span>
    </label>
  );
}

function PasswordField({ autoComplete }: { autoComplete: string }) {
  return (
    <label className="grid gap-2 text-sm text-frost">
      Mot de passe
      <span className="flex items-center gap-2 rounded-xl border border-[#d6dfe6] bg-[#fbf8f2] px-3 focus-within:border-mint/60">
        <Lock className="h-4 w-4 text-muted" />
        <input name="password" type="password" required minLength={8} autoComplete={autoComplete} placeholder="8 caractères minimum" className="min-h-12 flex-1 bg-transparent text-sm text-frost outline-none placeholder:text-muted" />
      </span>
    </label>
  );
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;

  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#eaf3f8_0%,#f7f3eb_100%)]" />
      <div className="absolute left-1/2 top-24 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-[#9dc3df]/30 blur-3xl" />

      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
        <div className="lg:sticky lg:top-32">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-frost">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#cbd9e3] bg-white/70 text-mint">
              <BrainCircuit className="h-5 w-5" />
            </span>
            <span className="font-semibold">Menta Prépa</span>
          </Link>
          <h1 className="display-serif text-balance text-5xl font-medium leading-tight text-frost sm:text-6xl">
            Ton espace de travail, vraiment personnel dès l’inscription.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
            Menta connaît ton cursus une seule fois, puis l’utilise partout : Planning IA, fiches, quiz, Focus et recommandations.
          </p>
          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {["Progression sauvegardée", "Cursus mémorisé", "Planning personnel"].map((item) => (
              <div key={item} className="rounded-2xl border border-[#d8e0e6] bg-white/65 p-4 text-sm text-frost shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {params.error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</p>
          ) : null}
          {params.message ? (
            <p className="rounded-xl border border-[#bfd7c9] bg-[#eef7f1] px-4 py-3 text-sm text-[#315c43]">{params.message}</p>
          ) : null}

          <div className="rounded-[28px] border border-[#d4dee5] bg-white/75 p-5 shadow-[0_24px_70px_rgba(44,78,108,0.12)] backdrop-blur-xl sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-mint">Déjà inscrit</p>
              <h2 className="display-serif mt-3 text-3xl font-medium text-frost">Se connecter</h2>
            </div>
            <form action={signIn} className="grid gap-4">
              <EmailField />
              <PasswordField autoComplete="current-password" />
              <button type="submit" className="mt-1 min-h-11 rounded-full bg-[#173f66] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#245783]">
                Connexion
              </button>
            </form>
          </div>

          <div className="rounded-[28px] border border-[#566ff5]/14 bg-white/82 p-5 shadow-[0_24px_70px_rgba(44,78,108,0.12)] backdrop-blur-xl sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#566ff5]">Nouveau sur Menta</p>
              <h2 className="display-serif mt-3 text-3xl font-medium text-frost">Créer mon compte</h2>
              <p className="mt-2 text-sm leading-6 text-muted">Indique ton cursus maintenant : Menta ne te le redemandera pas dans le Planning IA.</p>
            </div>

            <form action={signUp} className="grid gap-4">
              <EmailField autoComplete="email" />
              <PasswordField autoComplete="new-password" />
              <CurriculumFields />
              <button type="submit" className="min-h-12 rounded-full bg-[#566ff5] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(86,111,245,.23)] transition hover:-translate-y-0.5 hover:bg-[#465de4]">
                Créer mon compte Menta
              </button>
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
            <p className="mt-2 text-center text-[11px] leading-5 text-muted">Lors d’une première connexion Google, Menta te demandera ton cursus juste après l’authentification.</p>

            <p className="mt-6 text-center text-xs leading-5 text-muted">
              En créant un compte, tu acceptes les futures conditions d’utilisation et la politique de confidentialité de Menta Prépa.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
