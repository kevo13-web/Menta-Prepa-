import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreditCard, GraduationCap, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { BillingPortalButton } from "@/components/BillingPortalButton";
import { studyTypeLabel, type StudyTypeKey } from "@/data/frenchStudyPrograms";

export const metadata: Metadata = {
  title: "Mon compte | Menta Prépa",
};

type AccountPageProps = {
  searchParams: Promise<{ checkout?: string; cursus?: string }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name, plan, subscription_status, current_period_end, stripe_customer_id, study_type, study_track, school_level, specialties")
    .eq("id", user.id)
    .maybeSingle();

  const planLabels: Record<string, string> = {
    gratuit: "Gratuit",
    etudiant_plus: "Étudiant Plus",
    prepa_pro: "Prépa Pro",
  };

  const studyType = profile?.study_type as StudyTypeKey | null;
  const specialties = Array.isArray(profile?.specialties) ? profile.specialties : [];

  return (
    <section className="px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-mint">Mon compte</p>
        <h1 className="display-serif mt-3 text-5xl font-medium text-frost">Ton espace Menta</h1>
        <p className="mt-4 max-w-2xl text-muted">Compte, cursus, abonnement et données personnelles réunis au même endroit.</p>

        {params.checkout === "success" ? (
          <div className="mt-8 rounded-2xl border border-[#b9d7c5] bg-[#eef7f1] p-4 text-sm text-[#315c43]">
            Paiement confirmé. Ton abonnement sera activé dès réception de la confirmation Stripe.
          </div>
        ) : null}
        {params.cursus === "updated" ? (
          <div className="mt-8 rounded-2xl border border-[#b9d7c5] bg-[#eef7f1] p-4 text-sm text-[#315c43]">
            Cursus enregistré. Menta l’utilisera désormais automatiquement dans le Planning IA.
          </div>
        ) : null}

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-[26px] border border-[#d6e0e7] bg-white/70 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dceaf4] text-[#4f83b6]"><UserRound className="h-5 w-5" /></span>
              <div><p className="text-sm text-muted">Compte</p><h2 className="font-serif text-2xl text-frost">{profile?.full_name || "Étudiant Menta"}</h2></div>
            </div>
            <p className="mt-6 text-sm text-muted">Email</p>
            <p className="mt-1 font-medium text-frost">{profile?.email || user.email}</p>
          </div>

          <div className="rounded-[26px] border border-[#d6e0e7] bg-white/70 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dceaf4] text-[#4f83b6]"><CreditCard className="h-5 w-5" /></span>
              <div><p className="text-sm text-muted">Abonnement</p><h2 className="font-serif text-2xl text-frost">{planLabels[profile?.plan ?? "gratuit"] ?? "Gratuit"}</h2></div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-muted"><ShieldCheck className="h-4 w-4 text-mint" /> Statut : {profile?.subscription_status ?? "inactive"}</div>
            {profile?.current_period_end ? <p className="mt-2 text-xs text-muted">Période actuelle jusqu’au {new Date(profile.current_period_end).toLocaleDateString("fr-FR")}</p> : null}
            {profile?.stripe_customer_id ? <BillingPortalButton /> : null}
          </div>

          <div className="rounded-[26px] border border-[#566ff5]/14 bg-gradient-to-br from-[#edf1ff] via-white to-[#e8fbf5] p-6 shadow-sm md:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#566ff5] shadow-sm"><GraduationCap className="h-5 w-5" /></span>
                  <div><p className="text-sm text-muted">Cursus</p><h2 className="font-serif text-2xl text-frost">{studyType ? studyTypeLabel(studyType) : "À compléter"}</h2></div>
                </div>
                {studyType ? (
                  <div className="mt-5 space-y-2 text-sm text-[#5f7489]">
                    {profile?.school_level ? <p><strong className="text-[#294762]">Classe :</strong> {profile.school_level}</p> : null}
                    {profile?.study_track ? <p><strong className="text-[#294762]">Filière :</strong> {profile.study_track}</p> : null}
                    {specialties.length ? <p><strong className="text-[#294762]">Spécialités :</strong> {specialties.join(" · ")}</p> : null}
                  </div>
                ) : <p className="mt-4 text-sm text-[#6d8094]">Ajoute ton cursus pour que Menta personnalise automatiquement le Planning IA.</p>}
              </div>
              <Link href="/account/cursus" className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#566ff5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#465de4]">
                {studyType ? "Modifier mon cursus" : "Compléter mon cursus"}
              </Link>
            </div>
          </div>
        </div>

        <form action={signOut} className="mt-8">
          <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#cbd9e3] bg-white/70 px-5 py-2.5 text-sm font-semibold text-frost transition hover:bg-white">
            <LogOut className="h-4 w-4" /> Se déconnecter
          </button>
        </form>
      </div>
    </section>
  );
}
