import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { CurriculumFields } from "@/components/CurriculumFields";
import { createClient } from "@/lib/supabase/server";
import { updateCurriculum } from "@/app/auth/actions";

export const metadata: Metadata = {
  title: "Mon cursus | Menta Prépa",
};

type CursusPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function CursusPage({ searchParams }: CursusPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("study_type, study_track, school_level, specialties, study_options")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <section className="px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/account" className="inline-flex items-center gap-2 text-sm font-semibold text-[#62778e] hover:text-[#405b78]">
          <ArrowLeft className="h-4 w-4" /> Retour au compte
        </Link>

        <div className="mt-6 rounded-[2rem] border border-[#566ff5]/14 bg-white/80 p-6 shadow-[0_22px_70px_rgba(45,67,110,.1)] backdrop-blur-xl sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#edf1ff] text-[#566ff5]"><GraduationCap className="h-5 w-5" /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#566ff5]">Profil académique</p>
              <h1 className="display-serif mt-1 text-3xl font-semibold text-[#1d3552]">Ton cursus Menta</h1>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-[#6b7d90]">Ce cursus est utilisé automatiquement par le Planning IA, les recommandations et les prochaines fonctions de personnalisation. En CPGE, Menta mémorise aussi ta voie exacte, tes options, ta spécialité et tes langues.</p>

          {params.error ? <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</p> : null}

          <form action={updateCurriculum} className="mt-6 grid gap-5">
            <CurriculumFields
              defaultStudyType={profile?.study_type}
              defaultTrack={profile?.study_track}
              defaultSchoolLevel={profile?.school_level}
              defaultSpecialties={Array.isArray(profile?.specialties) ? profile.specialties : []}
              defaultStudyOptions={Array.isArray(profile?.study_options) ? profile.study_options : []}
            />
            <button type="submit" className="min-h-12 rounded-2xl bg-[#566ff5] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(86,111,245,.22)] transition hover:-translate-y-0.5 hover:bg-[#465de4]">
              Enregistrer mon cursus
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
