import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_TEXT = 9000;

type GradeStatus = "correct" | "partial" | "incorrect";

type GradePayload = {
  question?: string;
  expected?: string;
  explanation?: string;
  answer?: string;
};

function clean(value: unknown, max = MAX_TEXT) {
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
  let body: GradePayload;
  try {
    body = (await request.json()) as GradePayload;
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const question = clean(body.question, 3500);
  const expected = clean(body.expected);
  const explanation = clean(body.explanation, 4000);
  const answer = clean(body.answer);

  if (!question || !expected || !answer) {
    return NextResponse.json({ error: "Question, correction et réponse requises" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI_GRADER_NOT_CONFIGURED" }, { status: 503 });
  }

  const model = process.env.OPENAI_GRADING_MODEL || "gpt-5.6-terra";

  const instructions = `Tu es le correcteur académique de Menta Prépa. Tu évalues une réponse libre d'étudiant en comparant son sens à une réponse de référence, pas en recherchant des mots identiques.

Tu dois attribuer exactement l'un des trois statuts suivants :
- correct : la thèse et les distinctions décisives sont justes ; de petites omissions non essentielles sont acceptables.
- partial : le noyau de la réponse est juste, mais il manque un élément important, une distinction, une précision, ou une formulation contient une erreur locale. Ce statut doit être utilisé généreusement lorsqu'un étudiant a réellement compris l'essentiel. Ne transforme jamais une réponse globalement juste en "incorrect" pour une omission.
- incorrect : le noyau conceptuel est faux, contradictoire avec la référence, hors sujet, ou trop pauvre pour établir une compréhension réelle.

Règles pédagogiques :
1. Évalue la signification, les synonymes et la reformulation personnelle.
2. Distingue erreur locale et erreur structurante.
3. Pour partial, commence le feedback par « Presque juste — cependant » et explique précisément ce qu'il faut ajouter ou modifier.
4. Pour correct, valorise brièvement ce qui est maîtrisé et ne réclame pas une récitation mot à mot.
5. Pour incorrect, explique la méprise sans humilier l'étudiant.
6. N'invente aucune exigence qui ne découle pas de la question ou de la correction de référence.
7. Le champ improved_answer doit conserver autant que possible les idées justes de l'étudiant en les corrigeant ou complétant.
8. Réponds uniquement dans le JSON imposé.`;

  const input = `QUESTION\n${question}\n\nRÉPONSE DE RÉFÉRENCE\n${expected}\n\nPRÉCISION DU BARÈME\n${explanation || "Aucune précision supplémentaire."}\n\nRÉPONSE DE L'ÉTUDIANT\n${answer}`;

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
            name: "academic_grade",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                status: { type: "string", enum: ["correct", "partial", "incorrect"] },
                confidence: { type: "number", minimum: 0, maximum: 1 },
                feedback: { type: "string" },
                missing_points: { type: "array", items: { type: "string" }, maxItems: 5 },
                strengths: { type: "array", items: { type: "string" }, maxItems: 4 },
                improved_answer: { type: "string" },
              },
              required: ["status", "confidence", "feedback", "missing_points", "strengths", "improved_answer"],
            },
          },
          verbosity: "low",
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Menta AI grader error", response.status, detail.slice(0, 1200));
      return NextResponse.json({ error: "AI_GRADER_UNAVAILABLE" }, { status: 502 });
    }

    const data = await response.json();
    const text = outputText(data);
    if (!text) return NextResponse.json({ error: "AI_GRADER_EMPTY" }, { status: 502 });

    const grade = JSON.parse(text) as {
      status: GradeStatus;
      confidence: number;
      feedback: string;
      missing_points: string[];
      strengths: string[];
      improved_answer: string;
    };

    return NextResponse.json({ ...grade, source: "ai", model });
  } catch (error) {
    console.error("Menta AI grader failed", error);
    return NextResponse.json({ error: "AI_GRADER_FAILED" }, { status: 502 });
  }
}
