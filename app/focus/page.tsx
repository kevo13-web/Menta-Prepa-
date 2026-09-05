"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Coffee,
  Expand,
  LibraryBig,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Search,
  SkipForward,
  Sparkles,
  TimerReset,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  formatPomodoroTime,
  minutesForPomodoroPhase,
  type PomodoroPhase,
  type PomodoroSettings,
  usePomodoro,
} from "@/components/PomodoroProvider";
import { resources } from "@/data/siteData";

const phaseCopy: Record<PomodoroPhase, { label: string; eyebrow: string; hint: string }> = {
  work: {
    label: "Concentration",
    eyebrow: "Mode profond",
    hint: "Une seule tâche. Tout le reste peut attendre.",
  },
  shortBreak: {
    label: "Pause courte",
    eyebrow: "Respire",
    hint: "Lève-toi, regarde au loin et laisse ton cerveau souffler.",
  },
  longBreak: {
    label: "Grande pause",
    eyebrow: "Recharge complète",
    hint: "Tu as terminé un cycle complet. Coupe vraiment quelques minutes.",
  },
};

type FocusSheetSection = {
  title: string;
  paragraphs: string[];
  points?: string[];
  reference?: string;
};

type FocusSheet = {
  id: string;
  title: string;
  subject: string;
  type: string;
  level: string;
  subtitle?: string;
  thesis?: string;
  sections?: FocusSheetSection[];
  distinctions?: string[];
  recall?: string[];
  demo?: boolean;
};

const evilDemoSheet: FocusSheet = {
  id: "demo-mal-philosophie",
  title: "Le mal : privation, positivité, liberté et scandale de la raison",
  subject: "Philosophie",
  type: "Fiche conceptuelle",
  level: "Doctorat",
  demo: true,
  subtitle:
    "Cartographie problématique du mal, de l'ontologie augustinienne à la crise contemporaine de la théodicée.",
  thesis:
    "Le problème du mal devient philosophiquement aigu dès qu'on refuse simultanément deux solutions trop faciles : en faire une substance autonome, qui ruinerait l'unité de l'être, ou le réduire à une simple apparence, qui méconnaîtrait la réalité de la souffrance et de la faute. La tradition occidentale oscille ainsi entre dé-substantialisation ontologique, imputabilité morale, positivité de la liberté et critique de toute justification rationnelle de la souffrance.",
  sections: [
    {
      title: "I. Le nœud métaphysique : comment le mal peut-il être sans être ?",
      paragraphs: [
        "Chez Augustin, la solution décisive consiste à refuser au mal toute substantialité propre. Tout ce qui est, en tant qu'il est, possède une mesure, une forme et un ordre ; l'être est donc convertible, selon une structure néoplatonicienne christianisée, avec un certain degré de bien. Le mal ne constitue pas un étant supplémentaire opposé au bien : il est privatio boni, défaut d'une perfection qui devrait appartenir à une nature donnée.",
        "Cette thèse ne signifie pourtant pas que le mal serait irréel. La privation est ontologiquement parasitaire mais phénoménologiquement effective : une volonté corrompue, un corps mutilé ou une institution injuste existent positivement comme réalités, tandis que leur mal consiste dans la déficience d'ordre qui les affecte. L'avantage théologique est immédiat : Dieu n'a pas à créer le mal comme une chose. Mais le prix conceptuel est élevé, car il faut expliquer comment une privation peut produire des effets historiquement massifs.",
      ],
      points: [
        "Ne pas confondre privation et simple absence : la cécité est privation de la vue chez un être naturellement destiné à voir.",
        "Le mal n'est pas un principe rival du bien : l'anti-manichéisme est au cœur de l'argument augustinien.",
        "La dé-substantialisation du mal déplace la question de l'ontologie vers la volonté et la responsabilité.",
      ],
      reference: "Augustin, Confessions, livre VII ; De natura boni ; Enchiridion.",
    },
    {
      title: "II. Leibniz : rationaliser le mal sans l'attribuer directement à Dieu",
      paragraphs: [
        "La Théodicée leibnizienne systématise le problème en distinguant mal métaphysique, mal physique et mal moral. Le mal métaphysique désigne la limitation constitutive de toute créature finie ; le mal physique renvoie à la souffrance ; le mal moral à la faute. Dieu ne veut pas le mal moral comme fin, mais il peut le permettre dans l'économie du meilleur monde possible, c'est-à-dire du monde dont l'ensemble réalise le maximum de perfection compossible.",
        "L'argument ne consiste donc pas à prétendre que chaque événement est bon isolément. Il faut raisonner au niveau du système total des compossibles. La difficulté est alors épistémologique et morale : une justification globale peut-elle rendre intelligible une souffrance singulière sans la convertir en simple moyen d'une harmonie supérieure ? C'est précisément ce que les critiques modernes de la théodicée refuseront.",
      ],
      points: [
        "Possible ne signifie pas compossible : tous les biens imaginables ne peuvent pas nécessairement coexister dans un même monde.",
        "La permission du mal ne vaut pas approbation du mal.",
        "La théodicée cherche à concilier puissance, bonté et sagesse divines avec l'existence du mal.",
      ],
      reference: "Leibniz, Essais de Théodicée, notamment §§20-21 et la Préface.",
    },
    {
      title: "III. Kant : le mal radical comme structure de la maxime, non comme substance",
      paragraphs: [
        "Avec Kant, le centre de gravité se déplace vers la structure de la liberté. Le mal radical n'est ni une nature démoniaque ni une pulsion naturelle qui abolirait la responsabilité. Il consiste dans une propension de la volonté à inverser l'ordre des mobiles : au lieu de subordonner l'amour de soi à la loi morale, le sujet conditionne l'obéissance à la loi par ses intérêts sensibles.",
        "Le terme radical signifie que le mal concerne la racine de l'adoption des maximes, la Gesinnung, et non qu'il constituerait une substance diabolique. La difficulté devient alors celle d'une liberté qui doit pouvoir être imputée au sujet tout en étant décrite comme une propension universellement repérable dans l'humanité. Kant maintient ainsi ensemble universalité anthropologique et responsabilité intelligible.",
      ],
      points: [
        "Le mal n'est pas la sensibilité elle-même : les inclinations ne sont pas moralement mauvaises par nature.",
        "Le sujet mauvais reconnaît encore la loi morale ; il lui subordonne simplement d'autres mobiles selon un ordre inversé.",
        "Un être véritablement diabolique qui choisirait le mal pour le mal sortirait, chez Kant, du cadre proprement humain.",
      ],
      reference: "Kant, La religion dans les limites de la simple raison, première partie.",
    },
    {
      title: "IV. Schelling : penser une possibilité positive du mal sans retomber dans le dualisme",
      paragraphs: [
        "Le traité de 1809 sur la liberté radicalise le problème. Une simple théorie de la privation paraît insuffisante pour rendre compte de l'énergie positive de la faute. Schelling distingue en Dieu le fond obscur, Grund, et l'existence lumineuse, sans poser pour autant deux dieux ou deux substances. La créature libre peut désordonner le rapport des puissances et faire de ce qui devait rester particulier le principe dominant du tout.",
        "Le mal possède dès lors une positivité dynamique : il n'est pas une chose indépendante, mais une perversion active de l'ordre. L'enjeu est de rendre la liberté métaphysiquement réelle. Une liberté qui ne pourrait choisir que le bien serait une nécessité déguisée ; mais une liberté réellement capable du mal oblige la métaphysique à inscrire la possibilité du désordre au cœur même d'un monde créé.",
      ],
      points: [
        "Schelling ne réhabilite pas un manichéisme substantiel : la positivité du mal est celle d'une inversion de rapports.",
        "La possibilité du mal devient condition d'une liberté non mécanique.",
        "Le problème n'est plus seulement : d'où vient le défaut ? mais : comment une puissance d'inversion est-elle possible ?",
      ],
      reference: "Schelling, Recherches philosophiques sur l'essence de la liberté humaine, 1809.",
    },
    {
      title: "V. Nietzsche et Arendt : de la métaphysique du mal à la généalogie et à la politique",
      paragraphs: [
        "Nietzsche déplace l'interrogation : avant de demander ce qu'est le mal, il faut demander qui a intérêt à qualifier certaines forces de bonnes ou mauvaises. La généalogie déconstruit la prétention des valeurs morales à exprimer une structure éternelle de l'être. Le couple bien/mal peut devenir l'effet historique d'une production de valeurs, notamment dans la morale du ressentiment. Cela ne supprime pas la cruauté réelle, mais interdit de confondre immédiatement condamnation morale et description ontologique.",
        "Arendt, de son côté, fait apparaître une autre rupture. Dans Les Origines du totalitarisme, elle parle de mal radical pour désigner une destruction politique qui tend à rendre les hommes superflus. Dans Eichmann à Jérusalem, la formule de la banalité du mal ne signifie pas que les crimes seraient banals, mais qu'une catastrophe morale peut être accomplie par un agent dépourvu de profondeur démoniaque, dont la faillite tient à l'absence de pensée et de jugement. Le mal cesse ainsi d'être nécessairement spectaculaire dans sa subjectivité pour devenir administrativement normalisable.",
      ],
      points: [
        "Généalogiser le mal ne revient pas à nier toute normativité ; cela oblige à interroger la provenance des valeurs.",
        "La banalité du mal n'est pas une théorie générale de tout mal, ni une excuse psychologique d'Eichmann.",
        "La modernité politique oblige à penser le mal à l'échelle des dispositifs, des bureaucraties et de l'obéissance ordinaire.",
      ],
      reference: "Nietzsche, Généalogie de la morale ; Arendt, Les Origines du totalitarisme et Eichmann à Jérusalem.",
    },
    {
      title: "VI. Après la théodicée : souffrance, scandale et limites de la justification",
      paragraphs: [
        "La philosophie contemporaine devient particulièrement méfiante envers les discours qui totalisent la souffrance dans une économie rationnelle. Chez Levinas, la souffrance d'autrui résiste à la justification : l'expliquer comme moment nécessaire d'un ordre supérieur peut devenir moralement obscène. Le mal n'est plus seulement un problème spéculatif à résoudre ; il constitue une épreuve éthique qui met en question la prétention de la raison à convertir toute négativité en sens.",
        "Ricœur permet alors de distinguer plusieurs registres : faute, souffrance, symbole, récit, plainte. Les symboles du mal ne sont pas des définitions scientifiques, mais des matrices de compréhension par lesquelles une culture donne forme à l'expérience de l'impureté, du péché ou de la culpabilité. Le problème du mal déborde donc toute discipline unique : il touche simultanément ontologie, anthropologie, morale, politique, théologie et herméneutique.",
      ],
      points: [
        "Une explication causale du mal n'équivaut pas à une justification morale du mal.",
        "La souffrance subie et la faute commise ne doivent pas être rabattues l'une sur l'autre.",
        "Le refus de la théodicée peut lui-même devenir une position philosophique positive : préserver l'irréductibilité de la plainte et de la responsabilité.",
      ],
      reference: "Levinas, textes sur la souffrance inutile ; Ricœur, La symbolique du mal.",
    },
  ],
  distinctions: [
    "Mal ontologique / mal moral / mal physique : trois questions différentes qui ne doivent jamais être confondues.",
    "Privation / négation : une privation suppose une perfection due à la nature considérée.",
    "Expliquer / justifier : rendre intelligible une causalité ne légitime pas ce qui advient.",
    "Possibilité du mal / réalité du mal : une métaphysique de la liberté doit penser la première sans naturaliser la seconde.",
    "Responsabilité individuelle / production institutionnelle : l'analyse politique déplace le niveau d'imputation sans l'annuler automatiquement.",
  ],
  recall: [
    "Pourquoi la théorie augustinienne de la privatio boni est-elle anti-manichéenne ?",
    "En quoi le mal radical kantien est-il radical sans être diabolique ?",
    "Pourquoi Schelling juge-t-il nécessaire de donner au mal une positivité dynamique ?",
    "Quelle différence faut-il établir entre le mal radical des Origines du totalitarisme et la banalité du mal d'Eichmann à Jérusalem ?",
    "Pourquoi une théodicée peut-elle devenir moralement problématique lorsqu'elle rencontre la souffrance singulière ?",
  ],
};

const focusSheets: FocusSheet[] = [
  evilDemoSheet,
  ...resources.map((resource, index) => ({
    id: `resource-${index}`,
    title: resource.title,
    subject: resource.subject,
    type: resource.type,
    level: resource.level,
  })),
];

export default function FocusPage() {
  const {
    settings,
    phase,
    secondsLeft,
    running,
    completed,
    ready,
    start,
    pause,
    reset,
    skip,
    updateSetting,
  } = usePomodoro();

  const [immersive, setImmersive] = useState(false);
  const [sheetsOpen, setSheetsOpen] = useState(false);
  const [sheetQuery, setSheetQuery] = useState("");
  const [selectedSheet, setSelectedSheet] = useState<FocusSheet | null>(null);

  useEffect(() => {
    document.title = running ? `${formatPomodoroTime(secondsLeft)} · Menta Focus` : "Focus · Menta Prépa";
    return () => {
      document.title = "Menta Prépa | Stratégie mentale du travail étudiant";
    };
  }, [running, secondsLeft]);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) setImmersive(false);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const totalSeconds = minutesForPomodoroPhase(phase, settings) * 60;
  const progress = useMemo(
    () => Math.max(0, Math.min(1, 1 - secondsLeft / totalSeconds)),
    [secondsLeft, totalSeconds],
  );
  const circumference = 2 * Math.PI * 132;
  const dashOffset = circumference * (1 - progress);

  const visibleSheets = useMemo(() => {
    const normalized = sheetQuery.trim().toLowerCase();
    if (!normalized) return focusSheets;
    return focusSheets.filter((resource) =>
      `${resource.title} ${resource.subject} ${resource.type}`.toLowerCase().includes(normalized),
    );
  }, [sheetQuery]);

  function toggleSheets() {
    if (!sheetsOpen && !selectedSheet) setSelectedSheet(evilDemoSheet);
    setSheetsOpen((value) => !value);
  }

  async function activateFocus() {
    setImmersive(true);
    if (!running) start();

    const shell = document.getElementById("menta-focus-shell");
    try {
      if (shell && !document.fullscreenElement) await shell.requestFullscreen();
    } catch {
      // Le mode immersif CSS reste disponible si le navigateur refuse le plein écran natif.
    }
  }

  async function leaveFocus() {
    setImmersive(false);
    setSheetsOpen(false);
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      // Le timer continue dans le provider global, même si la sortie native échoue.
    }
  }

  const phaseAccent =
    phase === "work" ? "#566ff5" : phase === "shortBreak" ? "#58d6b1" : "#ff9768";

  if (!ready) {
    return <section className="min-h-screen px-4 pb-14 pt-28" />;
  }

  return (
    <section
      id="menta-focus-shell"
      data-phase={phase}
      className={`focus-shell relative overflow-hidden transition-colors duration-700 ${
        immersive
          ? "fixed inset-0 z-[100] min-h-screen bg-[#f7fbff] p-0"
          : "min-h-screen px-4 pb-14 pt-28 sm:px-6 lg:px-8"
      }`}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full bg-[#79c7ff]/30 blur-3xl"
        animate={
          immersive
            ? { width: "52vw", height: "52vw", left: "-12vw", top: "-18vw", opacity: 0.7 }
            : { width: 288, height: 288, left: -96, top: 80, opacity: 1 }
        }
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full bg-[#ff8c6b]/22 blur-3xl"
        animate={
          immersive
            ? { width: "46vw", height: "46vw", right: "-12vw", top: "14vh", opacity: 0.72 }
            : { width: 320, height: 320, right: -64, top: "33%", opacity: 1 }
        }
        transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full bg-[#58d6b1]/25 blur-3xl"
        animate={
          immersive
            ? { width: "42vw", height: "42vw", left: "28vw", bottom: "-22vw", opacity: 0.75 }
            : { width: 256, height: 256, left: "33%", bottom: 0, opacity: 1 }
        }
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />

      <motion.div
        layout
        className={`relative mx-auto w-full ${
          immersive
            ? `grid min-h-screen max-w-none items-stretch ${sheetsOpen ? "lg:grid-cols-[minmax(0,1fr)_minmax(430px,600px)]" : "grid-cols-1"}`
            : "grid max-w-6xl gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center"
        }`}
        transition={{ layout: { duration: 0.68, ease: [0.22, 1, 0.36, 1] } }}
      >
        <motion.div
          layout
          className={`focus-card ${
            immersive
              ? "relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white/16 px-5 py-8 backdrop-blur-[2px] sm:px-10"
              : "glass rounded-[2.2rem] p-5 sm:p-8 lg:p-10"
          }`}
          transition={{ layout: { duration: 0.68, ease: [0.22, 1, 0.36, 1] } }}
        >
          <motion.div
            layout
            className={`flex flex-wrap items-center gap-3 ${
              immersive
                ? "absolute left-5 right-5 top-5 z-20 justify-between sm:left-8 sm:right-8 sm:top-7"
                : "mb-8 justify-between"
            }`}
          >
            <AnimatePresence mode="wait">
              {!immersive ? (
                <motion.div
                  key="focus-title"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28 }}
                >
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#60778f]">
                    <Sparkles className="h-4 w-4 text-[#566ff5]" /> {phaseCopy[phase].eyebrow}
                  </div>
                  <h1 className="display-serif text-4xl font-semibold text-[#182b49] sm:text-5xl">
                    Menta Focus
                  </h1>
                </motion.div>
              ) : (
                <motion.div
                  key="focus-status"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#5b7087] shadow-sm backdrop-blur-xl sm:text-sm"
                >
                  {phaseCopy[phase].eyebrow}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2">
              <div className="rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-semibold text-[#45617b] shadow-sm backdrop-blur-xl">
                {completed} pomodoro{completed > 1 ? "s" : ""} terminé{completed > 1 ? "s" : ""}
              </div>

              {immersive ? (
                <>
                  <button
                    type="button"
                    onClick={toggleSheets}
                    className={`inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 ${
                      sheetsOpen
                        ? "border-[#58d6b1]/45 bg-[#dff9f0] text-[#287863]"
                        : "border-white/80 bg-white/70 text-[#38536c]"
                    }`}
                  >
                    <LibraryBig className="h-4 w-4" /> Fiches
                  </button>
                  <button
                    type="button"
                    onClick={leaveFocus}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3.5 text-sm font-semibold text-[#38536c] shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    <Minimize2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Quitter le plein écran</span>
                  </button>
                </>
              ) : null}
            </div>
          </motion.div>

          <motion.div
            layout
            className={`mx-auto flex flex-col items-center text-center ${immersive ? "w-full" : "max-w-xl"}`}
            transition={{ layout: { duration: 0.68, ease: [0.22, 1, 0.36, 1] } }}
          >
            <motion.div
              layout
              className="relative grid place-items-center"
              animate={
                immersive
                  ? sheetsOpen
                    ? { width: "min(50vmin, 560px)", height: "min(50vmin, 560px)", scale: 1 }
                    : { width: "min(72vmin, 720px)", height: "min(72vmin, 720px)", scale: 1 }
                  : { width: "min(82vw, 350px)", height: "min(82vw, 350px)", scale: 1 }
              }
              transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                aria-hidden="true"
                className="absolute inset-[4%] rounded-full"
                animate={{
                  boxShadow: immersive
                    ? `0 0 0 1px ${phaseAccent}25, 0 0 90px ${phaseAccent}30, inset 0 0 80px ${phaseAccent}12`
                    : `0 0 0 0px ${phaseAccent}00`,
                  backgroundColor: immersive ? "rgba(255,255,255,.34)" : "rgba(255,255,255,0)",
                }}
                transition={{ duration: 0.8 }}
              />

              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 300 300" aria-hidden="true">
                <circle cx="150" cy="150" r="132" fill="none" stroke="rgba(24,43,73,.08)" strokeWidth="10" />
                <circle
                  cx="150"
                  cy="150"
                  r="132"
                  fill="none"
                  stroke={phaseAccent}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="transition-[stroke-dashoffset,stroke] duration-700 ease-out"
                />
              </svg>

              <motion.div
                layout
                className="relative z-10"
                animate={immersive ? { scale: sheetsOpen ? 1.02 : 1.18 } : { scale: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className={`mb-2 font-bold uppercase tracking-[0.28em] ${immersive ? "text-base sm:text-lg" : "text-sm"}`}
                  style={{ color: phaseAccent }}
                >
                  {phaseCopy[phase].label}
                </div>
                <div
                  className={`tabular-nums font-semibold leading-none tracking-[-0.07em] text-[#182b49] ${
                    immersive
                      ? sheetsOpen
                        ? "text-[clamp(4rem,10vmin,7.5rem)]"
                        : "text-[clamp(5.5rem,17vmin,11.5rem)]"
                      : "text-[4.7rem] sm:text-[5.7rem]"
                  }`}
                >
                  {formatPomodoroTime(secondsLeft)}
                </div>
                <p className="mx-auto mt-5 max-w-[360px] leading-6 text-[#647b8f]">
                  {phaseCopy[phase].hint}
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              layout
              className={`flex flex-wrap justify-center gap-3 ${immersive ? "mt-2 sm:mt-4" : "mt-7"}`}
            >
              {!running ? (
                immersive ? (
                  <button type="button" onClick={start} className="focus-primary inline-flex min-h-12 items-center gap-2 rounded-2xl px-6 py-3 font-semibold shadow-lg">
                    <Play className="h-5 w-5" /> Reprendre
                  </button>
                ) : (
                  <button type="button" onClick={activateFocus} className="focus-primary inline-flex min-h-12 items-center gap-2 rounded-2xl px-6 py-3 font-semibold shadow-lg">
                    <Expand className="h-5 w-5" /> Activer le mode focus
                  </button>
                )
              ) : (
                <button type="button" onClick={pause} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#182b49] px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.03]">
                  <Pause className="h-5 w-5" /> Pause
                </button>
              )}

              <button type="button" onClick={reset} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-[#566ff5]/15 bg-white/75 px-4 py-3 font-semibold text-[#38536c] shadow-sm backdrop-blur-xl transition hover:scale-[1.03] hover:bg-white">
                <RotateCcw className="h-4 w-4" /> Recommencer
              </button>
              <button type="button" onClick={skip} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-[#566ff5]/15 bg-white/75 px-4 py-3 font-semibold text-[#38536c] shadow-sm backdrop-blur-xl transition hover:scale-[1.03] hover:bg-white">
                <SkipForward className="h-4 w-4" /> Suivant
              </button>
            </motion.div>

            {immersive ? (
              <p className="mt-4 text-xs font-medium text-[#75879a]">
                Tu peux quitter ce mode et naviguer ailleurs : le chrono continuera en arrière-plan.
              </p>
            ) : null}
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {immersive && sheetsOpen ? (
            <motion.aside
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-30 flex min-h-screen max-h-screen flex-col border-l border-[#566ff5]/10 bg-white/84 p-5 shadow-[-20px_0_60px_rgba(55,76,123,.10)] backdrop-blur-2xl sm:p-7"
            >
              <div className="flex shrink-0 items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#eaf0ff] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#5267d9]">
                    <BookOpen className="h-3.5 w-3.5" /> Réviser sans quitter Focus
                  </div>
                  <h2 className="display-serif text-3xl font-semibold text-[#182b49]">
                    {selectedSheet ? "Lecture" : "Mes fiches"}
                  </h2>
                </div>
                <button type="button" onClick={() => setSheetsOpen(false)} aria-label="Fermer les fiches" className="grid h-10 w-10 place-items-center rounded-full bg-[#f2f5ff] text-[#50637d] transition hover:bg-[#e8edff]">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {selectedSheet ? (
                <SheetReader sheet={selectedSheet} onBack={() => setSelectedSheet(null)} />
              ) : (
                <>
                  <label className="mt-5 flex min-h-11 shrink-0 items-center gap-2 rounded-2xl border border-[#566ff5]/12 bg-[#f8faff] px-3 text-sm text-[#62758b] focus-within:border-[#566ff5]/35 focus-within:ring-2 focus-within:ring-[#566ff5]/10">
                    <Search className="h-4 w-4 text-[#566ff5]" />
                    <input
                      value={sheetQuery}
                      onChange={(event) => setSheetQuery(event.target.value)}
                      placeholder="Chercher une fiche"
                      className="w-full bg-transparent text-[#253d5b] outline-none placeholder:text-[#93a0b0]"
                    />
                  </label>

                  <div className="mt-5 flex-1 space-y-3 overflow-y-auto pr-1">
                    {visibleSheets.map((resource, index) => {
                      const tones = [
                        "border-[#566ff5]/16 bg-[#edf1ff]",
                        "border-[#58d6b1]/18 bg-[#e8fbf5]",
                        "border-[#ff8c6b]/18 bg-[#fff0ea]",
                        "border-[#ffd665]/26 bg-[#fff8dc]",
                      ];

                      return (
                        <button
                          type="button"
                          key={resource.id}
                          onClick={() => setSelectedSheet(resource)}
                          className={`w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${tones[index % tones.length]} ${resource.demo ? "ring-2 ring-[#566ff5]/20" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#65778c]">{resource.subject} · {resource.type}</p>
                                {resource.demo ? <span className="rounded-full bg-[#566ff5] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white">Démo</span> : null}
                              </div>
                              <h3 className="mt-1 text-sm font-semibold leading-5 text-[#213955]">{resource.title}</h3>
                            </div>
                            <span className="shrink-0 rounded-full bg-white/75 px-2.5 py-1 text-[10px] font-semibold text-[#6c7d90]">{resource.level}</span>
                          </div>
                        </button>
                      );
                    })}

                    {visibleSheets.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#566ff5]/20 bg-white/55 p-5 text-center text-sm text-[#6a7e93]">
                        Aucune fiche ne correspond à ta recherche.
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </motion.aside>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {!immersive ? (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              className="space-y-5"
            >
              <div className="glass rounded-[2rem] p-6 sm:p-7">
                <div className="mb-6 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e8edff] text-[#566ff5]">
                    <TimerReset className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-[#182b49]">Ton rythme</h2>
                    <p className="text-sm text-[#6a8092]">Personnalise le Pomodoro selon ta séance.</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <Setting label="Travail" value={settings.work} suffix="min" min={5} max={120} onChange={(value) => updateSetting("work", value)} disabled={running} tone="blue" />
                  <Setting label="Pause courte" value={settings.shortBreak} suffix="min" min={1} max={30} onChange={(value) => updateSetting("shortBreak", value)} disabled={running} tone="mint" />
                  <Setting label="Grande pause" value={settings.longBreak} suffix="min" min={5} max={60} onChange={(value) => updateSetting("longBreak", value)} disabled={running} tone="coral" />
                  <Setting label="Grande pause après" value={settings.longBreakEvery} suffix="cycles" min={2} max={8} onChange={(value) => updateSetting("longBreakEvery", value)} disabled={running} tone="sun" />
                </div>
              </div>

              <div className="rounded-[2rem] border border-[#58d6b1]/20 bg-gradient-to-br from-[#e6faf4] via-white/85 to-[#edf1ff] p-6 shadow-[0_18px_55px_rgba(52,77,101,.09)]">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-[#43ae91] shadow-sm">
                    <Coffee className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#24435f]">Le cycle se gère tout seul</h3>
                    <p className="mt-1 text-sm leading-6 text-[#667d90]">
                      Après chaque session de travail, Menta lance une pause courte. Tous les {settings.longBreakEvery} pomodoros, la grande pause prend automatiquement le relais.
                    </p>
                  </div>
                </div>
              </div>
            </motion.aside>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

function SheetReader({ sheet, onBack }: { sheet: FocusSheet; onBack: () => void }) {
  return (
    <div className="mt-5 flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-[#566ff5]/10 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex min-h-9 items-center gap-2 rounded-full bg-[#f1f4ff] px-3 text-xs font-semibold text-[#5267d9] transition hover:bg-[#e7ecff]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Toutes les fiches
        </button>
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#566ff5]">
          <span>{sheet.subject}</span><span>·</span><span>{sheet.type}</span><span>·</span><span>{sheet.level}</span>
          {sheet.demo ? <span className="rounded-full bg-[#566ff5] px-2 py-0.5 text-[9px] text-white">Fiche test</span> : null}
        </div>
        <h3 className="mt-2 display-serif text-2xl font-semibold leading-tight text-[#182b49] sm:text-3xl">{sheet.title}</h3>
        {sheet.subtitle ? <p className="mt-2 text-sm leading-6 text-[#63778e]">{sheet.subtitle}</p> : null}
      </div>

      <article className="mt-4 flex-1 overflow-y-auto pr-2 text-[#304760]">
        {sheet.thesis ? (
          <div className="mb-6 rounded-2xl border border-[#58d6b1]/22 bg-[#eafaf5] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#2f8b72]">
              <Brain className="h-4 w-4" /> Thèse directrice
            </div>
            <p className="text-sm leading-6">{sheet.thesis}</p>
          </div>
        ) : null}

        {sheet.sections?.map((section) => (
          <section key={section.title} className="mb-7">
            <h4 className="display-serif text-xl font-semibold leading-snug text-[#1d3552]">{section.title}</h4>
            <div className="mt-3 space-y-3">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 80)} className="text-[13.5px] leading-6 text-[#40566e]">{paragraph}</p>
              ))}
            </div>
            {section.points ? (
              <ul className="mt-4 space-y-2 rounded-2xl bg-[#f7f9fd] p-4 text-[13px] leading-5 text-[#4d6076]">
                {section.points.map((point) => <li key={point} className="flex gap-2"><span className="mt-1 text-[#566ff5]">◆</span><span>{point}</span></li>)}
              </ul>
            ) : null}
            {section.reference ? <p className="mt-3 text-[11px] font-medium italic leading-5 text-[#8190a1]">Références : {section.reference}</p> : null}
          </section>
        ))}

        {sheet.distinctions ? (
          <section className="mb-7 rounded-2xl border border-[#ffd665]/35 bg-[#fff9e4] p-4">
            <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-[#8c7125]">Distinctions à maîtriser</h4>
            <ul className="mt-3 space-y-2 text-[13px] leading-5 text-[#5e5a49]">
              {sheet.distinctions.map((item) => <li key={item} className="flex gap-2"><span className="text-[#d2a62f]">—</span><span>{item}</span></li>)}
            </ul>
          </section>
        ) : null}

        {sheet.recall ? (
          <section className="mb-7 rounded-2xl border border-[#ff8c6b]/20 bg-[#fff1ec] p-4">
            <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-[#b65f43]">Rappel actif</h4>
            <p className="mt-1 text-xs leading-5 text-[#826458]">Ferme la fiche et réponds sans regarder.</p>
            <ol className="mt-3 space-y-3 text-[13px] leading-5 text-[#624f48]">
              {sheet.recall.map((question, index) => <li key={question}><span className="mr-2 font-bold text-[#d16b4a]">{index + 1}.</span>{question}</li>)}
            </ol>
          </section>
        ) : null}

        {!sheet.sections ? (
          <div className="rounded-2xl border border-dashed border-[#566ff5]/18 bg-[#f8faff] p-5">
            <p className="text-sm leading-6 text-[#62758b]">Cette ressource de démonstration n'a pas encore de contenu détaillé intégré au lecteur Focus.</p>
            <Link href="/fiches" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#566ff5] px-4 py-2 text-sm font-semibold text-white">
              <BookOpen className="h-4 w-4" /> Ouvrir la bibliothèque complète
            </Link>
          </div>
        ) : null}
      </article>
    </div>
  );
}

function Setting({
  label,
  value,
  suffix,
  min,
  max,
  disabled,
  tone,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  min: number;
  max: number;
  disabled: boolean;
  tone: "blue" | "mint" | "coral" | "sun";
  onChange: (value: number) => void;
}) {
  const tones = {
    blue: "from-[#e9edff] to-[#f8f9ff] border-[#cbd4ff]",
    mint: "from-[#e5faf3] to-[#f7fffc] border-[#bfeede]",
    coral: "from-[#ffede7] to-[#fff9f6] border-[#ffd1c4]",
    sun: "from-[#fff6d4] to-[#fffdf4] border-[#f6e4a3]",
  };

  return (
    <label className={`rounded-2xl border bg-gradient-to-br p-4 ${tones[tone]} ${disabled ? "opacity-60" : ""}`}>
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#62798d]">{label}</span>
      <div className="flex items-end gap-2">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full min-w-0 bg-transparent text-3xl font-semibold text-[#183650] outline-none disabled:cursor-not-allowed"
        />
        <span className="pb-1 text-sm font-semibold text-[#75899a]">{suffix}</span>
      </div>
    </label>
  );
}
