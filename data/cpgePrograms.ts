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
  year: "1re année" | "2e année" | "3e année" | "1 an";
  optionGroups?: CpgeOptionGroup[];
  note?: string;
};

const ensLanguages = [
  "Allemand",
  "Anglais",
  "Arabe",
  "Chinois",
  "Espagnol",
  "Grec moderne",
  "Hébreu",
  "Italien",
  "Japonais",
  "Polonais",
  "Portugais",
  "Russe",
];

const languageNames = [...ensLanguages, "Autre langue proposée par mon lycée"];

function single(id: string, label: string, options: string[], required = true, help?: string): CpgeOptionGroup {
  return { id, label, mode: "single", min: required ? 1 : 0, max: 1, options, help };
}

function multiple(id: string, label: string, options: string[], min = 0, max?: number, help?: string): CpgeOptionGroup {
  return { id, label, mode: "multiple", min, max, options, help };
}

function languageGroup(id: string, label: string, prefix: string, required: boolean): CpgeOptionGroup {
  return single(id, label, languageNames.map((language) => `${prefix} · ${language}`), required);
}

const lvaRequired = () => languageGroup("lva", "Langue vivante A", "LVA", true);
const lvbRequired = () => languageGroup("lvb", "Langue vivante B", "LVB", true);
const lvbOptional = () => ({
  ...languageGroup("lvb", "Langue vivante B", "LVB", false),
  help: "Facultative ou dispensable dans certaines voies ; sélectionne-la seulement si tu la suis réellement.",
});

const hypokhagneComplements = [
  "Complément · Géographie",
  "Complément · LVA approfondie",
  "Complément · LVB approfondie",
  "Complément · Latin débutant",
  "Complément · Latin confirmé",
  "Complément · Grec débutant",
  "Complément · Grec confirmé",
  "Option artistique · Arts plastiques",
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
  "Spécialité langue vivante · Allemand",
  "Spécialité langue vivante · Anglais",
  "Spécialité langue vivante · Arabe",
  "Spécialité langue vivante · Chinois",
  "Spécialité langue vivante · Espagnol",
  "Spécialité langue vivante · Italien",
  "Spécialité langue vivante · Russe",
  "Spécialité arts · Arts plastiques",
  "Spécialité arts · Cinéma et audiovisuel",
  "Spécialité arts · Théâtre",
  "Spécialité arts · Musique",
  "Spécialité arts · Histoire des arts",
];

const khagneUlmOptions = [
  "Option concours A/L · Version latine et court thème",
  "Option concours A/L · Commentaire d’un texte philosophique",
  "Option concours A/L · Commentaire d’un texte littéraire français",
  "Option concours A/L · Composition de géographie",
  "Option concours A/L · Histoire",
  ...ensLanguages.map((language) => `Option concours A/L · Littérature étrangère · ${language}`),
  ...ensLanguages.map((language) => `Option concours A/L · Version et thème · ${language}`),
  "Option concours A/L · Histoire de la musique",
  "Option concours A/L · Histoire et théorie des arts",
  "Option concours A/L · Études cinématographiques",
  "Option concours A/L · Études théâtrales",
];

const saintCyrOptions = [
  "Option obligatoire · Mathématiques",
  "Option obligatoire · Latin",
  "Option obligatoire · LVC arabe",
  "Option obligatoire · LVC russe",
];

function ecg(year: "1re année" | "2e année", id: string): CpgeProgram {
  return {
    id,
    label: `${year} — ECG`,
    family: "Économique et commerciale",
    year,
    optionGroups: [
      single(`${id}-maths`, "Option de mathématiques", ["Mathématiques approfondies", "Mathématiques appliquées"]),
      single(`${id}-shs`, "Option de sciences humaines et sociales", [
        "ESH · Économie, sociologie et histoire du monde contemporain",
        "HGG · Histoire, géographie et géopolitique du monde contemporain",
      ], true, "Les deux choix forment les quatre parcours nationaux possibles de la voie ECG."),
      lvaRequired(),
      lvbRequired(),
    ],
  };
}

function d1(year: "1re année" | "2e année", id: string): CpgeProgram {
  return {
    id,
    label: `${year} — D1 Droit, économie, management`,
    family: "Économique et commerciale",
    year,
    optionGroups: [
      single(`${id}-option`, "Enseignement optionnel", ["Droit commercial", "Droit public", "Mathématiques appliquées et statistiques"]),
      lvbRequired(),
    ],
    note: "L’anglais appartient au programme commun de D1 ; la LVB et l’enseignement optionnel sont enregistrés séparément.",
  };
}

function d2(year: "1re année" | "2e année", id: string): CpgeProgram {
  return {
    id,
    label: `${year} — D2 Économie et gestion`,
    family: "Économique et commerciale",
    year,
    optionGroups: [
      single(`${id}-option`, "Enseignement optionnel", ["Dominante gestion", "Histoire des faits économiques"]),
      lvaRequired(),
    ],
  };
}

function simpleScience(id: string, label: string, year: "1re année" | "2e année"): CpgeProgram {
  return { id, label, family: "Scientifique", year, optionGroups: [lvaRequired(), lvbOptional()] };
}

function secondYearScience(id: string, label: string, withMpOption = false): CpgeProgram {
  return {
    id,
    label,
    family: "Scientifique",
    year: "2e année",
    optionGroups: [
      ...(withMpOption ? [single(`${id}-option`, "Option scientifique", ["Option informatique", "Option SII"])] : []),
      lvaRequired(),
      lvbOptional(),
    ],
  };
}

const cpgePrograms: CpgeProgram[] = [
  {
    id: "lettres-1",
    label: "1re année — Lettres (hypokhâgne A/L)",
    family: "Littéraire",
    year: "1re année",
    optionGroups: [
      lvaRequired(),
      lvbOptional(),
      single("hk-ancient", "Langue ancienne du tronc commun", ["Latin · débutant", "Latin · confirmé", "Grec · débutant", "Grec · confirmé"], true,
        "Une langue ancienne est obligatoire en hypokhâgne ; elle peut être commencée en CPGE."),
      multiple("hk-complements", "Enseignements complémentaires réellement suivis", hypokhagneComplements, 0, 6,
        "L’offre varie fortement selon les établissements ; ne sélectionne que les enseignements de ton lycée."),
    ],
    note: "En hypokhâgne A/L, la LVB peut être dispensée lorsque l’étudiant suit suffisamment d’enseignements optionnels.",
  },
  {
    id: "lettres-lyon-2",
    label: "2e année — Lettres ENS Lyon (khâgne LSH)",
    family: "Littéraire",
    year: "2e année",
    optionGroups: [
      single("lyon-specialty", "Spécialité de khâgne", khagneLyonSpecialties, true,
        "Cette liste reprend les spécialités actuellement répertoriées pour la khâgne ENS Lyon ; l’ouverture concrète dépend du lycée."),
      lvaRequired(),
      lvbOptional(),
      multiple("lyon-extra", "Enseignements / préparations complémentaires", [
        "Complément · Latin",
        "Complément · Grec",
        "Complément · LVB approfondie",
        "Préparation complémentaire · École nationale des chartes section B",
      ], 0, 4),
    ],
  },
  {
    id: "lettres-ulm-2",
    label: "2e année — Lettres ENS Ulm (khâgne A/L)",
    family: "Littéraire",
    year: "2e année",
    optionGroups: [
      lvaRequired(),
      single("ulm-ancient", "Langue et culture anciennes", ["Latin", "Grec"]),
      single("ulm-option", "Épreuve écrite à option A/L préparée", khagneUlmOptions, true,
        "Les intitulés suivent la réglementation du concours ENS Paris-PSL mise à jour en 2026, y compris les intitulés applicables à la session 2027."),
      lvbOptional(),
      multiple("ulm-extra", "Préparations complémentaires", [
        "Préparation complémentaire · Histoire ancienne",
        "Préparation complémentaire · Histoire médiévale",
        "Préparation complémentaire · Histoire moderne",
        "Préparation complémentaire · École nationale des chartes section B",
      ], 0, 4),
    ],
  },
  {
    id: "bl-1",
    label: "1re année — Lettres et sciences sociales B/L",
    family: "Littéraire",
    year: "1re année",
    optionGroups: [
      lvaRequired(),
      multiple("bl-options-1", "Deux choix préparés en vue des concours", [
        "Option B/L · Latin",
        "Option B/L · Grec",
        "Option B/L · Géographie",
        "Option B/L · Deuxième langue",
        "Option B/L · Sciences sociales",
      ], 2, 2, "La B/L prévoit deux choix parmi ces cinq domaines en vue des concours."),
      single("bl-lva-civilisation-1", "Civilisation renforcée en LVA", ["Civilisation renforcée en LVA"], false),
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
      multiple("bl-options-2", "Deux choix préparés en vue des concours", [
        "Option B/L · Latin",
        "Option B/L · Grec",
        "Option B/L · Géographie",
        "Option B/L · Deuxième langue",
        "Option B/L · Sciences sociales",
      ], 2, 2),
      single("bl-lva-civilisation-2", "Civilisation renforcée en LVA", ["Civilisation renforcée en LVA"], false),
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
      single("chartes-a-classics-1", "Choix en langues anciennes", [
        "Section A · Thème latin",
        "Section A · Version grecque",
      ], true, "Le latin (version) appartient au cursus de section A ; le choix porte notamment sur thème latin ou version grecque."),
    ],
    note: "La section A est une préparation spécialisée en histoire et langues anciennes ; quelques établissements seulement l’ouvrent.",
  },
  {
    id: "chartes-a-2",
    label: "2e année — Chartes section A",
    family: "Littéraire",
    year: "2e année",
    optionGroups: [
      lvaRequired(),
      single("chartes-a-classics-2", "Choix en langues anciennes", ["Section A · Thème latin", "Section A · Version grecque"]),
    ],
  },
  {
    id: "chartes-b-1",
    label: "1re année — Chartes section B",
    family: "Littéraire",
    year: "1re année",
    optionGroups: [
      lvaRequired(),
      single("chartes-b-written-1", "Option principale de section B", [
        "Chartes B · Version latine",
        "Chartes B · Version grecque",
        "Chartes B · Géographie",
        "Chartes B · Histoire des arts",
      ]),
      lvbOptional(),
    ],
    note: "Certains lycées, notamment Pierre-de-Fermat, préparent directement les sections A et B dès la première année.",
  },
  {
    id: "chartes-b-2",
    label: "2e année — Chartes section B",
    family: "Littéraire",
    year: "2e année",
    optionGroups: [
      lvaRequired(),
      single("chartes-b-written-2", "Option principale de section B", [
        "Chartes B · Version latine",
        "Chartes B · Version grecque",
        "Chartes B · Géographie",
        "Chartes B · Histoire des arts",
      ]),
      single("chartes-b-second-2", "Complément de section B", ["Chartes B · LVB", "Chartes B · Histoire médiévale"], false),
      lvbOptional(),
    ],
  },
  {
    id: "chartes-b-khagne",
    label: "2e année — Préparation Chartes section B adossée à une khâgne",
    family: "Littéraire",
    year: "2e année",
    optionGroups: [
      lvaRequired(),
      single("chartes-b-khagne-written", "Option principale de section B", [
        "Chartes B · Version latine",
        "Chartes B · Version grecque",
        "Chartes B · Géographie",
        "Chartes B · Histoire des arts",
      ]),
      lvbOptional(),
    ],
    note: "Cette préparation peut être suivie au sein d’une khâgne Ulm ou Lyon sans constituer une classe autonome.",
  },
  {
    id: "saint-cyr-lettres-1",
    label: "1re année — Saint-Cyr lettres et sciences humaines",
    family: "Littéraire",
    year: "1re année",
    optionGroups: [
      lvaRequired(),
      lvbRequired(),
      single("saint-cyr-option-1", "Matière optionnelle obligatoire", saintCyrOptions),
    ],
    note: "L’anglais doit être suivi en LVA ou en LVB. L’option est mathématiques, latin ou LVC (arabe/russe selon l’offre).",
  },
  {
    id: "saint-cyr-lettres-2",
    label: "2e année — Saint-Cyr lettres et sciences humaines",
    family: "Littéraire",
    year: "2e année",
    optionGroups: [
      lvaRequired(),
      lvbRequired(),
      single("saint-cyr-option-2", "Matière optionnelle obligatoire", saintCyrOptions),
    ],
    note: "L’anglais doit être suivi en LVA ou en LVB.",
  },

  ecg("1re année", "ecg-1"),
  ecg("2e année", "ecg-2"),
  { id: "ect-1", label: "1re année — ECT", family: "Économique et commerciale", year: "1re année", optionGroups: [lvaRequired(), lvbRequired()] },
  { id: "ect-2", label: "2e année — ECT", family: "Économique et commerciale", year: "2e année", optionGroups: [lvaRequired(), lvbRequired()] },
  {
    id: "ect-bacpro-1",
    label: "1re année du dispositif bac professionnel — ECT",
    family: "Économique et commerciale",
    year: "1re année",
    optionGroups: [lvaRequired(), lvbOptional()],
    note: "Dispositif ECT en trois ans réservé à certains bacheliers professionnels tertiaires.",
  },
  {
    id: "ect-bacpro-2",
    label: "2e année du dispositif bac professionnel — ECT",
    family: "Économique et commerciale",
    year: "2e année",
    optionGroups: [lvaRequired(), lvbOptional()],
  },
  {
    id: "ect-bacpro-3",
    label: "3e année du dispositif bac professionnel — ECT",
    family: "Économique et commerciale",
    year: "3e année",
    optionGroups: [lvaRequired(), lvbRequired()],
  },
  d1("1re année", "d1-1"),
  d1("2e année", "d1-2"),
  d2("1re année", "d2-1"),
  d2("2e année", "d2-2"),

  {
    id: "mpsi",
    label: "1re année — MPSI",
    family: "Scientifique",
    year: "1re année",
    optionGroups: [
      single("mpsi-option", "Choix à l’issue du 1er semestre", [
        "Sans option · orientation MP/MP*",
        "Option informatique · orientation MP/MP*",
        "Option SII · orientation MP/MP* ou PSI/PSI*",
      ]),
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
      single("mp2i-option", "Option du 2e semestre", [
        "Option sciences informatiques · orientation MPI/MPI*",
        "Option SII · orientation MP/MP* ou PSI/PSI*",
      ]),
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
      single("pcsi-option", "Option à l’issue du 1er semestre", [
        "Option physique et chimie · orientation PC/PC*",
        "Option physique et sciences de l’ingénieur · orientation PSI/PSI*",
      ]),
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
      single("ptsi-module", "Module à l’issue du 1er semestre", [
        "Module mathématiques · orientation PSI/PSI* possible",
        "Sans module mathématiques supplémentaire · orientation PT/PT*",
      ]),
      lvaRequired(),
      lvbOptional(),
    ],
  },
  simpleScience("bcpst-1", "1re année — BCPST", "1re année"),
  simpleScience("bcpst-2", "2e année — BCPST", "2e année"),
  simpleScience("tsi-1", "1re année — TSI", "1re année"),
  simpleScience("tsi-2", "2e année — TSI", "2e année"),
  {
    id: "tsi-bacpro-1",
    label: "1re année du dispositif bac professionnel — TSI",
    family: "Scientifique",
    year: "1re année",
    optionGroups: [lvaRequired(), lvbOptional()],
    note: "Dispositif TSI en trois ans destiné à certains bacheliers professionnels industriels.",
  },
  { id: "tsi-bacpro-2", label: "2e année du dispositif bac professionnel — TSI", family: "Scientifique", year: "2e année", optionGroups: [lvaRequired(), lvbOptional()] },
  { id: "tsi-bacpro-3", label: "3e année du dispositif bac professionnel — TSI", family: "Scientifique", year: "3e année", optionGroups: [lvaRequired(), lvbOptional()] },
  simpleScience("tpc-1", "1re année — TPC", "1re année"),
  simpleScience("tpc-2", "2e année — TPC", "2e année"),
  simpleScience("tb-1", "1re année — TB", "1re année"),
  simpleScience("tb-2", "2e année — TB", "2e année"),
  secondYearScience("mp-2", "2e année — MP", true),
  secondYearScience("mp-star-2", "2e année — MP*", true),
  secondYearScience("mpi-2", "2e année — MPI"),
  secondYearScience("mpi-star-2", "2e année — MPI*"),
  secondYearScience("pc-2", "2e année — PC"),
  secondYearScience("pc-star-2", "2e année — PC*"),
  secondYearScience("psi-2", "2e année — PSI"),
  secondYearScience("psi-star-2", "2e année — PSI*"),
  secondYearScience("pt-2", "2e année — PT"),
  secondYearScience("pt-star-2", "2e année — PT*"),

  { id: "arts-design-1", label: "1re année — Arts et design", family: "Arts et design", year: "1re année", optionGroups: [lvaRequired()] },
  { id: "arts-design-2", label: "2e année — Arts et design", family: "Arts et design", year: "2e année", optionGroups: [lvaRequired()] },

  {
    id: "ats-eco",
    label: "ATS — Économie-gestion",
    family: "ATS",
    year: "1 an",
    optionGroups: [
      single("ats-eco-option", "Enseignement optionnel", [
        "Culture économique",
        "Gestion-comptabilité",
        "Marketing",
        "Approfondissement en droit",
        "Calcul et raisonnement",
      ]),
    ],
    note: "L’anglais appartient au programme commun ; l’enseignement optionnel représente 1 h 30 hebdomadaire.",
  },
  {
    id: "ats-indus",
    label: "ATS — Ingénierie industrielle",
    family: "ATS",
    year: "1 an",
    note: "Prépa post-BTS/BUT scientifique à dominante ingénierie industrielle.",
  },
  {
    id: "ats-gc",
    label: "ATS — Génie civil",
    family: "ATS",
    year: "1 an",
    note: "Prépa post-BTS/BUT orientée génie civil, bâtiment, travaux publics et domaines proches.",
  },
  {
    id: "ats-chimie",
    label: "ATS — Métiers de la chimie",
    family: "ATS",
    year: "1 an",
    optionGroups: [
      single("ats-chimie-parcours", "Parcours", ["Parcours chimie", "Parcours génie des procédés"]),
    ],
  },
  {
    id: "agro-veto-post-bts",
    label: "Classe Agro-Véto post-BTSA et BTS",
    family: "ATS",
    year: "1 an",
    optionGroups: [
      single("agro-veto-orientation", "Orientation du 2d semestre", ["Orientation ingénieur", "Orientation vétérinaire"], false,
        "La partie orientée du second semestre dépend du concours réussi ; renseigne-la uniquement si elle est déjà déterminée."),
    ],
  },
  {
    id: "ats-horti",
    label: "ATS — Métiers de l’horticulture et du paysage",
    family: "ATS",
    year: "1 an",
  },
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
  "ATS — Biologie": "Classe Agro-Véto post-BTSA et BTS",
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
