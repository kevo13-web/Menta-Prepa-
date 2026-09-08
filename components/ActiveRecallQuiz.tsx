"use client";

import { Brain, CheckCircle2, Loader2, RotateCcw, Sparkles, Trophy, XCircle } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { RecallQuestion } from "@/data/evilStudy";

type GradeStatus = "correct" | "partial" | "incorrect";

type Feedback = {
  status: GradeStatus;
  confidence: number;
  feedback: string;
  missing_points: string[];
  strengths: string[];
  improved_answer: string;
  source: "ai" | "local";
};

type SavedQuizProgress = {
  queue: number[];
  answer: string;
  feedback: Feedback | null;
  attempts: Record<number, number>;
  firstPassGrades: Record<number, GradeStatus>;
  mastered: number[];
  finished: boolean;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function localFallback(question: RecallQuestion, answer: string): Feedback {
  const normalizedAnswer = normalize(answer);
  const matched = question.keywordGroups.map((group) =>
    group.some((keyword) => normalizedAnswer.includes(normalize(keyword))),
  );
  const score = matched.filter(Boolean).length;
  const required = question.minMatches ?? Math.max(1, Math.ceil(question.keywordGroups.length * 0.6));
  const partialRequired = Math.max(1, Math.ceil(required * 0.55));
  const missing = question.keywordGroups
    .filter((_, index) => !matched[index])
    .map((group) => group[0]);

  const status: GradeStatus = score >= required ? "correct" : score >= partialRequired ? "partial" : "incorrect";

  return {
    status,
    confidence: 0.55,
    feedback:
      status === "correct"
        ? "L'essentiel est présent et les concepts décisifs sont correctement mobilisés."
        : status === "partial"
          ? `Presque juste — cependant il faut encore préciser ${missing.slice(0, 3).join(", ") || "un élément important de la distinction"}.`
          : "Le noyau attendu n'apparaît pas encore suffisamment dans la réponse.",
    missing_points: missing.slice(0, 5),
    strengths: question.keywordGroups.filter((_, index) => matched[index]).slice(0, 4).map((group) => group[0]),
    improved_answer: question.expected,
    source: "local",
  };
}

async function semanticGrade(question: RecallQuestion, answer: string): Promise<Feedback> {
  try {
    const response = await fetch("/api/quiz/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question.prompt,
        expected: question.expected,
        explanation: question.explanation,
        answer,
      }),
    });

    if (!response.ok) throw new Error("AI grader unavailable");
    const result = await response.json();
    if (!["correct", "partial", "incorrect"].includes(result.status)) throw new Error("Invalid grade");

    return {
      status: result.status,
      confidence: typeof result.confidence === "number" ? result.confidence : 0.8,
      feedback: result.feedback || "Réponse analysée.",
      missing_points: Array.isArray(result.missing_points) ? result.missing_points : [],
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      improved_answer: result.improved_answer || question.expected,
      source: "ai",
    };
  } catch {
    return localFallback(question, answer);
  }
}

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
  const [grading, setGrading] = useState(false);
  const [attempts, setAttempts] = useState<Record<number, number>>({});
  const [firstPassGrades, setFirstPassGrades] = useState<Record<number, GradeStatus>>({});
  const [mastered, setMastered] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [progressReady, setProgressReady] = useState(false);

  const storageKey = useMemo(
    () => `menta-active-recall-v1:${questions.map((question) => question.id).join("|")}`,
    [questions],
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;

      const saved = JSON.parse(raw) as Partial<SavedQuizProgress>;
      if (Array.isArray(saved.queue)) {
        setQueue(saved.queue.filter((index) => Number.isInteger(index) && index >= 0 && index < questions.length));
      }
      if (typeof saved.answer === "string") setAnswer(saved.answer);
      if (saved.feedback === null || (saved.feedback && typeof saved.feedback === "object")) {
        setFeedback((saved.feedback as Feedback | null) ?? null);
      }
      if (saved.attempts && typeof saved.attempts === "object") setAttempts(saved.attempts);
      if (saved.firstPassGrades && typeof saved.firstPassGrades === "object") setFirstPassGrades(saved.firstPassGrades);
      if (Array.isArray(saved.mastered)) {
        setMastered(saved.mastered.filter((index) => Number.isInteger(index) && index >= 0 && index < questions.length));
      }
      if (typeof saved.finished === "boolean") setFinished(saved.finished);
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      setProgressReady(true);
    }
  }, [questions.length, storageKey]);

  useEffect(() => {
    if (!progressReady) return;

    const progress: SavedQuizProgress = {
      queue,
      answer,
      feedback,
      attempts,
      firstPassGrades,
      mastered,
      finished,
    };

    window.localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [answer, attempts, feedback, finished, firstPassGrades, mastered, progressReady, queue, storageKey]);

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
    setGrading(false);
    setAttempts({});
    setFirstPassGrades({});
    setMastered([]);
    setFinished(false);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!answer.trim() || feedback || grading || !current) return;

    setGrading(true);
    const result = await semanticGrade(current, answer);
    setGrading(false);

    const attemptNumber = currentAttempt + 1;
    setAttempts((previous) => ({ ...previous, [currentIndex]: attemptNumber }));
    if (attemptNumber === 1) {
      setFirstPassGrades((previous) => ({ ...previous, [currentIndex]: result.status }));
    }
    if (result.status === "correct" && !mastered.includes(currentIndex)) {
      setMastered((previous) => [...previous, currentIndex]);
    }
    setFeedback(result);
  }

  function next() {
    if (!feedback) return;
    const remaining = queue.slice(1);
    const nextQueue = feedback.status === "correct" ? remaining : [...remaining, currentIndex];
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
    const points = Object.values(firstPassGrades).reduce(
      (sum, grade) => sum + (grade === "correct" ? 1 : grade === "partial" ? 0.5 : 0),
      0,
    );
    const firstScore = Math.round((points / questions.length) * 100);
    const partialCount = Object.values(firstPassGrades).filter((grade) => grade === "partial").length;

    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center text-center">
        <div className="grid h-16 w-16 place-items-center rounded-3xl bg-[#fff6d4] text-[#c79820]">
          <Trophy className="h-8 w-8" />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#566ff5]">Maîtrise complète</p>
        <h3 className="mt-2 display-serif text-3xl font-semibold text-[#182b49]">100 % maîtrisé</h3>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#64778c]">
          Score pondéré au premier passage : <strong>{firstScore} %</strong>. Une réponse « presque juste » compte à moitié, puis revient dans la file jusqu'à maîtrise complète.
        </p>
        {partialCount > 0 ? <p className="mt-2 text-xs font-semibold text-[#9a7828]">{partialCount} réponse{partialCount > 1 ? "s" : ""} presque juste{partialCount > 1 ? "s" : ""} au premier passage</p> : null}
        {retryCount > 0 ? <p className="mt-1 text-xs font-semibold text-[#b4674e]">{retryCount} reprise{retryCount > 1 ? "s" : ""} nécessaire{retryCount > 1 ? "s" : ""}</p> : null}
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
  const statusStyles = feedback?.status === "correct"
    ? {
        shell: "border-[#58d6b1]/28 bg-[#eafaf5]",
        text: "text-[#287a64]",
        button: "bg-[#43ae91]",
      }
    : feedback?.status === "partial"
      ? {
          shell: "border-[#f0c95c]/38 bg-[#fff8dc]",
          text: "text-[#8c7125]",
          button: "bg-[#c89b27]",
        }
      : {
          shell: "border-[#ff8c6b]/25 bg-[#fff1ec]",
          text: "text-[#b65f43]",
          button: "bg-[#e67552]",
        };

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
          <p className="mt-3 text-xs leading-5 text-[#75869a]">Aucun QCM : formule ta réponse de mémoire, avec tes propres mots. La correction juge le sens, pas une liste de mots-clés.</p>
        </div>

        <form onSubmit={submit} className="mt-4">
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            disabled={Boolean(feedback) || grading}
            placeholder="Écris ta réponse sans regarder la fiche…"
            rows={7}
            className="w-full resize-none rounded-2xl border border-[#566ff5]/14 bg-white/90 p-4 text-sm leading-6 text-[#263f5d] outline-none transition placeholder:text-[#9aa7b5] focus:border-[#566ff5]/40 focus:ring-4 focus:ring-[#566ff5]/8 disabled:bg-[#fafbfe]"
          />

          {!feedback ? (
            <button
              type="submit"
              disabled={!answer.trim() || grading}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#566ff5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#465de4] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {grading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyse sémantique de ta réponse…</> : "Valider ma réponse"}
            </button>
          ) : null}
        </form>

        {feedback ? (
          <div className={`mt-4 rounded-2xl border p-4 ${statusStyles.shell}`}>
            <div className={`flex items-center gap-2 text-sm font-bold ${statusStyles.text}`}>
              {feedback.status === "correct" ? <CheckCircle2 className="h-5 w-5" /> : feedback.status === "partial" ? <Brain className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              {feedback.status === "correct"
                ? "Réponse validée"
                : feedback.status === "partial"
                  ? "Presque juste — à compléter"
                  : "À revoir — cette question reviendra"}
            </div>

            <p className="mt-3 text-sm font-medium leading-6 text-[#40566e]">{feedback.feedback}</p>

            {feedback.strengths.length > 0 ? (
              <div className="mt-3 rounded-xl bg-white/65 p-3 text-xs leading-5 text-[#4f6e65]">
                <strong>Ce qui est juste :</strong> {feedback.strengths.join(" · ")}
              </div>
            ) : null}

            {feedback.missing_points.length > 0 ? (
              <div className="mt-3 rounded-xl bg-white/65 p-3 text-xs leading-5 text-[#805f54]">
                <strong>{feedback.status === "partial" ? "À ajouter ou modifier :" : "Concepts encore absents :"}</strong> {feedback.missing_points.join(" · ")}
              </div>
            ) : null}

            <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[#697b8f]">
              {feedback.status === "correct" ? "Réponse de référence" : "Réponse améliorée"}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#40566e]">{feedback.improved_answer}</p>

            <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8794a3]">
              <Brain className="h-3.5 w-3.5" />
              {feedback.source === "ai" ? "Correction sémantique par IA" : "Mode de secours local"}
            </div>

            <button
              type="button"
              onClick={next}
              className={`mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white ${statusStyles.button}`}
            >
              {feedback.status === "correct"
                ? "Question suivante"
                : feedback.status === "partial"
                  ? "Continuer — je la reprendrai plus tard"
                  : "Continuer — elle reviendra plus tard"}
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-3 shrink-0 border-t border-[#566ff5]/10 pt-3 text-center text-[11px] leading-5 text-[#7d8b9c]">
        {title} · progression sauvegardée automatiquement ; tu peux consulter la fiche puis reprendre exactement où tu en étais.
      </div>
    </div>
  );
}