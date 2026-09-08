import type { Metadata } from "next";
import { SheetSourceCreator } from "@/components/SheetSourceCreator";

export const metadata: Metadata = {
  title: "Créer une fiche | Menta Prépa",
};

export default function CreateSheetPage() {
  return (
    <section className="min-h-screen px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SheetSourceCreator />
      </div>
    </section>
  );
}
