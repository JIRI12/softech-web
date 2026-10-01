"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const statuses = [
  "draft",
  "proposed",
  "approved",
  "in_progress",
  "completed",
];

const priorities = ["low", "medium", "high", "critical"];

export default function TransformationPlansPage() {
  const router = useRouter();

  const [plans, setPlans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    customerId: "",
    title: "",
    objective: "",
    priority: "medium",
    currentScore: "",
    targetScore: "",
    timeline: "",
    estimatedInvestment: "",
  });

  const loadData = useCallback(async () => {
    if (!supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const [plansResult, customersResult] = await Promise.all([
      supabase
        .from("transformation_plans")
        .select(
          `
          *,
          customers (
            business_name,
            contact_name,
            industry
          )
        `
        )
        .order("created_at", { ascending: false }),

      supabase
        .from("customers")
        .select("*")
        .order("business_name", { ascending: true }),
    ]);

    if (plansResult.error) {
      console.error(plansResult.error);
      setError(plansResult.error.message);
      setPlans([]);
    } else {
      setPlans(plansResult.data || []);
    }

    if (customersResult.error) {
      console.error(customersResult.error);
      setCustomers([]);
    } else {
      setCustomers(customersResult.data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    async function initialize() {
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

      await loadData();

      setCheckingAuth(false);
    }

    initialize();
  }, [router, loadData]);

  function updateForm(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function selectCustomer(event) {
    const customerId = event.target.value;

    const customer = customers.find(
        (item) => item.id === customerId
    );

    setForm((previous) => ({
        ...previous,
        customerId,
        title:
        customer && !previous.title
            ? `${customer.business_name} Digital Transformation Programme`
            : previous.title,
        currentScore:
        customer?.readiness_score ?? previous.currentScore,
    }));
    }

  async function createPlan(event) {
    event.preventDefault();

    if (!supabase) return;

    if (!form.customerId) {
      setError("Please select a customer.");
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter a transformation plan title.");
      return;
    }

    setError("");

    const { error: insertError } = await supabase
      .from("transformation_plans")
      .insert({
        customer_id: form.customerId,
        title: form.title.trim(),
        objective: form.objective.trim(),
        priority: form.priority,
        current_score:
          form.currentScore === ""
            ? null
            : Number(form.currentScore),
        target_score:
          form.targetScore === ""
            ? null
            : Number(form.targetScore),
        timeline: form.timeline.trim(),
        estimated_investment:
          form.estimatedInvestment === ""
            ? null
            : Number(form.estimatedInvestment),
        status: "draft",
      });

    if (insertError) {
      console.error(insertError);
      setError(insertError.message);
      return;
    }

    setForm({
      customerId: "",
      title: "",
      objective: "",
      priority: "medium",
      currentScore: "",
      targetScore: "",
      timeline: "",
      estimatedInvestment: "",
    });

    setShowForm(false);

    await loadData();
  }

  async function updateStatus(id, status) {
    if (!supabase) return;

    const { error: updateError } = await supabase
      .from("transformation_plans")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadData();
  }

  const draftPlans = plans.filter(
    (plan) => plan.status === "draft"
  ).length;

  const activePlans = plans.filter(
    (plan) =>
      plan.status === "approved" ||
      plan.status === "in_progress"
  ).length;

  const completedPlans = plans.filter(
    (plan) => plan.status === "completed"
  ).length;

  const highPriority = plans.filter(
    (plan) =>
      plan.priority === "high" ||
      plan.priority === "critical"
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

          <p>
            SofTech One — Transformation Plans
          </p>
        </div>

        <Link
          href="/hq"
          className="secondary-button"
        >
          ← HQ Dashboard
        </Link>
      </header>

      <div className="hq-container">
        <section className="hq-heading">
          <span className="eyebrow">
            SOFTECH ONE / TRANSFORMATION
          </span>

          <h1>Transformation Plans</h1>

          <p>
            Turn technology audit results into structured
            transformation programmes for SofTech customers.
          </p>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Total Plans</span>
            <strong>{plans.length}</strong>
            <small>Transformation programmes</small>
          </div>

          <div className="stat-card">
            <span>Draft Plans</span>
            <strong>{draftPlans}</strong>
            <small>Awaiting proposal or approval</small>
          </div>

          <div className="stat-card">
            <span>Active Plans</span>
            <strong>{activePlans}</strong>
            <small>Approved or in progress</small>
          </div>

          <div className="stat-card">
            <span>High Priority</span>
            <strong>{highPriority}</strong>
            <small>High or critical plans</small>
          </div>
        </section>

        <section className="leads-card">
          <div className="audit-toolbar">
            <div>
              <h2>Transformation Portfolio</h2>

              <p>
                Manage technology transformation programmes
                across the SofTech customer base.
              </p>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm
                ? "Close Form"
                : "+ Create Transformation Plan"}
            </button>
          </div>

          {showForm && (
            <form
              className="transformation-form"
              onSubmit={createPlan}
            >
              <div className="form-section-title">
                New Transformation Plan
              </div>

              <div className="form-grid">
                <label>
                  Customer *
                  <select
                    name="customerId"
                    value={form.customerId}
                    onChange={selectCustomer}
                  >
                    <option value="">
                      Select customer
                    </option>

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
                  Plan Title *
                  <input
                    name="title"
                    value={form.title}
                    onChange={updateForm}
                    placeholder="Digital Transformation Programme"
                  />
                </label>

                <label>
                  Priority
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={updateForm}
                  >
                    {priorities.map((priority) => (
                      <option
                        key={priority}
                        value={priority}
                      >
                        {formatLabel(priority)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Timeline
                  <input
                    name="timeline"
                    value={form.timeline}
                    onChange={updateForm}
                    placeholder="90 days"
                  />
                </label>

                <label>
                  Current Readiness Score
                  <input
                    type="number"
                    min="0"
                    max="100"
                    name="currentScore"
                    value={form.currentScore}
                    onChange={updateForm}
                  />
                </label>

                <label>
                  Target Score
                  <input
                    type="number"
                    min="0"
                    max="100"
                    name="targetScore"
                    value={form.targetScore}
                    onChange={updateForm}
                    placeholder="80"
                  />
                </label>

                <label>
                  Estimated Investment
                  <input
                    type="number"
                    min="0"
                    name="estimatedInvestment"
                    value={form.estimatedInvestment}
                    onChange={updateForm}
                    placeholder="0"
                  />
                </label>
              </div>

              <label>
                Transformation Objective
                <textarea
                  name="objective"
                  value={form.objective}
                  onChange={updateForm}
                  rows="4"
                  placeholder="Describe what the transformation programme should achieve..."
                />
              </label>

              {error && (
                <p className="form-error">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="primary-button"
              >
                Create Transformation Plan
              </button>
            </form>
          )}

          {loading && (
            <div className="empty-state">
              Loading transformation plans...
            </div>
          )}

          {!loading && !error && plans.length === 0 && (
            <div className="empty-state">
              <p>
                No transformation plans have been created yet.
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={() => setShowForm(true)}
              >
                Create First Plan
              </button>
            </div>
          )}

          {!loading && plans.length > 0 && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Plan</th>
                    <th>Priority</th>
                    <th>Readiness</th>
                    <th>Status</th>
                    <th>Timeline</th>
                  </tr>
                </thead>

                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.id}>
                      <td>
                        <strong className="business-name">
                          {plan.customers?.business_name ||
                            "Unknown"}
                        </strong>

                        <small className="table-muted">
                          {plan.customers?.industry ||
                            ""}
                        </small>
                      </td>

                      <td>
                        <strong>
                          {plan.title}
                        </strong>

                        <small className="table-muted">
                          {plan.objective || ""}
                        </small>
                      </td>

                      <td>
                        <span
                          className={`priority-badge ${plan.priority}`}
                        >
                          {formatLabel(plan.priority)}
                        </span>
                      </td>

                      <td>
                        {plan.current_score ?? "—"}
                        {plan.target_score != null
                          ? ` → ${plan.target_score}`
                          : ""}
                      </td>

                      <td>
                        <select
                          className="status-select"
                          value={plan.status}
                          onChange={(event) =>
                            updateStatus(
                              plan.id,
                              event.target.value
                            )
                          }
                        >
                          {statuses.map((status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {formatLabel(status)}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        {plan.timeline || "—"}
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

function formatLabel(value) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}