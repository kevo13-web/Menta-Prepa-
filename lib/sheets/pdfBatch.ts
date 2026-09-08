export const MAX_PDF_BATCH_BYTES = 25 * 1024 * 1024;
export const MAX_PDF_BATCH_FILES = 20;

export type PdfSource = {
  storagePath: string;
  sourceName: string;
  sourceMime?: string;
  size?: number;
};

export function isPdfName(name: string) {
  return typeof name === "string" && /\.pdf$/i.test(name.trim());
}

export function validatePdfBatch(files: Array<{ name: string; size: number; type?: string }>) {
  if (!files.length) return "Ajoute au moins un PDF.";
  if (files.length > MAX_PDF_BATCH_FILES) return `Maximum ${MAX_PDF_BATCH_FILES} PDF par fiche.`;
  let total = 0;
  for (const file of files) {
    if (!isPdfName(file.name) || (file.type && file.type !== "application/pdf")) return `« ${file.name} » n'est pas un PDF valide.`;
    if (!Number.isSafeInteger(file.size) || file.size <= 0) return `« ${file.name} » est vide ou invalide.`;
    total += file.size;
    if (total > MAX_PDF_BATCH_BYTES) return "Le poids total des PDF ne doit pas dépasser 25 Mo.";
  }
  return "";
}

export function validatePdfSources(value: unknown, userId: string): PdfSource[] {
  if (!Array.isArray(value) || !value.length || value.length > MAX_PDF_BATCH_FILES) throw new Error("INVALID_PDF_BATCH");
  const paths = new Set<string>();
  return value.map((entry: unknown) => {
    if (!entry || typeof entry !== "object") throw new Error("INVALID_PDF_BATCH");
    const source = entry as Record<string, unknown>;
    const storagePath = source.storagePath;
    const sourceName = source.sourceName;
    if (typeof storagePath !== "string" || typeof sourceName !== "string" || !isPdfName(sourceName) || sourceName.length > 255 || !storagePath.startsWith(`${userId}/`) || storagePath.includes("..") || paths.has(storagePath)) throw new Error("INVALID_PDF_BATCH");
    paths.add(storagePath);
    const size = source.size;
    if (size !== undefined && (!Number.isSafeInteger(size) || (size as number) <= 0 || (size as number) > MAX_PDF_BATCH_BYTES)) throw new Error("INVALID_PDF_BATCH");
    return { storagePath, sourceName, sourceMime: "application/pdf", size: typeof size === "number" ? size : undefined };
  });
}

export function isPdfBytes(bytes: Uint8Array) {
  return bytes.length >= 5 && bytes[0] === 37 && bytes[1] === 80 && bytes[2] === 68 && bytes[3] === 70 && bytes[4] === 45;
}
