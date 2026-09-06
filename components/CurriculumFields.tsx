"use client";

import { useMemo, useState } from "react";
import { GraduationCap } from "lucide-react";
import {
  getTrackSuggestions,
  studyTypeOptions,
  type StudyTypeKey,
} from "@/data/frenchStudyPrograms";
import {
  lyceeGeneralSpecialties,
  lyceeSchoolLevels,
  lyceeTechnologySeries,
  specialtyLimitForLevel,
} from "@/data/lyceePrograms";

const fieldClass = "min-h-11 w-full rounded-xl border border-[#d6dfe6] bg-[#fbf8f2] px-3 text-sm text-[#294762] outline-none transition focus:border-[#7185f2] focus:ring-4 focus:ring-[#566ff5]/8";

type CurriculumFieldsProps = {
  defaultStudyType?: StudyTypeKey | string | null;
  defaultTrack?: string | null;
  defaultSchoolLevel?: string | null;
  defaultSpecialties?: string[] | null;
};

export function CurriculumFields({
  defaultStudyType = "lycee",
  defaultTrack = "",
  defaultSchoolLevel = "Seconde générale et technologique",
  defaultSpecialties = [],
}: CurriculumFieldsProps) {
  const normalizedType = studyTypeOptions.some((item) => item.value === defaultStudyType)
    ? (defaultStudyType as StudyTypeKey)
    : "lycee";

  const [studyType, setStudyType] = useState<StudyTypeKey>(normalizedType);
  const [schoolLevel, setSchoolLevel] = useState(defaultSchoolLevel || "Seconde générale et technologique");
  const [track, setTrack] = useState(defaultTrack || "");
  const [specialties, setSpecialties] = useState<string[]>(defaultSpecialties || []);

  const suggestions = useMemo(() => getTrackSuggestions(studyType), [studyType]);
  const isLycee = studyType === "lycee";
  const isGeneral = schoolLevel === "Première générale" || schoolLevel === "Terminale générale";
  const isSecondeGeneral = schoolLevel === "Seconde générale et technologique";
  const isTech = schoolLevel.includes("technologique") && !isSecondeGeneral;
  const isProfessional = schoolLevel.includes("professionnelle");
  const specialtyLimit = specialtyLimitForLevel(schoolLevel);

  const submittedTrack = isLycee
    ? isTech
      ? track
      : isProfessional
        ? track
        : schoolLevel === "Seconde STHR"
          ? "STHR — sciences et technologies de l’hôtellerie et de la restauration"
          : schoolLevel
    : track;

  function changeStudyType(next: StudyTypeKey) {
    setStudyType(next);
    setSpecialties([]);
    if (next === "lycee") {
      setSchoolLevel("Seconde générale et technologique");
      setTrack("");
      return;
    }
    setTrack(getTrackSuggestions(next)[0] || "");
  }

  function changeLevel(next: string) {
    setSchoolLevel(next);
    setSpecialties([]);
    if (next.includes("technologique") && next !== "Seconde générale et technologique") {
      setTrack(lyceeTechnologySeries[0]);
    } else if (next.includes("professionnelle")) {
      setTrack("");
    } else {
      setTrack("");
    }
  }

  function toggleSpecialty(value: string) {
    setSpecialties((previous) => {
      if (previous.includes(value)) return previous.filter((item) => item !== value);
      if (specialtyLimit && previous.length >= specialtyLimit) return previous;
      return [...previous, value];
    });
  }

  return (
    <div className="rounded-2xl border border-[#566ff5]/12 bg-gradient-to-br from-[#f6f8ff] to-[#f1fbf8] p-4">
      <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#5267d9]">
        <GraduationCap className="h-4 w-4" /> Ton cursus
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-[#334d68]">
          Type d’études
          <select name="study_type" value={studyType} onChange={(event) => changeStudyType(event.target.value as StudyTypeKey)} className={fieldClass} required>
            {studyTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>

        {isLycee ? (
          <label className="grid gap-2 text-sm font-semibold text-[#334d68]">
            Classe / voie
            <select name="school_level" value={schoolLevel} onChange={(event) => changeLevel(event.target.value)} className={fieldClass} required>
              {lyceeSchoolLevels.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        ) : (
          <label className="grid gap-2 text-sm font-semibold text-[#334d68]">
            Filière / année
            <input name="study_track" list="menta-signup-tracks" value={track} onChange={(event) => setTrack(event.target.value)} className={fieldClass} placeholder="Ex. L2 — Droit" required />
            <datalist id="menta-signup-tracks">{suggestions.map((item) => <option key={item} value={item} />)}</datalist>
          </label>
        )}
      </div>

      {isLycee && isTech ? (
        <label className="mt-4 grid gap-2 text-sm font-semibold text-[#334d68]">
          Série technologique
          <select value={track} onChange={(event) => setTrack(event.target.value)} className={fieldClass} required>
            {lyceeTechnologySeries.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      ) : null}

      {isLycee && isProfessional ? (
        <label className="mt-4 grid gap-2 text-sm font-semibold text-[#334d68]">
          Spécialité du bac professionnel
          <input value={track} onChange={(event) => setTrack(event.target.value)} className={fieldClass} placeholder="Ex. Métiers du commerce et de la vente" required />
        </label>
      ) : null}

      <input type="hidden" name="study_track" value={submittedTrack} />

      {isLycee && (isGeneral || isSecondeGeneral) ? (
        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-sm font-semibold text-[#334d68]">
              {isSecondeGeneral ? "Spécialités envisagées" : "Enseignements de spécialité"}
            </label>
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#718196]">
              {specialties.length}/{specialtyLimit} {isSecondeGeneral ? "max." : "sélectionnées"}
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-5 text-[#7d8c9b]">
            {isSecondeGeneral
              ? "Facultatif en seconde : indique jusqu’à 3 spécialités que tu envisages pour que Menta prépare déjà ton parcours."
              : schoolLevel === "Première générale"
                ? "Choisis exactement les 3 spécialités suivies en première."
                : "Choisis exactement les 2 spécialités conservées en terminale."}
          </p>

          <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto rounded-xl border border-[#dce4ed] bg-white/70 p-3 sm:grid-cols-2">
            {lyceeGeneralSpecialties.map((specialty) => {
              const checked = specialties.includes(specialty);
              const disabled = !checked && Boolean(specialtyLimit) && specialties.length >= specialtyLimit;
              return (
                <label key={specialty} className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-xs leading-5 transition ${checked ? "border-[#566ff5]/25 bg-[#edf1ff] text-[#4359c8]" : "border-transparent bg-white/70 text-[#5f7287] hover:border-[#d5ddeb]"} ${disabled ? "cursor-not-allowed opacity-45" : ""}`}>
                  <input type="checkbox" name="specialties" value={specialty} checked={checked} disabled={disabled} onChange={() => toggleSpecialty(specialty)} className="mt-1" />
                  <span>{specialty}</span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
