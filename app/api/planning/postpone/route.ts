import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type BlockType = "cours" | "revision" | "fichage" | "dissertation" | "oral" | "repos";

type Block = {
  id: string;
  label: string;
  time: string;
  duration: number;
  type: BlockType;
  subject?: string;
  reason?: string;
  sheet_id?: string;
};

type Day = {
  day: string;
  date?: string;
  focus: string;
  energy?: "léger" | "modéré" | "intense";
  blocks: Block[];
};

type Persisted = {
  plan: {
    summary?: string;
    strategy?: string;
    weekly_hours?: number;
    workload?: string;
    priority?: string;
    coaching?: string[];
    days: Day[];
    source?: string;
    model?: string;
    library_context?: unknown;
  };
  completedIds: string[];
  inputs?: {
    studyType?: string;
    track?: string;
    courseHours?: string;
    freeHours?: string;
    deadlines?: string;
    fatigue?: number;
    goal?: string;
  };
};

type Payload = {
  blockId?: string;
  nowLocal?: string;
  today?: string;
};

const PROGRESS_KEY = "planning-ai-current";
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"] as const;

function clean(value: unknown, max = 5000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function outputText(data: any) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) return data.output_text;
  for (const item of data?.output ?? []) {
    if (item?.type !== "message") continue;
    for (const content of item?.content ?? []) {
      if (content?.type === "output_text" && typeof content.text === "string") return content.text;
    }
  }
  return "";
}

function timeMinutes(value: string) {
  const match = String(value || "").match(/(\d{1,2})\s*[:hH]\s*(\d{2})?/);
  if (!match) return null;
  const hour = Math.max(0, Math.min(23, Number(match[1])));
  const minute = Math.max(0, Math.min(59, Number(match[2] || 0)));
  return hour * 60 + minute;
}

function sortBlocks(blocks: Block[]) {
  return [...blocks].sort((a, b) => (timeMinutes(a.time) ?? 1440) - (timeMinutes(b.time) ?? 1440));
}

function overlaps(day: Day, block: Block, ignoredId: string) {
  const start = timeMinutes(block.time);
  if (start === null) return false;
  const end = start + Math.max(10, Number(block.duration) || 0);
  return day.blocks.some((other) => {
    if (other.id === ignoredId) return false;
    const otherStart = timeMinutes(other.time);
    if (otherStart === null) return false;
    const otherEnd = otherStart + Math.max(10, Number(other.duration) || 0);
    return start < otherEnd && otherStart < end;
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  const blockId = clean(body.blockId, 300);
  const nowLocal = clean(body.nowLocal, 80) || new Date().toISOString();
  const today = clean(body.today, 80) || "jour actuel non précisé";
  if (!blockId) return NextResponse.json({ error: "BLOCK_REQUIRED" }, { status: 400 });

  const { data, error } = await supabase
    .from("user_progress")
    .select("value")
    .eq("user_id", user.id)
    .eq("key", PROGRESS_KEY)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "PLAN_READ_FAILED" }, { status: 500 });
  const saved = data?.value as Persisted | null;
  if (!saved?.plan?.days?.length) return NextResponse.json({ error: "NO_PLAN" }, { status: 404 });

  if ((saved.completedIds || []).includes(blockId)) return NextResponse.json({ error: "BLOCK_COMPLETED" }, { status: 409 });

  let sourceIndex = -1;
  let sourceBlock: Block | null = null;
  saved.plan.days.forEach((day, index) => {
    const found = day.blocks.find((block) => block.id === blockId);
    if (found) {
      sourceIndex = index;
      sourceBlock = found;
    }
  });

  if (!sourceBlock || sourceIndex < 0) return NextResponse.json({ error: "BLOCK_NOT_FOUND" }, { status: 404 });
  if (sourceBlock.type === "cours" || sourceBlock.type === "repos") return NextResponse.json({ error: "BLOCK_LOCKED" }, { status: 409 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI_PLANNER_NOT_CONFIGURED" }, { status: 503 });
  const model = process.env.OPENAI_PLANNING_MODEL || process.env.OPENAI_GRADING_MODEL || "gpt-5.6-terra";
  const inputs = saved.inputs || {};

  const instructions = `Tu es Menta Daily Planner. L'étudiant demande explicitement de reporter UNE SEULE tâche de son planning.

Règles absolues :
1. Tu ne modifies que le bloc TARGET_BLOCK. Tous les autres blocs sont verrouillés.
2. Trouve le meilleur créneau futur dans la semaine actuelle en tenant compte des cours, autres blocs, disponibilités, échéances, objectif et fatigue.
3. Ne place jamais la tâche dans le passé par rapport à NOW_LOCAL.
4. Ne crée aucun chevauchement avec un autre bloc du planning.
5. Conserve le même objectif académique. Tu peux raccourcir légèrement la durée si c'est pédagogiquement raisonnable.
6. Si aucun report utile n'est possible avant la fin de la semaine, choisis action "abandonné" plutôt que de surcharger artificiellement l'étudiant.
7. Pour action "déplacé" ou "raccourci", to_day doit être un jour de la semaine et to_time une heure précise au format HH:MM.
8. Explique le choix en une phrase courte dans reason.
9. Réponds uniquement dans le JSON imposé, en français.`;

  const input = `NOW_LOCAL\n${nowLocal}\n\nJOUR ACTUEL\n${today}\n\nCURSUS\n${clean(inputs.studyType, 200) || "Non précisé"} · ${clean(inputs.track, 260) || "Non précisé"}\n\nFATIGUE\n${Math.min(5, Math.max(1, Number(inputs.fatigue) || 3))}/5\n\nDISPONIBILITÉS\n${clean(inputs.freeHours, 5000) || "Non précisées"}\n\nEMPLOI DU TEMPS FIXE\n${clean(inputs.courseHours, 9000) || "Non précisé"}\n\nÉCHÉANCES\n${clean(inputs.deadlines, 5000) || "Aucune"}\n\nOBJECTIF HEBDOMADAIRE\n${clean(inputs.goal, 5000) || "Non précisé"}\n\nTARGET_BLOCK\n${JSON.stringify({ source_day: saved.plan.days[sourceIndex]?.day, ...sourceBlock })}\n\nPLANNING COMPLET VERROUILLÉ\n${JSON.stringify(saved.plan.days)}`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        reasoning: { effort: "medium" },
        store: false,
        instructions,
        input,
        text: {
          format: {
            type: "json_schema",
            name: "daily_task_postpone",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                action: { type: "string", enum: ["déplacé", "raccourci", "abandonné"] },
                to_day: { type: "string", enum: DAYS },
                to_time: { type: "string" },
                duration: { type: "number", minimum: 10, maximum: 180 },
                reason: { type: "string" }
              },
              required: ["action", "to_day", "to_time", "duration", "reason"]
            }
          },
          verbosity: "low"
        }
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Menta postpone error", response.status, detail.slice(0, 1200));
      return NextResponse.json({ error: "AI_POSTPONE_UNAVAILABLE" }, { status: 502 });
    }

    const raw = outputText(await response.json());
    if (!raw) return NextResponse.json({ error: "AI_POSTPONE_EMPTY" }, { status: 502 });
    const result = JSON.parse(raw) as { action: "déplacé" | "raccourci" | "abandonné"; to_day: string; to_time: string; duration: number; reason: string };

    const nextDays = saved.plan.days.map((day) => ({ ...day, blocks: day.blocks.filter((block) => block.id !== blockId) }));

    if (result.action !== "abandonné") {
      const targetIndex = nextDays.findIndex((day) => day.day === result.to_day);
      if (targetIndex < 0) return NextResponse.json({ error: "AI_POSTPONE_INVALID_DAY" }, { status: 502 });

      const moved: Block = {
        ...sourceBlock,
        time: result.to_time,
        duration: Math.max(10, Math.min(180, Number(result.duration) || sourceBlock.duration)),
        reason: `Report Menta : ${result.reason}`,
      };
      if (overlaps(nextDays[targetIndex], moved, blockId)) return NextResponse.json({ error: "AI_POSTPONE_CONFLICT" }, { status: 502 });
      nextDays[targetIndex] = { ...nextDays[targetIndex], blocks: sortBlocks([...nextDays[targetIndex].blocks, moved]) };
    }

    const nextSaved: Persisted = {
      ...saved,
      plan: {
        ...saved.plan,
        days: nextDays,
        source: "ai-daily-adapted",
        model,
      },
    };

    const { error: saveError } = await supabase.from("user_progress").upsert(
      { user_id: user.id, key: PROGRESS_KEY, value: nextSaved, updated_at: new Date().toISOString() },
      { onConflict: "user_id,key" },
    );
    if (saveError) return NextResponse.json({ error: "PLAN_SAVE_FAILED" }, { status: 500 });

    return NextResponse.json({
      ok: true,
      message: result.action === "abandonné" ? `« ${sourceBlock.label} » a été retiré de cette semaine.` : `« ${sourceBlock.label} » est reporté à ${result.to_day} ${result.to_time}.`,
      reason: result.reason,
      action: result.action,
      saved: nextSaved,
    });
  } catch (cause) {
    console.error("Menta postpone failed", cause);
    return NextResponse.json({ error: "AI_POSTPONE_FAILED" }, { status: 502 });
  }
}
