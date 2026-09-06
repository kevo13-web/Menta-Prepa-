import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const priceByPlan = {
  etudiant_plus: process.env.STRIPE_PRICE_ETUDIANT_PLUS,
  prepa_pro: process.env.STRIPE_PRICE_PREPA_PRO,
} as const;

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe n’est pas encore configuré." }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const plan = body.plan as keyof typeof priceByPlan;
  const price = priceByPlan[plan];

  if (!price) {
    return NextResponse.json({ error: "Offre invalide ou prix Stripe manquant." }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: `${siteUrl}/account?checkout=success`,
    cancel_url: `${siteUrl}/#tarifs`,
    allow_promotion_codes: true,
    client_reference_id: user.id,
    customer: profile?.stripe_customer_id || undefined,
    customer_email: profile?.stripe_customer_id ? undefined : user.email,
    metadata: { user_id: user.id, plan },
    subscription_data: { metadata: { user_id: user.id, plan } },
  });

  return NextResponse.json({ url: session.url });
}
