import { GeneratedSheetView } from "@/components/GeneratedSheetView";
import type { FocusSheet } from "@/data/evilStudy";
import { createClient } from "@/lib/supabase/server";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function GeneratedSheetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: row } = await supabase
    .from("study_sheets")
    .select("id, title, subject, content")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!row) notFound();

  const content = row.content as Omit<FocusSheet, "id" | "title" | "subject" | "type" | "level">;
  const sheet: FocusSheet = {
    id: row.id,
    title: row.title,
    subject: row.subject,
    type: "Fiche générée",
    level: "Menta AI",
    ...content,
  };

  return (
    <section className="min-h-screen px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/fiches" className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-white/70 px-4 text-sm font-semibold text-[#5267d9] shadow-sm backdrop-blur-xl">
          <ChevronLeft className="h-4 w-4" /> Retour aux fiches
        </Link>
        <GeneratedSheetView sheet={sheet} />
      </div>
    </section>
  );
}
