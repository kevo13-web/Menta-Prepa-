"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Brain,
  CheckCircle2,
  Flame,
  GraduationCap,
  PenLine,
  Send,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const coaches = [
  { name: "Mentor brutal", icon: Flame, tone: "direct, exigeant, sans dramatiser" },
  { name: "Coach bienveillant", icon: ShieldCheck, tone: "calme, précis, encourageant" },
  { name: "Préparateur khôlle", icon: GraduationCap, tone: "oral, relances, structure" },
  { name: "Correcteur dissertation", icon: PenLine, tone: "problématique, plan, transitions" },
  { name: "Coach anti-procrastination", icon: CheckCircle2, tone: "micro-actions, démarrage immédiat" },
];

type Message = {
  role: "user" | "assistant";
  content: string;
};

const initialMessages: Message[] = [
  {
    role: "assistant",
    content:
      "Dis-moi ce que tu dois préparer, ton énergie actuelle et ton délai. Je transforme ça en plan de travail exploitable.",
  },
];

function buildAnswer(coach: string, input: string) {
  return `Mode ${coach}. Voici un plan de travail réaliste pour les prochaines 48h : d’abord, clarifie le livrable exact en 10 minutes. Ensuite, bloque deux séances profondes sur la priorité la plus risquée. Termine chaque séance par une trace courte : erreurs, citations, questions possibles. Ton message mentionne “${input.slice(0, 64)}${input.length > 64 ? "..." : ""}”, donc je commencerais par découper ce point en trois tâches vérifiables.`;
}

export function CoachChat() {
  const [activeCoach, setActiveCoach] = useState(coaches[1]);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();

    if (!trimmed) {
      return;
    }

    setMessages((current) => [
      ...current,
      { role: "user", content: trimmed },
      { role: "assistant", content: buildAnswer(activeCoach.name, trimmed) },
    ]);
    setInput("");
  }

  return (
    <div className="grid min-h-[720px] overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] lg:grid-cols-[320px_1fr]">
      <aside className="border-b border-white/10 bg-ink/50 p-4 lg:border-b-0 lg:border-r">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage/16 text-sage">
            <Brain className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold text-frost">Type de coach</h2>
            <p className="text-xs text-muted">Choisis le ton utile maintenant.</p>
          </div>
        </div>
        <div className="grid gap-2">
          {coaches.map((coach) => {
            const Icon = coach.icon;
            const active = activeCoach.name === coach.name;

            return (
              <button
                key={coach.name}
                type="button"
                onClick={() => setActiveCoach(coach)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 text-left transition",
                  active
                    ? "border-mint/40 bg-mint/12 text-frost"
                    : "border-white/8 bg-white/[0.035] text-muted hover:border-white/16 hover:text-frost",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>
                  <span className="block text-sm font-semibold">{coach.name}</span>
                  <span className="block text-xs leading-5 opacity-75">{coach.tone}</span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="flex min-h-[620px] flex-col">
        <div className="border-b border-white/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-mint">
            Coaching IA fictif
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-frost">{activeCoach.name}</h2>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {messages.map((message, index) => (
            <motion.div
              key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[820px] rounded-lg border px-4 py-3 text-sm leading-6",
                  message.role === "user"
                    ? "border-mint/30 bg-mint/12 text-frost"
                    : "border-white/10 bg-white/[0.06] text-frost/88",
                )}
              >
                {message.role === "assistant" ? (
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-mint">
                    <Bot className="h-3.5 w-3.5" />
                    Menta Prépa
                  </div>
                ) : null}
                {message.content}
              </div>
            </motion.div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="border-t border-white/10 p-4">
          <div className="flex items-end gap-3 rounded-lg border border-white/10 bg-ink/70 p-2 focus-within:border-mint/50">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={2}
              placeholder="Ex : j’ai une khôlle de philo jeudi et je n’ai presque rien fiché..."
              className="min-h-12 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-frost outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              aria-label="Envoyer"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-frost text-ink transition hover:bg-white"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
