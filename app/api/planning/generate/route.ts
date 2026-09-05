import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Payload = {
  studyType?: string;
  track?: string;
  level?: string;
  subjects?: string[];
  courseHours?: string;
  freeHours?: string;
  deadlines?: string;
  fatigue?: number;
  goal?: string;
  workStyle?: string;
  weekAnchor?: string;
};

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

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const studyType = clean(body.studyType, 180) || "Études supérieures";
  const track = clean(body.track, 260) || clean(body.level, 200) || "Filière non précisée";
  const subjects = Array.isArray(body.subjects)
    ? body.subjects.map((item) => clean(item, 120)).filter(Boolean).slice(0, 20)
    : [];
  const courseHours = clean(body.courseHours, 9000);
  const freeHours = clean(body.freeHours);
  const deadlines = clean(body.deadlines);
  const goal = clean(body.goal);
  const workStyle = clean(body.workStyle, 160) || "Équilibré";
  const weekAnchor = clean(body.weekAnchor, 20) || new Date().toISOString().slice(0, 10);
  const fatigue = Math.min(5, Math.max(1, Number(body.fatigue) || 3));

  if (!subjects.length || !freeHours || !goal) {
    return NextResponse.json({ error: "Matières, disponibilités et objectif requis" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI_PLANNER_NOT_CONFIGURED" }, { status: 503 });

  const model = process.env.OPENAI_PLANNING_MODEL || process.env.OPENAI_GRADING_MODEL || "gpt-5.6-terra";

  const instructions = `Tu es Menta Planner, un planificateur académique exigeant conçu pour les cursus français. Tu transformes les contraintes réelles d'un étudiant en semaine de travail réaliste, soutenable et orientée résultats.

Règles impératives :
1. Respecte strictement l'emploi du temps et les indisponibilités : ne place aucun bloc de travail sur un créneau occupé.
2. Adapte la méthode au type d'études et à la filière. Une CPGE, une licence de droit, un BUT, un BTS, une école d'ingénieurs ou un cursus de médecine n'ont pas les mêmes exercices, rythmes ni priorités.
3. Priorise d'abord les échéances proches, puis les matières faibles/importantes, puis l'entretien régulier.
4. Adapte la charge au niveau de fatigue. Fatigue 4 ou 5 = réduction nette du volume, davantage de récupération et aucun surmenage tardif.
5. Utilise rappel actif, répétition espacée, correction d'erreurs, sujets blancs, exercices, annales, plans, oral, flashcards ou fichage uniquement quand ils sont pertinents pour le cursus.
6. Les blocs de travail durent en général 25 à 120 minutes. Évite les journées absurdes ou surchargées.
7. Prévois de vraies marges de récupération. Le repos est un outil de performance, pas un bloc décoratif.
8. Chaque bloc doit avoir un objectif concret et vérifiable, jamais une formule vague comme « travailler l'histoire ».
9. Répartis les tâches difficiles aux moments les plus favorables parmi les disponibilités fournies.
10. Si les disponibilités sont imprécises, reste prudent et choisis des horaires plausibles sans prétendre connaître ce qui n'a pas été fourni.
11. Produis les sept jours de lundi à dimanche. Les jours peuvent être très légers s'il n'y a rien d'utile à ajouter.
12. Dans reason, explique brièvement pourquoi ce bloc est placé à cet endroit.
13. Réponds uniquement dans le JSON imposé, en français.`;

  const input = `SEMAINE DE RÉFÉRENCE\n${weekAnchor}\n\nTYPE D'ÉTUDES\n${studyType}\n\nFILIÈRE / ANNÉE\n${track}\n\nMATIÈRES\n${subjects.join(", ")}\n\nEMPLOI DU TEMPS / CONTRAINTES FIXES\n${courseHours || "Non précisés"}\n\nDISPONIBILITÉS DE TRAVAIL\n${freeHours}\n\nÉCHÉANCES\n${deadlines || "Aucune échéance indiquée"}\n\nFATIGUE\n${fatigue}/5\n\nSTYLE DE TRAVAIL\n${workStyle}\n\nOBJECTIF HEBDOMADAIRE\n${goal}`;

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
            name: "academic_week_plan",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                summary: { type: "string" },
                strategy: { type: "string" },
                weekly_hours: { type: "number", minimum: 0, maximum: 60 },
                workload: { type: "string", enum: ["légère", "équilibrée", "soutenue"] },
                priority: { type: "string" },
                coaching: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 2,
                  maxItems: 4
                },
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
                        maxItems: 6,
                        items: {
                          type: "object",
                          additionalProperties: false,
                          properties: {
                            time: { type: "string" },
                            duration: { type: "number", minimum: 10, maximum: 180 },
                            label: { type: "string" },
                            type: { type: "string", enum: ["cours", "revision", "fichage", "dissertation", "oral", "repos"] },
                            subject: { type: "string" },
                            reason: { type: "string" }
                          },
                          required: ["time", "duration", "label", "type", "subject", "reason"]
                        }
                      }
                    },
                    required: ["day", "date", "focus", "energy", "blocks"]
                  }
                }
              },
              required: ["summary", "strategy", "weekly_hours", "workload", "priority", "coaching", "days"]
            }
          },
          verbosity: "low"
        }
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Menta planner error", response.status, detail.slice(0, 1200));
      return NextResponse.json({ error: "AI_PLANNER_UNAVAILABLE" }, { status: 502 });
    }

    const data = await response.json();
    const text = outputText(data);
    if (!text) return NextResponse.json({ error: "AI_PLANNER_EMPTY" }, { status: 502 });

    const plan = JSON.parse(text) as any;
    plan.days = (plan.days || []).map((day: any, dayIndex: number) => ({
      ...day,
      blocks: (day.blocks || []).map((block: any, blockIndex: number) => ({
        ...block,
        id: `${weekAnchor}-${dayIndex + 1}-${blockIndex + 1}`,
      })),
    }));

    return NextResponse.json({ ...plan, source: "ai", model });
  } catch (error) {
    console.error("Menta planner failed", error);
    return NextResponse.json({ error: "AI_PLANNER_FAILED" }, { status: 502 });
  }
}
