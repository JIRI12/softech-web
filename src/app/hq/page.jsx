"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const modules = [
  {
    title: "Technology Audits",
    description:
      "Assess customer technology readiness and identify transformation opportunities.",
    href: "/hq/audits",
    icon: "◉",
  },
  {
    title: "Customers",
    description:
      "Manage customer relationships and transformation journeys.",
    href: "/hq/customers",
    icon: "◎",
  },
  {
    title: "Transformation Plans",
    description:
      "Create and manage customer digital transformation programmes.",
    href: "/hq/plans",
    icon: "◆",
  },
  {
    title: "Implementation",
    description:
      "Track technology implementation projects and delivery progress.",
    href: "/hq/projects",
    icon: "▣",
  },
  {
    title: "Support & Managed Services",
    description:
      "Manage support tickets and recurring technology services.",
    href: "/hq/support",
    icon: "◌",
  },
  {
    title: "Cybersecurity",
    description:
      "Manage security assessments, risks and cybersecurity posture.",
    href: "/hq/cyber",
    icon: "◈",
  },
  {
    title: "Reports & Analytics",
    description:
      "Executive reporting across customers, projects, services and security.",
    href: "/hq/reports",
    icon: "▥",
  },
  {
    title: "Franchise Network",
    description:
      "Manage franchise partners, territories and network performance.",
    href: "/hq/franchise",
    icon: "⌂",
  },
];

export default function HQPage() {
  const router = useRouter();

  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");

  const loadAudits = useCallback(async () => {
    if (!supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("technology_audits")
      .select(
        "id, business_name, contact_name, email, phone, industry, location, score, readiness_level, created_at"
      )
      .order("created_at", { ascending: false });

    if (loadError) {
      console.error("HQ audit load failed:", loadError);
      setError(loadError.message);
      setAudits([]);
    } else {
      setAudits(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    async function checkAuthentication() {
      if (!supabase) {
        setError("Supabase is not configured.");
        setCheckingAuth(false);
        return;
      }

      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !data.session) {
        router.replace("/hq/login");
        return;
      }

      setCheckingAuth(false);
      loadAudits();
    }

    checkAuthentication();
  }, [router, loadAudits]);

  async function handleLogout() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    router.replace("/hq/login");
  }

  const totalLeads = audits.length;

  const averageReadiness =
    audits.length > 0
      ? Math.round(
          audits.reduce(
            (sum, audit) => sum + Number(audit.score || 0),
            0
          ) / audits.length
        )
      : 0;

  const opportunities = audits.filter(
    (audit) => Number(audit.score || 0) < 80
  ).length;

  const advancedBusinesses = audits.filter(
    (audit) => Number(audit.score || 0) >= 80
  ).length;

  if (checkingAuth) {
    return (
      <main className="loading-page">
        <p>Checking SofTech HQ access...</p>
      </main>
    );
  }

  return (
    <main className="hq-page">
      <header className="hq-header">
        <div>
          <Link href="/" className="brand">
            <img src="/softech-logo.png" alt="SofTech" />
          </Link>

          <p>SofTech One — HQ Command Center</p>
        </div>

        <div className="hero-actions">
          <Link href="/" className="secondary-button">
            Website
          </Link>

          <button
            type="button"
            className="secondary-button"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="hq-container">
        <section className="hq-heading">
          <span className="eyebrow">SOFTECH ONE</span>

          <h1>HQ Command Center</h1>

          <p>
            Manage SofTech customers, technology audits,
            transformation opportunities and future operations.
          </p>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Total Businesses</span>
            <strong>{totalLeads}</strong>
            <small>Technology audit leads</small>
          </div>

          <div className="stat-card">
            <span>Audits Completed</span>
            <strong>{audits.length}</strong>
            <small>Completed assessments</small>
          </div>

          <div className="stat-card">
            <span>Average Readiness</span>
            <strong>{averageReadiness}/100</strong>
            <small>Across all businesses</small>
          </div>

          <div className="stat-card">
            <span>Opportunities</span>
            <strong>{opportunities}</strong>
            <small>Businesses below 80</small>
          </div>
        </section>

        <section className="module-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">PLATFORM</span>

              <h2>SofTech One</h2>

              <p>
                Your central operating platform for the SofTech
                technology ecosystem.
              </p>
            </div>
          </div>

          <div className="module-grid">
            {modules.map((module) => (
              <Link
                key={module.title}
                href={module.href}
                className="module-card"
              >
                <span className="module-icon">
                  {module.icon}
                </span>

                <div>
                  <h3>{module.title}</h3>

                  <p>{module.description}</p>
                </div>

                <span className="module-arrow">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="leads-card">
          <div className="leads-header">
            <div>
              <span className="eyebrow">
                CUSTOMER PIPELINE
              </span>

              <h2>Recent Businesses</h2>

              <p>
                Businesses that have completed the SofTech
                Technology Audit.
              </p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={loadAudits}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loading && (
            <p className="empty-state">
              Loading businesses...
            </p>
          )}

          {error && (
            <div className="save-error">
              <strong>
                Unable to load business records.
              </strong>

              <p>{error}</p>
            </div>
          )}

          {!loading && !error && audits.length === 0 && (
            <div className="empty-state">
              <p>
                No businesses have completed an audit yet.
              </p>

              <Link
                href="/audit"
                className="primary-button"
              >
                Run Technology Audit
              </Link>
            </div>
          )}

          {!loading && !error && audits.length > 0 && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Contact</th>
                    <th>Industry</th>
                    <th>Location</th>
                    <th>Score</th>
                    <th>Level</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {audits.slice(0, 10).map((audit) => (
                    <tr key={audit.id}>
                      <td>{audit.business_name}</td>

                      <td>
                        {audit.contact_name || "—"}
                      </td>

                      <td>
                        {audit.industry || "Other"}
                      </td>

                      <td>
                        {audit.location || "—"}
                      </td>

                      <td>
                        {Number(audit.score || 0)}/100
                      </td>

                      <td>
                        {audit.readiness_level || "—"}
                      </td>

                      <td>
                        {audit.created_at
                          ? new Date(
                              audit.created_at
                            ).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="hq-footer-summary">
          <div>
            <span>Advanced Businesses</span>
            <strong>{advancedBusinesses}</strong>
          </div>

          <div>
            <span>Transformation Opportunities</span>
            <strong>{opportunities}</strong>
          </div>

          <div>
            <span>Platform Status</span>
            <strong>Operational</strong>
          </div>
        </section>
      </div>
    </main>
  );
}