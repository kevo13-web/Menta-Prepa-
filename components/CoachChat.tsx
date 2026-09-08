"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { BookOpen, Brain, CheckCircle2, ExternalLink, GraduationCap, Loader2, MessageCircle, Plus, Send, ShieldCheck, Trash2 } from "lucide-react";

type Mode = "mentor" | "method" | "oral" | "exam" | "organization";
type CoachSource = { id: string; title: string; organization: string; url: string; kind: "evidence" | "directory"; year?: number };
type CoachAction = { label: string; detail: string; kind: "focus" | "planning" | "fiches" | "none" };
type CoachMessage = { id: string; role: "user" | "assistant"; content: string; sources?: CoachSource[]; actions?: CoachAction[]; created_at?: string; uncertainty?: string; follow_up?: string };
type CoachSession = { id: string; title: string; mode: Mode; use_academic_context: boolean; updated_at: string };
type CoachProfile = { study_type?: string | null; study_track?: string | null; school_level?: string | null; specialties?: string[] | null; study_options?: string[] | null };
type CoachQuota = { used: number; limit: number; month?: string };
type CoachData = { profile: CoachProfile | null; sessions: CoachSession[]; messages: CoachMessage[]; sources: CoachSource[]; quota: CoachQuota };

const modes: { id: Mode; label: string; description: string }[] = [
  { id: "mentor", label: "Mentor", description: "Conseils et stratégie personnelle" },
  { id: "method", label: "Méthode", description: "Comprendre, rédiger et progresser" },
  { id: "oral", label: "Oral", description: "Simulation, questions et relances" },
  { id: "exam", label: "Concours & examens", description: "Préparation adaptée aux épreuves" },
  { id: "organization", label: "Organisation", description: "Priorités et travail réalisable" },
];
const errors: Record<string, string> = {
  AUTH_REQUIRED: "Connecte-toi pour utiliser ton coach.",
  CURRICULUM_REQUIRED: "Complète ton cursus dans Mon compte pour personnaliser le coaching.",
  COACHING_QUOTA_REACHED: "Ton quota mensuel de coaching est atteint. Tu peux retrouver tes échanges et tes sources.",
  COACHING_BUSY: "Une autre réponse est en cours. Réessaie dans un instant.",
  COACHING_NOT_CONFIGURED: "Le coaching n'est pas encore configuré sur ce déploiement.",
  QUOTA_UNAVAILABLE: "Le compteur de coaching est momentanément indisponible.",
  SESSION_NOT_FOUND: "Cette conversation n'est plus disponible sur ton compte.",
  AI_UNAVAILABLE: "L'IA est momentanément indisponible. Ton message n'a pas été décompté ; tu peux réessayer.",
};
const actionHrefs: Record<string, string> = { focus: "/focus", planning: "/planning", fiches: "/fiches" };

async function readResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(errors[data.error] || "Une erreur est survenue. Réessaie dans un instant.");
  return data;
}

export function CoachChat() {
  const [data, setData] = useState<CoachData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [mode, setMode] = useState<Mode>("mentor");
  const [useAcademicContext, setUseAcademicContext] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSources, setShowSources] = useState(false);
  const requestRef = useRef(0);
  const messagesEnd = useRef<HTMLDivElement>(null);

  const load = useCallback(async (id: string | null = null, includeMessages = true) => {
    const request = ++requestRef.current;
    const url = `/api/coaching${id ? `?sessionId=${encodeURIComponent(id)}` : ""}`;
    const next = await readResponse(await fetch(url, { cache: "no-store" })) as CoachData;
    if (request !== requestRef.current) return;
    setData(next);
    if (includeMessages) setMessages(next.messages || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load().catch((err) => { setError(err.message); setLoading(false); });
    return () => { requestRef.current++; };
  }, [load]);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages.length, busy]);

  async function openSession(session: CoachSession) {
    if (busy) return;
    setLoading(true);
    setError("");
    setSessionId(session.id);
    setMode(session.mode);
    setUseAcademicContext(session.use_academic_context);
    try { await load(session.id); } catch (err) { setError(err instanceof Error ? err.message : "Conversation indisponible."); setLoading(false); }
  }

  function newSession() {
    if (busy) return;
    requestRef.current++;
    setSessionId(null);
    setMessages([]);
    setInput("");
    setError("");
  }

  async function send(event?: FormEvent<HTMLFormElement>, suggested?: string) {
    event?.preventDefault();
    const message = (suggested ?? input).trim();
    if (busy || !message || message.length > 4000 || !data) return;
    setBusy(true);
    setError("");
    const localId = crypto.randomUUID();
    const previous = messages;
    setMessages([...previous, { id: localId, role: "user", content: message }]);
    setInput("");
    try {
      const result = await readResponse(await fetch("/api/coaching", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, mode, useAcademicContext, sessionId, requestId: crypto.randomUUID() }),
      }));
      setSessionId(result.sessionId);
      setMessages([...previous, { id: localId, role: "user", content: message }, result.message]);
      await load(result.sessionId, false);
    } catch (err) {
      setMessages(previous);
      setInput(message);
      setError(err instanceof Error ? err.message : "Envoi impossible.");
      void load(sessionId, false).catch(() => {});
    } finally { setBusy(false); }
  }

  async function deleteSession(id: string) {
    if (busy || !window.confirm("Supprimer cette conversation et ses messages ?")) return;
    setBusy(true);
    setError("");
    try {
      await readResponse(await fetch("/api/coaching", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: id }) }));
      if (sessionId === id) { setSessionId(null); setMessages([]); }
      await load(null, false);
    } catch (err) { setError(err instanceof Error ? err.message : "Suppression impossible."); }
    finally { setBusy(false); }
  }

  const quota = data?.quota;
  const profile = data?.profile;
  const profileLabel = [profile?.study_track, profile?.school_level, ...(profile?.specialties || [])].filter(Boolean).join(" · ");

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#dce4ef] bg-white/90 shadow-[0_20px_65px_rgba(42,65,101,.07)]">
      <div className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b border-[#e2e8f0] bg-[#f7f8ff] p-5 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2 text-[#5267d9]"><Brain className="h-5 w-5" /><span className="text-sm font-bold">Ton espace de coaching</span></div>
          <button type="button" onClick={newSession} disabled={busy} className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#566ff5] px-4 text-sm font-semibold text-white disabled:opacity-50"><Plus className="h-4 w-4" /> Nouvelle conversation</button>
          <div className="mt-6 space-y-1"><p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#8190a5]">Historique privé</p>
            {data?.sessions.map((session) => <div key={session.id} className={`flex items-center gap-1 rounded-xl ${sessionId === session.id ? "bg-[#e7ecff]" : "hover:bg-white"}`}><button type="button" disabled={busy} onClick={() => void openSession(session)} className="min-w-0 flex-1 truncate px-3 py-3 text-left text-xs font-medium text-[#405773]">{session.title}</button><button type="button" disabled={busy} onClick={() => void deleteSession(session.id)} aria-label={`Supprimer ${session.title}`} className="p-2 text-[#8393a6] hover:text-[#c45555]"><Trash2 className="h-3.5 w-3.5" /></button></div>)}
            {!data?.sessions.length && <p className="text-xs leading-5 text-[#8a9bad]">Tes conversations apparaîtront ici.</p>}
          </div>
          <div className="mt-6 rounded-xl border border-[#dce4f1] bg-white p-4"><p className="text-xs font-semibold text-[#3d5573]">Ton quota mensuel</p><p className="mt-2 text-2xl font-bold text-[#1f3554]">{quota ? `${quota.used} / ${quota.limit}` : "—"}</p><p className="mt-1 text-xs text-[#8190a2]">réponses de coaching</p></div>
        </aside>
        <div className="flex min-w-0 flex-col">
          <div className="border-b border-[#e3e9f2] bg-gradient-to-r from-[#eef2ff] via-white to-[#eafaf5] p-5 sm:p-7">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#5267d9]"><GraduationCap className="h-4 w-4" /> Menta Coach</div>
            <h2 className="mt-2 display-serif text-2xl font-semibold text-[#1c3552] sm:text-3xl">Un accompagnement qui connaît ton parcours.</h2>
            <p className="mt-2 text-sm leading-6 text-[#62788d]">{profileLabel || "Ton cursus sera utilisé pour adapter les méthodes et les conseils à tes études."}</p>
            <div className="mt-4 flex flex-wrap gap-2">{modes.map((item) => <button type="button" key={item.id} onClick={() => setMode(item.id)} disabled={busy} title={item.description} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${mode === item.id ? "border-[#566ff5] bg-[#566ff5] text-white" : "border-[#dbe3ef] bg-white text-[#667c91] hover:border-[#566ff5]"}`}>{item.label}</button>)}</div>
            <label className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#536b82]"><input type="checkbox" checked={useAcademicContext} onChange={(event) => setUseAcademicContext(event.target.checked)} disabled={busy} className="mt-0.5 accent-[#566ff5]" /><span><strong>Utiliser mes fiches et mon planning</strong><br />Autorise Menta à consulter tes priorités et tes fiches les moins maîtrisées pour cette réponse.</span></label>
          </div>
          <div className="max-h-[650px] min-h-[360px] space-y-5 overflow-y-auto bg-[#fcfdff] p-5 sm:p-7" aria-live="polite">
            {loading && <div className="flex items-center gap-2 text-sm text-[#7b8da1]"><Loader2 className="h-4 w-4 animate-spin" /> Chargement de ton espace…</div>}
            {!loading && messages.length === 0 && <div className="mx-auto max-w-xl py-8 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#e9edff] text-[#566ff5]"><MessageCircle className="h-7 w-7" /></div><h3 className="mt-4 text-xl font-semibold text-[#243c59]">Qu'est-ce qu'on travaille aujourd'hui ?</h3><p className="mt-3 text-sm leading-6 text-[#71859a]">Dis-moi ton objectif, ta difficulté ou ton échéance. Le coach adaptera sa réponse à ton cursus, sans inventer ce qu'il ne sait pas.</p><div className="mt-5 flex flex-wrap justify-center gap-2">{["Aide-moi à organiser mes révisions", "Fais-moi passer un oral sur mon cours", "Comment améliorer ma méthode pour mes épreuves ?"].map((suggestion) => <button type="button" key={suggestion} onClick={() => void send(undefined, suggestion)} disabled={busy} className="rounded-full border border-[#dbe3ee] bg-white px-4 py-2 text-xs font-medium text-[#526a83] hover:bg-[#f0f3ff]">{suggestion}</button>)}</div></div>}
            {messages.map((message) => <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`min-w-0 max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[85%] ${message.role === "user" ? "bg-[#e9edff] text-[#294469]" : "border border-[#e2e8f0] bg-white text-[#334b65]"}`}>
              {message.role === "assistant" && <p className="mb-2 flex items-center gap-2 text-xs font-bold text-[#5267d9]"><Brain className="h-4 w-4" /> Menta Coach</p>}
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
              {message.uncertainty && <p className="mt-3 rounded-xl bg-[#fff8e5] px-3 py-2 text-xs leading-5 text-[#886e2c]">À vérifier : {message.uncertainty}</p>}
              {!!message.sources?.length && <div className="mt-4 border-t border-[#e8edf4] pt-3"><p className="mb-2 text-xs font-bold text-[#698098]">Sources utilisées</p>{message.sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer" className="mb-2 flex items-start gap-2 text-xs leading-5 text-[#5267d9] hover:underline"><ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>{source.title} · {source.organization}{source.year ? ` (${source.year})` : ""}</span></a>)}</div>}
              {!!message.actions?.length && <div className="mt-4 space-y-2">{message.actions.filter((action) => action.label).map((action, index) => <div key={`${action.label}-${index}`} className="rounded-xl bg-[#f3f6fc] p-3"><p className="text-xs font-semibold text-[#294966]">{action.label}</p><p className="mt-1 text-xs leading-5 text-[#647b90]">{action.detail}</p>{actionHrefs[action.kind] && <Link href={actionHrefs[action.kind]} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#5267d9]">Ouvrir {action.kind === "fiches" ? "mes fiches" : action.kind === "planning" ? "mon planning" : "Focus"} →</Link>}</div>)}</div>}
              {message.follow_up && <p className="mt-3 text-xs italic text-[#71869a]">{message.follow_up}</p>}
            </div></div>)}
            {busy && <div className="flex items-center gap-2 text-sm text-[#71869a]"><Loader2 className="h-4 w-4 animate-spin" /> Menta prépare une réponse adaptée…</div>}
            <div ref={messagesEnd} />
          </div>
          <div className="border-t border-[#e3e9f2] bg-white p-4 sm:p-5">
            {error && <div role="alert" className="mb-3 rounded-xl bg-[#fff0eb] p-3 text-sm text-[#a74f3c]">{error}{error.includes("cursus") && <Link href="/account/cursus" className="ml-2 font-semibold underline">Compléter mon cursus</Link>}</div>}
            <form onSubmit={(event) => void send(event)} className="flex items-end gap-2"><textarea value={input} onChange={(event) => setInput(event.target.value)} rows={2} maxLength={4000} disabled={busy || loading || !data} placeholder="Explique ta difficulté, ton objectif ou l'épreuve à préparer…" className="min-h-14 min-w-0 flex-1 resize-y rounded-xl border border-[#dbe3ee] bg-[#fafbfe] p-3 text-sm leading-6 text-[#2c4662] outline-none focus:border-[#566ff5] disabled:opacity-50" /><button type="submit" disabled={busy || loading || !input.trim() || !data} aria-label="Envoyer le message" className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#566ff5] text-white disabled:opacity-40">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}</button></form>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#8190a2]"><span>Un coach IA peut se tromper. Vérifie les informations importantes.</span><button type="button" onClick={() => setShowSources(!showSources)} className="flex items-center gap-1 font-semibold text-[#5267d9]"><BookOpen className="h-3.5 w-3.5" /> {showSources ? "Masquer les ressources" : "Voir mes ressources"}</button></div>
          </div>
          {showSources && <div className="border-t border-[#e3e9f2] bg-[#f8faff] p-5"><p className="text-sm font-semibold text-[#294762]">Ressources proposées pour ton cursus</p><p className="mt-1 text-xs leading-5 text-[#8190a2]">Les répertoires donnent accès aux documents officiels ; leur présence ne signifie pas que chaque rapport a été analysé.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{data?.sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[#dfe7f2] bg-white p-3 text-xs leading-5 text-[#405b78] hover:border-[#566ff5]"><span className="font-semibold">{source.title}</span><span className="mt-1 block text-[#8190a2]">{source.organization}{source.year ? ` · ${source.year}` : ""}</span></a>)}</div></div>}
        </div>
      </div>
    </div>
  );
}
