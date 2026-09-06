"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { studyTypeOptions, type StudyTypeKey } from "@/data/frenchStudyPrograms";
import { lyceeGeneralSpecialties, lyceeSchoolLevels } from "@/data/lyceePrograms";

function siteUrl() {
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function curriculumFromForm(formData: FormData) {
  const studyType = String(formData.get("study_type") ?? "").trim() as StudyTypeKey;
  const studyTrack = String(formData.get("study_track") ?? "").trim();
  const schoolLevel = String(formData.get("school_level") ?? "").trim();
  const specialties = Array.from(new Set(
    formData.getAll("specialties").map((value) => String(value).trim()).filter(Boolean),
  ));

  if (!studyTypeOptions.some((item) => item.value === studyType)) {
    throw new Error("Choisis ton type d’études.");
  }

  if (studyType === "lycee") {
    if (!lyceeSchoolLevels.includes(schoolLevel as (typeof lyceeSchoolLevels)[number])) {
      throw new Error("Choisis ta classe au lycée.");
    }
    if (!studyTrack) throw new Error("Précise ta voie ou ta filière au lycée.");
    if (specialties.some((item) => !lyceeGeneralSpecialties.includes(item as (typeof lyceeGeneralSpecialties)[number]))) {
      throw new Error("Une spécialité sélectionnée n’est pas reconnue.");
    }
    if (schoolLevel === "Première générale" && specialties.length !== 3) {
      throw new Error("En première générale, sélectionne exactement 3 spécialités.");
    }
    if (schoolLevel === "Terminale générale" && specialties.length !== 2) {
      throw new Error("En terminale générale, sélectionne exactement 2 spécialités.");
    }
    if (schoolLevel === "Seconde générale et technologique" && specialties.length > 3) {
      throw new Error("En seconde, tu peux indiquer au maximum 3 spécialités envisagées.");
    }
  } else if (!studyTrack) {
    throw new Error("Précise ta filière et ton année.");
  }

  return {
    studyType,
    studyTrack,
    schoolLevel: studyType === "lycee" ? schoolLevel : "",
    specialties: studyType === "lycee" ? specialties : [],
  };
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/auth?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  let curriculum;
  try {
    curriculum = curriculumFromForm(formData);
  } catch (error) {
    redirect(`/auth?error=${encodeURIComponent(error instanceof Error ? error.message : "Cursus invalide")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback`,
      data: {
        study_type: curriculum.studyType,
        study_track: curriculum.studyTrack,
        school_level: curriculum.schoolLevel,
        specialties: curriculum.specialties,
      },
    },
  });

  if (error) {
    redirect(`/auth?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/auth?message=Compte créé. Vérifie ton email pour confirmer ton inscription.");
}

export async function updateCurriculum(formData: FormData) {
  let curriculum;
  try {
    curriculum = curriculumFromForm(formData);
  } catch (error) {
    redirect(`/account/cursus?error=${encodeURIComponent(error instanceof Error ? error.message : "Cursus invalide")}`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { error } = await supabase
    .from("profiles")
    .update({
      study_type: curriculum.studyType,
      study_track: curriculum.studyTrack,
      school_level: curriculum.schoolLevel || null,
      specialties: curriculum.specialties,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    redirect(`/account/cursus?error=${encodeURIComponent("Impossible d’enregistrer le cursus.")}`);
  }

  redirect("/account?cursus=updated");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl()}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect(`/auth?error=${encodeURIComponent(error?.message ?? "Connexion Google impossible")}`);
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
