import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_TEXT = 60000;
const MAX_REMOTE_BYTES = 4_000_000;

type SourceType = "photo" | "pdf" | "text" | "url";

type GeneratePayload = {
  sourceType?: SourceType;
  text?: string;
  url?: string;
  storagePath?: string;
  sourceName?: string;
  sourceMime?: string;
  subjectHint?: string;
};

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

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TEXT);
}

function isBlockedHost(hostname: string) {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host === "::1" || host.endsWith(".local")) return true;
  if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host)) return true;
  const match = host.match(/^172\.(\d+)\./);
  if (match && Number(match[1]) >= 16 && Number(match[1]) <= 31) return true;
  return false;
}

async function fileToDataUrl(blob: Blob, mime: string) {
  const bytes = Buffer.from(await blob.arrayBuffer());
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

export async function POST(request: Request) {
  let body: GeneratePayload;
  try {
    body = (await request.json()) as GeneratePayload;
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const sourceType = body.sourceType;
  if (!sourceType || !["photo", "pdf", "text", "url"].includes(sourceType)) {
    return NextResponse.json({ error: "Source invalide" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI_NOT_CONFIGURED" }, { status: 503 });

  const content: any[] = [];
  let sourceLabel = "Source importée";
  let storedPath: string | null = null;

  try {
    if (sourceType === "text") {
      const text = (body.text || "").trim().slice(0, MAX_TEXT);
      if (text.length < 30) return NextResponse.json({ error: "Texte trop court" }, { status: 400 });
      sourceLabel = "Texte collé";
      content.push({ type: "input_text", text });
    }

    if (sourceType === "url") {
      const rawUrl = (body.url || "").trim();
      let parsed: URL;
      try { parsed = new URL(rawUrl); } catch { return NextResponse.json({ error: "URL invalide" }, { status: 400 }); }
      if (!["http:", "https:"].includes(parsed.protocol) || isBlockedHost(parsed.hostname)) {
        return NextResponse.json({ error: "URL non autorisée" }, { status: 400 });
      }

      const remote = await fetch(parsed.toString(), {
        redirect: "follow",
        signal: AbortSignal.timeout(12000),
        headers: { "User-Agent": "MentaPrepa/1.0 Study Sheet Generator" },
      });
      if (!remote.ok) return NextResponse.json({ error: "Impossible de lire cette URL" }, { status: 400 });
      const length = Number(remote.headers.get("content-length") || 0);
      if (length && length > MAX_REMOTE_BYTES) return NextResponse.json({ error: "Source URL trop volumineuse" }, { status: 400 });
      const mime = (remote.headers.get("content-type") || "text/html").split(";")[0];
      sourceLabel = parsed.hostname;

      if (mime === "application/pdf") {
        const blob = await remote.blob();
        if (blob.size > MAX_REMOTE_BYTES) return NextResponse.json({ error: "PDF distant trop volumineux" }, { status: 400 });
        content.push({ type: "input_file", filename: "source.pdf", file_data: await fileToDataUrl(blob, "application/pdf") });
      } else if (mime.startsWith("image/")) {
        content.push({ type: "input_image", image_url: parsed.toString(), detail: "high" });
      } else {
        const html = await remote.text();
        const clean = stripHtml(html);
        if (clean.length < 80) return NextResponse.json({ error: "Cette page ne contient pas assez de texte exploitable" }, { status: 400 });
        content.push({ type: "input_text", text: clean });
      }
    }

    if (sourceType === "photo" || sourceType === "pdf") {
      const storagePath = (body.storagePath || "").trim();
      if (!storagePath || !storagePath.startsWith(`${user.id}/`)) {
        return NextResponse.json({ error: "Fichier invalide" }, { status: 400 });
      }
      const { data: file, error: downloadError } = await supabase.storage.from("study-sources").download(storagePath);
      if (downloadError || !file) return NextResponse.json({ error: "Impossible de récupérer le fichier" }, { status: 400 });
      const mime = body.sourceMime || file.type || (sourceType === "pdf" ? "application/pdf" : "image/jpeg");
      const dataUrl = await fileToDataUrl(file, mime);
      storedPath = storagePath;
      sourceLabel = body.sourceName || (sourceType === "pdf" ? "PDF importé" : "Photo importée");
      if (sourceType === "pdf") {
        content.push({ type: "input_file", filename: body.sourceName || "cours.pdf", file_data: dataUrl });
      } else {
        content.push({ type: "input_image", image_url: dataUrl, detail: "high" });
      }
    }
  } catch (error) {
    console.error("Menta source preparation failed", error);
    return NextResponse.json({ error: "SOURCE_PREPARATION_FAILED" }, { status: 400 });
  }

  const subjectHint = (body.subjectHint || "").trim().slice(0, 80);
  const instructions = `Tu es l'IA académique de Menta Prépa. Transforme la source fournie en une fiche de révision fidèle, dense et utile pour un étudiant exigeant.

Priorités absolues :
1. Ne jamais inventer une information absente de la source. Si un passage est incertain ou illisible, le signaler explicitement dans la fiche au lieu de deviner.
2. Corriger la forme, hiérarchiser, synthétiser et reformuler sans trahir le contenu.
3. Identifier les définitions, thèses, arguments, exemples, auteurs, dates, concepts et distinctions réellement présents.
4. Produire une fiche suffisamment rigoureuse pour servir ensuite de base à un rappel actif et à un quiz.
5. Le champ subject doit être une matière scolaire/universitaire concise. ${subjectHint ? `L'utilisateur suggère la matière : ${subjectHint}.` : "Déduis la matière si elle est identifiable."}
6. Le champ chapter doit être un intitulé de chapitre court et académique qui permette de classer la fiche dans une bibliothèque. Déduis-le uniquement de la source ; s'il est impossible à identifier, utilise une formulation descriptive prudente.
7. Les questions de quiz doivent porter uniquement sur la fiche et avoir une réponse objectivement défendable à partir de la source.
8. Réponds uniquement dans le JSON imposé.`;

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
        type: "array",
        minItems: 2,
        maxItems: 10,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            paragraphs: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 5 },
            points: { type: "array", items: { type: "string" }, maxItems: 8 },
            reference: { type: "string" },
          },
          required: ["title", "paragraphs", "points", "reference"],
        },
      },
      distinctions: { type: "array", items: { type: "string" }, maxItems: 10 },
      recall: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 10 },
      quiz: {
        type: "array",
        minItems: 5,
        maxItems: 10,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: { type: "string" },
            prompt: { type: "string" },
            expected: { type: "string" },
            explanation: { type: "string" },
            keywordGroups: { type: "array", items: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4 }, minItems: 3, maxItems: 8 },
            minMatches: { type: "integer", minimum: 1, maximum: 8 },
          },
          required: ["id", "prompt", "expected", "explanation", "keywordGroups", "minMatches"],
        },
      },
    },
    required: ["title", "subject", "chapter", "subtitle", "thesis", "sections", "distinctions", "recall", "quiz"],
  };

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
        text: { format: { type: "json_schema", name: "study_sheet", strict: true, schema }, verbosity: "medium" },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Menta sheet generation error", response.status, detail.slice(0, 1500));
      return NextResponse.json({ error: "AI_GENERATION_UNAVAILABLE" }, { status: 502 });
    }

    const data = await response.json();
    const text = outputText(data);
    if (!text) return NextResponse.json({ error: "AI_GENERATION_EMPTY" }, { status: 502 });
    const generated = JSON.parse(text);

    const { data: row, error: insertError } = await supabase
      .from("study_sheets")
      .insert({
        user_id: user.id,
        title: generated.title,
        subject: generated.subject,
        chapter: generated.chapter || null,
        source_type: sourceType,
        source_label: sourceLabel,
        source_path: storedPath,
        content: generated,
      })
      .select("id, title, subject, chapter, folder, favorite, mastery, content")
      .single();

    if (insertError || !row) {
      console.error("Menta sheet save error", insertError);
      return NextResponse.json({ error: "SHEET_SAVE_FAILED", content: generated }, { status: 500 });
    }

    return NextResponse.json({ sheet: row });
  } catch (error) {
    console.error("Menta sheet generation failed", error);
    return NextResponse.json({ error: "AI_GENERATION_FAILED" }, { status: 502 });
  }
}
