type AcademicProfile = {
  study_type?: string | null;
  study_track?: string | null;
  school_level?: string | null;
  specialties?: string[] | null;
  study_options?: string[] | null;
};

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[]));
}

function languageSubjects(options: string[]) {
  return options.flatMap((option) => {
    const lva = option.match(/^LVA · (.+)$/);
    if (lva) return [`LVA — ${lva[1]}`];
    const lvb = option.match(/^LVB · (.+)$/);
    if (lvb) return [`LVB — ${lvb[1]}`];
    const specialtyLanguage = option.match(/^Spécialité langue vivante · (.+)$/);
    if (specialtyLanguage) return [`Langue vivante — ${specialtyLanguage[1]}`];
    if (/Latin/i.test(option)) return ["Latin"];
    if (/Grec/i.test(option) && !/Grec moderne/i.test(option)) return ["Grec ancien"];
    return [];
  });
}

function optionSubjects(options: string[]) {
  return options.flatMap((option) => {
    if (/Mathématiques approfondies|Mathématiques appliquées|Module mathématiques|calcul et raisonnement/i.test(option)) return ["Mathématiques"];
    if (/ESH ·/i.test(option)) return ["ESH"];
    if (/HGG ·/i.test(option)) return ["HGG"];
    if (/Droit commercial/i.test(option)) return ["Droit commercial"];
    if (/Droit public/i.test(option)) return ["Droit public"];
    if (/Mathématiques appliquées et statistiques/i.test(option)) return ["Mathématiques appliquées et statistiques"];
    if (/Dominante gestion|Gestion-comptabilité|Marketing/i.test(option)) return [option.replace(/^.*·\s*/, "")];
    if (/Histoire des faits économiques/i.test(option)) return ["Histoire des faits économiques"];
    if (/Option informatique|sciences informatiques/i.test(option)) return ["Informatique"];
    if (/Option SII|sciences de l’ingénieur|physique-SII/i.test(option)) return ["Sciences industrielles de l’ingénieur"];
    if (/physique et chimie/i.test(option)) return ["Physique", "Chimie"];
    if (/Spécialité · Philosophie/i.test(option) || /texte philosophique/i.test(option)) return ["Philosophie"];
    if (/Spécialité · Histoire et géographie/i.test(option)) return ["Histoire", "Géographie"];
    if (/Lettres modernes|texte littéraire français/i.test(option)) return ["Lettres / Français"];
    if (/Lettres classiques/i.test(option)) return ["Lettres classiques", "Latin", "Grec ancien"];
    if (/Géographie/i.test(option)) return ["Géographie"];
    if (/Histoire/i.test(option) && !/Histoire des arts|Histoire et théorie des arts|faits économiques/i.test(option)) return ["Histoire"];
    if (/Arts plastiques/i.test(option)) return ["Arts plastiques"];
    if (/Cinéma/i.test(option)) return ["Cinéma / audiovisuel"];
    if (/Théâtre/i.test(option)) return ["Théâtre"];
    if (/Musique/i.test(option)) return ["Musique"];
    if (/Histoire des arts|Histoire et théorie des arts/i.test(option)) return ["Histoire des arts"];
    if (/parcours chimie/i.test(option)) return ["Chimie"];
    if (/génie des procédés/i.test(option)) return ["Génie des procédés"];
    return [];
  });
}

function cpgeSubjects(track: string, options: string[]) {
  let base: string[] = [];

  if (/Lettres \(hypokhâgne A\/L\)|Lettres ENS Lyon|Lettres ENS Ulm/.test(track)) {
    base = ["Lettres / Français", "Philosophie", "Histoire", "Géographie"];
  } else if (/Lettres et sciences sociales B\/L/.test(track)) {
    base = ["Mathématiques", "Sciences sociales", "Littérature / Français", "Philosophie", "Histoire"];
  } else if (/Chartes/.test(track)) {
    base = ["Histoire", "Latin", "Français"];
  } else if (/Saint-Cyr lettres/.test(track)) {
    base = ["Lettres / Français", "Philosophie", "Histoire", "Géographie"];
  } else if (/ECG/.test(track)) {
    base = ["Mathématiques", "Lettres / Philosophie", "Culture générale"];
  } else if (/ECT/.test(track)) {
    base = ["Mathématiques", "Management et sciences de gestion", "Économie-droit", "Culture générale"];
  } else if (/D1 Droit/.test(track)) {
    base = ["Droit civil", "Économie", "Méthodologie", "Anglais"];
  } else if (/D2 Économie/.test(track)) {
    base = ["Mathématiques et statistiques", "Économie", "Analyse monétaire / politique économique", "Méthodologie"];
  } else if (/MPSI/.test(track)) {
    base = ["Mathématiques", "Physique", "Chimie", "Informatique", "Sciences industrielles de l’ingénieur", "Français-philosophie", "TIPE"];
  } else if (/MP2I/.test(track)) {
    base = ["Mathématiques", "Physique", "Chimie", "Informatique", "Sciences industrielles de l’ingénieur", "Français-philosophie", "TIPE"];
  } else if (/PCSI/.test(track)) {
    base = ["Mathématiques", "Physique", "Chimie", "Sciences industrielles de l’ingénieur", "Informatique", "Français-philosophie", "TIPE"];
  } else if (/PTSI/.test(track)) {
    base = ["Mathématiques", "Physique", "Chimie", "Sciences industrielles de l’ingénieur", "Informatique", "Français-philosophie", "TIPE"];
  } else if (/BCPST/.test(track)) {
    base = ["Mathématiques", "Physique", "Chimie", "Biologie", "Sciences de la Terre", "Informatique", "Français-philosophie", "TIPE"];
  } else if (/\bMP\*?\b/.test(track) && !/MP2I|MPSI/.test(track)) {
    base = ["Mathématiques", "Physique", "Français-philosophie", "TIPE"];
  } else if (/\bMPI\*?\b/.test(track)) {
    base = ["Mathématiques", "Physique", "Informatique", "Français-philosophie", "TIPE"];
  } else if (/\bPC\*?\b/.test(track) && !/PCSI/.test(track)) {
    base = ["Mathématiques", "Physique", "Chimie", "Français-philosophie", "TIPE"];
  } else if (/\bPSI\*?\b/.test(track)) {
    base = ["Mathématiques", "Physique", "Chimie", "Sciences industrielles de l’ingénieur", "Français-philosophie", "TIPE"];
  } else if (/\bPT\*?\b/.test(track) && !/PTSI/.test(track)) {
    base = ["Mathématiques", "Physique", "Sciences industrielles de l’ingénieur", "Français-philosophie", "TIPE"];
  } else if (/TSI/.test(track)) {
    base = ["Mathématiques", "Physique-chimie", "Sciences industrielles de l’ingénieur", "Informatique", "Français-philosophie", "TIPE"];
  } else if (/TPC/.test(track)) {
    base = ["Mathématiques", "Physique", "Chimie", "Français-philosophie", "TIPE"];
  } else if (/\bTB\b/.test(track)) {
    base = ["Mathématiques", "Physique-chimie", "Biotechnologies / Biologie", "Sciences de la Terre", "Français-philosophie", "TIPE"];
  } else if (/Arts et design/.test(track)) {
    base = ["Arts", "Design", "Culture générale", "Langue vivante"];
  } else if (/ATS — Économie-gestion/.test(track)) {
    base = ["Anglais", "Culture générale", "Mathématiques", "Économie-droit", "Gestion", "Méthodologie"];
  } else if (/ATS — Ingénierie industrielle/.test(track)) {
    base = ["Mathématiques", "Physique", "Sciences industrielles de l’ingénieur", "Français", "Anglais"];
  } else if (/ATS — Génie civil/.test(track)) {
    base = ["Mathématiques", "Physique", "Génie civil", "Français", "Anglais"];
  } else if (/ATS — Métiers de la chimie/.test(track)) {
    base = ["Mathématiques", "Physique", "Chimie", "Anglais"];
  } else if (/Agro-Véto post-BTSA et BTS/.test(track)) {
    base = ["Biologie", "Chimie", "Mathématiques", "Physique", "Français", "Anglais"];
  } else if (/horticulture|paysage/i.test(track)) {
    base = ["Biologie", "Sciences agronomiques", "Mathématiques", "Français", "Anglais"];
  }

  return unique([...base, ...languageSubjects(options), ...optionSubjects(options)]);
}

export function suggestedSubjectsForProfile(profile: AcademicProfile) {
  const type = profile.study_type || "";
  const track = profile.study_track || "";
  const options = Array.isArray(profile.study_options) ? profile.study_options : [];
  const specialties = Array.isArray(profile.specialties) ? profile.specialties : [];

  if (type === "cpge") return cpgeSubjects(track, options);
  if (type === "lycee") return unique([...specialties]);
  return [];
}
