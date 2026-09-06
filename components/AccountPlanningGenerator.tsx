"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GraduationCap, Sparkles } from "lucide-react";
import { PlanningGenerator } from "@/components/PlanningGenerator";
import { createClient } from "@/lib/supabase/client";
import { studyTypeLabel, type StudyTypeKey } from "@/data/frenchStudyPrograms";

type AcademicProfile = {
  study_type: string | null;
  study_track: string | null;
  school_level: string | null;
  specialties: string[] | null;
  study_options: string[] | null;
};

export function AccountPlanningGenerator() {
  const [profile, setProfile] = useState<AcademicProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("study_type, study_track, school_level, specialties, study_options")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled && data) setProfile(data as AcademicProfile);
    };
    void loadProfile();
    return () => { cancelled = true; };
  }, []);

  const profileType = profile?.study_type
    ? studyTypeLabel(profile.study_type as StudyTypeKey)
    : "Cursus à compléter";
  const options = Array.isArray(profile?.study_options) ? profile.study_options : [];
  const specialties = Array.isArray(profile?.specialties) ? profile.specialties : [];

  return (
    <div className="account-planning-generator">
      {profile ? (
        <div className="mb-5 overflow-hidden rounded-[1.8rem] border border-[#566ff5]/14 bg-gradient-to-br from-[#edf1ff] via-white to-[#e8fbf5] p-5 shadow-[0_16px_48px_rgba(53,82,110,.07)] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#566ff5] text-white shadow-[0_9px_22px_rgba(86,111,245,.22)]"><GraduationCap className="h-5 w-5" /></span>
                <div>
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.17em] text-[#5267d9]"><Sparkles className="h-3.5 w-3.5" /> Cursus utilisé par Menta AI</p>
                  <h2 className="mt-1 display-serif text-xl font-semibold text-[#1d3552]">{profileType}</h2>
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold text-[#405c78]">{[profile.school_level, profile.study_track].filter(Boolean).join(" · ") || "Profil académique non précisé"}</p>
              {(specialties.length || options.length) ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {specialties.map((item) => <span key={`specialty-${item}`} className="rounded-full border border-[#58d6b1]/20 bg-[#e9faf5] px-2.5 py-1 text-[11px] font-semibold text-[#347d69]">{item}</span>)}
                  {options.map((item) => <span key={`option-${item}`} className="rounded-full border border-[#566ff5]/14 bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-[#6073c7]">{item}</span>)}
                </div>
              ) : null}
              <p className="mt-3 max-w-3xl text-xs leading-5 text-[#75879a]">Le Planning IA utilise ce profil comme source de vérité : voie, année, spécialités, langues et options influencent les méthodes et priorités proposées.</p>
            </div>
            <Link href="/account/cursus" className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-[#566ff5]/15 bg-white/85 px-4 text-xs font-bold text-[#5267d9] shadow-sm transition hover:bg-white">Modifier mon cursus</Link>
          </div>
        </div>
      ) : null}

      <PlanningGenerator />
      <style jsx global>{`
        .account-planning-generator aside > div > div.grid > section:first-child {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
