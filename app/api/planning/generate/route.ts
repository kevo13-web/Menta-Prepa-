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

type StudySheetRow = {
  id: string;
  title: string;
  subject: string;
  chapter: string | null;
  folder: string | null;
  mastery: number | null;
  favorite: boolean | null;
  updated_at: string | null;
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

function clampMastery(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function libraryText(sheets: StudySheetRow[]) {
  if (!sheets.length) return "Aucune fiche personnelle disponible dans la bibliothèque Menta.";

  const ordered = [...sheets].sort((a, b) => {
    const masteryGap = clampMastery(a.mastery) - clampMastery(b.mastery);
    if (masteryGap !== 0) return masteryGap;
    if (Boolean(a.favorite) !== Boolean(b.favorite)) return a.favorite ? -1 : 1;
    return String(b.updated_at || "").localeCompare(String(a.updated_at || ""));
  });

  return ordered
    .slice(0, 35)
    .map((sheet) => {
      const chapter = sheet.chapter ? ` · chapitre ${sheet.chapter}` : "";
      const favorite = sheet.favorite ? " · favorite" : "";
      return `- ID ${sheet.id} · ${sheet.title} · ${sheet.subject}${chapter} · maîtrise ${clampMastery(sheet.mastery)}%${favorite}`;
    })
    .join("\n");
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

  const { data: sheetData, error: sheetError } = await supabase
    .from("study_sheets")
    .select("id, title, subject, chapter, folder, mastery, favorite, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(80);

  if (sheetError) console.error("Menta planner library context error", sheetError.message);
  const sheets = (sheetData || []) as StudySheetRow[];
  const validSheetIds = new Set(sheets.map((sheet) => sheet.id));
  const libraryContext = libraryText(sheets);
  const averageMastery = sheets.length
    ? Math.round(sheets.reduce((sum, sheet) => sum + clampMastery(sheet.mastery), 0) / sheets.length)
    : 0;
  const weakSheets = sheets.filter((sheet) => clampMastery(sheet.mastery) < 80);
  const prioritySheets = [...weakSheets]
    .sort((a, b) => clampMastery(a.mastery) - clampMastery(b.mastery))
    .slice(0, 5);

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
13. Tu as accès à la bibliothèque personnelle Menta de l'étudiant et à son niveau de maîtrise pour chaque fiche. Exploite ces données activement au lieu de les ignorer.
14. Une fiche à moins de 50% de maîtrise est une faiblesse forte : si elle est pertinente pour les matières, l'objectif ou une échéance, programme du rappel actif puis, lorsque la semaine le permet, une seconde exposition espacée 24 à 72 heures plus tard.
15. Une fiche entre 50% et 79% mérite une consolidation ciblée. Une fiche à 80% ou plus ne doit être entretenue que si elle est liée à une échéance, un objectif prioritaire ou un besoin de réactivation.
16. Ne programme pas mécaniquement toutes les fiches faibles : croise toujours maîtrise, pertinence, échéances, temps disponible et fatigue.
17. Quand un bloc utilise explicitement une fiche de la bibliothèque, reprends son titre exact ou une formulation immédiatement reconnaissable et renseigne son ID exact dans sheet_id. Sinon sheet_id doit être une chaîne vide.
18. N'invente jamais une fiche, un score de maîtrise, une échéance ou un lien entre une fiche et un examen qui n'est pas justifié par les données fournies.
19. Réponds uniquement dans le JSON imposé, en français.`;

  const input = `SEMAINE DE RÉFÉRENCE\n${weekAnchor}\n\nTYPE D'ÉTUDES\n${studyType}\n\nFILIÈRE / ANNÉE\n${track}\n\nMATIÈRES\n${subjects.join(", ")}\n\nEMPLOI DU TEMPS / CONTRAINTES FIXES\n${courseHours || "Non précisés"}\n\nDISPONIBILITÉS DE TRAVAIL\n${freeHours}\n\nÉCHÉANCES\n${deadlines || "Aucune échéance indiquée"}\n\nFATIGUE\n${fatigue}/5\n\nSTYLE DE TRAVAIL\n${workStyle}\n\nOBJECTIF HEBDOMADAIRE\n${goal}\n\nBIBLIOTHÈQUE MENTA ET MAÎTRISE\n${libraryContext}`;

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
                            reason: { type: "string" },
                            sheet_id: { type: "string" }
                          },
                          required: ["time", "duration", "label", "type", "subject", "reason", "sheet_id"]
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
        sheet_id: validSheetIds.has(String(block.sheet_id || "")) ? String(block.sheet_id) : undefined,
      })),
    }));

    const priorities = prioritySheets.map((sheet) => ({
      id: sheet.id,
      title: sheet.title,
      subject: sheet.subject,
      chapter: sheet.chapter,
      mastery: clampMastery(sheet.mastery),
    }));

    return NextResponse.json({
      ...plan,
      source: "ai",
      model,
      library_context: {
        total: sheets.length,
        to_master: weakSheets.length,
        mastered: sheets.length - weakSheets.length,
        average_mastery: averageMastery,
        priorities,
      },
    });
  } catch (error) {
    console.error("Menta planner failed", error);
    return NextResponse.json({ error: "AI_PLANNER_FAILED" }, { status: 502 });
  }
}
