"use client";

import { createClient } from "@/lib/supabase/client";
import { Camera, FileText, Link2, Loader2, Sparkles, Type, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type SourceType = "photo" | "pdf" | "text" | "url";

const tabs: { id: SourceType; label: string; icon: typeof Camera; hint: string }[] = [
  { id: "photo", label: "Photo", icon: Camera, hint: "Photographie ou scan d'un cours" },
  { id: "pdf", label: "PDF", icon: FileText, hint: "Cours, polycopié ou document PDF" },
  { id: "text", label: "Texte", icon: Type, hint: "Colle directement ton cours" },
  { id: "url", label: "URL", icon: Link2, hint: "Article, page web ou PDF en ligne" },
];

export function SheetSourceCreator() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [sourceType, setSourceType] = useState<SourceType>("photo");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [subjectHint, setSubjectHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  function switchSource(next: SourceType) {
    setSourceType(next);
    setFile(null);
    setError("");
    setStatus("");
  }

  async function generate() {
    setError("");
    setStatus("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Connecte-toi pour créer et sauvegarder une fiche.");
      return;
    }

    if ((sourceType === "photo" || sourceType === "pdf") && !file) {
      setError("Choisis d'abord un fichier.");
      return;
    }
    if (sourceType === "text" && text.trim().length < 30) {
      setError("Ajoute un peu plus de contenu avant de générer la fiche.");
      return;
    }
    if (sourceType === "url" && !url.trim()) {
      setError("Ajoute l'URL de la source.");
      return;
    }

    setLoading(true);
    try {
      let storagePath: string | undefined;
      if (file) {
        setStatus("Envoi sécurisé du document…");
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        storagePath = `${user.id}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("study-sources")
          .upload(storagePath, file, { contentType: file.type, upsert: false });
        if (uploadError) throw new Error(uploadError.message);
      }

      setStatus(sourceType === "photo" ? "Lecture de la photo et reconstruction du cours…" : sourceType === "pdf" ? "Lecture du PDF et extraction du cours…" : sourceType === "url" ? "Lecture de la source en ligne…" : "Analyse et structuration du texte…");

      const response = await fetch("/api/sheets/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType,
          text: sourceType === "text" ? text : undefined,
          url: sourceType === "url" ? url : undefined,
          storagePath,
          sourceName: file?.name,
          sourceMime: file?.type,
          subjectHint,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result?.sheet?.id) {
        throw new Error(result?.error || "Impossible de générer la fiche.");
      }

      setStatus("Fiche créée. Ouverture…");
      router.push(`/fiches/${result.sheet.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#566ff5]/14 bg-white/80 shadow-[0_24px_70px_rgba(45,67,110,.10)] backdrop-blur-2xl">
      <div className="border-b border-[#566ff5]/10 bg-gradient-to-r from-[#edf1ff] via-white to-[#e8fbf5] p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#5267d9] shadow-sm">
          <Sparkles className="h-3.5 w-3.5" /> Menta AI
        </div>
        <h1 className="mt-4 display-serif text-4xl font-semibold text-[#182b49] sm:text-5xl">Transforme n'importe quel cours en fiche.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#65798f]">Photo, PDF, texte ou source web : Menta lit la source, la structure, crée la fiche et prépare automatiquement le rappel actif.</p>
      </div>

      <div className="p-5 sm:p-8">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = sourceType === tab.id;
            return (
              <button key={tab.id} type="button" onClick={() => switchSource(tab.id)} className={`rounded-2xl border p-4 text-left transition ${active ? "border-[#566ff5]/35 bg-[#edf1ff] shadow-sm" : "border-[#dce4ec] bg-white/70 hover:border-[#b9c8d8]"}`}>
                <Icon className={`h-5 w-5 ${active ? "text-[#566ff5]" : "text-[#7690a6]"}`} />
                <div className={`mt-3 text-sm font-semibold ${active ? "text-[#253f63]" : "text-[#536a7f]"}`}>{tab.label}</div>
                <div className="mt-1 text-[11px] leading-4 text-[#8a9aaa]">{tab.hint}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-3xl border border-[#dce4ec] bg-[#f9fbfd] p-5 sm:p-6">
          {sourceType === "photo" ? (
            <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#8fb3f7]/45 bg-gradient-to-br from-[#edf5ff] to-[#effcf8] p-6 text-center transition hover:border-[#566ff5]/55">
              <Camera className="h-9 w-9 text-[#566ff5]" />
              <span className="mt-4 font-semibold text-[#294762]">Prendre une photo ou l'importer</span>
              <span className="mt-1 text-xs text-[#7a8da0]">JPG, PNG ou WebP · cours imprimé ou manuscrit</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" onChange={(event) => setFile(event.target.files?.[0] || null)} />
              {file ? <span className="mt-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#5267d9] shadow-sm">{file.name}</span> : null}
            </label>
          ) : null}

          {sourceType === "pdf" ? (
            <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#ff9b7d]/40 bg-[#fff8f5] p-6 text-center transition hover:border-[#ff8c6b]/60">
              <UploadCloud className="h-9 w-9 text-[#e87958]" />
              <span className="mt-4 font-semibold text-[#5f463d]">Déposer un fichier PDF</span>
              <span className="mt-1 text-xs text-[#8f7a71]">Jusqu'à 25 Mo pour cette première version</span>
              <input type="file" accept="application/pdf" className="hidden" onChange={(event) => setFile(event.target.files?.[0] || null)} />
              {file ? <span className="mt-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#b65f43] shadow-sm">{file.name}</span> : null}
            </label>
          ) : null}

          {sourceType === "text" ? (
            <textarea value={text} onChange={(event) => setText(event.target.value)} rows={12} placeholder="Colle ici ton cours, tes notes, un chapitre, une transcription…" className="w-full resize-y rounded-2xl border border-[#566ff5]/15 bg-white p-5 text-sm leading-7 text-[#2f4963] outline-none focus:border-[#566ff5]/40 focus:ring-4 focus:ring-[#566ff5]/8" />
          ) : null}

          {sourceType === "url" ? (
            <div className="py-8 sm:py-12">
              <label className="block text-sm font-semibold text-[#304a63]">Lien de la source</label>
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#58d6b1]/28 bg-white px-4">
                <Link2 className="h-5 w-5 shrink-0 text-[#43ae91]" />
                <input value={url} onChange={(event) => setUrl(event.target.value)} type="url" placeholder="https://…" className="min-h-14 w-full bg-transparent text-sm text-[#2f4963] outline-none" />
              </div>
              <p className="mt-3 text-xs leading-5 text-[#8090a0]">Menta peut lire une page publique, un article ou un PDF public accessible depuis cette URL.</p>
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <label>
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#74879a]">Matière — facultatif</span>
            <input value={subjectHint} onChange={(event) => setSubjectHint(event.target.value)} placeholder="Ex. Philosophie, Histoire, Droit…" className="min-h-12 w-full rounded-2xl border border-[#d7e1ea] bg-white px-4 text-sm text-[#304a63] outline-none focus:border-[#566ff5]/35" />
          </label>
          <button type="button" onClick={generate} disabled={loading} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#566ff5] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(86,111,245,.25)] transition hover:bg-[#465de4] disabled:cursor-wait disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Création en cours…" : "Créer ma fiche"}
          </button>
        </div>

        {status ? <div className="mt-4 rounded-2xl bg-[#eafaf5] px-4 py-3 text-sm font-medium text-[#2d806a]">{status}</div> : null}
        {error ? <div className="mt-4 rounded-2xl bg-[#fff1ec] px-4 py-3 text-sm font-medium text-[#b65f43]">{error}</div> : null}
      </div>
    </div>
  );
}
