"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const statuses = [
  "prospect",
  "application",
  "onboarding",
  "active",
  "suspended",
  "closed",
];

const emptyForm = {
  franchiseName: "",
  ownerName: "",
  country: "Zimbabwe",
  city: "",
  email: "",
  phone: "",
  territory: "",
  status: "prospect",
  onboardingProgress: 0,
  customersCount: 0,
  projectsCount: 0,
  monthlyRevenue: 0,
  joinedDate: "",
  notes: "",
};

function formatStatus(status) {
  return status
    .replace("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-ZW", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function FranchiseNetworkPage() {
  const router = useRouter();

  const [franchises, setFranchises] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

      await loadFranchises();
      setLoading(false);
    }

    initialize();
  }, [router]);

  async function loadFranchises() {
    const { data, error: loadError } = await supabase
      .from("franchise_network")
      .select("*")
      .order("created_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
      return;
    }

    setFranchises(data || []);
  }

  function updateForm(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function createFranchise(event) {
    event.preventDefault();

    if (
      !form.franchiseName.trim() ||
      !form.ownerName.trim()
    ) {
      setError(
        "Franchise name and owner name are required."
      );
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const { error: insertError } = await supabase
      .from("franchise_network")
      .insert({
        franchise_name: form.franchiseName.trim(),
        owner_name: form.ownerName.trim(),
        country: form.country.trim(),
        city: form.city.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        territory: form.territory.trim() || null,
        status: form.status,
        onboarding_progress: Number(
          form.onboardingProgress
        ),
        customers_count: Number(
          form.customersCount
        ),
        projects_count: Number(
          form.projectsCount
        ),
        monthly_revenue: Number(
          form.monthlyRevenue
        ),
        joined_date: form.joinedDate || null,
        notes: form.notes.trim() || null,
      });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setForm(emptyForm);
    setMessage("Franchise added successfully.");

    await loadFranchises();

    setSaving(false);
  }

  async function updateFranchise(id, field, value) {
    const update = {
      [field]: value,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("franchise_network")
      .update(update)
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setFranchises((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, ...update }
          : item
      )
    );
  }

  const stats = useMemo(() => {
    const active = franchises.filter(
      (item) => item.status === "active"
    ).length;

    const onboarding = franchises.filter(
      (item) => item.status === "onboarding"
    ).length;

    const prospects = franchises.filter(
      (item) =>
        item.status === "prospect" ||
        item.status === "application"
    ).length;

    const revenue = franchises.reduce(
      (sum, item) =>
        sum + Number(item.monthly_revenue || 0),
      0
    );

    const customers = franchises.reduce(
      (sum, item) =>
        sum + Number(item.customers_count || 0),
      0
    );

    return {
      total: franchises.length,
      active,
      onboarding,
      prospects,
      revenue,
      customers,
    };
  }, [franchises]);

  const filteredFranchises = useMemo(() => {
    const query = search.trim().toLowerCase();

    return franchises.filter((item) => {
      const matchesSearch =
        !query ||
        item.franchise_name
          ?.toLowerCase()
          .includes(query) ||
        item.owner_name
          ?.toLowerCase()
          .includes(query) ||
        item.country
          ?.toLowerCase()
          .includes(query) ||
        item.city
          ?.toLowerCase()
          .includes(query) ||
        item.territory
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [franchises, search, statusFilter]);

  const currency = new Intl.NumberFormat("en-ZW", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  if (loading) {
    return (
      <main className="hq-page">
        <div className="hq-content">
          <div className="loading-card">
            Loading Franchise Network...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="hq-page">
      <div className="hq-content">

        <section className="module-header">
          <div>
            <span className="eyebrow">
              SOFTECH 2030
            </span>

            <h1>Franchise Network</h1>

            <p>
              Manage SofTech franchise partners,
              territories and network performance.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={loadFranchises}
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
            <span>Total Network</span>
            <strong>{stats.total}</strong>
          </div>

          <div className="stat-card">
            <span>Active Franchises</span>
            <strong>{stats.active}</strong>
          </div>

          <div className="stat-card">
            <span>Onboarding</span>
            <strong>{stats.onboarding}</strong>
          </div>

          <div className="stat-card">
            <span>Network Customers</span>
            <strong>{stats.customers}</strong>
          </div>
        </section>

        <section className="franchise-form">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                NETWORK MANAGEMENT
              </span>

              <h2>Add Franchise Partner</h2>
            </div>
          </div>

          <form onSubmit={createFranchise}>
            <div className="form-grid">

              <label>
                Franchise Name
                <input
                  name="franchiseName"
                  value={form.franchiseName}
                  onChange={updateForm}
                  placeholder="e.g. SofTech Mutare"
                  required
                />
              </label>

              <label>
                Owner / Partner
                <input
                  name="ownerName"
                  value={form.ownerName}
                  onChange={updateForm}
                  placeholder="Partner name"
                  required
                />
              </label>

              <label>
                Country
                <input
                  name="country"
                  value={form.country}
                  onChange={updateForm}
                  placeholder="Zimbabwe"
                />
              </label>

              <label>
                City
                <input
                  name="city"
                  value={form.city}
                  onChange={updateForm}
                  placeholder="Harare"
                />
              </label>

              <label>
                Territory
                <input
                  name="territory"
                  value={form.territory}
                  onChange={updateForm}
                  placeholder="Eastern Zimbabwe"
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={updateForm}
                  placeholder="partner@example.com"
                />
              </label>

              <label>
                Phone
                <input
                  name="phone"
                  value={form.phone}
                  onChange={updateForm}
                  placeholder="+263..."
                />
              </label>

              <label>
                Status
                <select
                  name="status"
                  value={form.status}
                  onChange={updateForm}
                >
                  {statuses.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Onboarding Progress %
                <input
                  type="number"
                  min="0"
                  max="100"
                  name="onboardingProgress"
                  value={form.onboardingProgress}
                  onChange={updateForm}
                />
              </label>

              <label>
                Customers
                <input
                  type="number"
                  min="0"
                  name="customersCount"
                  value={form.customersCount}
                  onChange={updateForm}
                />
              </label>

              <label>
                Projects
                <input
                  type="number"
                  min="0"
                  name="projectsCount"
                  value={form.projectsCount}
                  onChange={updateForm}
                />
              </label>

              <label>
                Monthly Revenue
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="monthlyRevenue"
                  value={form.monthlyRevenue}
                  onChange={updateForm}
                  placeholder="0"
                />
              </label>

              <label>
                Joined Date
                <input
                  type="date"
                  name="joinedDate"
                  value={form.joinedDate}
                  onChange={updateForm}
                />
              </label>

              <label className="full-width">
                Notes
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={updateForm}
                  rows="4"
                  placeholder="Franchise notes, territory details or HQ observations..."
                />
              </label>

            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Adding Franchise..."
                : "Add Franchise Partner"}
            </button>
          </form>
        </section>

        <section className="module-section">

          <div className="section-heading">
            <div>
              <span className="eyebrow">
                NETWORK DIRECTORY
              </span>

              <h2>Franchise Partners</h2>
            </div>
          </div>

          <div className="module-filters">
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search franchise, owner, city or territory..."
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="all">
                All Statuses
              </option>

              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>

          {filteredFranchises.length === 0 ? (
            <div className="empty-state">
              No franchise partners found.
            </div>
          ) : (
            <div className="franchise-grid">
              {filteredFranchises.map((franchise) => (
                <article
                  className="franchise-card"
                  key={franchise.id}
                >

                  <div className="franchise-card-top">
                    <div>
                      <span className="eyebrow">
                        {franchise.country}
                      </span>

                      <h3>
                        {franchise.franchise_name}
                      </h3>

                      <p>
                        {franchise.owner_name}
                      </p>
                    </div>

                    <span
                      className={`franchise-status ${franchise.status}`}
                    >
                      {formatStatus(franchise.status)}
                    </span>
                  </div>

                  <div className="franchise-location">
                    <strong>
                      {franchise.city || "Location pending"}
                    </strong>

                    <span>
                      {franchise.territory ||
                        "Territory not assigned"}
                    </span>
                  </div>

                  <div className="franchise-progress">
                    <div className="progress-heading">
                      <span>
                        Onboarding Progress
                      </span>

                      <strong>
                        {franchise.onboarding_progress}%
                      </strong>
                    </div>

                    <div className="progress-track">
                      <div
                        style={{
                          width: `${franchise.onboarding_progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="franchise-meta">
                    <div>
                      <span>Customers</span>
                      <strong>
                        {franchise.customers_count}
                      </strong>
                    </div>

                    <div>
                      <span>Projects</span>
                      <strong>
                        {franchise.projects_count}
                      </strong>
                    </div>

                    <div>
                      <span>Monthly Revenue</span>
                      <strong>
                        {currency.format(
                          Number(
                            franchise.monthly_revenue || 0
                          )
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="franchise-controls">

                    <label>
                      Status

                      <select
                        value={franchise.status}
                        onChange={(event) =>
                          updateFranchise(
                            franchise.id,
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
                            {formatStatus(status)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Progress

                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={
                          franchise.onboarding_progress
                        }
                        onChange={(event) =>
                          updateFranchise(
                            franchise.id,
                            "onboarding_progress",
                            Number(event.target.value)
                          )
                        }
                      />
                    </label>

                  </div>

                  <div className="franchise-footer">
                    <span>
                      {franchise.email ||
                        "No email"}
                    </span>

                    <span>
                      Joined{" "}
                      {formatDate(
                        franchise.joined_date
                      )}
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