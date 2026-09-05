import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreditCard, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export const metadata: Metadata = {
  title: "Mon compte | Menta Prépa",
};

type AccountPageProps = {
  searchParams: Promise<{ checkout?: string }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name, plan, subscription_status, current_period_end")
    .eq("id", user.id)
    .maybeSingle();

  const planLabels: Record<string, string> = {
    gratuit: "Gratuit",
    etudiant_plus: "Étudiant Plus",
    prepa_pro: "Prépa Pro",
  };

  return (
    <section className="px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-mint">Mon compte</p>
        <h1 className="display-serif mt-3 text-5xl font-medium text-frost">Ton espace Menta</h1>
        <p className="mt-4 max-w-2xl text-muted">Compte, abonnement et données personnelles réunis au même endroit.</p>

        {params.checkout === "success" ? (
          <div className="mt-8 rounded-2xl border border-[#b9d7c5] bg-[#eef7f1] p-4 text-sm text-[#315c43]">
            Paiement confirmé. Ton abonnement sera activé dès réception de la confirmation Stripe.
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
