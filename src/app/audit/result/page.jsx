"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AuditResultPage() {
  const [audit, setAudit] = useState(null);
  const [saveState, setSaveState] = useState("saved");

  useEffect(() => {
    const stored = sessionStorage.getItem("softechAudit");
    const storedSaveState =
      sessionStorage.getItem("softechAuditSaveState");

    if (!stored) {
      window.location.href = "/audit";
      return;
    }

    try {
      const parsedAudit = JSON.parse(stored);

      setAudit(parsedAudit);

      if (storedSaveState === "local") {
        setSaveState("local");
      } else {
        setSaveState("saved");
      }
    } catch (error) {
      console.error("Unable to load audit:", error);
      window.location.href = "/audit";
    }
  }, []);

  if (!audit) {
    return (
      <main className="loading-page">
        <p>Preparing your Digital Readiness Report...</p>
      </main>
    );
  }

  return (
    <main className="result-page">
      <div className="result-container">
        <Link href="/" className="back-link">
          ← Back to SofTech
        </Link>

        <div className="result-header">
          <span className="eyebrow">SOFTECH TECHNOLOGY AUDIT</span>

          <h1>Digital Readiness Report</h1>

          <p>Prepared for {audit.business.businessName}</p>
        </div>

        <section className="score-grid">
          <div>
            <span>Readiness Score</span>

            <strong>
              {audit.score}
              <small>/100</small>
            </strong>
          </div>

          <div>
            <span>Readiness Level</span>

            <strong className="text-score">
              {audit.readinessLevel}
            </strong>
          </div>

          <div>
            <span>Industry</span>

            <strong className="text-score">
              {audit.business.industry || "Other"}
            </strong>
          </div>
        </section>

        <section className="result-card">
          <h2>What your score means</h2>

          <p>
            {audit.score >= 80
              ? "Your business has strong technology foundations and is positioned to build further digital capabilities."
              : audit.score >= 60
              ? "Your business has a developing technology foundation, with several opportunities to improve."
              : audit.score >= 40
              ? "Your business has some technology foundations in place, but several areas can be improved to support reliable growth."
              : "Your business has significant opportunities to strengthen its technology foundation."}
          </p>
        </section>

        <section className="next-step">
          <h2>Your next step</h2>

          <p>
            SofTech can use this assessment to prepare a structured
            technology transformation plan covering digital systems,
            cybersecurity, cloud, AI, connectivity and business automation.
          </p>
        </section>

        {saveState === "saved" && (
          <p className="save-success">
            ✓ Assessment saved successfully.
          </p>
        )}

        {saveState === "local" && (
          <p className="save-status">
            Assessment completed. Supabase is not configured yet.
          </p>
        )}

        <div className="result-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => window.print()}
          >
            Print / Save PDF
          </button>

          <Link href="/" className="secondary-button">
            Back to SofTech
          </Link>
        </div>
      </div>
    </main>
  );
}