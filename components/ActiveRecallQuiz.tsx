"use client";

import { CheckCircle2, RotateCcw, Sparkles, Trophy, XCircle } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type { RecallQuestion } from "@/data/evilStudy";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function grade(question: RecallQuestion, answer: string) {
  const normalizedAnswer = normalize(answer);
  const matched = question.keywordGroups.map((group) =>
    group.some((keyword) => normalizedAnswer.includes(normalize(keyword))),
  );
  const score = matched.filter(Boolean).length;
  const required = question.minMatches ?? Math.max(1, Math.ceil(question.keywordGroups.length * 0.6));
  return {
    correct: score >= required,
    score,
    required,
    missing: question.keywordGroups
      .filter((_, index) => !matched[index])
      .map((group) => group[0]),
  };
}

type Feedback = ReturnType<typeof grade> & { answer: string };

export function ActiveRecallQuiz({
  questions,
  title,
}: {
  questions: RecallQuestion[];
  title: string;
}) {
  const [queue, setQueue] = useState(() => questions.map((_, index) => index));
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [attempts, setAttempts] = useState<Record<number, number>>({});
  const [firstPassCorrect, setFirstPassCorrect] = useState<number[]>([]);
  const [mastered, setMastered] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const currentIndex = queue[0] ?? 0;
  const current = questions[currentIndex];
  const currentAttempt = attempts[currentIndex] ?? 0;
  const retryCount = useMemo(
    () => Object.values(attempts).reduce((sum, value) => sum + Math.max(0, value - 1), 0),
    [attempts],
  );

  function restart() {
    setQueue(questions.map((_, index) => index));
    setAnswer("");
    setFeedback(null);
    setAttempts({});
    setFirstPassCorrect([]);
    setMastered([]);
    setFinished(false);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!answer.trim() || feedback || !current) return;

    const result = grade(current, answer);
    const attemptNumber = currentAttempt + 1;
    setAttempts((previous) => ({ ...previous, [currentIndex]: attemptNumber }));
    if (attemptNumber === 1 && result.correct) {
      setFirstPassCorrect((previous) => [...previous, currentIndex]);
    }
    if (result.correct && !mastered.includes(currentIndex)) {
      setMastered((previous) => [...previous, currentIndex]);
    }
    setFeedback({ ...result, answer });
  }

  function next() {
    if (!feedback) return;
    const remaining = queue.slice(1);
    const nextQueue = feedback.correct ? remaining : [...remaining, currentIndex];
    setAnswer("");
    setFeedback(null);

    if (nextQueue.length === 0) {
      setQueue([]);
      setFinished(true);
      return;
    }
    setQueue(nextQueue);
  }

  if (finished) {
    const firstScore = Math.round((firstPassCorrect.length / questions.length) * 100);
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center text-center">
        <div className="grid h-16 w-16 place-items-center rounded-3xl bg-[#fff6d4] text-[#c79820]">
          <Trophy className="h-8 w-8" />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#566ff5]">Maîtrise complète</p>
        <h3 className="mt-2 display-serif text-3xl font-semibold text-[#182b49]">100 % maîtrisé</h3>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#64778c]">
          Premier passage : <strong>{firstPassCorrect.length}/{questions.length}</strong> ({firstScore} %). Les erreurs ont été remises dans la file jusqu'à obtention d'une réponse correcte.
        </p>
        {retryCount > 0 ? <p className="mt-2 text-xs font-semibold text-[#b4674e]">{retryCount} reprise{retryCount > 1 ? "s" : ""} nécessaire{retryCount > 1 ? "s" : ""}</p> : null}
        <button
          type="button"
          onClick={restart}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#566ff5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#465de4]"
        >
          <RotateCcw className="h-4 w-4" /> Refaire le test
        </button>
      </div>
    );
  }

  if (!current) return null;

  const uniqueSeen = Object.keys(attempts).length;
  const progress = Math.round((mastered.length / questions.length) * 100);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-[#6b7e92]">
          <span>{mastered.length}/{questions.length} notions maîtrisées</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e8edf7]">
          <div className="h-full rounded-full bg-gradient-to-r from-[#566ff5] to-[#58d6b1] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-5 flex-1 overflow-y-auto pr-1">
        <div className="rounded-3xl border border-[#566ff5]/14 bg-[#f7f9ff] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#566ff5]">
              <Sparkles className="h-3.5 w-3.5" /> Rappel actif · réponse libre
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[#718196] shadow-sm">
              {currentAttempt > 0 ? `Reprise ${currentAttempt}` : `Question ${Math.min(uniqueSeen + 1, questions.length)}`}
            </span>
          </div>
          <h4 className="mt-4 display-serif text-xl font-semibold leading-snug text-[#1c3554]">{current.prompt}</h4>
          <p className="mt-3 text-xs leading-5 text-[#75869a]">Aucun QCM : formule ta réponse de mémoire, avec tes propres mots.</p>
        </div>

        <form onSubmit={submit} className="mt-4">
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            disabled={Boolean(feedback)}
            placeholder="Écris ta réponse sans regarder la fiche…"
            rows={7}
            className="w-full resize-none rounded-2xl border border-[#566ff5]/14 bg-white/90 p-4 text-sm leading-6 text-[#263f5d] outline-none transition placeholder:text-[#9aa7b5] focus:border-[#566ff5]/40 focus:ring-4 focus:ring-[#566ff5]/8 disabled:bg-[#fafbfe]"
          />

          {!feedback ? (
            <button
              type="submit"
              disabled={!answer.trim()}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-[#566ff5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#465de4] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Valider ma réponse
            </button>
          ) : null}
        </form>

        {feedback ? (
          <div className={`mt-4 rounded-2xl border p-4 ${feedback.correct ? "border-[#58d6b1]/28 bg-[#eafaf5]" : "border-[#ff8c6b]/25 bg-[#fff1ec]"}`}>
            <div className={`flex items-center gap-2 text-sm font-bold ${feedback.correct ? "text-[#287a64]" : "text-[#b65f43]"}`}>
              {feedback.correct ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              {feedback.correct ? "Réponse validée" : "À revoir — cette question reviendra"}
            </div>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-[#697b8f]">Réponse attendue</p>
            <p className="mt-2 text-sm leading-6 text-[#40566e]">{current.expected}</p>
            <p className="mt-3 text-xs leading-5 text-[#738396]">{current.explanation}</p>
            {!feedback.correct && feedback.missing.length > 0 ? (
              <div className="mt-3 rounded-xl bg-white/65 p-3 text-xs leading-5 text-[#805f54]">
                <strong>Concepts encore absents :</strong> {feedback.missing.slice(0, 4).join(" · ")}
              </div>
            ) : null}
            <button
              type="button"
              onClick={next}
              className={`mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white ${feedback.correct ? "bg-[#43ae91]" : "bg-[#e67552]"}`}
            >
              {feedback.correct ? "Question suivante" : "Continuer — elle reviendra plus tard"}
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-3 shrink-0 border-t border-[#566ff5]/10 pt-3 text-center text-[11px] leading-5 text-[#7d8b9c]">
        {title} · les erreurs sont automatiquement reprogrammées jusqu'à maîtrise.
      </div>
    </div>
  );
}