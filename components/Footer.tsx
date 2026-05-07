import Link from "next/link";
import { BrainCircuit, Github, Mail, Sparkles } from "lucide-react";
import { navItems } from "@/data/siteData";

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-ink/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 bg-white/8 text-mint">
              <BrainCircuit className="h-5 w-5" />
            </span>
            <span className="text-base font-semibold text-frost">Menta Prépa</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted">
            Une plateforme sérieuse pour transformer une charge de travail dense en décisions
            claires, séances utiles et progression visible.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-frost">Plateforme</h3>
          <div className="mt-4 grid gap-3">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-muted transition hover:text-frost">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-frost">Contact</h3>
          <div className="mt-4 grid gap-3 text-sm text-muted">
            <a className="flex items-center gap-2 transition hover:text-frost" href="mailto:bonjour@mentaprepa.fr">
              <Mail className="h-4 w-4" />
              bonjour@mentaprepa.fr
            </a>
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-mint" />
              Démo fictive sans backend
            </span>
            <span className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              Next.js · React · Tailwind
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/8 px-4 py-5 text-center text-xs text-muted">
        © 2026 Menta Prépa. Discipline, clarté, respiration.
      </div>
    </footer>
  );
}
