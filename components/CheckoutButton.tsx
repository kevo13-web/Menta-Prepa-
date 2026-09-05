"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CheckoutButtonProps = {
  plan: "etudiant_plus" | "prepa_pro";
  featured?: boolean;
};

export function CheckoutButton({ plan, featured = false }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function checkout() {
    setLoading(true);
    setError("");

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    if (response.status === 401) {
      router.push(`/auth?message=${encodeURIComponent("Connecte-toi avant de choisir ton abonnement.")}`);
      return;
    }

    const data = await response.json();
    if (!response.ok || !data.url) {
      setError(data.error ?? "Impossible d’ouvrir le paiement.");
      setLoading(false);
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={checkout}
        disabled={loading}
        className={featured
          ? "min-h-11 w-full rounded-full bg-[#173f66] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#245783] disabled:opacity-60"
          : "min-h-11 w-full rounded-full border border-[#bfd0dc] bg-white/70 px-5 py-2.5 text-sm font-semibold text-frost transition hover:bg-[#edf5f9] disabled:opacity-60"}
      >
        {loading ? "Ouverture du paiement…" : "Choisir cette offre"}
      </button>
      {error ? <p className="mt-2 text-center text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
