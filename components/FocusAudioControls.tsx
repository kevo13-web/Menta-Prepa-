"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, BellOff, Check, ChevronDown, Volume2, VolumeX, X } from "lucide-react";
import { usePomodoro, type FocusAnnouncement } from "@/components/PomodoroProvider";

export function FocusAudioControls() {
  const pathname = usePathname();
  const { ready, phase, running, countdown, audioSettings, audioReady, announcement, updateAudioSetting, enableAudio, testAudio } = usePomodoro();
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<FocusAnnouncement | null>(null);
  const [audioError, setAudioError] = useState(false);
  const [testing, setTesting] = useState(false);
  const onFocusPage = pathname === "/focus";

  useEffect(() => {
    if (!announcement) return;
    setNotice(announcement);
    const timeout = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [announcement]);

  useEffect(() => {
    if (!onFocusPage) setOpen(false);
  }, [onFocusPage]);

  async function activateSound() {
    const ok = await enableAudio();
    setAudioError(!ok);
  }

  async function preview() {
    setTesting(true);
    const ok = await testAudio();
    setAudioError(!ok);
    setTesting(false);
  }

  if (!ready) return null;
  const counting = countdown !== null;
  const noticeVisible = !counting && notice && (notice.kind !== "warning" || running);
  const showPanel = onFocusPage && open;

  return (
    <>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement?.message || ""}</div>
      <div className="pointer-events-none fixed bottom-3 left-3 right-3 z-[120] mx-auto flex max-w-sm flex-col gap-2 sm:bottom-5 sm:left-auto sm:right-5 sm:mx-0 sm:w-[360px]">
        {counting ? (
          <div className="pointer-events-auto overflow-hidden rounded-[1.5rem] border border-[#566ff5]/20 bg-white/95 p-4 shadow-[0_16px_45px_rgba(32,50,83,.16)] backdrop-blur-xl" role="timer" aria-label={phase === "work" ? "Décompte avant la pause" : "Décompte avant la reprise"}>
            <div className="flex items-center gap-3">
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${phase === "work" ? "bg-[#e8faf4] text-[#31856f]" : "bg-[#edf1ff] text-[#5267d9]"}`}><Bell className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70849a]">Menta Focus</p><p className="mt-0.5 text-sm font-semibold text-[#233e5a]">{phase === "work" ? "La pause approche" : "La reprise approche"}</p><p className="mt-1 text-xs text-[#70849a]">{phase === "work" ? "Termine tranquillement ta tâche." : "Prépare-toi à te reconcentrer."}</p></div>
              <div className="text-right"><span className="block text-4xl font-semibold tabular-nums text-[#1d3552]">{countdown}</span><span className="text-[10px] font-semibold text-[#8a9aab]">secondes</span></div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e6eaf1]"><div className="h-full rounded-full bg-[#566ff5] transition-[width] duration-200" style={{ width: `${100 * countdown / Math.max(1, audioSettings.warningSeconds)}%` }} /></div>
          </div>
        ) : noticeVisible ? (
          <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-[#58d6b1]/25 bg-white/95 p-4 shadow-[0_12px_35px_rgba(32,50,83,.12)] backdrop-blur-xl"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e8faf4] text-[#31856f]"><Check className="h-5 w-5" /></span><p className="text-sm font-semibold leading-5 text-[#294762]">{notice.message}</p></div>
        ) : null}

        {showPanel ? (
          <div className="pointer-events-auto rounded-[1.5rem] border border-[#566ff5]/18 bg-white/98 p-4 shadow-[0_18px_55px_rgba(32,50,83,.16)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-[#1d3552]">Sons et transitions</h3><p className="mt-1 text-xs leading-5 text-[#72859a]">Un signal doux avant et au début de chaque nouvelle phase.</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Fermer les réglages sonores" className="rounded-lg p-1.5 text-[#71849a] hover:bg-[#f0f3fa]"><X className="h-4 w-4" /></button></div>
            <label className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-[#f6f8ff] p-3"><span className="flex items-center gap-2 text-sm font-semibold text-[#304b68]">{audioSettings.enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />} Sons activés</span><input type="checkbox" className="h-5 w-5 accent-[#566ff5]" checked={audioSettings.enabled} onChange={(event) => { updateAudioSetting("enabled", event.target.checked); setAudioError(false); }} /></label>
            <label className="mt-4 block text-xs font-semibold text-[#405b76]">Prévenir avant la transition</label><select value={audioSettings.warningSeconds} onChange={(event) => updateAudioSetting("warningSeconds", Number(event.target.value))} className="mt-2 min-h-10 w-full rounded-xl border border-[#dce4ee] bg-white px-3 text-sm text-[#294762] outline-none focus:border-[#566ff5]"><option value={0}>Sans compte à rebours</option><option value={3}>3 secondes</option><option value={5}>5 secondes</option><option value={10}>10 secondes</option><option value={15}>15 secondes</option><option value={30}>30 secondes</option></select>
            <label className="mt-4 flex justify-between text-xs font-semibold text-[#405b76]"><span>Volume</span><span>{audioSettings.volume}%</span></label><input type="range" min={0} max={100} step={5} value={audioSettings.volume} onChange={(event) => updateAudioSetting("volume", Number(event.target.value))} className="mt-2 w-full accent-[#566ff5]" aria-label="Volume des sons Focus" />
            <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => void preview()} disabled={testing} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#566ff5] px-3 text-xs font-semibold text-white disabled:opacity-50"><Bell className="h-4 w-4" /> {testing ? "Test…" : "Tester le son"}</button>{audioSettings.enabled && !audioReady ? <button type="button" onClick={() => void activateSound()} className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-[#566ff5]/20 px-3 text-xs font-semibold text-[#5267d9]">Activer l’audio</button> : null}</div>
            <p className="mt-3 text-[11px] leading-5 text-[#8090a2]">{audioError ? "Le navigateur bloque l’audio. Vérifie le son de l’appareil, puis réessaie après une interaction avec la page." : audioSettings.enabled && audioReady ? "Audio prêt. Les signaux continuent lorsque tu navigues dans Menta, tant que l’onglet reste ouvert." : audioSettings.enabled ? "Clique sur Activer l’audio ou démarre le timer pour autoriser les sons." : "Les sons sont coupés. Le décompte visuel reste disponible."}</p>
          </div>
        ) : null}

        {onFocusPage ? <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="pointer-events-auto ml-auto inline-flex min-h-10 items-center gap-2 rounded-full border border-[#566ff5]/15 bg-white/95 px-4 text-xs font-semibold text-[#45617b] shadow-[0_8px_24px_rgba(32,50,83,.1)] backdrop-blur-xl hover:bg-white">{audioSettings.enabled ? <Volume2 className="h-4 w-4" /> : <BellOff className="h-4 w-4" />} Sons Focus <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} /></button> : null}
      </div>
    </>
  );
}
