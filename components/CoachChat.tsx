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
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const coaches = [
  { name: "Mentor brutal", icon: Flame, tone: "direct, exigeant, sans dramatiser" },
  { name: "Coach bienveillant", icon: ShieldCheck, tone: "calme, précis, encourageant" },
  { name: "Préparateur khôlle", icon: GraduationCap, tone: "oral, relances, structure" },
  { name: "Correcteur dissertation", icon: PenLine, tone: "problématique, plan, transitions" },
  { name: "Coach anti-procrastination", icon: CheckCircle2, tone: "micro-actions, démarrage immédiat" },
];

const suggestions = [
  "J’ai une khôlle de philo jeudi",
  "Je dois reprendre mon retard cette semaine",
  "Aide-moi à construire un plan de dissertation",
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

  function submit(content: string) {
    const trimmed = content.trim();
    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      { role: "user", content: trimmed },
      { role: "assistant", content: buildAnswer(activeCoach.name, trimmed) },
    ]);
    setInput("");
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(input);
  }

  return (
    <div className="grid min-h-[620px] overflow-hidden rounded-[28px] border border-[#d6e0e7] bg-white/65 shadow-[0_18px_55px_rgba(53,82,110,0.07)] lg:grid-cols-[290px_1fr]">
      <aside className="border-b border-[#dbe3e8] bg-[#f6f1e8]/90 p-5 lg:border-b-0 lg:border-r">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dceaf4] text-[#4f83b6]">
            <Brain className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-serif text-xl font-semibold text-frost">Type de coach</h2>
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
                  "flex items-center gap-3 rounded-xl border p-3 text-left transition",
                  active
                    ? "border-[#8fb4cf] bg-[#e5f0f7] text-frost shadow-[0_6px_18px_rgba(53,82,110,0.05)]"
                    : "border-[#dddeda] bg-white/55 text-muted hover:border-[#b9ccd9] hover:bg-white/80 hover:text-frost",
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

      <section className="flex min-h-[560px] flex-col bg-[linear-gradient(180deg,rgba(235,244,249,0.6),rgba(255,255,255,0.72))]">
        <div className="border-b border-[#dbe3e8] px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4f83b6]">Coaching IA fictif</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-frost">{activeCoach.name}</h2>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-7">
          {messages.map((message, index) => (
            <motion.div
              key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[760px] rounded-2xl border px-4 py-3 text-sm leading-6 shadow-[0_6px_18px_rgba(53,82,110,0.04)]",
                  message.role === "user"
                    ? "border-[#8fb4cf] bg-[#dceaf4] text-frost"
                    : "border-[#d5e0e7] bg-[#fbf8f2] text-frost/90",
                )}
              >
                {message.role === "assistant" ? (
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#4f83b6]">
                    <Bot className="h-3.5 w-3.5" />
                    Menta Prépa
                  </div>
                ) : null}
                {message.content}
              </div>
            </motion.div>
          ))}

          {messages.length === 1 ? (
            <div className="pt-3">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#7891a5]">
                <Sparkles className="h-3.5 w-3.5" />
                Idées pour démarrer
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => submit(suggestion)}
                    className="rounded-full border border-[#cfdce5] bg-white/70 px-4 py-2 text-sm text-frost transition hover:border-[#8fb4cf] hover:bg-[#eef6fa]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <form onSubmit={sendMessage} className="border-t border-[#dbe3e8] bg-[#faf7f1]/80 p-4">
          <div className="flex items-end gap-3 rounded-2xl border border-[#d3dee6] bg-white/80 p-2 shadow-[0_6px_20px_rgba(53,82,110,0.04)] focus-within:border-[#79a6cb] focus-within:ring-2 focus-within:ring-[#8db5d8]/20">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={2}
              placeholder="Ex : j’ai une khôlle de philo jeudi et je n’ai presque rien fiché..."
              className="min-h-12 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-frost outline-none placeholder:text-[#8a98a5]"
            />
            <button
              type="submit"
              aria-label="Envoyer"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#173f66] text-white transition hover:bg-[#245783]"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
