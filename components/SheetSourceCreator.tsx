"use client";

import { createClient } from "@/lib/supabase/client";
import { MAX_PDF_BATCH_BYTES, MAX_PDF_BATCH_FILES, isPdfBytes, validatePdfBatch } from "@/lib/sheets/pdfBatch";
import { ArrowDown, ArrowUp, Camera, FileText, Link2, Loader2, Sparkles, Trash2, Type, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

type SourceType = "photo" | "pdf" | "text" | "url";
const tabs: { id: SourceType; label: string; icon: typeof Camera; hint: string }[] = [
  { id: "photo", label: "Photo", icon: Camera, hint: "Photographie ou scan d'un cours" },
  { id: "pdf", label: "PDF", icon: FileText, hint: "Un ou plusieurs documents pour une seule fiche" },
  { id: "text", label: "Texte", icon: Type, hint: "Colle directement ton cours" },
  { id: "url", label: "URL", icon: Link2, hint: "Article, page web ou PDF en ligne" },
];
const formatSize = (bytes: number) => `${(bytes / (1024 * 1024)).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} Mo`;
const fieldClass = "min-h-12 w-full rounded-2xl border border-[#d7e1ea] bg-white px-4 text-sm text-[#304a63] outline-none focus:border-[#566ff5]/35";

export function SheetSourceCreator() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const pdfInput = useRef<HTMLInputElement>(null);
  const [sourceType, setSourceType] = useState<SourceType>("photo");
  const [file, setFile] = useState<File | null>(null);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [subjectHint, setSubjectHint] = useState("");
  const [titleHint, setTitleHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const totalBytes = pdfFiles.reduce((sum, item) => sum + item.size, 0);
  const pdfError = pdfFiles.length ? validatePdfBatch(pdfFiles) : "";

  function switchSource(next: SourceType) {
    if (loading) return;
    setSourceType(next);
    setError("");
    setStatus("");
  }

  async function addPdfs(selected: FileList | null) {
    if (!selected || loading) return;
    setError("");
    const next = [...pdfFiles];
    for (const candidate of Array.from(selected)) {
      if (next.some((item) => item.name === candidate.name && item.size === candidate.size && item.lastModified === candidate.lastModified)) continue;
      const issue = validatePdfBatch([candidate]);
      if (issue) { setError(issue); break; }
      const header = new Uint8Array(await candidate.slice(0, 5).arrayBuffer());
      if (!isPdfBytes(header)) { setError(`« ${candidate.name} » ne contient pas un PDF valide.`); break; }
      const nextIssue = validatePdfBatch([...next, candidate]);
      if (nextIssue) { setError(nextIssue); break; }
      next.push(candidate);
    }
    setPdfFiles(next);
    if (pdfInput.current) pdfInput.current.value = "";
  }

  function movePdf(index: number, direction: number) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= pdfFiles.length || loading) return;
    const next = [...pdfFiles];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setPdfFiles(next);
  }

  async function generate() {
    if (loading) return;
    setError("");
    setStatus("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Connecte-toi pour créer et sauvegarder une fiche."); return; }
    if (sourceType === "pdf") {
      const issue = validatePdfBatch(pdfFiles);
      if (issue) { setError(issue); return; }
    } else if (sourceType === "photo" && !file) {
      setError("Choisis d'abord une photo."); return;
    } else if (sourceType === "text" && text.trim().length < 30) {
      setError("Ajoute un peu plus de contenu avant de générer la fiche."); return;
    } else if (sourceType === "url" && !url.trim()) {
      setError("Ajoute l'URL de la source."); return;
    }

    setLoading(true);
    const uploadedPaths: string[] = [];
    let submitted = false;
    try {
      let storagePath: string | undefined;
      let sources: Array<{ storagePath: string; sourceName: string; sourceMime: string; size: number }> | undefined;
      if (sourceType === "pdf") {
        sources = [];
        for (let index = 0; index < pdfFiles.length; index++) {
          const item = pdfFiles[index];
          setStatus(`Envoi sécurisé du PDF ${index + 1}/${pdfFiles.length} : ${item.name}`);
          const safeName = item.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 140);
          const path = `${user.id}/${crypto.randomUUID()}/${safeName}`;
          const { error: uploadError } = await supabase.storage.from("study-sources").upload(path, item, { contentType: "application/pdf", upsert: false });
          if (uploadError) throw new Error(uploadError.message);
          uploadedPaths.push(path);
          sources.push({ storagePath: path, sourceName: item.name, sourceMime: "application/pdf", size: item.size });
        }
      } else if (sourceType === "photo" && file) {
        setStatus("Envoi sécurisé de la photo…");
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 140);
        storagePath = `${user.id}/${crypto.randomUUID()}/${safeName}`;
        const { error: uploadError } = await supabase.storage.from("study-sources").upload(storagePath, file, { contentType: file.type, upsert: false });
        if (uploadError) throw new Error(uploadError.message);
        uploadedPaths.push(storagePath);
      }
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser?.id !== user.id) throw new Error("La session a changé. Reconnecte-toi et réessaie.");
      setStatus(sourceType === "pdf" ? `Analyse croisée de ${pdfFiles.length} PDF et création d'une fiche unique…` : sourceType === "photo" ? "Lecture de la photo et reconstruction du cours…" : sourceType === "url" ? "Lecture de la source en ligne…" : "Analyse et structuration du texte…");
      submitted = true;
      const response = await fetch(sourceType === "pdf" ? "/api/sheets/generate-batch" : "/api/sheets/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sourceType === "pdf" ? { sources, subjectHint, titleHint } : {
          sourceType, text: sourceType === "text" ? text : undefined, url: sourceType === "url" ? url : undefined,
          storagePath, sourceName: file?.name, sourceMime: file?.type, subjectHint,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result?.sheet?.id) throw new Error(result?.error || "Impossible de générer la fiche.");
      setStatus("Fiche créée. Ouverture…");
      router.push(`/fiches/${result.sheet.id}`);
      router.refresh();
    } catch (cause) {
      if (!submitted && uploadedPaths.length) await supabase.storage.from("study-sources").remove(uploadedPaths);
      setError(cause instanceof Error ? cause.message : "Une erreur est survenue.");
      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#566ff5]/14 bg-white/80 shadow-[0_24px_70px_rgba(45,67,110,.10)] backdrop-blur-2xl">
      <div className="border-b border-[#566ff5]/10 bg-gradient-to-r from-[#edf1ff] via-white to-[#e8fbf5] p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#5267d9] shadow-sm"><Sparkles className="h-3.5 w-3.5" /> Menta AI</div>
        <h1 className="mt-4 display-serif text-4xl font-semibold text-[#182b49] sm:text-5xl">Transforme tes cours en fiche.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#65798f]">Importe un ou plusieurs PDF, une photo, un texte ou une source web. Menta rassemble les informations et prépare une fiche structurée avec rappel actif.</p>
      </div>
      <div className="p-5 sm:p-8">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {tabs.map((tab) => { const Icon = tab.icon; const active = sourceType === tab.id; return (
            <button key={tab.id} type="button" disabled={loading} onClick={() => switchSource(tab.id)} className={`rounded-2xl border p-4 text-left transition disabled:opacity-60 ${active ? "border-[#566ff5]/35 bg-[#edf1ff] shadow-sm" : "border-[#dce4ec] bg-white/70 hover:border-[#b9c8d8]"}`}>
              <Icon className={`h-5 w-5 ${active ? "text-[#566ff5]" : "text-[#7690a6]"}`} /><div className={`mt-3 text-sm font-semibold ${active ? "text-[#253f63]" : "text-[#536a7f]"}`}>{tab.label}</div><div className="mt-1 text-[11px] leading-4 text-[#8a9aaa]">{tab.hint}</div>
            </button>
          ); })}
        </div>
        <div className="mt-6 rounded-3xl border border-[#dce4ec] bg-[#f9fbfd] p-5 sm:p-6">
          {sourceType === "pdf" ? (
            <div className="space-y-4">
              <label className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#ff9b7d]/40 bg-[#fff8f5] p-6 text-center transition hover:border-[#ff8c6b]/60">
                <UploadCloud className="h-9 w-9 text-[#e87958]" /><span className="mt-4 font-semibold text-[#5f463d]">Ajouter plusieurs PDF</span>
                <span className="mt-1 text-xs text-[#8f7a71]">Sélectionne plusieurs fichiers ou ajoute-les en plusieurs fois.</span>
                <span className="mt-2 text-xs font-semibold text-[#b65f43]">25 Mo maximum au total · {MAX_PDF_BATCH_FILES} PDF maximum</span>
                <input ref={pdfInput} type="file" accept="application/pdf,.pdf" multiple disabled={loading} className="sr-only" onChange={(event) => void addPdfs(event.target.files)} />
              </label>
              {pdfFiles.length > 0 ? (
                <div className="rounded-2xl border border-[#e5eaf0] bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-[#294762]">{pdfFiles.length} document{pdfFiles.length > 1 ? "s" : ""} sélectionné{pdfFiles.length > 1 ? "s" : ""}</p><p className={`text-sm font-bold ${pdfError ? "text-red-600" : "text-[#5267d9]"}`}>{formatSize(totalBytes)} / 25 Mo</p></div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf0f5]"><div className={`h-full rounded-full transition-all ${pdfError ? "bg-red-500" : "bg-[#566ff5]"}`} style={{ width: `${Math.min(100, totalBytes / MAX_PDF_BATCH_BYTES * 100)}%` }} /></div>
                  <div className="mt-4 space-y-2">{pdfFiles.map((item, index) => (
                    <div key={`${item.name}-${item.size}-${item.lastModified}-${index}`} className="flex min-w-0 items-center gap-3 rounded-xl border border-[#e5eaf0] bg-[#fafbff] p-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#edf1ff] text-[#566ff5]"><FileText className="h-4 w-4" /></span>
                      <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[#294762]" title={item.name}>{item.name}</p><p className="mt-1 text-[11px] text-[#8090a0]">{formatSize(item.size)}</p></div>
                      <div className="flex shrink-0 gap-1"><button type="button" aria-label={`Monter ${item.name}`} disabled={loading || index === 0} onClick={() => movePdf(index, -1)} className="rounded-lg p-2 text-[#718397] hover:bg-white disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button><button type="button" aria-label={`Descendre ${item.name}`} disabled={loading || index === pdfFiles.length - 1} onClick={() => movePdf(index, 1)} className="rounded-lg p-2 text-[#718397] hover:bg-white disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button><button type="button" aria-label={`Retirer ${item.name}`} disabled={loading} onClick={() => { setPdfFiles((previous) => previous.filter((_, position) => position !== index)); setError(""); }} className="rounded-lg p-2 text-[#b65f43] hover:bg-[#fff0ea] disabled:opacity-30"><Trash2 className="h-4 w-4" /></button></div>
                    </div>
                  ))}</div>
                  <p className="mt-3 text-xs leading-5 text-[#72859a]">Menta lira les documents ensemble pour produire une seule fiche, en croisant les notions et en conservant la provenance des informations.</p>
                  {pdfError ? <p className="mt-2 text-xs font-semibold text-red-600">{pdfError}</p> : null}
                </div>
              ) : null}
            </div>
          ) : null}
          {sourceType === "photo" ? <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#8fb3f7]/45 bg-gradient-to-br from-[#edf5ff] to-[#effcf8] p-6 text-center transition hover:border-[#566ff5]/55"><Camera className="h-9 w-9 text-[#566ff5]" /><span className="mt-4 font-semibold text-[#294762]">Prendre une photo ou l'importer</span><span className="mt-1 text-xs text-[#7a8da0]">JPG, PNG ou WebP · cours imprimé ou manuscrit</span><input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={loading} className="sr-only" onChange={(event) => setFile(event.target.files?.[0] || null)} />{file ? <span className="mt-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#5267d9] shadow-sm">{file.name}</span> : null}</label> : null}
          {sourceType === "text" ? <textarea value={text} onChange={(event) => setText(event.target.value)} rows={12} disabled={loading} placeholder="Colle ici ton cours, tes notes, un chapitre, une transcription…" className="w-full resize-y rounded-2xl border border-[#566ff5]/15 bg-white p-5 text-sm leading-7 text-[#2f4963] outline-none focus:border-[#566ff5]/40" /> : null}
          {sourceType === "url" ? <div className="py-8 sm:py-12"><label className="block text-sm font-semibold text-[#304a63]">Lien de la source</label><div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#58d6b1]/28 bg-white px-4"><Link2 className="h-5 w-5 shrink-0 text-[#43ae91]" /><input value={url} onChange={(event) => setUrl(event.target.value)} type="url" disabled={loading} placeholder="https://…" className="min-h-14 w-full bg-transparent text-sm text-[#2f4963] outline-none" /></div><p className="mt-3 text-xs leading-5 text-[#8090a0]">Menta peut lire une page publique, un article ou un PDF public accessible depuis cette URL.</p></div> : null}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="grid gap-4"><label><span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#74879a]">Matière — facultatif</span><input value={subjectHint} onChange={(event) => setSubjectHint(event.target.value)} disabled={loading} placeholder="Ex. Philosophie, Histoire, Droit…" className={fieldClass} /></label>{sourceType === "pdf" ? <label><span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#74879a]">Titre de la fiche — facultatif</span><input value={titleHint} onChange={(event) => setTitleHint(event.target.value)} disabled={loading} placeholder="Ex. La Restauration et la monarchie de Juillet" className={fieldClass} /></label> : null}</div>
          <button type="button" onClick={() => void generate()} disabled={loading || (sourceType === "pdf" && (!pdfFiles.length || Boolean(pdfError)))} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#566ff5] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(86,111,245,.25)] transition hover:bg-[#465de4] disabled:cursor-not-allowed disabled:opacity-50">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{loading ? "Création en cours…" : sourceType === "pdf" && pdfFiles.length > 1 ? "Créer ma fiche complète" : "Créer ma fiche"}</button>
        </div>
        {status ? <div role="status" aria-live="polite" className="mt-4 rounded-2xl bg-[#eafaf5] px-4 py-3 text-sm font-medium text-[#2d806a]">{status}</div> : null}
        {error ? <div role="alert" className="mt-4 rounded-2xl bg-[#fff1ec] px-4 py-3 text-sm font-medium text-[#b65f43]">{error}</div> : null}
      </div>
    </div>
  );
}
