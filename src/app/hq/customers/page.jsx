"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const statuses = [
  "lead",
  "audited",
  "transformation",
  "implementation",
  "managed_service",
];

export default function CustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState([]);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadCustomers = useCallback(async () => {
    if (!supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (customerError) {
      console.error(customerError);
      setError(customerError.message);
      setCustomers([]);
    } else {
      setCustomers(data || []);
    }

    setLoading(false);
  }, []);

  async function loadAudits() {
    if (!supabase) return;

    const { data } = await supabase
      .from("technology_audits")
      .select(
        "business_name, contact_name, email, phone, industry, location, score, readiness_level"
      );

    setAudits(data || []);
  }

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

      await loadCustomers();
      await loadAudits();

      setCheckingAuth(false);
    }

    initialize();
  }, [router, loadCustomers]);

  async function createCustomerFromAudit(audit) {
    if (!supabase) return;

    const exists = customers.some(
      (customer) =>
        customer.email &&
        audit.email &&
        customer.email.toLowerCase() === audit.email.toLowerCase()
    );

    if (exists) {
      alert("This business is already in Customers.");
      return;
    }

    const { error: insertError } = await supabase
      .from("customers")
      .insert({
        business_name: audit.business_name,
        contact_name: audit.contact_name,
        email: audit.email,
        phone: audit.phone,
        industry: audit.industry,
        location: audit.location,
        status: "audited",
        source: "technology_audit",
        readiness_score: audit.score,
        readiness_level: audit.readiness_level,
      });

    if (insertError) {
      alert(insertError.message);
      return;
    }

    await loadCustomers();
  }

  async function updateStatus(id, status) {
    if (!supabase) return;

    const { error: updateError } = await supabase
      .from("customers")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      alert(updateError.message);
      return;
    }

    await loadCustomers();
  }

  const filteredCustomers = customers.filter((customer) => {
    const query = search.toLowerCase();

    const matchesSearch =
      customer.business_name?.toLowerCase().includes(query) ||
      customer.contact_name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.industry?.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" ||
      customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) =>
      customer.status === "implementation" ||
      customer.status === "managed_service"
  ).length;

  const auditedCustomers = customers.filter(
    (customer) => customer.status === "audited"
  ).length;

  const transformationCustomers = customers.filter(
    (customer) => customer.status === "transformation"
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

          <p>SofTech One — Customer Management</p>
        </div>

        <div className="hero-actions">
          <Link href="/hq" className="secondary-button">
            ← HQ Dashboard
          </Link>
        </div>
      </header>

      <div className="hq-container">
        <section className="hq-heading">
          <span className="eyebrow">
            SOFTECH ONE / CUSTOMERS
          </span>

          <h1>Customers</h1>

          <p>
            Manage businesses moving through the SofTech
            technology transformation journey.
          </p>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Total Customers</span>
            <strong>{totalCustomers}</strong>
            <small>Businesses in SofTech One</small>
          </div>

          <div className="stat-card">
            <span>Audited</span>
            <strong>{auditedCustomers}</strong>
            <small>Ready for transformation planning</small>
          </div>

          <div className="stat-card">
            <span>Transformation</span>
            <strong>{transformationCustomers}</strong>
            <small>Plans in progress</small>
          </div>

          <div className="stat-card">
            <span>Active Services</span>
            <strong>{activeCustomers}</strong>
            <small>Implementation or managed service</small>
          </div>
        </section>

        <section className="leads-card">
          <div className="audit-toolbar">
            <div>
              <h2>Customer Pipeline</h2>

              <p>
                Convert completed technology audits into
                managed SofTech customer relationships.
              </p>
            </div>
          </div>

          <div className="audit-filters">
            <input
              type="search"
              placeholder="Search customers..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="all">All stages</option>

              {statuses.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="secondary-button"
              onClick={loadCustomers}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {audits.length > 0 && (
            <div className="customer-conversion">
              <div>
                <strong>Convert an audit into a customer</strong>

                <p>
                  Businesses below have completed an audit but
                  are not yet in the customer database.
                </p>
              </div>

              <div className="conversion-list">
                {audits
                  .filter(
                    (audit) =>
                      !customers.some(
                        (customer) =>
                          customer.email &&
                          audit.email &&
                          customer.email.toLowerCase() ===
                            audit.email.toLowerCase()
                      )
                  )
                  .slice(0, 5)
                  .map((audit, index) => (
                    <div
                      className="conversion-item"
                      key={`${audit.email}-${index}`}
                    >
                      <div>
                        <strong>
                          {audit.business_name}
                        </strong>

                        <span>
                          {audit.email || audit.contact_name}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="primary-button"
                        onClick={() =>
                          createCustomerFromAudit(audit)
                        }
                      >
                        Add Customer
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="empty-state">
              Loading customers...
            </div>
          )}

          {error && (
            <div className="save-error">
              <strong>
                Unable to load customers.
              </strong>

              <p>{error}</p>
            </div>
          )}

          {!loading &&
            !error &&
            filteredCustomers.length === 0 && (
              <div className="empty-state">
                <p>No customers found.</p>

                <Link
                  href="/audit"
                  className="primary-button"
                >
                  Run Technology Audit
                </Link>
              </div>
            )}

          {!loading &&
            !error &&
            filteredCustomers.length > 0 && (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Business</th>
                      <th>Contact</th>
                      <th>Industry</th>
                      <th>Readiness</th>
                      <th>Stage</th>
                      <th>Updated</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td>
                          <strong className="business-name">
                            {customer.business_name}
                          </strong>
                        </td>

                        <td>
                          {customer.contact_name || "—"}
                          <small className="table-muted">
                            {customer.email || ""}
                          </small>
                        </td>

                        <td>
                          {customer.industry || "Other"}
                        </td>

                        <td>
                          {customer.readiness_score ?? 0}/100
                        </td>

                        <td>
                          <select
                            className="status-select"
                            value={customer.status}
                            onChange={(event) =>
                              updateStatus(
                                customer.id,
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
                        </td>

                        <td>
                          {customer.updated_at
                            ? new Date(
                                customer.updated_at
                              ).toLocaleDateString()
                            : new Date(
                                customer.created_at
                              ).toLocaleDateString()}
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

function formatStatus(status) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}