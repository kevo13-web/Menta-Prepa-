import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validatePdfSources, validatePdfBatch, isPdfBytes, MAX_PDF_BATCH_BYTES } from "@/lib/sheets/pdfBatch";
import { generateFromPreparedSources } from "@/lib/sheets/generateFromSources";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requête invalide" }, { status: 400 }); }
  let sources;
  try { sources = validatePdfSources(body.sources, user.id); } catch { return NextResponse.json({ error: "Lot de PDF invalide" }, { status: 400 }); }

  const content: Array<Record<string, unknown>> = [];
  const manifest: Array<{ storagePath: string; sourceName: string; size: number; sourceMime: string }> = [];
  let total = 0;
  for (const source of sources) {
    const { data: blob, error } = await supabase.storage.from("study-sources").download(source.storagePath);
    if (error || !blob) return NextResponse.json({ error: `Impossible de lire « ${source.sourceName} ».` }, { status: 400 });
    total += blob.size;
    if (total > MAX_PDF_BATCH_BYTES) return NextResponse.json({ error: "Le poids total des PDF dépasse 25 Mo." }, { status: 413 });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    if (!isPdfBytes(bytes)) return NextResponse.json({ error: `« ${source.sourceName} » n'est pas un PDF valide.` }, { status: 400 });
    manifest.push({ storagePath: source.storagePath, sourceName: source.sourceName, size: bytes.byteLength, sourceMime: "application/pdf" });
    content.push({ type: "input_text", text: `Source S${manifest.length} : ${source.sourceName}` });
    content.push({ type: "input_file", filename: source.sourceName, file_data: `data:application/pdf;base64,${Buffer.from(bytes).toString("base64")}` });
  }
  const validation = validatePdfBatch(manifest.map((source) => ({ name: source.sourceName, size: source.size, type: source.sourceMime })));
  if (validation) return NextResponse.json({ error: validation }, { status: 400 });
  return generateFromPreparedSources({ supabase, userId: user.id, content, sources: manifest, sourceType: "pdf", subjectHint: typeof body.subjectHint === "string" ? body.subjectHint : "", titleHint: typeof body.titleHint === "string" ? body.titleHint : "" });
}
