import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type BlockType = "cours" | "revision" | "fichage" | "dissertation" | "oral" | "repos";

type ScheduleBlock = {
  id: string;
  label: string;
  time: string;
  duration: number;
  type: BlockType;
  subject?: string;
  reason?: string;
  sheet_id?: string;
};

type DaySchedule = {
  day: string;
  date?: string;
  focus: string;
  energy?: "léger" | "modéré" | "intense";
  blocks: ScheduleBlock[];
};

type Plan = {
  summary: string;
  strategy: string;
  weekly_hours: number;
  workload: "légère" | "équilibrée" | "soutenue";
  priority: string;
  coaching: string[];
  days: DaySchedule[];
  source?: string;
  model?: string;
  library_context?: unknown;
};

type Inputs = {
  studyType?: string;
  track?: string;
  subjectsInput?: string;
  courseHours?: string;
  freeHours?: string;
  deadlines?: string;
  fatigue?: number;
  goal?: string;
  workStyle?: string;
};

type PersistedPlan = {
  plan: Plan;
  completedIds: string[];
  inputs?: Inputs;
};

type Payload = {
  mode?: "missed" | "no_time_today" | "fatigue" | "constraint" | "manual";
  reason?: string;
  fatigue?: number;
  nowLocal?: string;
  today?: string;
};

type StudySheetRow = {
  id: string;
  title: string;
  subject: string;
  chapter: string | null;
  mastery: number | null;
};

const PROGRESS_KEY = "planning-ai-current";

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

function clampMastery(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function minutesFromTime(value: string) {
  const match = String(value || "").match(/(\d{1,2})\s*[:hH]\s*(\d{2})?/);
  if (!match) return 24 * 60;
  const hours = Math.max(0, Math.min(23, Number(match[1])));
  const minutes = Math.max(0, Math.min(59, Number(match[2] || 0)));
  return hours * 60 + minutes;
}

function sortBlocks(blocks: ScheduleBlock[]) {
  return [...blocks].sort((a, b) => minutesFromTime(a.time) - minutesFromTime(b.time));
}

function weeklyHours(days: DaySchedule[]) {
  const minutes = days.flatMap((day) => day.blocks)
    .filter((block) => block.type !== "cours" && block.type !== "repos")
    .reduce((sum, block) => sum + Math.max(0, Number(block.duration) || 0), 0);
  return Math.round((minutes / 60) * 10) / 10;
}

function libraryText(sheets: StudySheetRow[]) {
  if (!sheets.length) return "Aucune fiche Menta disponible.";
  return [...sheets]
    .sort((a, b) => clampMastery(a.mastery) - clampMastery(b.mastery))
    .slice(0, 30)
    .map((sheet) => `- ${sheet.title} · ${sheet.subject}${sheet.chapter ? ` · ${sheet.chapter}` : ""} · maîtrise ${clampMastery(sheet.mastery)}% · ID ${sheet.id}`)
    .join("\n");
}

function protectLockedBlocks(candidateDays: DaySchedule[], originalDays: DaySchedule[], completedIds: string[]) {
  const completed = new Set(completedIds);
  const locked = new Map<string, { dayIndex: number; block: ScheduleBlock }>();

  originalDays.forEach((day, dayIndex) => {
    day.blocks.forEach((block) => {
      if (completed.has(block.id) || block.type === "cours") {
        locked.set(block.id, { dayIndex, block });
      }
    });
  });

  const cleaned = candidateDays.map((day) => ({
    ...day,
    blocks: day.blocks.filter((block) => !locked.has(block.id)),
  }));

  locked.forEach(({ dayIndex, block }) => {
    if (!cleaned[dayIndex]) return;
    cleaned[dayIndex] = {
      ...cleaned[dayIndex],
      blocks: sortBlocks([...cleaned[dayIndex].blocks, block]),
    };
  });

  return cleaned;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  let body: Payload = {};
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  const mode = body.mode || "manual";
  const reason = clean(body.reason, 2500);
  const today = clean(body.today, 40) || "jour actuel non précisé";
  const nowLocal = clean(body.nowLocal, 80) || new Date().toISOString();

  const { data: progressData, error: progressError } = await supabase
    .from("user_progress")
    .select("value")
    .eq("user_id", user.id)
    .eq("key", PROGRESS_KEY)
    .maybeSingle();

  if (progressError) {
    console.error("Menta rebalance progress error", progressError.message);
    return NextResponse.json({ error: "PLAN_READ_FAILED" }, { status: 500 });
  }

  const persisted = progressData?.value as PersistedPlan | null;
  if (!persisted?.plan?.days?.length) {
    return NextResponse.json({ error: "NO_PLAN" }, { status: 404 });
  }

  const currentPlan = persisted.plan;
  const completedIds = Array.isArray(persisted.completedIds) ? persisted.completedIds : [];
  const inputs: Inputs = { ...(persisted.inputs || {}) };
  const nextFatigue = Math.min(5, Math.max(1, Number(body.fatigue) || Number(inputs.fatigue) || 3));
  inputs.fatigue = nextFatigue;

  const { data: sheetData } = await supabase
    .from("study_sheets")
    .select("id, title, subject, chapter, mastery")
    .eq("user_id", user.id)
    .order("mastery", { ascending: true })
    .limit(60);

  const libraryContext = libraryText((sheetData || []) as StudySheetRow[]);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI_PLANNER_NOT_CONFIGURED" }, { status: 503 });

  const model = process.env.OPENAI_PLANNING_MODEL || process.env.OPENAI_GRADING_MODEL || "gpt-5.6-terra";

  const modeRule = {
    missed: "Des blocs non réalisés sont désormais en retard. Replace uniquement ce qui reste utile, sans punir l'étudiant par une surcharge.",
    no_time_today: `L'étudiant indique qu'il n'a plus le temps de travailler aujourd'hui (${today}). Déplace tous les blocs de travail non terminés d'aujourd'hui vers les meilleurs créneaux futurs de la semaine.`,
    fatigue: `Le niveau de fatigue vient de changer à ${nextFatigue}/5. Réduis, raccourcis ou déplace la charge si nécessaire, sans sacrifier aveuglément les priorités urgentes.`,
    constraint: "Une nouvelle contrainte ou échéance est apparue. Réorganise la semaine autour d'elle en respectant les autres obligations.",
    manual: "Réévalue la semaine restante et améliore la répartition sans modifier ce qui est déjà accompli.",
  }[mode];

  const instructions = `Tu es Menta Adaptive Planner. Tu rééquilibres un planning académique déjà existant quand la réalité de l'étudiant change.

OBJECTIF
Produire une version mise à jour de la semaine restante, pas recréer arbitrairement un nouveau planning.

RÈGLES ABSOLUES
1. Les blocs dont l'ID figure dans COMPLETED_IDS sont terminés : ne les déplace, ne les raccourcis et ne les supprime jamais.
2. Les blocs de type cours sont des contraintes fixes : ne les déplace jamais.
3. Ne programme jamais deux blocs qui se chevauchent et n'utilise jamais un créneau explicitement occupé dans l'emploi du temps.
4. N'ajoute pas de nouvelle obligation académique inventée. Tu peux déplacer, raccourcir ou exceptionnellement abandonner un bloc devenu moins prioritaire. Tu peux ajouter du repos si cela améliore la soutenabilité.
5. Ne replace jamais une tâche dans le passé par rapport à NOW_LOCAL. Pour aujourd'hui, tout nouveau bloc doit commencer après l'heure actuelle.
6. Les échéances proches dominent. Ensuite viennent faiblesse/maîtrise, importance de la matière, répétition espacée et objectif hebdomadaire.
7. Si une tâche ratée peut encore être faite utilement, replace-la dans le meilleur créneau futur. Si elle n'est plus pertinente, indique explicitement pourquoi elle est abandonnée dans changes.
8. Évite l'effet boule de neige : une tâche ratée ne doit pas transformer le lendemain en journée irréaliste. Respecte la fatigue ${nextFatigue}/5.
9. Pour fatigue 4-5, préfère raccourcir et étaler plutôt que compresser ; limite le travail tardif.
10. Les fiches Menta faibles peuvent guider les priorités, mais ne force pas une fiche sans lien avec les échéances ou objectifs.
11. Conserve les mêmes IDs pour les blocs déplacés ou raccourcis. Pour un nouveau bloc de repos seulement, crée un ID commençant par "rebalance-rest-".
12. Dans reason, explique pourquoi le bloc est maintenant placé ici.
13. La liste changes doit expliquer les principales modifications avec ancien jour, nouveau jour et raison.
14. Réponds uniquement dans le JSON imposé, en français.

SITUATION À TRAITER
${modeRule}`;

  const input = `NOW_LOCAL\n${nowLocal}\n\nJOUR ACTUEL\n${today}\n\nMODE\n${mode}\n\nNOUVELLE INFORMATION\n${reason || "Aucune précision supplémentaire."}\n\nFATIGUE\n${nextFatigue}/5\n\nCURSUS\n${clean(inputs.studyType, 200) || "Non précisé"} · ${clean(inputs.track, 260) || "Non précisé"}\n\nDISPONIBILITÉS\n${clean(inputs.freeHours, 5000) || "Non précisées"}\n\nEMPLOI DU TEMPS / CONTRAINTES FIXES\n${clean(inputs.courseHours, 9000) || "Non précisé"}\n\nÉCHÉANCES\n${clean(inputs.deadlines, 5000) || "Aucune"}\n\nOBJECTIF\n${clean(inputs.goal, 5000) || "Non précisé"}\n\nCOMPLETED_IDS\n${completedIds.join(", ") || "Aucun"}\n\nBIBLIOTHÈQUE / MAÎTRISE\n${libraryContext}\n\nPLANNING ACTUEL\n${JSON.stringify(currentPlan.days)}`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        reasoning: { effort: "medium" },
        store: false,
        instructions,
        input,
        text: {
          format: {
            type: "json_schema",
            name: "adaptive_week_rebalance",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                message: { type: "string" },
                days: {
                  type: "array",
                  minItems: 7,
                  maxItems: 7,
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      day: { type: "string", enum: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"] },
                      date: { type: "string" },
                      focus: { type: "string" },
                      energy: { type: "string", enum: ["léger", "modéré", "intense"] },
                      blocks: {
                        type: "array",
                        maxItems: 8,
                        items: {
                          type: "object",
                          additionalProperties: false,
                          properties: {
                            id: { type: "string" },
                            time: { type: "string" },
                            duration: { type: "number", minimum: 10, maximum: 180 },
                            label: { type: "string" },
                            type: { type: "string", enum: ["cours", "revision", "fichage", "dissertation", "oral", "repos"] },
                            subject: { type: "string" },
                            reason: { type: "string" },
                            sheet_id: { type: "string" }
                          },
                          required: ["id", "time", "duration", "label", "type", "subject", "reason", "sheet_id"]
                        }
                      }
                    },
                    required: ["day", "date", "focus", "energy", "blocks"]
                  }
                },
                changes: {
                  type: "array",
                  maxItems: 12,
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      block_id: { type: "string" },
                      action: { type: "string", enum: ["déplacé", "raccourci", "conservé", "abandonné", "repos ajouté"] },
                      from_day: { type: "string" },
                      to_day: { type: "string" },
                      to_time: { type: "string" },
                      reason: { type: "string" }
                    },
                    required: ["block_id", "action", "from_day", "to_day", "to_time", "reason"]
                  }
                }
              },
              required: ["message", "days", "changes"]
            }
          },
          verbosity: "low"
        }
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Menta rebalance OpenAI error", response.status, detail.slice(0, 1400));
      return NextResponse.json({ error: "AI_REBALANCE_UNAVAILABLE" }, { status: 502 });
    }

    const data = await response.json();
    const text = outputText(data);
    if (!text) return NextResponse.json({ error: "AI_REBALANCE_EMPTY" }, { status: 502 });

    const parsed = JSON.parse(text) as { message: string; days: DaySchedule[]; changes: unknown[] };
    const safeDays = protectLockedBlocks(parsed.days || [], currentPlan.days, completedIds).map((day) => ({
      ...day,
      blocks: sortBlocks((day.blocks || []).map((block) => ({
        ...block,
        sheet_id: block.sheet_id || undefined,
      }))),
    }));

    if (safeDays.length !== 7) return NextResponse.json({ error: "AI_REBALANCE_INVALID" }, { status: 502 });

    const nextPlan: Plan = {
      ...currentPlan,
      days: safeDays,
      weekly_hours: weeklyHours(safeDays),
      strategy: `${currentPlan.strategy} Rééquilibrage adaptatif appliqué : ${parsed.message}`.slice(0, 1800),
      source: "ai-rebalanced",
      model,
    };

    const nextPersisted: PersistedPlan = {
      plan: nextPlan,
      completedIds,
      inputs,
    };

    const { error: saveError } = await supabase.from("user_progress").upsert(
      {
        user_id: user.id,
        key: PROGRESS_KEY,
        value: nextPersisted,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,key" },
    );

    if (saveError) {
      console.error("Menta rebalance save error", saveError.message);
      return NextResponse.json({ error: "PLAN_SAVE_FAILED" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: parsed.message,
      changes: parsed.changes || [],
      saved: nextPersisted,
      source: "ai",
      model,
    });
  } catch (error) {
    console.error("Menta rebalance failed", error);
    return NextResponse.json({ error: "AI_REBALANCE_FAILED" }, { status: 502 });
  }
}
