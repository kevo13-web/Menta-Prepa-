"use client";

import { PlanningGenerator } from "@/components/PlanningGenerator";

export function AccountPlanningGenerator() {
  return (
    <div className="account-planning-generator">
      <PlanningGenerator />
      <style jsx global>{`
        .account-planning-generator aside > div > div.grid > section:first-child {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
