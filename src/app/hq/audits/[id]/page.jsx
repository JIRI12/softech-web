"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

export default function AuditDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAudit() {
      if (!supabase) {
        setError("Supabase is not configured.");
        setLoading(false);
        return;
      }

      const { data: sessionData } =
        await supabase.auth.getSession();

      if (!sessionData.session) {
        router.replace("/hq/login");
        return;
      }

      const { data, error: loadError } = await supabase
        .from("technology_audits")
        .select("*")
        .eq("id", params.id)
        .single();

      if (loadError) {
        console.error(loadError);
        setError("Unable to load this technology audit.");
      } else {
        setAudit(data);
      }

      setLoading(false);
    }

    if (params.id) {
      loadAudit();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <main className="loading-page">
        <p>Loading technology audit...</p>
      </main>
    );
  }

  if (error || !audit) {
    return (
      <main className="loading-page">
        <div>
          <p>{error || "Audit not found."}</p>

          <Link
            href="/hq/audits"
            className="secondary-button"
          >
            ← Back to Audits
          </Link>
        </div>
      </main>
    );
  }

  const answers =
    audit.answers && typeof audit.answers === "object"
      ? Object.entries(audit.answers)
      : [];

  return (
    <main className="hq-page">
      <header className="hq-header">
        <div>
          <Link href="/" className="brand">
            <img src="/softech-logo.png" alt="SofTech" />
          </Link>

          <p>SofTech One — Audit Report</p>
        </div>

        <Link
          href="/hq/audits"
          className="secondary-button"
        >
          ← All Audits
        </Link>
      </header>

      <div className="hq-container">
        <section className="audit-report-header">
          <div>
            <span className="eyebrow">
              SOFTECH TECHNOLOGY AUDIT
            </span>

            <h1>{audit.business_name}</h1>

            <p>
              Digital Readiness Assessment
            </p>
          </div>

          <div className="audit-score-large">
            <span>Readiness Score</span>

            <strong>
              {Number(audit.score || 0)}
              <small>/100</small>
            </strong>

            <em>
              {audit.readiness_level || "—"}
            </em>
          </div>
        </section>

        <section className="audit-detail-grid">
          <div className="result-card">
            <span className="eyebrow">BUSINESS</span>

            <h2>Business Information</h2>

            <div className="detail-list">
              <div>
                <span>Business</span>
                <strong>{audit.business_name}</strong>
              </div>

              <div>
                <span>Contact</span>
                <strong>
                  {audit.contact_name || "—"}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {audit.email || "—"}
                </strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>
                  {audit.phone || "—"}
                </strong>
              </div>

              <div>
                <span>Industry</span>
                <strong>
                  {audit.industry || "Other"}
                </strong>
              </div>

              <div>
                <span>Location</span>
                <strong>
                  {audit.location || "—"}
                </strong>
              </div>

              <div>
                <span>Assessment Date</span>
                <strong>
                  {audit.created_at
                    ? new Date(
                        audit.created_at
                      ).toLocaleString()
                    : "—"}
                </strong>
              </div>
            </div>
          </div>

          <div className="result-card">
            <span className="eyebrow">NEXT STEP</span>

            <h2>Transformation Opportunity</h2>

            <p>
              Use this assessment to prepare a structured
              SofTech transformation plan covering digital
              systems, cybersecurity, cloud, AI,
              connectivity and business automation.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                alert(
                  "Transformation Plan module will be connected next."
                )
              }
            >
              Create Transformation Plan →
            </button>
          </div>
        </section>

        <section className="result-card answers-card">
          <div className="section-heading">
            <span className="eyebrow">
              ASSESSMENT RESULTS
            </span>

            <h2>Technology Assessment</h2>

            <p>
              Complete responses submitted by the business.
            </p>
          </div>

          <div className="answer-review-grid">
            {answers.map(([question, response], index) => (
              <div
                key={question}
                className="answer-review"
              >
                <span>
                  Question {index + 1}
                </span>

                <h3>
                  {formatQuestion(question)}
                </h3>

                <p>
                  {response?.answer || "No response"}
                </p>

                <strong>
                  {Number(response?.points || 0)}/10
                </strong>
              </div>
            ))}
          </div>
        </section>

        <div className="result-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => window.print()}
          >
            Print / Save PDF
          </button>

          <Link
            href="/hq/audits"
            className="secondary-button"
          >
            Back to Audits
          </Link>
        </div>
      </div>
    </main>
  );
}

function formatQuestion(value) {
  const labels = {
    website:
      "Does your business have a professional website?",
    email:
      "Does your business use professional business email?",
    cloud:
      "Does your business use cloud services?",
    backup:
      "Are your important business files regularly backed up?",
    cybersecurity:
      "Does your business have cybersecurity protection?",
    automation:
      "How much of your business uses digital automation?",
    ai:
      "Does your business currently use AI tools?",
    network:
      "Is your business network professionally managed?",
    support:
      "Does your business have reliable IT support?",
    training:
      "Do staff receive technology/security training?",
  };

  return labels[value] || value;
}