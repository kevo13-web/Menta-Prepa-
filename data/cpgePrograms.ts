export type CpgeOptionGroup = {
  id: string;
  label: string;
  mode: "single" | "multiple";
  min?: number;
  max?: number;
  options: string[];
  help?: string;
};

export type CpgeProgram = {
  id: string;
  label: string;
  family: "Littéraire" | "Économique et commerciale" | "Scientifique" | "ATS" | "Arts et design";
  year: "1re année" | "2e année" | "1 an";
  optionGroups?: CpgeOptionGroup[];
  note?: string;
};

const languageOptions = [
  "LVA · Anglais",
  "LVA · Allemand",
  "LVA · Espagnol",
  "LVA · Italien",
  "LVA · Arabe",
  "LVA · Chinois",
  "LVA · Portugais",
  "LVA · Russe",
  "LVA · Autre langue",
  "LVB · Anglais",
  "LVB · Allemand",
  "LVB · Espagnol",
  "LVB · Italien",
  "LVB · Arabe",
  "LVB · Chinois",
  "LVB · Portugais",
  "LVB · Russe",
  "LVB · Autre langue",
];

const languages: CpgeOptionGroup = {
  id: "languages",
  label: "Langues suivies",
  mode: "multiple",
  max: 3,
  options: languageOptions,
  help: "Indique tes langues telles qu’elles sont réellement suivies dans ton lycée. L’offre varie selon les établissements.",
};

const hkArts = [
  "Option · Arts plastiques",
  "Option · Musique",
  "Option · Cinéma-audiovisuel",
  "Option · Théâtre",
  "Option · Histoire des arts",
  "Option · Latin renforcé",
  "Option · Grec renforcé",
  "Option · LVB renforcée",
];

const khagneLyonSpecialties = [
  "Spécialité · Lettres modernes",
  "Spécialité · Lettres classiques",
  "Spécialité · Philosophie",
  "Spécialité · Histoire-géographie",
  "Spécialité · Anglais",
  "Spécialité · Allemand",
  "Spécialité · Espagnol",
  "Spécialité · Italien",
  "Spécialité · Russe",
  "Spécialité · Arabe",
  "Spécialité · Chinois",
  "Spécialité · Portugais",
  "Spécialité · Autre langue vivante",
  "Spécialité · Arts plastiques",
  "Spécialité · Musique",
  "Spécialité · Cinéma-audiovisuel",
  "Spécialité · Théâtre",
  "Spécialité · Histoire des arts",
];

const khagneUlmOptions = [
  "Option concours · Lettres modernes / Français",
  "Option concours · Lettres classiques / Latin",
  "Option concours · Lettres classiques / Grec",
  "Option concours · Philosophie",
  "Option concours · Géographie",
  "Option concours · Langue vivante",
  "Option concours · Arts plastiques",
  "Option concours · Musique",
  "Option concours · Cinéma-audiovisuel",
  "Option concours · Théâtre",
  "Option concours · Histoire des arts",
  "Préparation complémentaire · Histoire ancienne",
  "Préparation complémentaire · Histoire (commentaire de texte)",
  "Préparation · École nationale des chartes section B",
];

const cpgePrograms: CpgeProgram[] = [
  {
    id: "lettres-1",
    label: "1re année — Lettres (hypokhâgne A/L)",
    family: "Littéraire",
    year: "1re année",
    optionGroups: [
      {
        id: "ancient-language",
        label: "Langue ancienne obligatoire",
        mode: "single",
        min: 1,
        max: 1,
        options: ["Latin · débutant", "Latin · confirmé", "Grec · débutant", "Grec · confirmé"],
      },
      {
        id: "hk-options",
        label: "Enseignements optionnels",
        mode: "multiple",
        max: 3,
        options: hkArts,
        help: "Toutes les options nationales ne sont pas proposées dans tous les lycées.",
      },
      languages,
    ],
  },
  {
    id: "lettres-lyon-2",
    label: "2e année — Lettres ENS Lyon (khâgne LSH)",
    family: "Littéraire",
    year: "2e année",
    optionGroups: [
      {
        id: "lyon-specialty",
        label: "Spécialité de khâgne",
        mode: "single",
        min: 1,
        max: 1,
        options: khagneLyonSpecialties,
        help: "La liste réellement ouverte dépend du lycée : Menta conserve la spécialité exacte que tu suis.",
      },
      languages,
      {
        id: "lyon-extra",
        label: "Enseignements complémentaires",
        mode: "multiple",
        max: 3,
        options: ["Latin", "Grec", "LVB", "Préparation École nationale des chartes section B"],
      },
    ],
  },
  {
    id: "lettres-ulm-2",
    label: "2e année — Lettres ENS Ulm (khâgne A/L)",
    family: "Littéraire",
    year: "2e année",
    optionGroups: [
      {
        id: "ulm-ancient-language",
        label: "Langue ancienne obligatoire",
        mode: "single",
        min: 1,
        max: 1,
        options: ["Latin", "Grec"],
      },
      {
        id: "ulm-option",
        label: "Option / préparation spécifique",
        mode: "multiple",
        max: 3,
        options: khagneUlmOptions,
        help: "Les préparations effectivement dispensées varient selon le lycée et les concours visés.",
      },
      languages,
    ],
  },
  {
    id: "bl-1",
    label: "1re année — Lettres et sciences sociales B/L",
    family: "Littéraire",
    year: "1re année",
    optionGroups: [
      {
        id: "bl-options",
        label: "Options suivies",
        mode: "multiple",
        max: 4,
        options: ["Géographie", "Latin", "Grec", "LVB"],
      },
      languages,
    ],
  },
  {
    id: "bl-2",
    label: "2e année — Lettres et sciences sociales B/L",
    family: "Littéraire",
    year: "2e année",
    optionGroups: [
      {
        id: "bl2-options",
        label: "Options suivies",
        mode: "multiple",
        max: 4,
        options: ["Géographie", "Latin", "Grec", "LVB"],
      },
      languages,
    ],
  },
  {
    id: "chartes-a-1",
    label: "1re année — Chartes section A",
    family: "Littéraire",
    year: "1re année",
    optionGroups: [
      {
        id: "chartes-a-language",
        label: "Langue ancienne principale",
        mode: "single",
        min: 1,
        max: 1,
        options: ["Latin", "Grec ancien"],
      },
      languages,
    ],
  },
  {
    id: "chartes-a-2",
    label: "2e année — Chartes section A",
    family: "Littéraire",
    year: "2e année",
    optionGroups: [
      {
        id: "chartes-a-language-2",
        label: "Langue ancienne principale",
        mode: "single",
        min: 1,
        max: 1,
        options: ["Latin", "Grec ancien"],
      },
      languages,
    ],
  },
  {
    id: "chartes-b",
    label: "2e année — Préparation Chartes section B",
    family: "Littéraire",
    year: "2e année",
    optionGroups: [languages],
    note: "La section B est notamment préparée dans certaines khâgnes A/L ou Lyon et dans des établissements identifiés par l’École nationale des chartes.",
  },
  {
    id: "saint-cyr-lettres-1",
    label: "1re année — Saint-Cyr lettres",
    family: "Littéraire",
    year: "1re année",
    optionGroups: [
      {
        id: "saint-cyr-options-1",
        label: "Enseignements optionnels",
        mode: "multiple",
        max: 3,
        options: ["LVC", "Mathématiques", "Langue ancienne"],
      },
      languages,
    ],
  },
  {
    id: "saint-cyr-lettres-2",
    label: "2e année — Saint-Cyr lettres",
    family: "Littéraire",
    year: "2e année",
    optionGroups: [
      {
        id: "saint-cyr-options-2",
        label: "Enseignements optionnels",
        mode: "multiple",
        max: 3,
        options: ["LVC", "Mathématiques", "Langue ancienne"],
      },
      languages,
    ],
  },
  {
    id: "ecg-1",
    label: "1re année — ECG",
    family: "Économique et commerciale",
    year: "1re année",
    optionGroups: [
      {
        id: "ecg-maths-1",
        label: "Option de mathématiques",
        mode: "single",
        min: 1,
        max: 1,
        options: ["Mathématiques approfondies", "Mathématiques appliquées"],
      },
      {
        id: "ecg-humanities-1",
        label: "Option de sciences humaines et sociales",
        mode: "single",
        min: 1,
        max: 1,
        options: ["ESH · Économie, sociologie et histoire du monde contemporain", "HGG · Histoire, géographie et géopolitique du monde contemporain"],
      },
      languages,
    ],
  },
  {
    id: "ecg-2",
    label: "2e année — ECG",
    family: "Économique et commerciale",
    year: "2e année",
    optionGroups: [
      {
        id: "ecg-maths-2",
        label: "Option de mathématiques",
        mode: "single",
        min: 1,
        max: 1,
        options: ["Mathématiques approfondies", "Mathématiques appliquées"],
      },
      {
        id: "ecg-humanities-2",
        label: "Option de sciences humaines et sociales",
        mode: "single",
        min: 1,
        max: 1,
        options: ["ESH · Économie, sociologie et histoire du monde contemporain", "HGG · Histoire, géographie et géopolitique du monde contemporain"],
      },
      languages,
    ],
  },
  { id: "ect-1", label: "1re année — ECT", family: "Économique et commerciale", year: "1re année", optionGroups: [languages] },
  { id: "ect-2", label: "2e année — ECT", family: "Économique et commerciale", year: "2e année", optionGroups: [languages] },
  {
    id: "d1-1",
    label: "1re année — D1 Droit, économie, management",
    family: "Économique et commerciale",
    year: "1re année",
    optionGroups: [
      {
        id: "d1-option-1",
        label: "Enseignement optionnel",
        mode: "single",
        min: 1,
        max: 1,
        options: ["Droit commercial", "Droit public", "Mathématiques appliquées et statistiques"],
      },
      languages,
    ],
  },
  {
    id: "d1-2",
    label: "2e année — D1 Droit, économie, management",
    family: "Économique et commerciale",
    year: "2e année",
    optionGroups: [
      {
        id: "d1-option-2",
        label: "Enseignement optionnel",
        mode: "single",
        min: 1,
        max: 1,
        options: ["Droit commercial", "Droit public", "Mathématiques appliquées et statistiques"],
      },
      languages,
    ],
  },
  {
    id: "d2-1",
    label: "1re année — D2 Économie et gestion",
    family: "Économique et commerciale",
    year: "1re année",
    optionGroups: [
      {
        id: "d2-option-1",
        label: "Dominante optionnelle",
        mode: "single",
        min: 1,
        max: 1,
        options: ["Gestion", "Histoire des faits économiques"],
      },
      languages,
    ],
  },
  {
    id: "d2-2",
    label: "2e année — D2 Économie et gestion",
    family: "Économique et commerciale",
    year: "2e année",
    optionGroups: [
      {
        id: "d2-option-2",
        label: "Dominante optionnelle",
        mode: "single",
        min: 1,
        max: 1,
        options: ["Gestion", "Histoire des faits économiques"],
      },
      languages,
    ],
  },
  {
    id: "mpsi",
    label: "1re année — MPSI",
    family: "Scientifique",
    year: "1re année",
    optionGroups: [
      {
        id: "mpsi-option",
        label: "Choix du 2e semestre",
        mode: "single",
        min: 1,
        max: 1,
        options: ["Aucune option renforcée · orientation MP", "Option informatique · orientation MP", "Option SII · orientation MP ou PSI"],
      },
      languages,
    ],
  },
  {
    id: "mp2i",
    label: "1re année — MP2I",
    family: "Scientifique",
    year: "1re année",
    optionGroups: [
      {
        id: "mp2i-option",
        label: "Choix du 2e semestre",
        mode: "single",
        min: 1,
        max: 1,
        options: ["Option sciences informatiques · orientation MPI", "Option SII · orientation MP ou PSI"],
      },
      languages,
    ],
  },
  {
    id: "pcsi",
    label: "1re année — PCSI",
    family: "Scientifique",
    year: "1re année",
    optionGroups: [
      {
        id: "pcsi-option",
        label: "Choix du 2e semestre",
        mode: "single",
        min: 1,
        max: 1,
        options: ["Option physique et chimie · orientation PC", "Option physique et sciences de l’ingénieur · orientation PSI"],
      },
      languages,
    ],
  },
  {
    id: "ptsi",
    label: "1re année — PTSI",
    family: "Scientifique",
    year: "1re année",
    optionGroups: [
      {
        id: "ptsi-option",
        label: "Module du 2e semestre",
        mode: "single",
        min: 1,
        max: 1,
        options: ["Module mathématiques · orientation PSI possible", "Sans module mathématiques supplémentaire · orientation PT"],
      },
      languages,
    ],
  },
  { id: "bcpst-1", label: "1re année — BCPST", family: "Scientifique", year: "1re année", optionGroups: [languages] },
  { id: "bcpst-2", label: "2e année — BCPST", family: "Scientifique", year: "2e année", optionGroups: [languages] },
  { id: "tsi-1", label: "1re année — TSI", family: "Scientifique", year: "1re année", optionGroups: [languages] },
  { id: "tsi-2", label: "2e année — TSI", family: "Scientifique", year: "2e année", optionGroups: [languages] },
  { id: "tpc-1", label: "1re année — TPC", family: "Scientifique", year: "1re année", optionGroups: [languages] },
  { id: "tpc-2", label: "2e année — TPC", family: "Scientifique", year: "2e année", optionGroups: [languages] },
  { id: "tb-1", label: "1re année — TB", family: "Scientifique", year: "1re année", optionGroups: [languages] },
  { id: "tb-2", label: "2e année — TB", family: "Scientifique", year: "2e année", optionGroups: [languages] },
  {
    id: "mp-2",
    label: "2e année — MP",
    family: "Scientifique",
    year: "2e année",
    optionGroups: [
      { id: "mp-option", label: "Option scientifique", mode: "single", min: 1, max: 1, options: ["Option informatique", "Option SII"] },
      languages,
    ],
  },
  {
    id: "mp-star-2",
    label: "2e année — MP*",
    family: "Scientifique",
    year: "2e année",
    optionGroups: [
      { id: "mp-star-option", label: "Option scientifique", mode: "single", min: 1, max: 1, options: ["Option informatique", "Option SII"] },
      languages,
    ],
  },
  { id: "mpi-2", label: "2e année — MPI", family: "Scientifique", year: "2e année", optionGroups: [languages] },
  { id: "mpi-star-2", label: "2e année — MPI*", family: "Scientifique", year: "2e année", optionGroups: [languages] },
  { id: "pc-2", label: "2e année — PC", family: "Scientifique", year: "2e année", optionGroups: [languages] },
  { id: "pc-star-2", label: "2e année — PC*", family: "Scientifique", year: "2e année", optionGroups: [languages] },
  { id: "psi-2", label: "2e année — PSI", family: "Scientifique", year: "2e année", optionGroups: [languages] },
  { id: "psi-star-2", label: "2e année — PSI*", family: "Scientifique", year: "2e année", optionGroups: [languages] },
  { id: "pt-2", label: "2e année — PT", family: "Scientifique", year: "2e année", optionGroups: [languages] },
  { id: "pt-star-2", label: "2e année — PT*", family: "Scientifique", year: "2e année", optionGroups: [languages] },
  { id: "arts-design-1", label: "1re année — Arts et design", family: "Arts et design", year: "1re année", optionGroups: [languages] },
  { id: "arts-design-2", label: "2e année — Arts et design", family: "Arts et design", year: "2e année", optionGroups: [languages] },
  { id: "ats-eco", label: "ATS — Économie-gestion", family: "ATS", year: "1 an", optionGroups: [languages] },
  { id: "ats-indus", label: "ATS — Ingénierie industrielle", family: "ATS", year: "1 an", optionGroups: [languages] },
  { id: "ats-gc", label: "ATS — Génie civil", family: "ATS", year: "1 an", optionGroups: [languages] },
  { id: "ats-chimie", label: "ATS — Métiers de la chimie", family: "ATS", year: "1 an", optionGroups: [languages] },
  { id: "ats-bio", label: "ATS — Biologie", family: "ATS", year: "1 an", optionGroups: [languages] },
  { id: "ats-horti", label: "ATS — Métiers de l’horticulture et du paysage", family: "ATS", year: "1 an", optionGroups: [languages] },
];

export const cpgeFamilies = ["Littéraire", "Économique et commerciale", "Scientifique", "ATS", "Arts et design"] as const;

export function getCpgePrograms() {
  return cpgePrograms;
}

export function getCpgeProgramByLabel(label: string) {
  return cpgePrograms.find((program) => program.label === label);
}

export function getCpgeProgramById(id: string) {
  return cpgePrograms.find((program) => program.id === id);
}

export function isKnownCpgeTrack(label: string) {
  return cpgePrograms.some((program) => program.label === label);
}

export function allowedOptionsForCpgeTrack(label: string) {
  const program = getCpgeProgramByLabel(label);
  return new Set(program?.optionGroups?.flatMap((group) => group.options) || []);
}
