import { NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;
type Source = { storagePath: string; sourceName: string; size: number; sourceMime: string };

type GenerateArgs = {
  supabase: SupabaseClient;
  userId: string;
  content: Array<Record<string, unknown>>;
  sources: Source[];
  sourceType: "pdf";
  subjectHint: string;
  titleHint: string;
};

function outputText(data: any) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) return data.output_text;
  for (const item of data?.output ?? []) {
    if (item?.type !== "message") continue;
    for (const part of item?.content ?? []) {
      if (part?.type === "output_text" && typeof part.text === "string") return part.text;
    }
  }
  return "";
}

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    subject: { type: "string" },
    chapter: { type: "string" },
    subtitle: { type: "string" },
    thesis: { type: "string" },
    sections: {
      type: "array", minItems: 2, maxItems: 20,
      items: { type: "object", additionalProperties: false, properties: {
        title: { type: "string" },
        paragraphs: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 6 },
        points: { type: "array", items: { type: "string" }, maxItems: 10 },
        reference: { type: "string" },
      }, required: ["title", "paragraphs", "points", "reference"] },
    },
    distinctions: { type: "array", items: { type: "string" }, maxItems: 20 },
    recall: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 20 },
    quiz: { type: "array", minItems: 5, maxItems: 20, items: {
      type: "object", additionalProperties: false, properties: {
        id: { type: "string" }, prompt: { type: "string" }, expected: { type: "string" }, explanation: { type: "string" },
        keywordGroups: { type: "array", items: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4 }, minItems: 3, maxItems: 8 },
        minMatches: { type: "integer", minimum: 1, maximum: 8 },
      }, required: ["id", "prompt", "expected", "explanation", "keywordGroups", "minMatches"] },
    },
    source_coverage: { type: "array", items: { type: "object", additionalProperties: false, properties: {
      source: { type: "string" }, status: { type: "string", enum: ["used", "partially_read", "unreadable"] },
      covered_topics: { type: "array", items: { type: "string" } }, gaps: { type: "array", items: { type: "string" } },
    }, required: ["source", "status", "covered_topics", "gaps"] } },
  },
  required: ["title", "subject", "chapter", "subtitle", "thesis", "sections", "distinctions", "recall", "quiz", "source_coverage"],
};

export async function generateFromPreparedSources({ supabase, userId, content, sources, subjectHint, titleHint }: GenerateArgs) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI_NOT_CONFIGURED" }, { status: 503 });

  const sourceList = sources.map((source, index) => `[S${index + 1}] ${source.sourceName}`).join("\n");
  const instructions = `Tu es l'IA académique de Menta Prépa. Tu construis UNE fiche de révision fidèle, dense, structurée et exploitable à partir de l'ensemble des documents fournis.\n\nRègles impératives :\n1. Lis et prends en compte chacun des documents, sans privilégier le premier ni ignorer les annexes. Ne prétends jamais avoir lu une source inaccessible.\n2. Réconcilie les passages complémentaires, élimine les répétitions et conserve les notions, définitions, arguments, auteurs, dates, exemples, démonstrations et nuances qui apportent une information distincte.\n3. Organise la synthèse par thèmes et relations conceptuelles, et non comme une simple juxtaposition de résumés. Adapte la longueur à la richesse des sources : la fiche doit être substantielle, sans remplissage ni limite artificielle de quelques paragraphes.\n4. Ne fabrique aucune information ni citation. En cas de contradiction entre documents, expose les deux positions et leur provenance ; ne tranche pas sans justification. Signale les passages illisibles ou ambigus.\n5. Pour chaque partie, référence les sources pertinentes sous la forme [S1], [S2], avec les pages lorsque tu peux les déterminer de façon fiable. N'invente jamais de numéro de page.\n6. Renseigne source_coverage avec exactement une entrée par source, dans l'ordre, et indique les sujets utilisés ainsi que toute partie inaccessible ou insuffisamment traitée. Ne marque pas une source comme entièrement utilisée si ce n'est pas le cas.\n7. Les questions de rappel et de quiz doivent couvrir les différents documents et rester objectivement défendables à partir de leur contenu.\n8. subject doit être une matière académique concise et chapter un chapitre identifiable à partir des documents.\n9. Réponds uniquement dans le JSON imposé.\n\nSources :\n${sourceList}\n\nMatière suggérée : ${subjectHint.trim().slice(0, 80) || "à déduire"}.\nTitre souhaité : ${titleHint.trim().slice(0, 180) || "à déduire"}.`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_SHEET_MODEL || "gpt-5.6-terra",
        store: false,
        reasoning: { effort: "medium" },
        instructions,
        input: [{ role: "user", content }],
        text: { format: { type: "json_schema", name: "study_sheet", strict: true, schema }, verbosity: "high" },
      }),
      cache: "no-store",
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error("Menta batch generation error", response.status, detail.slice(0, 1200));
      return NextResponse.json({ error: response.status === 400 || response.status === 413 ? "Ces documents sont trop volumineux ou complexes pour être analysés ensemble. Essaie de les répartir en deux lots plus petits." : "AI_GENERATION_UNAVAILABLE" }, { status: response.status === 400 || response.status === 413 ? 422 : 502 });
    }
    const data = await response.json();
    const text = outputText(data);
    if (!text) return NextResponse.json({ error: "L'analyse n'a pas produit de fiche exploitable. Réessaie avec un lot plus petit." }, { status: 502 });
    const generated = JSON.parse(text);
    if (!generated || !Array.isArray(generated.sections) || !generated.sections.length) throw new Error("EMPTY_SHEET");
    const coverage = Array.isArray(generated.source_coverage) ? generated.source_coverage : [];
    if (coverage.length !== sources.length) return NextResponse.json({ error: "L'analyse n'a pas pu vérifier la couverture de tous les documents. Réessaie avec un lot plus petit." }, { status: 422 });
    generated.sources = sources.map((source, index) => ({ id: `S${index + 1}`, name: source.sourceName, path: source.storagePath, size: source.size, mime: source.sourceMime }));
    const sourceLabel = sources.length === 1 ? sources[0].sourceName : `${sources.length} PDF · ${sources.map((source) => source.sourceName).join(" · ")}`;
    const { data: row, error } = await supabase.from("study_sheets").insert({
      user_id: userId, title: generated.title, subject: generated.subject, chapter: generated.chapter || null,
      source_type: "pdf", source_label: sourceLabel, source_path: sources[0].storagePath, content: generated,
    }).select("id, title, subject, chapter, folder, favorite, mastery, content").single();
    if (error || !row) {
      console.error("Menta batch save error", error);
      return NextResponse.json({ error: "SHEET_SAVE_FAILED" }, { status: 500 });
    }
    return NextResponse.json({ sheet: row });
  } catch (error) {
    console.error("Menta batch generation failed", error);
    return NextResponse.json({ error: "AI_GENERATION_FAILED" }, { status: 502 });
  }
}
