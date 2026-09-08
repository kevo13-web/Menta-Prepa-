import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.SUPABASE_SECRET_KEY) {
    return NextResponse.json({ error: "Webhook non configuré." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature Stripe manquante." }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Signature Stripe invalide." }, { status: 400 });
  }

  const supabase = adminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id ?? session.client_reference_id;
    const plan = session.metadata?.plan ?? "gratuit";

    if (userId) {
      await supabase.from("profiles").update({
        stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id,
        stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : session.subscription?.id,
        subscription_status: "active",
        plan,
        updated_at: new Date().toISOString(),
      }).eq("id", userId);
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata.user_id;
    const plan = subscription.metadata.plan ?? "gratuit";
    const periodEnd = subscription.items.data[0]?.current_period_end;

    if (userId) {
      await supabase.from("profiles").update({
        stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        plan: event.type === "customer.subscription.deleted" ? "gratuit" : plan,
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      }).eq("id", userId);
    }
  }

  return NextResponse.json({ received: true });
}
