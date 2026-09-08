export const lyceeSchoolLevels = [
  "Seconde générale et technologique",
  "Seconde STHR",
  "Seconde professionnelle",
  "Première générale",
  "Terminale générale",
  "Première technologique",
  "Terminale technologique",
  "Première professionnelle",
  "Terminale professionnelle",
] as const;

export const lyceeTechnologySeries = [
  "STMG — sciences et technologies du management et de la gestion",
  "ST2S — sciences et technologies de la santé et du social",
  "STI2D — sciences et technologies de l’industrie et du développement durable",
  "STL — sciences et technologies de laboratoire",
  "STD2A — sciences et technologies du design et des arts appliqués",
  "STHR — sciences et technologies de l’hôtellerie et de la restauration",
  "S2TMD — sciences et techniques du théâtre, de la musique et de la danse",
  "STAV — sciences et technologies de l’agronomie et du vivant",
] as const;

// Les 13 enseignements de spécialité de la voie générale sont représentés ici
// avec leurs déclinaisons officielles lorsque le choix concret dépend d'une langue
// ou d'un domaine artistique.
export const lyceeGeneralSpecialties = [
  "Arts — arts du cirque",
  "Arts — arts plastiques",
  "Arts — cinéma-audiovisuel",
  "Arts — danse",
  "Arts — histoire des arts",
  "Arts — musique",
  "Arts — théâtre",
  "Biologie-écologie",
  "Éducation physique, pratiques et culture sportives (EPPCS)",
  "Histoire-géographie, géopolitique et sciences politiques (HGGSP)",
  "Humanités, littérature et philosophie (HLP)",
  "LLCER — allemand",
  "LLCER — anglais",
  "LLCER — anglais monde contemporain",
  "LLCER — espagnol",
  "LLCER — italien",
  "LLCER — portugais",
  "LLCER — basque",
  "LLCER — breton",
  "LLCER — catalan",
  "LLCER — corse",
  "LLCER — créole",
  "LLCER — occitan-langue d’Oc",
  "LLCER — tahitien",
  "Littérature, langues et cultures de l’Antiquité (LLCA) — grec",
  "Littérature, langues et cultures de l’Antiquité (LLCA) — latin",
  "Mathématiques",
  "Numérique et sciences informatiques (NSI)",
  "Physique-chimie",
  "Sciences de la vie et de la Terre (SVT)",
  "Sciences de l’ingénieur (SI)",
  "Sciences économiques et sociales (SES)",
] as const;

export function specialtyLimitForLevel(level: string) {
  if (level === "Première générale") return 3;
  if (level === "Terminale générale") return 2;
  if (level === "Seconde générale et technologique") return 3;
  return 0;
}
