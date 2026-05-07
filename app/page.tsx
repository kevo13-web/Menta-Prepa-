import Image from "next/image";
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
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { benefits, howItWorks, pricingPlans, testimonials } from "@/data/siteData";

const benefitIcons = [CalendarDays, Bot, BookOpenCheck, Target, Mic2];

export default function HomePage() {
  return (
    <>
      <section className="relative min-h-[92vh] overflow-hidden px-4 pt-28 sm:px-6 lg:px-8">
        <Image
          src="/menta-prepa-hero.png"
          alt="Bureau sombre avec ordinateur et planning de révision intelligent"
          fill
          priority
          className="absolute inset-0 -z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#050508_0%,rgba(5,5,8,0.94)_34%,rgba(5,5,8,0.64)_64%,rgba(5,5,8,0.42)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-ink to-transparent" />

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-12 pb-10">
          <div className="max-w-4xl pt-12 sm:pt-20">
            <Reveal>
              <p className="mb-5 inline-flex rounded-full border border-white/14 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-mint backdrop-blur-xl">
                Laboratoire mental · Stratégie · Discipline
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="text-balance text-5xl font-semibold tracking-normal text-frost sm:text-6xl lg:text-7xl">
                L’interface mentale pour reprendre le contrôle de ton travail.
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-frost/72 sm:text-xl">
                Menta Prépa structure tes révisions, clarifie tes priorités, prépare tes
                khôlles et transforme ton effort en système discipliné.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PremiumButton href="/planning">Créer mon planning</PremiumButton>
                <PremiumButton href="/conseils" variant="secondary">
                  Découvrir les conseils
                </PremiumButton>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.3}>
            <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
              {[
                ["48h", "pour restaurer de la clarté dans une semaine chargée"],
                ["7j", "de planning visuel ajustable"],
                ["0 API", "une démo front-end autonome et maîtrisée"],
              ].map(([value, label]) => (
                <div key={value} className="rounded-lg border border-white/12 bg-ink/45 p-4 backdrop-blur-xl">
                  <p className="text-2xl font-semibold text-frost">{value}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeader
              eyebrow="Ce que Menta Prépa change"
              title="Un poste de commandement pour penser, prioriser et exécuter."
              description="La plateforme ne vend pas d’agitation. Elle clarifie les décisions : quoi travailler, quand, pourquoi, et comment mesurer l’avancée sans bruit inutile."
            />
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {benefits.map((benefit, index) => {
              const Icon = benefitIcons[index];

              return (
                <Reveal key={benefit.title} delay={index * 0.05}>
                  <GlassCard className="h-full">
                    <Icon className="mb-6 h-7 w-7 text-mint" />
                    <h3 className="text-lg font-semibold text-frost">{benefit.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted">{benefit.text}</p>
                  </GlassCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-white/8 bg-white/[0.025] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeader
              eyebrow="Comment ça marche ?"
              title="Tu donnes les contraintes. Menta Prépa construit la stratégie."
              align="center"
            />
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step, index) => (
              <Reveal key={step} delay={index * 0.06}>
                <div className="relative rounded-lg border border-white/10 bg-ink/60 p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-mint to-sage text-sm font-bold text-ink">
                    {index + 1}
                  </span>
                  <h3 className="mt-8 text-xl font-semibold text-frost">{step}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    Chaque étape réduit l’ambiguïté et convertit la charge mentale en action
                    concrète.
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeader
              eyebrow="Retours étudiants"
              title="Des témoignages fictifs, mais des problèmes très réels."
              description="La réussite tient souvent à quelques décisions répétées : cadrer, prioriser, corriger, recommencer."
            />
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Reveal key={testimonial.name} delay={index * 0.06}>
                <GlassCard className="h-full">
                  <Quote className="mb-6 h-7 w-7 text-sage" />
                  <p className="text-base leading-7 text-frost/88">“{testimonial.quote}”</p>
                  <div className="mt-8">
                    <p className="font-semibold text-frost">{testimonial.name}</p>
                    <p className="text-sm text-muted">{testimonial.role}</p>
                  </div>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeader
              eyebrow="Tarifs fictifs"
              title="Choisis le niveau d’accompagnement qui colle à ta saison."
              align="center"
            />
          </Reveal>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <Reveal key={plan.name} delay={index * 0.06}>
                <div className={`h-full rounded-lg border p-6 ${
                  plan.featured
                    ? "border-mint/45 bg-mint/10 shadow-glow"
                    : "border-white/10 bg-white/[0.045]"
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-frost">{plan.name}</h3>
                      <p className="mt-2 text-sm text-muted">{plan.description}</p>
                    </div>
                    {plan.featured ? (
                      <span className="rounded-full bg-frost px-3 py-1 text-xs font-semibold text-ink">
                        Populaire
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-8 text-4xl font-semibold text-frost">
                    {plan.price}
                    <span className="text-sm font-medium text-muted"> / mois</span>
                  </p>
                  <div className="mt-8 grid gap-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3 text-sm text-frost/84">
                        <Check className="h-4 w-4 text-mint" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <PremiumButton href="/auth" variant={plan.featured ? "primary" : "secondary"} className="mt-8 w-full">
                    Commencer
                  </PremiumButton>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
