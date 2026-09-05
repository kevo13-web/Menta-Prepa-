import {
  BookOpenCheck,
  Bot,
  CalendarDays,
  Check,
  Mic2,
  Quote,
  Target,
} from "lucide-react";
import { PremiumButton } from "@/components/PremiumButton";
import { CheckoutButton } from "@/components/CheckoutButton";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { benefits, howItWorks, pricingPlans, testimonials } from "@/data/siteData";

const benefitIcons = [CalendarDays, Bot, BookOpenCheck, Target, Mic2];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#dcecf5_0%,#eff5f5_44%,#f7f2e9_100%)]" />
        <div className="absolute -left-24 top-20 -z-10 h-72 w-72 rounded-full bg-white/70 blur-3xl" />
        <div className="absolute right-[-8rem] top-16 -z-10 h-96 w-96 rounded-full bg-[#87b8d8]/30 blur-3xl" />
        <div className="absolute inset-x-0 top-24 -z-10 h-40 opacity-70 [background-image:radial-gradient(circle_at_20%_80%,white_0_3%,transparent_4%),radial-gradient(circle_at_48%_35%,white_0_5%,transparent_6%),radial-gradient(circle_at_78%_55%,white_0_4%,transparent_5%)]" />

        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="py-10 sm:py-16">
            <Reveal>
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#4d7192]">Travailler aujourd’hui, pour les horizons de demain.</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="display-serif text-balance text-6xl font-medium leading-[0.94] text-[#15314f] sm:text-7xl lg:text-8xl">Menta <span className="italic">Prépa</span></h1>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="display-serif mt-5 max-w-xl text-3xl italic leading-tight text-[#456883] sm:text-4xl">Des bases solides pour voir plus loin.</p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#52687b] sm:text-lg">Fiches, quiz, plannings et méthodes pour t’accompagner tout au long de ta prépa. Avancer, comprendre, progresser.</p>
            </Reveal>
            <Reveal delay={0.26}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PremiumButton href="/planning">Commencer à réviser</PremiumButton>
                <PremiumButton href="/dashboard" variant="secondary">Découvrir Menta</PremiumButton>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] border border-[#315b7f]/10 bg-white/55 p-7 shadow-[0_24px_70px_rgba(44,78,108,0.14)] backdrop-blur-xl">
              <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,.65),rgba(162,202,228,.25))]" />
              <div className="absolute -right-14 -top-10 h-52 w-52 rounded-full bg-[#91c3e2]/45 blur-2xl" />
              <div className="absolute -bottom-20 left-12 h-56 w-56 rounded-full bg-[#f4dcb6]/45 blur-3xl" />
              <div className="relative flex h-full min-h-[370px] flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#294c6d]">Vue du jour</span>
                  <span className="rounded-full border border-[#315b7f]/10 bg-white/65 px-3 py-1 text-xs text-[#637789]">Khâgne · 2026</span>
                </div>
                <div className="my-8 grid gap-3 sm:grid-cols-2">
                  {["Philosophie", "Histoire", "Lettres", "Langues"].map((item, i) => (
                    <div key={item} className="rounded-2xl border border-[#315b7f]/10 bg-white/70 p-5 shadow-sm">
                      <div className="mb-5 h-1.5 w-12 rounded-full bg-[#5c8fba]" style={{ opacity: 1 - i * 0.12 }} />
                      <p className="display-serif text-xl text-[#173a5e]">{item}</p>
                      <p className="mt-1 text-xs text-[#728293]">Progression suivie</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-[#315b7f]/10 bg-[#173a5e] p-5 text-white shadow-lg">
                  <p className="display-serif text-2xl italic">« Un peu plus loin, chaque jour. »</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/60">Menta Prépa</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal><SectionHeader eyebrow="Ce que Menta Prépa change" title="Un espace calme pour mieux travailler." description="Tout ce dont tu as besoin pour organiser ta prépa sans surcharge visuelle : des priorités claires, des outils simples et une progression visible." /></Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {benefits.map((benefit, index) => {
              const Icon = benefitIcons[index];
              return (
                <Reveal key={benefit.title} delay={index * 0.05}>
                  <GlassCard className="h-full"><Icon className="mb-6 h-7 w-7 text-mint" /><h3 className="text-lg font-semibold text-frost">{benefit.title}</h3><p className="mt-3 text-sm leading-6 text-muted">{benefit.text}</p></GlassCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-[#315b7f]/10 bg-white/35 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal><SectionHeader eyebrow="Comment ça marche ?" title="Une méthode simple, pensée pour durer." align="center" /></Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step, index) => (
              <Reveal key={step} delay={index * 0.06}>
                <div className="rounded-2xl border border-[#315b7f]/10 bg-white/65 p-6 shadow-sm"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dbeaf3] text-sm font-bold text-[#173a5e]">{index + 1}</span><h3 className="mt-8 text-xl font-semibold text-frost">{step}</h3><p className="mt-3 text-sm leading-6 text-muted">Chaque étape réduit la charge mentale et transforme tes objectifs en actions concrètes.</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal><SectionHeader eyebrow="Retours étudiants" title="Une prépa plus structurée, plus respirable." description="La régularité vient plus facilement quand l’outil donne envie de revenir travailler." /></Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Reveal key={testimonial.name} delay={index * 0.06}>
                <GlassCard className="h-full"><Quote className="mb-6 h-7 w-7 text-sage" /><p className="text-base leading-7 text-frost/90">“{testimonial.quote}”</p><div className="mt-8"><p className="font-semibold text-frost">{testimonial.name}</p><p className="text-sm text-muted">{testimonial.role}</p></div></GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="tarifs" className="scroll-mt-24 px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal><SectionHeader eyebrow="Abonnements" title="Choisis le rythme qui te convient." align="center" /></Reveal>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <Reveal key={plan.name} delay={index * 0.06}>
                <div className={`h-full rounded-2xl border p-6 shadow-sm ${plan.featured ? "border-[#5f91ba]/35 bg-[#e7f0f5]" : "border-[#315b7f]/10 bg-white/60"}`}>
                  <div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-semibold text-frost">{plan.name}</h3><p className="mt-2 text-sm text-muted">{plan.description}</p></div>{plan.featured ? <span className="rounded-full bg-[#173a5e] px-3 py-1 text-xs font-semibold text-white">Populaire</span> : null}</div>
                  <p className="mt-8 text-4xl font-semibold text-frost">{plan.price}<span className="text-sm font-medium text-muted"> / mois</span></p>
                  <div className="mt-8 grid gap-3">{plan.features.map((feature) => <div key={feature} className="flex items-center gap-3 text-sm text-frost/85"><Check className="h-4 w-4 text-mint" />{feature}</div>)}</div>
                  {plan.name === "Gratuit" ? (
                    <PremiumButton href="/auth" variant="secondary" className="mt-8 w-full">Créer mon compte</PremiumButton>
                  ) : (
                    <CheckoutButton plan={plan.name === "Étudiant Plus" ? "etudiant_plus" : "prepa_pro"} featured={Boolean(plan.featured)} />
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
