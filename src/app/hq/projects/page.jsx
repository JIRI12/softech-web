"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const statuses = [
  "planned",
  "in_progress",
  "on_hold",
  "completed",
];

const priorities = ["low", "medium", "high", "critical"];

export default function ProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    customerId: "",
    planId: "",
    projectName: "",
    projectManager: "",
    description: "",
    priority: "medium",
    startDate: "",
    targetDate: "",
  });

  const loadData = useCallback(async () => {
    if (!supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const [projectsResult, customersResult, plansResult] =
      await Promise.all([
        supabase
          .from("implementation_projects")
          .select(`
            *,
            customers (
              business_name,
              contact_name,
              industry
            ),
            transformation_plans (
              title
            )
          `)
          .order("created_at", { ascending: false }),

        supabase
          .from("customers")
          .select("*")
          .order("business_name", { ascending: true }),

        supabase
          .from("transformation_plans")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

    if (projectsResult.error) {
      console.error(projectsResult.error);
      setError(projectsResult.error.message);
      setProjects([]);
    } else {
      setProjects(projectsResult.data || []);
    }

    if (customersResult.error) {
      console.error(customersResult.error);
      setCustomers([]);
    } else {
      setCustomers(customersResult.data || []);
    }

    if (plansResult.error) {
      console.error(plansResult.error);
      setPlans([]);
    } else {
      setPlans(plansResult.data || []);
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

    const customerPlan = plans.find(
      (plan) => plan.customer_id === customerId
    );

    setForm((previous) => ({
      ...previous,
      customerId,
      planId: customerPlan?.id || "",
      projectName:
        customer && !previous.projectName
          ? `${customer.business_name} Implementation Project`
          : previous.projectName,
    }));
  }

  async function createProject(event) {
    event.preventDefault();

    if (!supabase) return;

    if (!form.customerId) {
      setError("Please select a customer.");
      return;
    }

    if (!form.projectName.trim()) {
      setError("Please enter a project name.");
      return;
    }

    setError("");

    const { error: insertError } = await supabase
      .from("implementation_projects")
      .insert({
        customer_id: form.customerId,
        plan_id: form.planId || null,
        project_name: form.projectName.trim(),
        project_manager:
          form.projectManager.trim() || null,
        description:
          form.description.trim() || null,
        priority: form.priority,
        start_date: form.startDate || null,
        target_date: form.targetDate || null,
        status: "planned",
        progress: 0,
      });

    if (insertError) {
      console.error(insertError);
      setError(insertError.message);
      return;
    }

    setForm({
      customerId: "",
      planId: "",
      projectName: "",
      projectManager: "",
      description: "",
      priority: "medium",
      startDate: "",
      targetDate: "",
    });

    setShowForm(false);

    await loadData();
  }

  async function updateProject(id, changes) {
    if (!supabase) return;

    const { error: updateError } = await supabase
      .from("implementation_projects")
      .update({
        ...changes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadData();
  }

  const planned = projects.filter(
    (project) => project.status === "planned"
  ).length;

  const active = projects.filter(
    (project) => project.status === "in_progress"
  ).length;

  const completed = projects.filter(
    (project) => project.status === "completed"
  ).length;

  const onHold = projects.filter(
    (project) => project.status === "on_hold"
  ).length;

  const averageProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce(
            (sum, project) =>
              sum + Number(project.progress || 0),
            0
          ) / projects.length
        )
      : 0;

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
            <img
              src="/softech-logo.png"
              alt="SofTech"
            />
          </Link>

          <p>
            SofTech One — Implementation Center
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
            SOFTECH ONE / IMPLEMENTATION
          </span>

          <h1>Implementation Center</h1>

          <p>
            Turn approved transformation plans into
            managed technology implementation projects.
          </p>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Total Projects</span>
            <strong>{projects.length}</strong>
            <small>Implementation programmes</small>
          </div>

          <div className="stat-card">
            <span>Planned</span>
            <strong>{planned}</strong>
            <small>Ready to begin</small>
          </div>

          <div className="stat-card">
            <span>In Progress</span>
            <strong>{active}</strong>
            <small>Currently being delivered</small>
          </div>

          <div className="stat-card">
            <span>Average Progress</span>
            <strong>{averageProgress}%</strong>
            <small>{completed} completed · {onHold} on hold</small>
          </div>
        </section>

        <section className="leads-card">
          <div className="audit-toolbar">
            <div>
              <h2>Implementation Projects</h2>

              <p>
                Track technology projects across the
                SofTech customer portfolio.
              </p>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                setShowForm(!showForm)
              }
            >
              {showForm
                ? "Close Form"
                : "+ New Implementation Project"}
            </button>
          </div>

          {showForm && (
            <form
              className="transformation-form"
              onSubmit={createProject}
            >
              <div className="form-section-title">
                New Implementation Project
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
                  Transformation Plan
                  <select
                    name="planId"
                    value={form.planId}
                    onChange={updateForm}
                  >
                    <option value="">
                      No linked plan
                    </option>

                    {plans
                      .filter(
                        (plan) =>
                          !form.customerId ||
                          plan.customer_id ===
                            form.customerId
                      )
                      .map((plan) => (
                        <option
                          key={plan.id}
                          value={plan.id}
                        >
                          {plan.title}
                        </option>
                      ))}
                  </select>
                </label>

                <label>
                  Project Name *
                  <input
                    name="projectName"
                    value={form.projectName}
                    onChange={updateForm}
                    placeholder="Digital Infrastructure Upgrade"
                  />
                </label>

                <label>
                  Project Manager
                  <input
                    name="projectManager"
                    value={form.projectManager}
                    onChange={updateForm}
                    placeholder="Project manager"
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
                  Start Date
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={updateForm}
                  />
                </label>

                <label>
                  Target Date
                  <input
                    type="date"
                    name="targetDate"
                    value={form.targetDate}
                    onChange={updateForm}
                  />
                </label>
              </div>

              <label>
                Project Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateForm}
                  rows="4"
                  placeholder="Describe the implementation work..."
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
                Create Implementation Project
              </button>
            </form>
          )}

          {error && !showForm && (
            <div className="save-error">
              <strong>
                Unable to load projects.
              </strong>
              <p>{error}</p>
            </div>
          )}

          {loading && (
            <div className="empty-state">
              Loading implementation projects...
            </div>
          )}

          {!loading &&
            !error &&
            projects.length === 0 && (
              <div className="empty-state">
                <p>
                  No implementation projects yet.
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() =>
                    setShowForm(true)
                  }
                >
                  Create First Project
                </button>
              </div>
            )}

          {!loading && projects.length > 0 && (
            <div className="project-grid">
              {projects.map((project) => (
                <article
                  className="project-card"
                  key={project.id}
                >
                  <div className="project-card-top">
                    <div>
                      <span className="eyebrow">
                        {formatLabel(
                          project.priority
                        )}
                      </span>

                      <h3>
                        {project.project_name}
                      </h3>

                      <p>
                        {project.customers
                          ?.business_name ||
                          "Unknown customer"}
                      </p>
                    </div>

                    <strong className="project-percent">
                      {project.progress}%
                    </strong>
                  </div>

                  <div className="project-progress">
                    <div
                      style={{
                        width: `${project.progress}%`,
                      }}
                    />
                  </div>

                  <div className="project-meta">
                    <div>
                      <span>Status</span>

                      <select
                        className="status-select"
                        value={project.status}
                        onChange={(event) =>
                          updateProject(
                            project.id,
                            {
                              status:
                                event.target.value,
                            }
                          )
                        }
                      >
                        {statuses.map(
                          (status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {formatLabel(
                                status
                              )}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <span>Manager</span>

                      <strong>
                        {project.project_manager ||
                          "Unassigned"}
                      </strong>
                    </div>

                    <div>
                      <span>Target</span>

                      <strong>
                        {project.target_date
                          ? new Date(
                              `${project.target_date}T00:00:00`
                            ).toLocaleDateString()
                          : "Not set"}
                      </strong>
                    </div>
                  </div>

                  <div className="project-controls">
                    <label>
                      Progress
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={
                          project.progress || 0
                        }
                        onChange={(event) =>
                          updateProject(
                            project.id,
                            {
                              progress:
                                Number(
                                  event.target
                                    .value
                                ),
                            }
                          )
                        }
                      />
                    </label>
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

function formatLabel(value) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}