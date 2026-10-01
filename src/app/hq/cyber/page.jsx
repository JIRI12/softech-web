"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const riskLevels = ["low", "medium", "high", "critical"];
const statuses = ["open", "in_progress", "resolved", "closed"];

const emptyForm = {
  customerId: "",
  assessmentName: "",
  securityScore: 0,
  riskLevel: "medium",
  status: "open",
  findings: 0,
  criticalFindings: 0,
  recommendations: "",
  assessedBy: "",
  assessmentDate: new Date().toISOString().slice(0, 10),
  nextReviewDate: "",
};

function riskClass(level) {
  return `risk-badge ${level}`;
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-ZW", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CybersecurityPage() {
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [assessments, setAssessments] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function initialize() {
      if (!supabase) {
        setError("Supabase is not configured.");
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/hq/login");
        return;
      }

      setSession(data.session);

      await Promise.all([
        loadCustomers(),
        loadAssessments(),
      ]);

      setLoading(false);
    }

    initialize();
  }, [router]);

  async function loadCustomers() {
    const { data, error: loadError } = await supabase
      .from("customers")
      .select("*")
      .order("business_name", { ascending: true });

    if (loadError) {
      setError(loadError.message);
      return;
    }

    setCustomers(data || []);
  }

  async function loadAssessments() {
    const { data, error: loadError } = await supabase
      .from("security_assessments")
      .select(`
        *,
        customers (
          id,
          business_name,
          industry
        )
      `)
      .order("created_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
      return;
    }

    setAssessments(data || []);
  }

  function updateForm(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function createAssessment(event) {
    event.preventDefault();

    if (!form.customerId || !form.assessmentName.trim()) {
      setError("Customer and assessment name are required.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const { error: insertError } = await supabase
      .from("security_assessments")
      .insert({
        customer_id: form.customerId,
        assessment_name: form.assessmentName.trim(),
        security_score: Number(form.securityScore),
        risk_level: form.riskLevel,
        status: form.status,
        findings: Number(form.findings),
        critical_findings: Number(form.criticalFindings),
        recommendations: form.recommendations.trim() || null,
        assessed_by: form.assessedBy.trim() || null,
        assessment_date: form.assessmentDate,
        next_review_date: form.nextReviewDate || null,
      });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setForm(emptyForm);
    setMessage("Security assessment created successfully.");

    await loadAssessments();

    setSaving(false);
  }

  async function updateAssessment(id, field, value) {
    const update = {
      [field]: value,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("security_assessments")
      .update(update)
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setAssessments((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, ...update }
          : item
      )
    );
  }

  const stats = useMemo(() => {
    const total = assessments.length;

    const lowRisk = assessments.filter(
      (item) => item.risk_level === "low"
    ).length;

    const highRisk = assessments.filter(
      (item) =>
        item.risk_level === "high" ||
        item.risk_level === "critical"
    ).length;

    const average =
      total > 0
        ? Math.round(
            assessments.reduce(
              (sum, item) => sum + Number(item.security_score || 0),
              0
            ) / total
          )
        : 0;

    return {
      total,
      lowRisk,
      highRisk,
      average,
    };
  }, [assessments]);

  const filteredAssessments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assessments.filter((item) => {
      const matchesSearch =
        !query ||
        item.assessment_name?.toLowerCase().includes(query) ||
        item.customers?.business_name?.toLowerCase().includes(query) ||
        item.assessed_by?.toLowerCase().includes(query);

      const matchesRisk =
        riskFilter === "all" ||
        item.risk_level === riskFilter;

      return matchesSearch && matchesRisk;
    });
  }, [assessments, search, riskFilter]);

  if (loading) {
    return (
      <main className="hq-page">
        <div className="hq-content">
          <div className="loading-card">
            Loading Cybersecurity Center...
          </div>
        </div>
      </main>
    );
  }

  if (!session) return null;

  return (
    <main className="hq-page">
      <div className="hq-content">

        <section className="module-header">
          <div>
            <span className="eyebrow">CYBERSECURITY</span>
            <h1>Cybersecurity Center</h1>
            <p>
              Manage security assessments, risks and cybersecurity
              posture across SofTech customers.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={loadAssessments}
          >
            Refresh
          </button>
        </section>

        {error && (
          <div className="alert-error">
            {error}
          </div>
        )}

        {message && (
          <div className="alert-success">
            {message}
          </div>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <span>Total Assessments</span>
            <strong>{stats.total}</strong>
          </div>

          <div className="stat-card">
            <span>Low Risk</span>
            <strong>{stats.lowRisk}</strong>
          </div>

          <div className="stat-card">
            <span>High / Critical</span>
            <strong>{stats.highRisk}</strong>
          </div>

          <div className="stat-card">
            <span>Average Security Score</span>
            <strong>{stats.average}/100</strong>
          </div>
        </section>

        <section className="cyber-form">
          <div className="section-heading">
            <div>
              <span className="eyebrow">NEW ASSESSMENT</span>
              <h2>Create Security Assessment</h2>
            </div>
          </div>

          <form onSubmit={createAssessment}>
            <div className="form-grid">

              <label>
                Customer
                <select
                  name="customerId"
                  value={form.customerId}
                  onChange={updateForm}
                  required
                >
                  <option value="">Select customer</option>

                  {customers.map((customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.business_name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Assessment Name
                <input
                  name="assessmentName"
                  value={form.assessmentName}
                  onChange={updateForm}
                  placeholder="e.g. Network Security Assessment"
                  required
                />
              </label>

              <label>
                Security Score
                <input
                  type="number"
                  name="securityScore"
                  min="0"
                  max="100"
                  value={form.securityScore}
                  onChange={updateForm}
                />
              </label>

              <label>
                Risk Level
                <select
                  name="riskLevel"
                  value={form.riskLevel}
                  onChange={updateForm}
                >
                  {riskLevels.map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() +
                        level.slice(1)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Status
                <select
                  name="status"
                  value={form.status}
                  onChange={updateForm}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status
                        .replace("_", " ")
                        .replace(/\b\w/g, (letter) =>
                          letter.toUpperCase()
                        )}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Findings
                <input
                  type="number"
                  name="findings"
                  min="0"
                  value={form.findings}
                  onChange={updateForm}
                />
              </label>

              <label>
                Critical Findings
                <input
                  type="number"
                  name="criticalFindings"
                  min="0"
                  value={form.criticalFindings}
                  onChange={updateForm}
                />
              </label>

              <label>
                Assessed By
                <input
                  name="assessedBy"
                  value={form.assessedBy}
                  onChange={updateForm}
                  placeholder="Security analyst"
                />
              </label>

              <label>
                Assessment Date
                <input
                  type="date"
                  name="assessmentDate"
                  value={form.assessmentDate}
                  onChange={updateForm}
                />
              </label>

              <label>
                Next Review Date
                <input
                  type="date"
                  name="nextReviewDate"
                  value={form.nextReviewDate}
                  onChange={updateForm}
                />
              </label>

              <label className="full-width">
                Recommendations
                <textarea
                  name="recommendations"
                  value={form.recommendations}
                  onChange={updateForm}
                  rows="4"
                  placeholder="Security recommendations and remediation actions..."
                />
              </label>

            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Creating Assessment..."
                : "Create Security Assessment"}
            </button>
          </form>
        </section>

        <section className="module-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">SECURITY REGISTER</span>
              <h2>Security Assessments</h2>
            </div>
          </div>

          <div className="module-filters">
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search assessments, customers or analysts..."
            />

            <select
              value={riskFilter}
              onChange={(event) =>
                setRiskFilter(event.target.value)
              }
            >
              <option value="all">All Risk Levels</option>
              {riskLevels.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() +
                    level.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {filteredAssessments.length === 0 ? (
            <div className="empty-state">
              No security assessments found.
            </div>
          ) : (
            <div className="cyber-grid">
              {filteredAssessments.map((assessment) => (
                <article
                  className="cyber-card"
                  key={assessment.id}
                >
                  <div className="cyber-card-top">
                    <div>
                      <span className="eyebrow">
                        {assessment.customers?.business_name ||
                          "Customer"}
                      </span>

                      <h3>
                        {assessment.assessment_name}
                      </h3>

                      <p>
                        {assessment.customers?.industry ||
                          "Technology customer"}
                      </p>
                    </div>

                    <span
                      className={riskClass(
                        assessment.risk_level
                      )}
                    >
                      {assessment.risk_level}
                    </span>
                  </div>

                  <div className="security-score">
                    <div className="score-ring">
                      <strong>
                        {assessment.security_score}
                      </strong>
                      <span>/100</span>
                    </div>

                    <div>
                      <span>Security Score</span>
                      <div className="score-bar">
                        <div
                          style={{
                            width: `${assessment.security_score}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="cyber-meta">
                    <div>
                      <span>Findings</span>
                      <strong>
                        {assessment.findings}
                      </strong>
                    </div>

                    <div>
                      <span>Critical</span>
                      <strong>
                        {assessment.critical_findings}
                      </strong>
                    </div>

                    <div>
                      <span>Assessed</span>
                      <strong>
                        {formatDate(
                          assessment.assessment_date
                        )}
                      </strong>
                    </div>
                  </div>

                  {assessment.recommendations && (
                    <div className="recommendation-box">
                      <span>Recommendations</span>
                      <p>
                        {assessment.recommendations}
                      </p>
                    </div>
                  )}

                  <div className="cyber-controls">
                    <label>
                      Risk
                      <select
                        value={assessment.risk_level}
                        onChange={(event) =>
                          updateAssessment(
                            assessment.id,
                            "risk_level",
                            event.target.value
                          )
                        }
                      >
                        {riskLevels.map((level) => (
                          <option
                            key={level}
                            value={level}
                          >
                            {level}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Status
                      <select
                        value={assessment.status}
                        onChange={(event) =>
                          updateAssessment(
                            assessment.id,
                            "status",
                            event.target.value
                          )
                        }
                      >
                        {statuses.map((status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="cyber-footer">
                    <span>
                      Next review:{" "}
                      {formatDate(
                        assessment.next_review_date
                      )}
                    </span>

                    <span>
                      {assessment.assessed_by || "Unassigned"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}