"use client";

import { useState } from "react";

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openPortal() {
    setLoading(true);
    setError("");

    const response = await fetch("/api/billing-portal", { method: "POST" });
    const data = await response.json();

    if (!response.ok || !data.url) {
      setError(data.error ?? "Impossible d’ouvrir la gestion de l’abonnement.");
      setLoading(false);
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div>
      <button
        type="button"
        onClick={openPortal}
        disabled={loading}
        className="mt-5 min-h-10 rounded-full border border-[#bfd0dc] bg-white/70 px-4 py-2 text-sm font-semibold text-frost transition hover:bg-[#edf5f9] disabled:opacity-60"
      >
        {loading ? "Ouverture…" : "Gérer mon abonnement"}
      </button>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
