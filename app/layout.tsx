import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Menta Prépa | Stratégie mentale du travail étudiant",
  description:
    "Menta Prépa transforme les emplois du temps en systèmes de travail clairs, disciplinés et intelligents pour les étudiants ambitieux.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
