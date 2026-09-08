import type { StudyTypeKey } from "@/data/frenchStudyPrograms";

export type CoachSource = {
  id: string;
  title: string;
  organization: string;
  url: string;
  kind: "evidence" | "directory";
  scopes: Array<StudyTypeKey | "all">;
  trackPattern?: string;
  keywords: string[];
  guidance: string;
  year?: number;
  checked: string;
  rights: "external-link-only";
};

const checked = "2026-09-07";
const all: ["all"] = ["all"];
const university: StudyTypeKey[] = ["licence", "licence_pro", "master", "doctorat"];
const technical: StudyTypeKey[] = ["but", "bts", "licence_pro", "ingenieur", "ecole_specialisee"];
const health: StudyTypeKey[] = ["sante", "paramedical", "veterinaire"];

function source(id: string, title: string, organization: string, url: string, kind: CoachSource["kind"], scopes: CoachSource["scopes"], guidance: string, keywords: string[], trackPattern?: string, year?: number): CoachSource {
  return { id, title, organization, url, kind, scopes, guidance, keywords, trackPattern, year, checked, rights: "external-link-only" };
}

// This is a curated reference index, not a repository of third-party documents.
// Guidance is original Menta wording. A directory is not evidence that a particular
// jury made a particular recommendation. No report, video transcript or book is copied.
export const coachSources: CoachSource[] = [
  source("learning-review", "Improving Students' Learning With Effective Learning Techniques", "Dunlosky et al., Psychological Science in the Public Interest", "https://doi.org/10.1177/1529100612453266", "evidence", all, "La revue comparative de 2013 attribue une utilité élevée aux tests d'entraînement et à la pratique distribuée. Elle invite à ne pas confondre familiarité après relecture et capacité à retrouver ou appliquer une connaissance. Adapter les exercices au contenu et à l'évaluation.", ["mémoire", "révision", "rappel", "espacement", "apprendre", "quiz"], undefined, 2013),
  source("learning-teacher", "Strengthening the Student Toolbox", "John Dunlosky, American Federation of Teachers", "https://www.aft.org/ae/fall2013/dunlosky", "evidence", all, "Article pédagogique de l'auteur de la revue : privilégier récupération active et espacement, et choisir une forme d'entraînement adaptée à l'objectif. Ce n'est pas un témoignage de majorant ni une garantie de réussite.", ["enseignant", "méthode", "révision", "apprendre"], undefined, 2013),
  source("lycee-sujets", "Sujets officiels des examens 2026", "Ministère de l'Éducation nationale", "https://www.education.gouv.fr/brevet-bac-et-cap-les-sujets-des-examens-2026-504911", "directory", ["lycee"], "Annales officielles pour les voies générale, technologique et professionnelle. Sélectionner uniquement les épreuves correspondant à la classe, à la voie et aux spécialités suivies ; vérifier les règles de la session préparée.", ["bac", "annales", "spécialité", "sujet", "examen"], undefined, 2026),
  source("lycee-bo", "Organisation et préparation des examens 2026", "Ministère de l'Éducation nationale", "https://www.education.gouv.fr/bo/2026/Hebdo10/MENE2605712C", "directory", ["lycee"], "Référence administrative de la session 2026. Les modalités et calendriers ne doivent pas être extrapolés à une autre session sans vérification.", ["bac", "calendrier", "épreuve", "modalités"], undefined, 2026),
  source("ens-ulm-2026", "Rapports et sujets du concours A/L 2026", "École normale supérieure, PSL", "https://www.ens.psl.eu/rapports-et-sujets-du-concours-2026-section-des-lettres-groupe-al", "directory", ["cpge"], "Répertoire officiel des rapports et sujets écrits et oraux par discipline, notamment philosophie, lettres, histoire, géographie, langues, arts et options. Choisir la bonne épreuve et la bonne session avant d'en déduire des attentes.", ["ENS", "Ulm", "BEL", "rapport", "jury", "philosophie", "lettres", "histoire", "géographie", "langue", "arts"], "lettres|a/l|hypokhagne|khagne|chartes", 2026),
  source("ens-ulm-2025", "Rapports et sujets A/L 2025", "École normale supérieure, PSL", "https://www.ens.psl.eu/en/node/8702", "directory", ["cpge"], "Archives officielles comprenant les rapports de jury et une présentation du concours par la présidence du jury. Utiliser les rapports pour comparer les attentes et erreurs récurrentes, sans leur attribuer de propos non vérifiés.", ["ENS", "Ulm", "BEL", "jury", "rapport", "professeur"], "lettres|a/l|hypokhagne|khagne", 2025),
  source("ens-lyon-fr-2025", "Rapport 2025 : composition française et explication de texte", "ENS de Lyon", "https://www.ens-lyon.fr/sites/default/files/2025-11/Composition%20fran%C3%A7aise%20et%20explication%20texte%202025%20OK%20Lyon%20RELU.pdf", "directory", ["cpge"], "Rapport officiel de la session 2025 pour les deux exercices de français. Consulter directement les critères et les exemples du jury ; ne pas inventer de barème ou de citation à partir du seul titre.", ["ENS", "Lyon", "BEL", "français", "littérature", "dissertation", "explication"], "lettres|a/l|hypokhagne|khagne", 2025),
  source("bce-annales", "Annales et rapports des épreuves écrites", "Banque commune d'épreuves", "https://www.concours-bce.com/annales?page=4", "directory", ["cpge"], "Catalogue officiel filtrable par année, filière, épreuve et type de document. Il comprend ECG, ECT, B/L et BEL. Vérifier le couple de mathématiques et HGG/ESH, les langues et l'école visée ; les annales orales commercialisées ne sont pas librement réutilisables.", ["BCE", "HEC", "ESSEC", "ESCP", "EDHEC", "emlyon", "ECG", "ECT", "BEL", "mathématiques", "HGG", "ESH", "culture générale", "langue", "rapport", "jury"], "ecg|ect|b/l|lettres", 2025),
  source("bce-oraux", "Annales des épreuves orales mutualisées", "Banque commune d'épreuves", "https://www.concours-bce.com/boutique", "directory", ["cpge"], "Catalogue officiel des annales orales vendues par la BCE. Ne pas reproduire ou télécharger leur contenu pour Menta sans autorisation ; orienter l'étudiant vers le canal officiel.", ["BCE", "oral", "langue", "entretien", "annales"], "ecg|ect|b/l|lettres"),
  source("ens-saclay-concours", "Admission sur concours et annales", "ENS Paris-Saclay", "https://ens-paris-saclay.fr/admission/admission-sur-concours", "directory", ["cpge", "but"], "Portail des concours scientifiques, B/L, économie-gestion D1/D2, design et admissions adaptées. Il renvoie aux règlements et rapports. Vérifier chaque voie et la session ; les voies universitaires ne sont pas interchangeables avec les concours CPGE.", ["ENS", "Saclay", "D1", "D2", "B/L", "économie", "gestion", "droit", "design", "rapport", "jury", "admission"], "d1|d2|b/l|mp|mpi|pc|psi|pt|tsi|bcpst|tb|design"),
  source("ens-d2-anglais", "Rapport de jury D2 : oral d'anglais 2021", "ENS Paris-Saclay", "https://ens-paris-saclay.fr/sites/default/files/CONCOURS/ANNALES_1C/1C_D2_1/2021_rapport_oral_D2_lv_anglais.pdf", "evidence", ["cpge"], "Le rapport distingue synthèse organisée et commentaire personnel : une restitution linéaire et trop longue ne suffit pas. S'entraîner à structurer par idées directrices et à respecter le temps. La durée de 10 à 12 minutes mentionnée pour 2022 n'est pas une règle à affirmer pour 2027 sans notice actuelle.", ["D2", "anglais", "oral", "synthèse", "commentaire", "temps"], "d2", 2021),
  source("chartes", "Concours d'archiviste paléographe : rapports et sujets", "École nationale des chartes, PSL", "https://www.chartes.psl.eu/formations/archiviste-paleographe/concours", "directory", ["cpge"], "Portail officiel des voies Chartes, rapports de jury et sujets. Faire préciser la voie A ou B et les épreuves choisies ; ne pas confondre histoire, langues anciennes et options de khâgne.", ["Chartes", "histoire", "latin", "grec", "paléographie", "jury"], "chartes"),
  source("centrale", "Sujets et rapports CentraleSupélec", "Concours Centrale-Supélec", "https://www.concours-centrale-supelec.fr/sujets-rapports", "directory", ["cpge"], "Archives officielles par filière, matière et session. Les rapports et sujets du concours sont soumis à des licences Creative Commons comportant une restriction d'utilisation commerciale ; Menta les référence sans les héberger, les modifier ni les reproduire.", ["Centrale", "Supélec", "mathématiques", "physique", "chimie", "informatique", "SII", "TIPE", "jury", "rapport"], "mpsi|mp2i|pcsi|ptsi|\bmp\b|\bmpi\b|\bpc\b|\bpsi\b|\bpt\b|tsi"),
  source("centrale-mpi-2025", "Rapport du jury CentraleSupélec MPI 2025", "Concours Centrale-Supélec", "https://www.concours-centrale-supelec.fr/sites/default/files/documents/Rapports_Jury_2025_MPI.pdf", "directory", ["cpge"], "Rapport officiel des épreuves écrites et orales MPI, notamment mathématiques, physique-chimie, informatique et travaux pratiques. Lire la section correspondant à l'épreuve avant de formuler une recommandation attribuée au jury.", ["MPI", "informatique", "mathématiques", "physique", "oral", "TP", "jury"], "\bmpi\b|mp2i", 2025),
  source("mines", "Archives des rapports et bilans Mines-Ponts", "Concours commun Mines-Ponts", "https://concoursminesponts.fr/archives/", "directory", ["cpge"], "Rapports officiels des écrits, oraux et bilans par année. Vérifier la filière et distinguer attentes scientifiques, communication et modalités de l'épreuve.", ["Mines", "Ponts", "mathématiques", "physique", "chimie", "informatique", "SII", "rapport", "jury"], "mpsi|mp2i|pcsi|ptsi|\bmp\b|\bmpi\b|\bpc\b|\bpsi\b"),
  source("mines-oraux", "Oraux et compléments méthodologiques Mines-Ponts", "Concours commun Mines-Ponts", "https://concoursminesponts.fr/les-oraux/", "directory", ["cpge"], "Portail officiel des oraux, exemples d'épreuves et compléments en mathématiques, physique, langues et TP. Les matériels de préparation ne doivent pas être présentés comme des sujets futurs.", ["Mines", "oral", "TP", "mathématiques", "physique", "informatique", "anglais"], "mpsi|mp2i|pcsi|ptsi|\bmp\b|\bmpi\b|\bpc\b|\bpsi\b"),
  source("banque-pt", "Rapports de jury de la Banque PT", "Banque filière PT", "https://www.banquept.fr/article154.html", "directory", ["cpge"], "Rapports officiels de l'écrit, par matière et session. Compléter par les rapports d'oral pertinents et les notices de la session visée.", ["PT", "PTSI", "mathématiques", "physique", "SII", "jury", "rapport"], "ptsi|\bpt\b", 2025),
  source("agro-tb-tipe", "Rapport 2025 : entretien scientifique et professionnel sur les TIPE TB", "Service des concours agronomiques et vétérinaires", "https://www.concours-agro-veto.net/IMG/pdf/rapport_de_jury_tipe_2025_vf_mis_en_page.pdf", "evidence", ["cpge"], "Le jury relève l'importance d'une démarche scientifique rigoureuse, de la place des sciences du vivant, d'hypothèses justifiées, de résultats et incertitudes interprétés et d'une bibliographie scientifique diversifiée. Préparer un oral qui explique les choix expérimentaux et leurs limites, plutôt qu'un récit de manipulations.", ["TB", "TIPE", "expérience", "biologie", "incertitude", "bibliographie", "oral"], "\btb\b", 2025),
  source("agro-bcpst-bio", "Rapport 2025 : oral de biologie BCPST", "Service des concours agronomiques et vétérinaires", "https://www.concours-agro-veto.net/IMG/pdf/rapportdejury_oralbio_2025_vdef.pdf", "evidence", ["cpge"], "Le rapport présente des questions sur la démarche scientifique, les variables, témoins, interprétations, liens entre expériences, corrélation et causalité. S'entraîner à expliquer un document puis à proposer une critique ou une expérience complémentaire pertinente.", ["BCPST", "biologie", "oral", "documents", "expérience", "causalité"], "bcpst", 2025),
  source("droit-professeurs", "Le discours de la méthode", "École de droit de la Sorbonne, Paris 1", "https://mediatheque.univ-paris1.fr/video/2092-les-rendez-vous-du-droit-discours-de-la-methode/", "evidence", ["licence", "licence_pro", "master", "cpge"], "Émission pédagogique avec Xavier Lagarde, Maëva Atchiaman et Ingrid Rosdahl consacrée au cas pratique, au commentaire d'arrêt et à la dissertation. Choisir la méthode propre à l'exercice demandé ; ne pas appliquer un plan de dissertation à un cas pratique. Le détail des consignes locales reste à vérifier auprès de l'enseignant.", ["droit", "juridique", "cas pratique", "commentaire d'arrêt", "dissertation", "méthodologie", "professeur"], "d1|droit", 2020),
  source("uness", "Ressources pédagogiques en santé", "Université numérique en santé et sport (UNESS)", "https://www.uness.fr/patrimoine-numerique/ressources", "directory", health, "Répertoire de ressources de médecine, pharmacie, odontologie, maïeutique, IFSI et autres disciplines de santé. Se référer au programme et aux référentiels de l'établissement ; les contenus cliniques nécessitent un encadrement professionnel.", ["médecine", "pharmacie", "odontologie", "maïeutique", "IFSI", "infirmier", "santé", "ECOS", "EDN", "anatomie", "physiologie"]),
  source("but-gmp", "Programme national du BUT Génie mécanique et productique", "Ministère de l'Enseignement supérieur", "https://www.enseignementsup-recherche.gouv.fr/sites/default/files/2023-12/g-nie-m-canique-et-productique-30840.pdf", "directory", ["but", "licence_pro"], "Référentiel national structuré en compétences, ressources et situations d'apprentissage et d'évaluation. Pour un BUT, préparer les SAÉ, projets, TP et livrables en plus des connaissances théoriques ; vérifier le parcours et la version du programme.", ["BUT", "GMP", "mécanique", "SAÉ", "projet", "compétence", "TP"], undefined, 2022),
  source("bts-maths-2026", "Groupements de spécialités BTS : mathématiques 2026", "Ministère de l'Enseignement supérieur", "https://www.education.gouv.fr/bo/2025/Hebdo45/ESRS2530618N", "directory", ["bts"], "Répartition officielle des spécialités par groupement pour l'épreuve de mathématiques 2026. Les sujets peuvent comporter des parties distinctes selon le BTS ; vérifier le référentiel de sa spécialité et la session plutôt que réviser sur un sujet générique.", ["BTS", "mathématiques", "examen", "référentiel", "groupement"], undefined, 2026),
  source("cti-2026", "Référentiels CTI 2026", "Commission des titres d'ingénieur", "https://www.cti-commission.fr/referentiels-cti-2026", "directory", ["ingenieur"], "Référentiels officiels des formations d'ingénieurs et bachelors. Utiliser les compétences et attendus du cursus pour relier cours, projets, stages et évaluations ; les exigences locales doivent être vérifiées dans le syllabus de l'école.", ["ingénieur", "compétence", "projet", "stage", "CTI"], undefined, 2026),
  source("ens-design", "Concours design et voies d'admission", "ENS Paris-Saclay", "https://ens-paris-saclay.fr/admission/admission-sur-concours", "directory", ["arts_design", "cpge"], "Le portail distingue les concours, notamment design, et les voies d'admission. Se référer aux épreuves et consignes de la voie réellement préparée ; ne pas généraliser les attentes d'une école à toutes les écoles d'art.", ["design", "arts", "concours", "portfolio", "ENS"], "design|arts"),
  source("research-integrity", "Intégrité scientifique : ressources et déontologie", "Ministère de l'Enseignement supérieur", "https://www.enseignementsup-recherche.gouv.fr/ressources-pedagogiques/notice/view/oai%253Acanal-u.fr%253A20713", "directory", ["doctorat", "master"], "Ressource d'initiation à l'intégrité scientifique et à la déontologie. Vérifier l'attribution des travaux, la traçabilité des données et les règles de son école doctorale. La ressource est signalée sous licence CC BY-NC : aucune reproduction commerciale n'est effectuée.", ["doctorat", "thèse", "recherche", "plagiat", "bibliographie", "intégrité", "méthodologie"]),
];

export type CoachProfile = {
  study_type?: string | null;
  study_track?: string | null;
  school_level?: string | null;
  specialties?: string[] | null;
  study_options?: string[] | null;
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function selectCoachSources(profile: CoachProfile, question = "", limit = 9): CoachSource[] {
  const type = profile.study_type || "autre";
  const track = normalize([profile.study_track, profile.school_level, ...(profile.specialties || []), ...(profile.study_options || [])].filter(Boolean).join(" "));
  const query = normalize(question);
  const candidates = coachSources.filter((item) => {
    if (!item.scopes.includes("all" as never) && !item.scopes.includes(type as StudyTypeKey)) return false;
    if (item.trackPattern && !new RegExp(item.trackPattern, "i").test(track)) return false;
    return true;
  });
  return candidates.sort((a, b) => {
    const score = (item: CoachSource) => item.keywords.reduce((sum, keyword) => sum + (query.includes(normalize(keyword)) ? 5 : 0) + (track.includes(normalize(keyword)) ? 2 : 0), item.kind === "evidence" ? 2 : 0);
    return score(b) - score(a);
  }).slice(0, limit);
}

export function publicCoachSource(item: CoachSource) {
  const { trackPattern: _trackPattern, scopes: _scopes, guidance: _guidance, keywords: _keywords, ...publicFields } = item;
  return publicFields;
}
