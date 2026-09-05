import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"] as const;

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

async function uploadTemporaryFile(apiKey: string, file: File) {
  const form = new FormData();
  form.append("purpose", "user_data");
  form.append("file", file, file.name);
  const response = await fetch("https://api.openai.com/v1/files", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  if (!response.ok) throw new Error(`FILE_UPLOAD_${response.status}`);
  return (await response.json()) as { id: string };
}

async function deleteTemporaryFile(apiKey: string, fileId: string) {
  try {
    await fetch(`https://api.openai.com/v1/files/${fileId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  } catch {
    // Best effort cleanup only.
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI_PLANNER_NOT_CONFIGURED" }, { status: 503 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "INVALID_FORM" }, { status: 400 });
  }

  const text = String(form.get("text") || "").trim().slice(0, 18000);
  const rawFile = form.get("file");
  const file = rawFile instanceof File && rawFile.size > 0 ? rawFile : null;

  if (!text && !file) return NextResponse.json({ error: "TIMETABLE_REQUIRED" }, { status: 400 });
  if (file && file.size > MAX_FILE_BYTES) return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 413 });

  const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  if (file && !allowed.includes(file.type)) return NextResponse.json({ error: "UNSUPPORTED_FILE" }, { status: 415 });

  const model = process.env.OPENAI_PLANNING_MODEL || process.env.OPENAI_GRADING_MODEL || "gpt-5.6-terra";
  const instructions = `Tu analyses un emploi du temps étudiant français. Ta mission est uniquement d'extraire fidèlement les créneaux fixes, sans inventer de cours ni d'horaires.

Règles :
1. Lis les jours, horaires, matières, TD/TP/CM, khôlles, stages et autres contraintes visibles ou écrites.
2. Quand une information est incertaine, place-la dans warnings au lieu de la deviner.
3. Normalise les heures au format HH:MM lorsque possible.
4. Fusionne les doublons évidents mais conserve les séances distinctes.
5. weekly_text doit être un résumé compact, directement exploitable par un planificateur : une ligne par jour.
6. subjects contient uniquement les matières réellement détectées.
7. Une photo difficile à lire doit avoir une confidence plus basse.
8. Réponds uniquement dans le JSON imposé, en français.`;

  const content: any[] = [{
    type: "input_text",
    text: text
      ? `Voici l'emploi du temps saisi par l'étudiant :\n\n${text}`
      : "Analyse le document joint et reconstruis l'emploi du temps étudiant.",
  }];

  let uploadedFileId: string | null = null;
  try {
    if (file) {
      const uploaded = await uploadTemporaryFile(apiKey, file);
      uploadedFileId = uploaded.id;
      content.push(file.type === "application/pdf"
        ? { type: "input_file", file_id: uploaded.id }
        : { type: "input_image", file_id: uploaded.id, detail: "high" });
    }

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
        input: [{ role: "user", content }],
        text: {
          format: {
            type: "json_schema",
            name: "student_timetable",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                summary: { type: "string" },
                weekly_text: { type: "string" },
                subjects: { type: "array", items: { type: "string" }, maxItems: 30 },
                confidence: { type: "number", minimum: 0, maximum: 1 },
                warnings: { type: "array", items: { type: "string" }, maxItems: 8 },
                days: {
                  type: "array",
                  minItems: 7,
                  maxItems: 7,
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      day: { type: "string", enum: DAYS },
                      entries: {
                        type: "array",
                        maxItems: 16,
                        items: {
                          type: "object",
                          additionalProperties: false,
                          properties: {
                            start: { type: "string" },
                            end: { type: "string" },
                            label: { type: "string" },
                            subject: { type: "string" },
                            kind: { type: "string", enum: ["cours", "td", "tp", "kholle", "stage", "contrainte", "autre"] },
                          },
                          required: ["start", "end", "label", "subject", "kind"],
                        },
                      },
                    },
                    required: ["day", "entries"],
                  },
                },
              },
              required: ["summary", "weekly_text", "subjects", "confidence", "warnings", "days"],
            },
          },
          verbosity: "low",
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Menta timetable analyzer", response.status, detail.slice(0, 1200));
      return NextResponse.json({ error: "TIMETABLE_ANALYSIS_FAILED" }, { status: 502 });
    }

    const data = await response.json();
    const textOut = outputText(data);
    if (!textOut) return NextResponse.json({ error: "TIMETABLE_ANALYSIS_EMPTY" }, { status: 502 });
    return NextResponse.json({ ...JSON.parse(textOut), source: "ai", model });
  } catch (error) {
    console.error("Menta timetable analyzer failed", error);
    return NextResponse.json({ error: "TIMETABLE_ANALYSIS_FAILED" }, { status: 502 });
  } finally {
    if (uploadedFileId) await deleteTemporaryFile(apiKey, uploadedFileId);
  }
}
