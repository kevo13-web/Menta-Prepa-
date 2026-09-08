"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  BookOpenCheck,
  Brain,
  Check,
  FileCheck2,
  Folder,
  FolderOpen,
  Heart,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { resources } from "@/data/siteData";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type GeneratedSheet = {
  id: string;
  title: string;
  subject: string;
  source_type: string;
  source_label: string | null;
  created_at: string;
  chapter: string | null;
  folder: string;
  favorite: boolean;
  mastery: number;
  content: {
    quiz?: Array<{ id: string }>;
  } | null;
};

type SmartFilter = "all" | "favorites" | "learning" | "mastered";

const sourceLabels: Record<string, string> = {
  photo: "Photo",
  pdf: "PDF",
  text: "Texte",
  url: "URL",
};

function localMastery(sheet: GeneratedSheet) {
  const quiz = sheet.content?.quiz;
  if (!quiz?.length || typeof window === "undefined") return sheet.mastery || 0;

  const key = `menta-active-recall-v1:${quiz.map((question) => question.id).join("|")}`;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return sheet.mastery || 0;
    const saved = JSON.parse(raw) as { mastered?: number[]; finished?: boolean };
    if (saved.finished) return 100;
    const mastered = Array.isArray(saved.mastered) ? saved.mastered.length : 0;
    return Math.max(sheet.mastery || 0, Math.round((mastered / quiz.length) * 100));
  } catch {
    return sheet.mastery || 0;
  }
}

export function ResourceLibrary() {
  const [activeSubject, setActiveSubject] = useState("Toutes");
  const [smartFilter, setSmartFilter] = useState<SmartFilter>("all");
  const [activeFolder, setActiveFolder] = useState("Tous les dossiers");
  const [query, setQuery] = useState("");
  const [generated, setGenerated] = useState<GeneratedSheet[]>([]);
  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
  const [folderDraft, setFolderDraft] = useState("");
  const [chapterDraft, setChapterDraft] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadGenerated() {
    const supabase = createClient();
    const { data } = await supabase
      .from("study_sheets")
      .select("id, title, subject, source_type, source_label, created_at, chapter, folder, favorite, mastery, content")
      .order("favorite", { ascending: false })
      .order("last_opened_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(100);

    if (!data) return;

    const hydrated = (data as GeneratedSheet[]).map((sheet) => ({
      ...sheet,
      folder: sheet.folder || "Sans dossier",
      mastery: localMastery(sheet),
    }));
    setGenerated(hydrated);

    const changed = hydrated.filter((sheet, index) => sheet.mastery !== (data[index] as GeneratedSheet).mastery);
    await Promise.all(
      changed.map((sheet) =>
        supabase.from("study_sheets").update({ mastery: sheet.mastery }).eq("id", sheet.id),
      ),
    );
  }

  useEffect(() => {
    void loadGenerated();
    const onFocus = () => void loadGenerated();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const subjectOptions = useMemo(() => {
    const values = new Set<string>();
    generated.forEach((sheet) => values.add(sheet.subject));
    resources.forEach((resource) => values.add(resource.subject));
    return ["Toutes", ...Array.from(values).sort((a, b) => a.localeCompare(b, "fr"))];
  }, [generated]);

  const folders = useMemo(
    () => ["Tous les dossiers", ...Array.from(new Set(generated.map((sheet) => sheet.folder || "Sans dossier"))).sort((a, b) => a.localeCompare(b, "fr"))],
    [generated],
  );

  const stats = useMemo(() => {
    const total = generated.length;
    const favorites = generated.filter((sheet) => sheet.favorite).length;
    const mastered = generated.filter((sheet) => sheet.mastery >= 80).length;
    const average = total ? Math.round(generated.reduce((sum, sheet) => sum + sheet.mastery, 0) / total) : 0;
    return { total, favorites, mastered, average };
  }, [generated]);

  const visibleGenerated = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return generated.filter((sheet) => {
      const matchesSubject = activeSubject === "Toutes" || sheet.subject === activeSubject;
      const matchesFolder = activeFolder === "Tous les dossiers" || sheet.folder === activeFolder;
      const matchesSmart =
        smartFilter === "all" ||
        (smartFilter === "favorites" && sheet.favorite) ||
        (smartFilter === "learning" && sheet.mastery < 80) ||
        (smartFilter === "mastered" && sheet.mastery >= 80);
      const haystack = `${sheet.title} ${sheet.subject} ${sheet.chapter || ""} ${sheet.folder || ""} ${sheet.source_label || ""}`.toLowerCase();
      return matchesSubject && matchesFolder && matchesSmart && haystack.includes(normalized);
    });
  }, [generated, activeSubject, activeFolder, smartFilter, query]);

  const visibleResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSubject = activeSubject === "Toutes" || resource.subject === activeSubject;
      const haystack = `${resource.title} ${resource.type} ${resource.subject}`.toLowerCase();
      return matchesSubject && haystack.includes(query.toLowerCase());
    });
  }, [activeSubject, query]);

  const showEvilDemo = useMemo(() => {
    const subjectMatches = activeSubject === "Toutes" || activeSubject === "Philosophie";
    const haystack = "le mal philosophie privation positivité liberté augustin kant schelling arendt fiche conceptuelle doctorat quiz rappel actif";
    return smartFilter === "all" && activeFolder === "Tous les dossiers" && subjectMatches && haystack.includes(query.toLowerCase().trim());
  }, [activeSubject, activeFolder, smartFilter, query]);

  async function toggleFavorite(sheet: GeneratedSheet) {
    const next = !sheet.favorite;
    setGenerated((previous) => previous.map((item) => item.id === sheet.id ? { ...item, favorite: next } : item));
    const supabase = createClient();
    const { error } = await supabase.from("study_sheets").update({ favorite: next }).eq("id", sheet.id);
    if (error) {
      setGenerated((previous) => previous.map((item) => item.id === sheet.id ? { ...item, favorite: sheet.favorite } : item));
    }
  }

  function startOrganizing(sheet: GeneratedSheet) {
    setEditingSheetId(sheet.id);
    setFolderDraft(sheet.folder || "Sans dossier");
    setChapterDraft(sheet.chapter || "");
  }

  async function saveOrganization(sheet: GeneratedSheet) {
    setSaving(true);
    const folder = folderDraft.trim() || "Sans dossier";
    const chapter = chapterDraft.trim() || null;
    const supabase = createClient();
    const { error } = await supabase
      .from("study_sheets")
      .update({ folder, chapter })
      .eq("id", sheet.id);
    setSaving(false);
    if (!error) {
      setGenerated((previous) => previous.map((item) => item.id === sheet.id ? { ...item, folder, chapter } : item));
      setEditingSheetId(null);
    }
  }

  return (
    <div>
      {generated.length > 0 ? (
        <div className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<BookOpenCheck className="h-5 w-5" />} label="Mes fiches" value={stats.total} tone="blue" />
          <StatCard icon={<Heart className="h-5 w-5" />} label="Favoris" value={stats.favorites} tone="coral" />
          <StatCard icon={<Target className="h-5 w-5" />} label="Maîtrisées" value={stats.mastered} tone="mint" />
          <StatCard icon={<Brain className="h-5 w-5" />} label="Maîtrise moyenne" value={`${stats.average}%`} tone="sun" />
        </div>
      ) : null}

      <div className="rounded-[1.7rem] border border-[#d9e1ea] bg-white/72 p-4 shadow-[0_14px_42px_rgba(53,82,110,.06)] backdrop-blur-xl sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {subjectOptions.map((subject) => (
              <button
                key={subject}
                type="button"
                onClick={() => setActiveSubject(subject)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
                  activeSubject === subject
                    ? "border-[#566ff5]/30 bg-[#e9edff] text-[#4359c8] shadow-sm"
                    : "border-[#d7dfe5] bg-[#fbf8f2] text-[#6a7d91] hover:border-[#aebbd7] hover:text-[#405b78]",
                )}
              >
                {subject}
              </button>
            ))}
          </div>

          <label className="flex min-h-11 items-center gap-2 rounded-2xl border border-[#d6dfe6] bg-[#fbf8f2] px-3 text-sm text-muted focus-within:border-[#7387f2] focus-within:ring-4 focus-within:ring-[#566ff5]/8">
            <Search className="h-4 w-4 text-[#566ff5]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Titre, chapitre, matière…"
              className="w-full bg-transparent text-frost outline-none placeholder:text-[#8b99a6] xl:w-64"
            />
          </label>
        </div>

        {generated.length > 0 ? (
          <div className="mt-4 flex flex-col gap-3 border-t border-[#566ff5]/8 pt-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1">
              <SmartButton active={smartFilter === "all"} onClick={() => setSmartFilter("all")} icon={<SlidersHorizontal className="h-3.5 w-3.5" />}>Toutes</SmartButton>
              <SmartButton active={smartFilter === "favorites"} onClick={() => setSmartFilter("favorites")} icon={<Heart className="h-3.5 w-3.5" />}>Favoris</SmartButton>
              <SmartButton active={smartFilter === "learning"} onClick={() => setSmartFilter("learning")} icon={<Brain className="h-3.5 w-3.5" />}>À maîtriser</SmartButton>
              <SmartButton active={smartFilter === "mastered"} onClick={() => setSmartFilter("mastered")} icon={<Check className="h-3.5 w-3.5" />}>Maîtrisées</SmartButton>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <FolderOpen className="h-4 w-4 shrink-0 text-[#43ae91]" />
              {folders.map((folder) => (
                <button
                  key={folder}
                  type="button"
                  onClick={() => setActiveFolder(folder)}
                  className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${activeFolder === folder ? "bg-[#e5faf3] text-[#287a64]" : "text-[#718397] hover:bg-[#f2f6f8]"}`}
                >
                  {folder}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {generated.length > 0 ? (
        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#5267d9]"><Sparkles className="h-4 w-4" /> Ma bibliothèque personnelle</div>
              <p className="mt-1 text-sm text-[#77889a]">{visibleGenerated.length} fiche{visibleGenerated.length > 1 ? "s" : ""} dans cette vue</p>
            </div>
            <Link href="/fiches/creer" className="hidden min-h-10 items-center gap-2 rounded-full bg-[#566ff5] px-4 py-2 text-sm font-semibold text-white shadow-sm sm:inline-flex">
              <Sparkles className="h-4 w-4" /> Nouvelle fiche
            </Link>
          </div>

          {visibleGenerated.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleGenerated.map((sheet, index) => {
                const tones = [
                  "from-[#edf1ff] via-white to-[#f3f5ff]",
                  "from-[#e7faf4] via-white to-[#f6fffc]",
                  "from-[#fff0e9] via-white to-[#fff8f4]",
                  "from-[#fff8dd] via-white to-[#fffdf4]",
                ];
                return (
                  <article key={sheet.id} className={`relative overflow-hidden rounded-[1.8rem] border border-[#566ff5]/12 bg-gradient-to-br ${tones[index % tones.length]} p-5 shadow-[0_16px_44px_rgba(53,82,110,.075)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_56px_rgba(53,82,110,.12)]`}>
                    <div className="absolute right-[-45px] top-[-45px] h-36 w-36 rounded-full bg-white/55 blur-2xl" />
                    <div className="relative">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#566ff5] text-white shadow-[0_8px_22px_rgba(86,111,245,.22)]"><Sparkles className="h-5 w-5" /></span>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5267d9]">{sheet.subject}</p>
                            <p className="mt-0.5 text-[11px] text-[#8291a1]">{sourceLabels[sheet.source_type] || sheet.source_type}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label={sheet.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                          onClick={() => void toggleFavorite(sheet)}
                          className={`grid h-10 w-10 place-items-center rounded-full border bg-white/80 shadow-sm transition hover:scale-105 ${sheet.favorite ? "border-[#ff9b7e]/35 text-[#e46f4f]" : "border-white text-[#8a99a8] hover:text-[#e46f4f]"}`}
                        >
                          <Heart className={`h-4.5 w-4.5 ${sheet.favorite ? "fill-current" : ""}`} />
                        </button>
                      </div>

                      <h3 className="mt-5 display-serif text-[1.45rem] font-semibold leading-snug text-[#1e3857]">{sheet.title}</h3>

                      <div className="mt-4 flex min-h-7 flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-2.5 py-1 text-[10px] font-semibold text-[#657a90]"><Folder className="h-3 w-3 text-[#43ae91]" /> {sheet.folder || "Sans dossier"}</span>
                        {sheet.chapter ? <span className="rounded-full bg-white/75 px-2.5 py-1 text-[10px] font-semibold text-[#657a90]">Chapitre · {sheet.chapter}</span> : null}
                      </div>

                      <div className="mt-5 rounded-2xl bg-white/62 p-3.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[#6c7e91]">
                          <span>Maîtrise</span>
                          <span className={sheet.mastery >= 80 ? "text-[#2f8b72]" : sheet.mastery >= 40 ? "text-[#b38422]" : "text-[#566ff5]"}>{sheet.mastery}%</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e5eaf2]">
                          <div className="h-full rounded-full bg-gradient-to-r from-[#566ff5] via-[#66a4ed] to-[#58d6b1] transition-all duration-700" style={{ width: `${sheet.mastery}%` }} />
                        </div>
                        <p className="mt-2 text-[10px] font-medium text-[#8996a4]">{sheet.mastery >= 80 ? "Solide — continue à entretenir" : sheet.mastery > 0 ? "En cours de maîtrise" : "Quiz pas encore commencé"}</p>
                      </div>

                      {editingSheetId === sheet.id ? (
                        <div className="mt-4 rounded-2xl border border-[#566ff5]/12 bg-white/85 p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#5267d9]">Classer la fiche</p>
                            <button type="button" onClick={() => setEditingSheetId(null)} className="text-[#8695a5]"><X className="h-4 w-4" /></button>
                          </div>
                          <label className="mt-3 block text-[11px] font-semibold text-[#6a7c8f]">Dossier</label>
                          <input value={folderDraft} onChange={(event) => setFolderDraft(event.target.value)} placeholder="Ex. Philosophie ENS" className="mt-1.5 min-h-10 w-full rounded-xl border border-[#d9e1eb] bg-white px-3 text-sm text-[#29445f] outline-none focus:border-[#566ff5]/45" />
                          <label className="mt-3 block text-[11px] font-semibold text-[#6a7c8f]">Chapitre</label>
                          <input value={chapterDraft} onChange={(event) => setChapterDraft(event.target.value)} placeholder="Ex. Le mal — théodicée" className="mt-1.5 min-h-10 w-full rounded-xl border border-[#d9e1eb] bg-white px-3 text-sm text-[#29445f] outline-none focus:border-[#566ff5]/45" />
                          <button type="button" disabled={saving} onClick={() => void saveOrganization(sheet)} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#43ae91] px-3 text-sm font-semibold text-white disabled:opacity-50"><Check className="h-4 w-4" /> {saving ? "Enregistrement…" : "Enregistrer"}</button>
                        </div>
                      ) : null}

                      <div className="mt-5 flex items-center gap-2">
                        <Link href={`/fiches/${sheet.id}`} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#566ff5] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#465de4]"><Brain className="h-4 w-4" /> Lire & se tester</Link>
                        <button type="button" onClick={() => startOrganizing(sheet)} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#cfd8e5] bg-white/80 px-3 text-xs font-semibold text-[#64788e] transition hover:border-[#8ea0d8] hover:text-[#5267d9]">Classer</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[1.7rem] border border-dashed border-[#566ff5]/20 bg-[#f7f9ff] p-8 text-center">
              <Brain className="mx-auto h-7 w-7 text-[#7186ec]" />
              <h3 className="mt-3 font-semibold text-[#29445f]">Aucune fiche dans cette vue</h3>
              <p className="mt-1 text-sm text-[#7b8998]">Change les filtres ou crée une nouvelle fiche.</p>
            </div>
          )}
        </section>
      ) : (
        <div className="mt-8 rounded-[1.8rem] border border-dashed border-[#566ff5]/18 bg-gradient-to-br from-[#edf1ff] to-[#e8fbf5] p-8 text-center sm:p-10">
          <Sparkles className="mx-auto h-7 w-7 text-[#566ff5]" />
          <h3 className="mt-3 display-serif text-2xl font-semibold text-[#1e3857]">Ta bibliothèque personnelle commence ici.</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#718397]">Crée une première fiche depuis une photo, un PDF, un texte ou une URL. Elle sera automatiquement classée dans ta bibliothèque.</p>
          <Link href="/fiches/creer" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#566ff5] px-5 py-2.5 text-sm font-semibold text-white"><Sparkles className="h-4 w-4" /> Créer ma première fiche</Link>
        </div>
      )}

      {smartFilter === "all" && activeFolder === "Tous les dossiers" ? (
        <section className="mt-12">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7c8da0]">Ressources Menta</p>
            <h2 className="mt-1 display-serif text-2xl font-semibold text-[#263f5d]">Méthodes et fiches de référence</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {showEvilDemo ? (
              <article className="group rounded-2xl border border-[#566ff5]/18 bg-gradient-to-br from-[#edf1ff] via-white to-[#e8fbf5] p-5 shadow-[0_14px_38px_rgba(53,82,110,.06)] transition hover:-translate-y-1">
                <div className="flex items-start justify-between gap-4"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#566ff5] text-white"><Brain className="h-5 w-5" /></span><span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-[#5267d9]">Doctorat</span></div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#566ff5]">Fiche conceptuelle · Quiz actif</p>
                <h3 className="mt-3 font-serif text-xl font-semibold text-frost">Le mal : privation, positivité, liberté et scandale de la raison</h3>
                <p className="mt-4 text-sm text-muted">Philosophie · fiche test Menta</p>
                <Link href="/fiches/mal" className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#566ff5] px-4 py-2 text-sm font-semibold text-white"><Brain className="h-4 w-4" /> Lire & se tester</Link>
              </article>
            ) : null}

            {visibleResources.map((resource) => (
              <article key={`${resource.subject}-${resource.title}`} className="group rounded-2xl border border-[#d7e0e6] bg-[#fbf8f2]/95 p-5 shadow-[0_12px_35px_rgba(53,82,110,.05)] transition duration-300 hover:-translate-y-1 hover:border-[#9ebed5]">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dceaf4] text-[#4f83b6]">{resource.type === "Checklist" || resource.type === "Grille d’évaluation" ? <FileCheck2 className="h-5 w-5" /> : <Archive className="h-5 w-5" />}</span>
                  <span className="rounded-full border border-[#d6dfe6] bg-white/70 px-3 py-1 text-xs text-muted">{resource.level}</span>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f83b6]">{resource.type}</p>
                <h3 className="mt-3 font-serif text-xl font-semibold text-frost">{resource.title}</h3>
                <p className="mt-4 text-sm text-muted">{resource.subject}</p>
                <button type="button" className="mt-6 rounded-full border border-[#cbd9e3] bg-white/55 px-4 py-2 text-sm font-semibold text-frost transition group-hover:border-[#79a6cb] group-hover:bg-[#eaf3f8]">Ouvrir</button>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SmartButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${active ? "bg-[#182b49] text-white shadow-sm" : "bg-[#f4f7f9] text-[#6e8093] hover:bg-[#eaf0f4]"}`}>
      {icon}{children}
    </button>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number | string; tone: "blue" | "mint" | "coral" | "sun" }) {
  const tones = {
    blue: "border-[#566ff5]/14 bg-[#edf1ff] text-[#5267d9]",
    mint: "border-[#58d6b1]/18 bg-[#e9faf5] text-[#2f8b72]",
    coral: "border-[#ff8c6b]/18 bg-[#fff0ea] text-[#c7674b]",
    sun: "border-[#f2cf60]/28 bg-[#fff8df] text-[#9a7828]",
  };
  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/75 shadow-sm">{icon}</span><div><p className="text-2xl font-bold leading-none text-[#233e5c]">{value}</p><p className="mt-1 text-xs font-semibold">{label}</p></div></div>
    </div>
  );
}
