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
  family: "Littéraire" | "Économique et commerciale" | "Scientifique" | "Arts et design" | "ATS";
  year: "1re année" | "2e année" | "1 an";
  optionGroups?: CpgeOptionGroup[];
  note?: string;
};

const languageNames = [
  "Anglais",
  "Allemand",
  "Espagnol",
  "Italien",
  "Arabe",
  "Chinois",
  "Grec moderne",
  "Hébreu",
  "Japonais",
  "Polonais",
  "Portugais",
  "Russe",
  "Autre langue proposée par mon lycée",
];

function languageGroup(id: string, label: string, prefix: string, required: boolean): CpgeOptionGroup {
  return {
    id,
    label,
    mode: "single",
    min: required ? 1 : 0,
    max: 1,
    options: languageNames.map((language) => `${prefix} · ${language}`),
  };
}

const lvaRequired = () => languageGroup("lva", "Langue vivante A", "LVA", true);
const lvbRequired = () => languageGroup("lvb", "Langue vivante B", "LVB", true);
const lvbOptional = () => ({
  ...languageGroup("lvb", "Langue vivante B (facultative selon la filière / le lycée)", "LVB", false),
  help: "L’offre de LVB varie selon les établissements. Ne la sélectionne que si tu la suis réellement.",
});

const hypokhagneComplements = [
  "Complément · Géographie",
  "Complément · LVA approfondie",
  "Complément · LVB approfondie",
  "Complément · Latin débutant",
  "Complément · Latin confirmé",
  "Complément · Grec débutant",
  "Complément · Grec confirmé",
  "Option artistique · Cinéma-audiovisuel",
  "Option artistique · Théâtre",
  "Option artistique · Musique",
  "Option artistique · Histoire des arts",
];

const khagneLyonSpecialties = [
  "Spécialité · Lettres modernes",
  "Spécialité · Lettres classiques",
  "Spécialité · Philosophie",
  "Spécialité · Histoire et géographie",
  "Spécialité langue vivante · Anglais",
  "Spécialité langue vivante · Allemand",
  "Spécialité langue vivante · Arabe",
  "Spécialité langue vivante · Chinois",
  "Spécialité langue vivante · Espagnol",
  "Spécialité langue vivante · Grec moderne",
  "Spécialité langue vivante · Hébreu",
  "Spécialité langue vivante · Italien",
  "Spécialité langue vivante · Japonais",
  "Spécialité langue vivante · Polonais",
  "Spécialité langue vivante · Portugais",
  "Spécialité langue vivante · Russe",
  "Spécialité arts · Études cinématographiques",
  "Spécialité arts · Études théâtrales",
  "Spécialité arts · Musique",
  "Spécialité arts · Histoire et théorie des arts",
];

const khagneUlmOptions = [
  "Option concours · Lettres classiques / version latine et thème",
  "Option concours · Philosophie",
  "Option concours · Lettres modernes / commentaire littéraire français",
  "Option concours · Géographie",
  "Option concours · Histoire",
  "Option concours · Langue vivante / littérature étrangère",
  "Option concours · Langue vivante / version et thème",
  "Option concours · Histoire de la musique",
  "Option concours · Histoire et théorie des arts",
  "Option concours · Études cinématographiques",
  "Option concours · Études théâtrales",
];

const saintCyrOptions = [
  "Option obligatoire · Mathématiques",
  "Option obligatoire · Langue ancienne",
  "Option obligatoire · LVC",
];

const cpgePrograms: CpgeProgram[] = [
  {
    id: "lettres-1",
    label: "1re année — Lettres (hypokhâgne A/L)",
    family: "Littéraire",
    year: "1re année",
    optionGroups: [
      lvaRequired(),
      lvbRequired(),
      {
        id: "ancient-language",
        label: "Langue ancienne du tronc commun",
        mode: "single",
        min: 1,
        max: 1,
        options: ["Latin · débutant", "Latin · confirmé", "Grec · débutant", "Grec · confirmé"],
        help: "Une langue ancienne est obligatoire en hypokhâgne A/L ; elle peut être commencée en CPGE.",
      },
      {
        id: "hk-complements",
        label: "Enseignements complémentaires suivis",
        mode: "multiple",
        max: 5,
        options: hypokhagneComplements,
        help: "Les compléments réellement ouverts changent d’un lycée à l’autre. Sélectionne uniquement ceux de ton établissement.",
      },
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
        help: "Menta distingue la série officielle de l’ENS Lyon et la spécialité précise réellement préparée dans ton lycée.",
      },
      lvaRequired(),
      lvbOptional(),
      {
        id: "lyon-extra",
        label: "Enseignements complémentaires",
        mode: "multiple",
        max: 4,
        options: [
          "Complément · Latin",
          "Complément · Grec",
          "Complément · LVB approfondie",
          "Préparation complémentaire · École nationale des chartes section B",
        ],
      },
    ],
  },
  {
    id: "lettres-ulm-2",
    label: "2e année — Lettres ENS Ulm (khâgne A/L)",
    family: "Littéraire",
    year: "2e année",
    optionGroups: [
      lvaRequired(),
      {
        id: "ulm-ancient-language",
        label: "Langue et culture anciennes",
        mode: "single",
        min: 1,
        max: 1,
        options: ["Latin", "Grec"],
        help: "La khâgne Ulm conserve une langue ancienne dans le cursus commun.",
      },
      {
        id: "ulm-option",
        label: "Épreuve à option préparée au concours A/L",
        mode: "single",
        min: 1,
        max: 1,
        options: khagneUlmOptions,
      },
      lvbOptional(),
      {
        id: "ulm-extra",
        label: "Préparations complémentaires",
        mode: "multiple",
        max: 3,
        options: [
          "Préparation complémentaire · Histoire ancienne",
          "Préparation complémentaire · Histoire médiévale / moderne",
          "Préparation complémentaire · École nationale des chartes section B",
        ],
      },
    ],
  },
  {
    id: "bl-1",
    label: "1re année — Lettres et sciences sociales B/L",
    family: "Littéraire",
    year: "1re année",
    optionGroups: [
      lvaRequired(),
      {
        id: "bl-options-1",
        label: "Deux enseignements à option préparés",
        mode: "multiple",
        min: 2,
        max: 2,
        options: [
          "Option B/L · Latin",
          "Option B/L · Grec",
          "Option B/L · Géographie",
          "Option B/L · LVB",
          "Option B/L · Sciences sociales",
        ],
        help: "La B/L articule les options aux concours visés ; l’offre concrète dépend du lycée.",
      },
      lvbOptional(),
    ],
  },
  {
    id: "bl-2",
    label: "2e année — Lettres et sciences sociales B/L",
    family: "Littéraire",
    year: "2e année",
    optionGroups: [
      lvaRequired(),
      {
        id: "bl-options-2",
        label: "Deux enseignements à option préparés",
        mode: "multiple",
        min: 2,
        max: 2,
        options: [
          "Option B/L · Latin",
          "Option B/L · Grec",
          "Option B/L · Géographie",
          "Option B/L · LVB",
          "Option B/L · Sciences sociales",
        ],
      },
      lvbOptional(),
    ],
  },
  {
    id: "chartes-a-1",
    label: "1re année — Chartes section A (hypochartes)",
    family: "Littéraire",
    year: "1re année",
    optionGroups: [
      lvaRequired(),
      {
        id: "chartes-ancient-1",
        label: "Langues anciennes travaillées",
        mode: "multiple",
        min: 1,
        max: 2,
        options: ["Chartes A · Latin", "Chartes A · Grec ancien"],
      },
    ],
    note: "La section A est une préparation très spécialisée en histoire et langues anciennes ; seules quelques classes dédiées existent en France.",
  },
  {
    id: "chartes-a-2",
    label: "2e année — Chartes section A",
    family: "Littéraire",
    year: "2e année",
    optionGroups: [
      lvaRequired(),
      {
        id: "chartes-ancient-2",
        label: "Langues anciennes travaillées",
        mode: "multiple",
        min: 1,
        max: 2,
        options: ["Chartes A · Latin", "Chartes A · Grec ancien"],
      },
    ],
  },
  {
    id: "chartes-b",
    label: "2e année — Préparation Chartes section B (adossée à une khâgne)",
    family: "Littéraire",
    year: "2e année",
    optionGroups: [
      lvaRequired(),
      {
        id: "chartes-b-written-option",
        label: "Option écrite Chartes B",
        mode: "single",
        min: 1,
        max: 1,
        options: [
          "Chartes B · Version latine",
          "Chartes B · Version grecque",
          "Chartes B · Géographie",
          "Chartes B · Histoire des arts",
        ],
      },
      lvbOptional(),
    ],
    note: "La préparation à la section B est souvent proposée comme option au sein d’une khâgne A/L ou Lyon, plutôt que comme une classe autonome.",
  },
  {
    id: "saint-cyr-lettres-1",
    label: "1re année — Saint-Cyr lettres et sciences humaines",
    family: "Littéraire",
    year: "1re année",
    optionGroups: [
      lvaRequired(),
      lvbRequired(),
      {
        id: "saint-cyr-options-1",
        label: "Enseignement optionnel obligatoire",
        mode: "single",
        min: 1,
        max: 1,
        options: saintCyrOptions,
      },
    ],
    note: "Pour la préparation Saint-Cyr lettres, l’anglais doit être suivi en LVA ou en LVB ; l’offre précise de LVC et langue ancienne dépend du lycée militaire.",
  },
  {
    id: "saint-cyr-lettres-2",
    label: "2e année — Saint-Cyr lettres et sciences humaines",
    family: "Littéraire",
    year: "2e année",
    optionGroups: [
      lvaRequired(),
      lvbRequired(),
      {
        id: "saint-cyr-options-2",
        label: "Enseignement optionnel obligatoire",
        mode: "single",
        min: 1,
        max: 1,
        options: saintCyrOptions,
      },
    ],
    note: "Pour la préparation Saint-Cyr lettres, l’anglais doit être suivi en LVA ou en LVB.",
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
        help: "Ces deux choix forment les quatre parcours officiels de la voie ECG.",
      },
      lvaRequired(),
      lvbRequired(),
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
      lvaRequired(),
      lvbRequired(),
    ],
  },
  { id: "ect-1", label: "1re année — ECT", family: "Économique et commerciale", year: "1re année", optionGroups: [lvaRequired(), lvbRequired()] },
  { id: "ect-2", label: "2e année — ECT", family: "Économique et commerciale", year: "2e année", optionGroups: [lvaRequired(), lvbRequired()] },
  {
    id: "d1-1",
    label: "1re année — D1 Droit, économie, management",
    family: "Économique et commerciale",
    year: "1re année",
    optionGroups: [
      { id: "d1-option-1", label: "Enseignement optionnel", mode: "single", min: 1, max: 1, options: ["Droit commercial", "Droit public", "Mathématiques appliquées et statistiques"] },
      lvbRequired(),
    ],
    note: "L’anglais fait partie du programme commun de D1 ; une LVB est également suivie.",
  },
  {
    id: "d1-2",
    label: "2e année — D1 Droit, économie, management",
    family: "Économique et commerciale",
    year: "2e année",
    optionGroups: [
      { id: "d1-option-2", label: "Enseignement optionnel", mode: "single", min: 1, max: 1, options: ["Droit commercial", "Droit public", "Mathématiques appliquées et statistiques"] },
      lvbRequired(),
    ],
    note: "L’anglais fait partie du programme commun de D1 ; une LVB est également suivie.",
  },
  {
    id: "d2-1",
    label: "1re année — D2 Économie et gestion",
    family: "Économique et commerciale",
    year: "1re année",
    optionGroups: [
      { id: "d2-option-1", label: "Enseignement optionnel", mode: "single", min: 1, max: 1, options: ["Gestion", "Histoire des faits économiques"] },
      lvaRequired(),
    ],
  },
  {
    id: "d2-2",
    label: "2e année — D2 Économie et gestion",
    family: "Économique et commerciale",
    year: "2e année",
    optionGroups: [
      { id: "d2-option-2", label: "Enseignement optionnel", mode: "single", min: 1, max: 1, options: ["Gestion", "Histoire des faits économiques"] },
      lvaRequired(),
    ],
  },
  {
    id: "mpsi",
    label: "1re année — MPSI",
    family: "Scientifique",
    year: "1re année",
    optionGroups: [
      { id: "mpsi-option", label: "Choix du 2e semestre", mode: "single", min: 1, max: 1, options: ["Sans option · orientation MP/MP*", "Option informatique · orientation MP/MP*", "Option SII · orientation MP/MP* ou PSI/PSI*"] },
      lvaRequired(),
      lvbOptional(),
    ],
  },
  {
    id: "mp2i",
    label: "1re année — MP2I",
    family: "Scientifique",
    year: "1re année",
    optionGroups: [
      { id: "mp2i-option", label: "Choix du 2e semestre", mode: "single", min: 1, max: 1, options: ["Option sciences informatiques · orientation MPI/MPI*", "Option SII · orientation MP/MP* ou PSI/PSI*"] },
      lvaRequired(),
      lvbOptional(),
    ],
  },
  {
    id: "pcsi",
    label: "1re année — PCSI",
    family: "Scientifique",
    year: "1re année",
    optionGroups: [
      { id: "pcsi-option", label: "Choix du 2e semestre", mode: "single", min: 1, max: 1, options: ["Option physique-chimie · orientation PC/PC*", "Option physique-SII · orientation PSI/PSI*"] },
      lvaRequired(),
      lvbOptional(),
    ],
  },
  {
    id: "ptsi",
    label: "1re année — PTSI",
    family: "Scientifique",
    year: "1re année",
    optionGroups: [
      { id: "ptsi-option", label: "Module du 2e semestre", mode: "single", min: 1, max: 1, options: ["Module mathématiques · orientation PSI/PSI* possible", "Sans module mathématiques supplémentaire · orientation PT/PT*"] },
      lvaRequired(),
      lvbOptional(),
    ],
  },
  { id: "bcpst-1", label: "1re année — BCPST", family: "Scientifique", year: "1re année", optionGroups: [lvaRequired(), lvbOptional()] },
  { id: "bcpst-2", label: "2e année — BCPST", family: "Scientifique", year: "2e année", optionGroups: [lvaRequired(), lvbOptional()] },
  { id: "tsi-1", label: "1re année — TSI", family: "Scientifique", year: "1re année", optionGroups: [lvaRequired(), lvbOptional()] },
  { id: "tsi-2", label: "2e année — TSI", family: "Scientifique", year: "2e année", optionGroups: [lvaRequired(), lvbOptional()] },
  { id: "tpc-1", label: "1re année — TPC", family: "Scientifique", year: "1re année", optionGroups: [lvaRequired(), lvbOptional()] },
  { id: "tpc-2", label: "2e année — TPC", family: "Scientifique", year: "2e année", optionGroups: [lvaRequired(), lvbOptional()] },
  { id: "tb-1", label: "1re année — TB", family: "Scientifique", year: "1re année", optionGroups: [lvaRequired(), lvbOptional()] },
  { id: "tb-2", label: "2e année — TB", family: "Scientifique", year: "2e année", optionGroups: [lvaRequired(), lvbOptional()] },
  {
    id: "mp-2",
    label: "2e année — MP",
    family: "Scientifique",
    year: "2e année",
    optionGroups: [
      { id: "mp-option", label: "Option scientifique", mode: "single", min: 1, max: 1, options: ["Option informatique", "Option SII"] },
      lvaRequired(),
      lvbOptional(),
    ],
  },
  {
    id: "mp-star-2",
    label: "2e année — MP*",
    family: "Scientifique",
    year: "2e année",
    optionGroups: [
      { id: "mp-star-option", label: "Option scientifique", mode: "single", min: 1, max: 1, options: ["Option informatique", "Option SII"] },
      lvaRequired(),
      lvbOptional(),
    ],
  },
  { id: "mpi-2", label: "2e année — MPI", family: "Scientifique", year: "2e année", optionGroups: [lvaRequired(), lvbOptional()] },
  { id: "mpi-star-2", label: "2e année — MPI*", family: "Scientifique", year: "2e année", optionGroups: [lvaRequired(), lvbOptional()] },
  { id: "pc-2", label: "2e année — PC", family: "Scientifique", year: "2e année", optionGroups: [lvaRequired(), lvbOptional()] },
  { id: "pc-star-2", label: "2e année — PC*", family: "Scientifique", year: "2e année", optionGroups: [lvaRequired(), lvbOptional()] },
  { id: "psi-2", label: "2e année — PSI", family: "Scientifique", year: "2e année", optionGroups: [lvaRequired(), lvbOptional()] },
  { id: "psi-star-2", label: "2e année — PSI*", family: "Scientifique", year: "2e année", optionGroups: [lvaRequired(), lvbOptional()] },
  { id: "pt-2", label: "2e année — PT", family: "Scientifique", year: "2e année", optionGroups: [lvaRequired(), lvbOptional()] },
  { id: "pt-star-2", label: "2e année — PT*", family: "Scientifique", year: "2e année", optionGroups: [lvaRequired(), lvbOptional()] },
  { id: "arts-design-1", label: "1re année — Arts et design", family: "Arts et design", year: "1re année", optionGroups: [lvaRequired()] },
  { id: "arts-design-2", label: "2e année — Arts et design", family: "Arts et design", year: "2e année", optionGroups: [lvaRequired()] },
  { id: "ats-eco", label: "ATS — Économie-gestion", family: "ATS", year: "1 an", optionGroups: [lvaRequired()] },
  { id: "ats-indus", label: "ATS — Ingénierie industrielle", family: "ATS", year: "1 an", optionGroups: [lvaRequired()] },
  { id: "ats-gc", label: "ATS — Génie civil", family: "ATS", year: "1 an", optionGroups: [lvaRequired()] },
  { id: "ats-chimie", label: "ATS — Métiers de la chimie", family: "ATS", year: "1 an", optionGroups: [lvaRequired()] },
  { id: "ats-bio", label: "ATS — Biologie", family: "ATS", year: "1 an", optionGroups: [lvaRequired()] },
  { id: "ats-horti", label: "ATS — Métiers de l’horticulture et du paysage", family: "ATS", year: "1 an", optionGroups: [lvaRequired()] },
];

export const cpgeFamilies = ["Littéraire", "Économique et commerciale", "Scientifique", "Arts et design", "ATS"] as const;

const legacyTrackMap: Record<string, string> = {
  "1re année — Lettres A/L (hypokhâgne)": "1re année — Lettres (hypokhâgne A/L)",
  "2e année — Lettres A/L (khâgne)": "2e année — Lettres ENS Lyon (khâgne LSH)",
  "Prépa D1 — Droit, économie, management": "1re année — D1 Droit, économie, management",
  "Prépa D2 — Économie et gestion": "1re année — D2 Économie et gestion",
  "Prépa Chartes": "1re année — Chartes section A (hypochartes)",
  "MPSI": "1re année — MPSI",
  "MP2I": "1re année — MP2I",
  "PCSI": "1re année — PCSI",
  "PTSI": "1re année — PTSI",
  "BCPST": "1re année — BCPST",
  "TSI": "1re année — TSI",
  "TPC": "1re année — TPC",
  "TB": "1re année — TB",
  "MP": "2e année — MP",
  "MPI": "2e année — MPI",
  "PC": "2e année — PC",
  "PSI": "2e année — PSI",
  "PT": "2e année — PT",
  "BCPST 2e année": "2e année — BCPST",
  "TSI 2e année": "2e année — TSI",
  "TPC 2e année": "2e année — TPC",
  "TB 2e année": "2e année — TB",
  "ATS — adaptation techniciens supérieurs": "ATS — Ingénierie industrielle",
};

export function getCpgePrograms() {
  return cpgePrograms;
}

export function normalizeCpgeTrack(label: string | null | undefined) {
  if (!label) return "";
  if (cpgePrograms.some((program) => program.label === label)) return label;
  return legacyTrackMap[label] || "";
}

export function getCpgeProgramByLabel(label: string) {
  const normalized = normalizeCpgeTrack(label);
  return cpgePrograms.find((program) => program.label === normalized);
}

export function getCpgeProgramById(id: string) {
  return cpgePrograms.find((program) => program.id === id);
}

export function isKnownCpgeTrack(label: string) {
  return Boolean(normalizeCpgeTrack(label));
}

export function allowedOptionsForCpgeTrack(label: string) {
  const program = getCpgeProgramByLabel(label);
  return new Set(program?.optionGroups?.flatMap((group) => group.options) || []);
}
