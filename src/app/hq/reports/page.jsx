"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function ReportsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [audits, setAudits] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [services, setServices] = useState([]);
  const [security, setSecurity] = useState([]);

  useEffect(() => {
    async function loadReports() {
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

      const results = await Promise.all([
        supabase.from("technology_audits").select("*"),
        supabase.from("customers").select("*"),
        supabase.from("transformation_plans").select("*"),
        supabase.from("implementation_projects").select("*"),
        supabase.from("support_tickets").select("*"),
        supabase.from("managed_services").select("*"),
        supabase.from("security_assessments").select("*"),
      ]);

      const errorResult = results.find(
        (result) => result.error
      );

      if (errorResult) {
        setError(errorResult.error.message);
        setLoading(false);
        return;
      }

      setAudits(results[0].data || []);
      setCustomers(results[1].data || []);
      setPlans(results[2].data || []);
      setProjects(results[3].data || []);
      setTickets(results[4].data || []);
      setServices(results[5].data || []);
      setSecurity(results[6].data || []);

      setLoading(false);
    }

    loadReports();
  }, [router]);

  const metrics = useMemo(() => {
    const auditAverage =
      audits.length > 0
        ? Math.round(
            audits.reduce(
              (sum, item) =>
                sum + Number(item.readiness_score || 0),
              0
            ) / audits.length
          )
        : 0;

    const securityAverage =
      security.length > 0
        ? Math.round(
            security.reduce(
              (sum, item) =>
                sum + Number(item.security_score || 0),
              0
            ) / security.length
          )
        : 0;

    const activeServices = services.filter(
      (item) => item.status === "active"
    );

    const monthlyRevenue = activeServices.reduce(
      (sum, item) => sum + Number(item.monthly_fee || 0),
      0
    );

    const openTickets = tickets.filter(
      (item) =>
        item.status === "open" ||
        item.status === "in_progress"
    ).length;

    const criticalSecurity = security.filter(
      (item) =>
        item.risk_level === "critical" ||
        item.risk_level === "high"
    ).length;

    const completedProjects = projects.filter(
      (item) => item.status === "completed"
    ).length;

    return {
      auditAverage,
      securityAverage,
      activeServices: activeServices.length,
      monthlyRevenue,
      openTickets,
      criticalSecurity,
      completedProjects,
    };
  }, [
    audits,
    services,
    tickets,
    projects,
    security,
  ]);

  const readinessLevels = useMemo(() => {
    return {
      critical: audits.filter(
        (item) => item.readiness_level === "Critical"
      ).length,

      developing: audits.filter(
        (item) => item.readiness_level === "Developing"
      ).length,

      ready: audits.filter(
        (item) => item.readiness_level === "Ready"
      ).length,

      advanced: audits.filter(
        (item) => item.readiness_level === "Advanced"
      ).length,
    };
  }, [audits]);

  const projectProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce(
            (sum, item) => sum + Number(item.progress || 0),
            0
          ) / projects.length
        )
      : 0;

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
            Loading Reports & Analytics...
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
              SOFTECH ONE
            </span>

            <h1>Reports & Analytics</h1>

            <p>
              Executive visibility across the SofTech
              customer and service ecosystem.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </section>

        {error && (
          <div className="alert-error">
            {error}
          </div>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <span>Customers</span>
            <strong>{customers.length}</strong>
            <small>
              Total customer records
            </small>
          </div>

          <div className="stat-card">
            <span>Audit Readiness</span>
            <strong>
              {metrics.auditAverage}/100
            </strong>
            <small>
              Average technology readiness
            </small>
          </div>

          <div className="stat-card">
            <span>Project Progress</span>
            <strong>
              {projectProgress}%
            </strong>
            <small>
              Average implementation progress
            </small>
          </div>

          <div className="stat-card">
            <span>Monthly Services</span>
            <strong>
              {currency.format(
                metrics.monthlyRevenue
              )}
            </strong>
            <small>
              Active managed services
            </small>
          </div>
        </section>

        <section className="analytics-grid">

          <div className="analytics-card">
            <div className="analytics-heading">
              <div>
                <span className="eyebrow">
                  TECHNOLOGY READINESS
                </span>
                <h2>Audit Overview</h2>
              </div>

              <strong>
                {audits.length}
              </strong>
            </div>

            <div className="analytics-bars">

              <div className="analytics-bar">
                <div>
                  <span>Critical</span>
                  <strong>
                    {readinessLevels.critical}
                  </strong>
                </div>

                <div className="bar-track">
                  <div
                    style={{
                      width: `${
                        audits.length
                          ? (readinessLevels.critical /
                              audits.length) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="analytics-bar">
                <div>
                  <span>Developing</span>
                  <strong>
                    {readinessLevels.developing}
                  </strong>
                </div>

                <div className="bar-track">
                  <div
                    style={{
                      width: `${
                        audits.length
                          ? (readinessLevels.developing /
                              audits.length) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="analytics-bar">
                <div>
                  <span>Ready</span>
                  <strong>
                    {readinessLevels.ready}
                  </strong>
                </div>

                <div className="bar-track">
                  <div
                    style={{
                      width: `${
                        audits.length
                          ? (readinessLevels.ready /
                              audits.length) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="analytics-bar">
                <div>
                  <span>Advanced</span>
                  <strong>
                    {readinessLevels.advanced}
                  </strong>
                </div>

                <div className="bar-track">
                  <div
                    style={{
                      width: `${
                        audits.length
                          ? (readinessLevels.advanced /
                              audits.length) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-heading">
              <div>
                <span className="eyebrow">
                  CYBERSECURITY
                </span>
                <h2>Security Posture</h2>
              </div>

              <strong>
                {metrics.securityAverage}/100
              </strong>
            </div>

            <div className="security-overview">
              <div className="security-score-large">
                <strong>
                  {metrics.securityAverage}
                </strong>
                <span>
                  Average security score
                </span>
              </div>

              <div className="security-stat">
                <span>
                  Assessments
                </span>
                <strong>
                  {security.length}
                </strong>
              </div>

              <div className="security-stat">
                <span>
                  High / Critical Risk
                </span>
                <strong>
                  {metrics.criticalSecurity}
                </strong>
              </div>
            </div>
          </div>

        </section>

        <section className="analytics-grid">

          <div className="analytics-card">
            <div className="analytics-heading">
              <div>
                <span className="eyebrow">
                  DELIVERY
                </span>
                <h2>Implementation</h2>
              </div>
            </div>

            <div className="mini-stat-grid">

              <div>
                <span>Total Projects</span>
                <strong>
                  {projects.length}
                </strong>
              </div>

              <div>
                <span>Completed</span>
                <strong>
                  {metrics.completedProjects}
                </strong>
              </div>

              <div>
                <span>In Progress</span>
                <strong>
                  {
                    projects.filter(
                      (item) =>
                        item.status ===
                        "in_progress"
                    ).length
                  }
                </strong>
              </div>

              <div>
                <span>Average Progress</span>
                <strong>
                  {projectProgress}%
                </strong>
              </div>

            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-heading">
              <div>
                <span className="eyebrow">
                  SUPPORT
                </span>
                <h2>Service Operations</h2>
              </div>
            </div>

            <div className="mini-stat-grid">

              <div>
                <span>Total Tickets</span>
                <strong>
                  {tickets.length}
                </strong>
              </div>

              <div>
                <span>Open / Active</span>
                <strong>
                  {metrics.openTickets}
                </strong>
              </div>

              <div>
                <span>Managed Services</span>
                <strong>
                  {metrics.activeServices}
                </strong>
              </div>

              <div>
                <span>Monthly Revenue</span>
                <strong>
                  {currency.format(
                    metrics.monthlyRevenue
                  )}
                </strong>
              </div>

            </div>
          </div>

        </section>

        <section className="analytics-card executive-summary">
          <span className="eyebrow">
            EXECUTIVE SNAPSHOT
          </span>

          <h2>SofTech Operating Overview</h2>

          <div className="summary-grid">

            <div>
              <strong>
                {customers.length}
              </strong>
              <span>
                Customers
              </span>
            </div>

            <div>
              <strong>
                {audits.length}
              </strong>
              <span>
                Technology Audits
              </span>
            </div>

            <div>
              <strong>
                {plans.length}
              </strong>
              <span>
                Transformation Plans
              </span>
            </div>

            <div>
              <strong>
                {projects.length}
              </strong>
              <span>
                Implementation Projects
              </span>
            </div>

            <div>
              <strong>
                {services.length}
              </strong>
              <span>
                Managed Services
              </span>
            </div>

            <div>
              <strong>
                {security.length}
              </strong>
              <span>
                Security Assessments
              </span>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}