"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function TechnologyAuditsPage() {
  const router = useRouter();

  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");

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
        "id, business_name, contact_name, email, phone, industry, location, score, readiness_level, answers, created_at"
      )
      .order("created_at", { ascending: false });

    if (loadError) {
      console.error(loadError);
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

      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/hq/login");
        return;
      }

      setCheckingAuth(false);
      loadAudits();
    }

    checkAuthentication();
  }, [router, loadAudits]);

  const filteredAudits = audits.filter((audit) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      audit.business_name?.toLowerCase().includes(searchValue) ||
      audit.contact_name?.toLowerCase().includes(searchValue) ||
      audit.email?.toLowerCase().includes(searchValue) ||
      audit.industry?.toLowerCase().includes(searchValue);

    const matchesLevel =
      levelFilter === "All" ||
      audit.readiness_level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  const averageScore =
    audits.length > 0
      ? Math.round(
          audits.reduce(
            (sum, audit) => sum + Number(audit.score || 0),
            0
          ) / audits.length
        )
      : 0;

  const advanced = audits.filter(
    (audit) => Number(audit.score || 0) >= 80
  ).length;

  const opportunities = audits.filter(
    (audit) => Number(audit.score || 0) < 80
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

          <p>SofTech One — Technology Audits</p>
        </div>

        <div className="hero-actions">
          <Link href="/hq" className="secondary-button">
            ← HQ Dashboard
          </Link>
        </div>
      </header>

      <div className="hq-container">
        <section className="hq-heading">
          <span className="eyebrow">SOFTECH ONE / AUDITS</span>

          <h1>Technology Audits</h1>

          <p>
            Review business technology readiness assessments
            and identify transformation opportunities.
          </p>
        </section>

        <section className="stats-grid audit-stats">
          <div className="stat-card">
            <span>Total Assessments</span>
            <strong>{audits.length}</strong>
            <small>Completed technology audits</small>
          </div>

          <div className="stat-card">
            <span>Average Score</span>
            <strong>{averageScore}/100</strong>
            <small>Across all businesses</small>
          </div>

          <div className="stat-card">
            <span>Advanced</span>
            <strong>{advanced}</strong>
            <small>80+ readiness score</small>
          </div>

          <div className="stat-card">
            <span>Opportunities</span>
            <strong>{opportunities}</strong>
            <small>Below 80 readiness</small>
          </div>
        </section>

        <section className="leads-card">
          <div className="audit-toolbar">
            <div>
              <h2>Assessment Records</h2>
              <p>
                Search and review completed SofTech assessments.
              </p>
            </div>

            <Link href="/audit" className="primary-button">
              New Technology Audit
            </Link>
          </div>

          <div className="audit-filters">
            <input
              type="search"
              placeholder="Search business, contact, email or industry..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              value={levelFilter}
              onChange={(event) =>
                setLevelFilter(event.target.value)
              }
            >
              <option value="All">All readiness levels</option>
              <option value="Foundation">Foundation</option>
              <option value="Basic">Basic</option>
              <option value="Developing">Developing</option>
              <option value="Advanced">Advanced</option>
            </select>

            <button
              type="button"
              className="secondary-button"
              onClick={loadAudits}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {error && (
            <div className="save-error">
              <strong>Unable to load assessments.</strong>
              <p>{error}</p>
            </div>
          )}

          {loading && (
            <div className="empty-state">
              Loading technology audits...
            </div>
          )}

          {!loading && !error && filteredAudits.length === 0 && (
            <div className="empty-state">
              <p>No assessments match your search.</p>
            </div>
          )}

          {!loading && !error && filteredAudits.length > 0 && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Contact</th>
                    <th>Industry</th>
                    <th>Score</th>
                    <th>Readiness</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAudits.map((audit) => (
                    <tr key={audit.id}>
                      <td>
                        <strong className="business-name">
                          {audit.business_name}
                        </strong>
                      </td>

                      <td>
                        <div>
                          {audit.contact_name || "—"}
                        </div>

                        <small className="table-muted">
                          {audit.email || ""}
                        </small>
                      </td>

                      <td>
                        {audit.industry || "Other"}
                      </td>

                      <td>
                        <strong>
                          {Number(audit.score || 0)}/100
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`readiness-badge ${(
                            audit.readiness_level || ""
                          )
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {audit.readiness_level || "—"}
                        </span>
                      </td>

                      <td>
                        {audit.created_at
                          ? new Date(
                              audit.created_at
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>
                        <Link
                          href={`/hq/audits/${audit.id}`}
                          className="view-button"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}