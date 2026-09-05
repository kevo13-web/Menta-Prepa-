export type StudyTypeKey =
  | "lycee"
  | "cpge"
  | "licence"
  | "licence_pro"
  | "but"
  | "bts"
  | "master"
  | "doctorat"
  | "sante"
  | "paramedical"
  | "ingenieur"
  | "commerce"
  | "iep"
  | "architecture"
  | "arts_design"
  | "comptabilite"
  | "veterinaire"
  | "ecole_specialisee"
  | "autre";

export const studyTypeOptions: Array<{ value: StudyTypeKey; label: string }> = [
  { value: "lycee", label: "Lycée" },
  { value: "cpge", label: "Prépa / CPGE" },
  { value: "licence", label: "Licence" },
  { value: "licence_pro", label: "Licence professionnelle" },
  { value: "but", label: "BUT" },
  { value: "bts", label: "BTS" },
  { value: "master", label: "Master" },
  { value: "doctorat", label: "Doctorat" },
  { value: "sante", label: "Études de santé (PASS / L.AS / MMOPK)" },
  { value: "paramedical", label: "Paramédical / social" },
  { value: "ingenieur", label: "École d’ingénieurs" },
  { value: "commerce", label: "École de commerce / management" },
  { value: "iep", label: "Sciences Po / IEP" },
  { value: "architecture", label: "Architecture" },
  { value: "arts_design", label: "Arts / design / DN MADE / DNA" },
  { value: "comptabilite", label: "Comptabilité / DCG / DSCG" },
  { value: "veterinaire", label: "Études vétérinaires" },
  { value: "ecole_specialisee", label: "École spécialisée / diplôme d’État" },
  { value: "autre", label: "Autre cursus" },
];

const cpge = [
  "1re année — Lettres A/L (hypokhâgne)",
  "2e année — Lettres A/L (khâgne)",
  "1re année — Lettres et sciences sociales B/L",
  "2e année — Lettres et sciences sociales B/L",
  "1re année — ECG",
  "2e année — ECG",
  "1re année — ECT",
  "2e année — ECT",
  "MPSI", "MP2I", "PCSI", "PTSI", "BCPST", "TSI", "TPC", "TB",
  "MP", "MPI", "PC", "PSI", "PT", "BCPST 2e année", "TSI 2e année", "TPC 2e année", "TB 2e année",
  "ATS — adaptation techniciens supérieurs",
  "Prépa D1 — Droit, économie, management",
  "Prépa D2 — Économie et gestion",
  "Prépa Chartes",
];

const licenceMentions = [
  "Administration publique", "Droit", "Économie", "Gestion", "Économie et gestion", "Administration économique et sociale", "Science politique", "Sciences sanitaires et sociales",
  "Humanités", "Histoire", "Histoire de l'art et archéologie", "Géographie et aménagement", "Sociologie", "Psychologie", "Professorat des écoles (LPE)", "Sciences de l'éducation et de la formation", "Philosophie", "Théologie", "Sciences sociales", "Sciences de l'homme, anthropologie, ethnologie", "Sciences du langage", "Information-communication",
  "Arts", "Arts plastiques", "Arts du spectacle", "Musicologie", "Lettres", "LLCER", "LEA", "Lettres, langues",
  "Informatique", "MIASHS", "Mathématiques", "Physique", "Chimie", "Physique, chimie", "Sciences de la vie", "Sciences de la Terre", "Sciences de la vie et de la Terre",
  "STAPS — entraînement sportif", "STAPS — ergonomie du sport et performance motrice", "STAPS — activité physique adaptée et santé", "STAPS — management du sport", "STAPS — éducation et motricité",
  "Électronique, énergie électrique, automatique", "Mécanique", "Génie civil", "Sciences pour la santé", "Sciences et technologies", "Sciences pour l'ingénieur",
];

const butSpecialties = [
  "Carrières juridiques", "Carrières sociales", "Chimie", "Génie biologique", "Génie chimique - génie des procédés", "Génie civil - construction durable", "Génie électrique et informatique industrielle", "Génie industriel et maintenance", "Génie mécanique et productique", "Gestion administrative et commerciale des organisations", "Gestion des entreprises et des administrations", "Hygiène - sécurité - environnement", "Information-communication", "Informatique", "Management de la logistique et des transports", "Mesures physiques", "Métiers de la transition et de l'efficacité énergétiques", "Métiers du multimédia et de l'Internet", "Packaging, emballage et conditionnement", "Qualité, logistique industrielle et organisation", "Réseaux et télécommunications", "Science des données", "Science et génie des matériaux", "Techniques de commercialisation",
];

const masterMentions = [
  "Analyse et politique économique", "Monnaie, banque, finance, assurance", "Économétrie, statistiques", "Économie", "Économie appliquée", "Économie du développement", "Économie internationale", "Économie sociale et solidaire", "Économie et management publics", "Économie de la santé",
  "Management et administration des entreprises", "Comptabilité - contrôle - audit", "Contrôle de gestion et audit organisationnel", "Finance", "Marketing, vente", "Management", "Management stratégique", "Management et commerce international", "Management public", "Entrepreneuriat et management de projets", "Gestion des ressources humaines",
  "Politiques publiques", "Relations internationales", "Science politique", "Administration publique",
  "Droit", "Droit administratif", "Droit civil", "Droit comparé", "Droit privé", "Droit public", "Droit public des affaires", "Droit des affaires", "Droit bancaire et financier", "Droit de la propriété intellectuelle", "Droit fiscal", "Droit des assurances", "Droit notarial", "Droit du patrimoine", "Droit de l'immobilier", "Droit social", "Droit de l'entreprise", "Droit pénal et sciences criminelles", "Droit de la santé", "Droit de l'environnement et de l'urbanisme", "Droit européen", "Droit international", "Droit du numérique", "Justice, procès et procédures",
  "Histoire", "Histoire de l'art", "Histoire, civilisations, patrimoine", "Archéologie, sciences pour l'archéologie", "Mondes anciens", "Mondes médiévaux", "Mondes modernes", "Mondes contemporains", "Géographie", "Géopolitique", "Géomatique", "Urbanisme et aménagement",
  "Sociologie", "Sciences sociales", "Études sur le genre", "Humanités numériques", "Sciences cognitives", "Anthropologie", "Ethnologie", "Philosophie", "Éthique", "Histoire de la philosophie", "Épistémologie, histoire des sciences et des techniques", "Psychologie", "Psychologie clinique, psychopathologie et psychologie de la santé", "Sciences de l'éducation et de la formation",
  "Journalisme", "Information, communication", "Communication des organisations", "Métiers du livre et de l'édition", "Lettres", "Littérature générale et comparée", "Création littéraire", "Français langue étrangère", "LLCER", "LEA", "Traduction et interprétation", "Didactique des langues", "Humanités",
  "Arts", "Arts plastiques", "Arts de la scène et du spectacle vivant", "Théâtre", "Cinéma et audiovisuel", "Création numérique", "Musicologie", "Patrimoine et musées", "Design",
  "Mathématiques", "Mathématiques et applications", "Mathématiques appliquées, statistique", "Informatique", "Réseaux et télécommunication", "MIAGE", "MIASHS", "Physique", "Chimie", "Génie civil", "Mécanique", "Sciences et génie des matériaux", "Génie des procédés et des bio-procédés", "Électronique, énergie électrique, automatique", "Énergie", "Automatique, robotique", "Génie industriel", "Aéronautique et espace",
  "Biologie", "Biologie-santé", "Santé", "Sciences du vivant", "Santé publique", "Sciences du médicament", "Biotechnologies", "Neurosciences", "Immunologie", "Nutrition et sciences des aliments", "Bio-informatique", "Génétique", "Ingénierie de la santé", "Sciences de la Terre et des planètes, environnement", "Biodiversité, écologie et évolution",
  "MEEF — 1er degré", "MEEF — 2e degré", "MEEF — encadrement éducatif", "MEEF — pratiques et ingénierie de la formation", "Risques et environnement", "Qualité, hygiène, sécurité", "Transport, mobilités, réseaux", "Tourisme", "Ville et environnements urbains",
];

const health = [
  "PASS — parcours d'accès spécifique santé",
  "L.AS 1 — licence avec accès santé", "L.AS 2 — licence avec accès santé", "L.AS 3 — licence avec accès santé",
  "Médecine — DFGSM2", "Médecine — DFGSM3", "Médecine — DFASM1", "Médecine — DFASM2", "Médecine — DFASM3",
  "Médecine — internat / DES médecine générale", "Médecine — internat / DES spécialité médicale", "Médecine — internat / DES spécialité chirurgicale",
  "Pharmacie — 2e année", "Pharmacie — 3e année", "Pharmacie — 4e année", "Pharmacie — 5e année", "Pharmacie — 6e année / internat",
  "Odontologie — 2e année", "Odontologie — 3e année", "Odontologie — 4e année", "Odontologie — 5e année", "Odontologie — 6e année / internat",
  "Maïeutique — 2e année", "Maïeutique — 3e année", "Maïeutique — 4e année", "Maïeutique — 5e année", "Maïeutique — 6e année",
  "Kinésithérapie — IFMK 1", "Kinésithérapie — IFMK 2", "Kinésithérapie — IFMK 3", "Kinésithérapie — IFMK 4",
];

const broadDoctoralFields = [
  "Droit", "Science politique", "Économie", "Gestion", "Histoire", "Géographie", "Philosophie", "Lettres", "Langues et littératures", "Sciences du langage", "Sociologie", "Anthropologie", "Psychologie", "Sciences de l'éducation", "Arts", "Information-communication", "Mathématiques", "Informatique", "Physique", "Chimie", "Sciences de la Terre", "Sciences de la vie", "Biochimie et biologie moléculaire", "Neurosciences", "Médecine", "Pharmacie", "Odontologie", "Sciences pour l'ingénieur", "Mécanique", "Génie civil", "Électronique / automatique", "STAPS",
];

function withYears(prefixes: string[], mentions: string[]) {
  return prefixes.flatMap((prefix) => mentions.map((mention) => `${prefix} — ${mention}`));
}

export function getTrackSuggestions(type: StudyTypeKey): string[] {
  switch (type) {
    case "lycee":
      return ["Seconde", "Première générale", "Terminale générale", "Première technologique", "Terminale technologique", "Voie professionnelle"];
    case "cpge": return cpge;
    case "licence": return withYears(["L1", "L2", "L3"], licenceMentions);
    case "licence_pro": return ["Licence professionnelle — parcours à préciser", ...licenceMentions.map((mention) => `Licence professionnelle — ${mention}`)];
    case "but": return withYears(["BUT1", "BUT2", "BUT3"], butSpecialties);
    case "bts": return ["BTS 1re année — spécialité à préciser", "BTS 2e année — spécialité à préciser", "BTS — Commerce international", "BTS — Communication", "BTS — Comptabilité et gestion", "BTS — Management commercial opérationnel", "BTS — Négociation et digitalisation de la relation client", "BTS — Services informatiques aux organisations", "BTS — Banque", "BTS — Assurance", "BTS — Tourisme", "BTS — Bâtiment", "BTS — Électrotechnique"];
    case "master": return withYears(["M1", "M2"], masterMentions);
    case "doctorat": return broadDoctoralFields.map((field) => `Doctorat — ${field}`);
    case "sante": return health;
    case "paramedical": return ["IFSI — diplôme d'État infirmier", "Orthophonie", "Orthoptie", "Audioprothèse", "Ergothérapie", "Psychomotricité", "Pédicure-podologie", "Manipulateur d'électroradiologie médicale", "Éducateur spécialisé", "Assistant de service social"];
    case "ingenieur": return ["Cycle préparatoire intégré", "Cycle ingénieur — 1re année", "Cycle ingénieur — 2e année", "Cycle ingénieur — 3e année", "Ingénieur — informatique", "Ingénieur — mécanique", "Ingénieur — génie civil", "Ingénieur — électronique", "Ingénieur — chimie", "Ingénieur — énergie", "Ingénieur — agronomie"];
    case "commerce": return ["Bachelor / BBA", "Programme Grande École — pré-master", "Programme Grande École — M1", "Programme Grande École — M2", "MSc / Mastère spécialisé"];
    case "iep": return ["Sciences Po / IEP — 1re année", "Sciences Po / IEP — 2e année", "Sciences Po / IEP — 3e année", "Sciences Po / IEP — Master 1", "Sciences Po / IEP — Master 2"];
    case "architecture": return ["DEEA — 1re année", "DEEA — 2e année", "DEEA — 3e année", "DEA — 1re année", "DEA — 2e année", "HMONP"];
    case "arts_design": return ["DN MADE — 1re année", "DN MADE — 2e année", "DN MADE — 3e année", "DNA — 1re année", "DNA — 2e année", "DNA — 3e année", "DNSEP — 1re année", "DNSEP — 2e année"];
    case "comptabilite": return ["DCG — 1re année", "DCG — 2e année", "DCG — 3e année", "DSCG — 1re année", "DSCG — 2e année", "DEC — stage d'expertise comptable"];
    case "veterinaire": return ["École vétérinaire — 1re année", "École vétérinaire — 2e année", "École vétérinaire — 3e année", "École vétérinaire — 4e année", "École vétérinaire — 5e année", "École vétérinaire — 6e année"];
    case "ecole_specialisee": return ["Diplôme d'État — filière à préciser", "École spécialisée — filière à préciser"];
    default: return [];
  }
}

export function studyTypeLabel(type: StudyTypeKey) {
  return studyTypeOptions.find((option) => option.value === type)?.label || "Autre cursus";
}
