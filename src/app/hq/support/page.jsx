"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const ticketStatuses = [
  "open",
  "in_progress",
  "on_hold",
  "resolved",
  "closed",
];

const priorities = [
  "low",
  "medium",
  "high",
  "critical",
];

const serviceStatuses = [
  "active",
  "paused",
  "cancelled",
  "expired",
];

export default function SupportPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("tickets");

  const [tickets, setTickets] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");

  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);

  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketFilter, setTicketFilter] = useState("all");

  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");

  const [ticketForm, setTicketForm] = useState({
    customerId: "",
    projectId: "",
    subject: "",
    description: "",
    priority: "medium",
    assignedTo: "",
    slaDueAt: "",
  });

  const [serviceForm, setServiceForm] = useState({
    customerId: "",
    serviceName: "",
    servicePackage: "Standard",
    description: "",
    monthlyFee: "",
    startDate: "",
    renewalDate: "",
    accountManager: "",
  });

  const loadData = useCallback(async () => {
    if (!supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const [
      ticketsResult,
      servicesResult,
      customersResult,
      projectsResult,
    ] = await Promise.all([
      supabase
        .from("support_tickets")
        .select(`
          *,
          customers (
            business_name,
            contact_name,
            email
          ),
          implementation_projects (
            project_name
          )
        `)
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("managed_services")
        .select(`
          *,
          customers (
            business_name,
            contact_name,
            email
          )
        `)
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("customers")
        .select("*")
        .order("business_name", {
          ascending: true,
        }),

      supabase
        .from("implementation_projects")
        .select("*")
        .order("created_at", {
          ascending: false,
        }),
    ]);

    if (ticketsResult.error) {
      console.error(ticketsResult.error);
      setError(ticketsResult.error.message);
      setTickets([]);
    } else {
      setTickets(ticketsResult.data || []);
    }

    if (servicesResult.error) {
      console.error(servicesResult.error);
      setError(servicesResult.error.message);
      setServices([]);
    } else {
      setServices(servicesResult.data || []);
    }

    if (customersResult.error) {
      console.error(customersResult.error);
      setCustomers([]);
    } else {
      setCustomers(customersResult.data || []);
    }

    if (projectsResult.error) {
      console.error(projectsResult.error);
      setProjects([]);
    } else {
      setProjects(projectsResult.data || []);
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

      const { data } =
        await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/hq/login");
        return;
      }

      await loadData();
      setCheckingAuth(false);
    }

    initialize();
  }, [router, loadData]);

  function updateTicketForm(event) {
    const { name, value } = event.target;

    setTicketForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function updateServiceForm(event) {
    const { name, value } = event.target;

    setServiceForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function selectTicketCustomer(event) {
    setTicketForm((previous) => ({
      ...previous,
      customerId: event.target.value,
      projectId: "",
    }));
  }

  async function createTicket(event) {
    event.preventDefault();

    if (!supabase) return;

    if (!ticketForm.customerId) {
      setError("Please select a customer.");
      return;
    }

    if (!ticketForm.subject.trim()) {
      setError("Please enter a ticket subject.");
      return;
    }

    setError("");

    const { error: insertError } =
      await supabase
        .from("support_tickets")
        .insert({
          customer_id: ticketForm.customerId,
          project_id:
            ticketForm.projectId || null,
          subject: ticketForm.subject.trim(),
          description:
            ticketForm.description.trim() || null,
          priority: ticketForm.priority,
          assigned_to:
            ticketForm.assignedTo.trim() || null,
          sla_due_at:
            ticketForm.slaDueAt
              ? new Date(
                  ticketForm.slaDueAt
                ).toISOString()
              : null,
          status: "open",
        });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setTicketForm({
      customerId: "",
      projectId: "",
      subject: "",
      description: "",
      priority: "medium",
      assignedTo: "",
      slaDueAt: "",
    });

    setShowTicketForm(false);
    await loadData();
  }

  async function createService(event) {
    event.preventDefault();

    if (!supabase) return;

    if (!serviceForm.customerId) {
      setError("Please select a customer.");
      return;
    }

    if (!serviceForm.serviceName.trim()) {
      setError("Please enter a service name.");
      return;
    }

    setError("");

    const { error: insertError } =
      await supabase
        .from("managed_services")
        .insert({
          customer_id: serviceForm.customerId,
          service_name:
            serviceForm.serviceName.trim(),
          service_package:
            serviceForm.servicePackage.trim() ||
            "Standard",
          description:
            serviceForm.description.trim() || null,
          monthly_fee:
            Number(serviceForm.monthlyFee) || 0,
          start_date:
            serviceForm.startDate ||
            new Date().toISOString().slice(0, 10),
          renewal_date:
            serviceForm.renewalDate || null,
          account_manager:
            serviceForm.accountManager.trim() ||
            null,
          status: "active",
        });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setServiceForm({
      customerId: "",
      serviceName: "",
      servicePackage: "Standard",
      description: "",
      monthlyFee: "",
      startDate: "",
      renewalDate: "",
      accountManager: "",
    });

    setShowServiceForm(false);
    await loadData();
  }

  async function updateTicket(id, changes) {
    if (!supabase) return;

    const updateData = {
      ...changes,
      updated_at: new Date().toISOString(),
    };

    if (
      changes.status === "resolved" ||
      changes.status === "closed"
    ) {
      updateData.resolved_at =
        new Date().toISOString();
    }

    const { error: updateError } =
      await supabase
        .from("support_tickets")
        .update(updateData)
        .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadData();
  }

  async function updateService(id, changes) {
    if (!supabase) return;

    const { error: updateError } =
      await supabase
        .from("managed_services")
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

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "open"
  ).length;

  const activeTickets = tickets.filter(
    (ticket) =>
      ticket.status === "in_progress"
  ).length;

  const criticalTickets = tickets.filter(
    (ticket) =>
      ticket.priority === "critical" &&
      !["resolved", "closed"].includes(
        ticket.status
      )
  ).length;

  const activeServices = services.filter(
    (service) => service.status === "active"
  ).length;

  const monthlyRevenue = services
    .filter(
      (service) => service.status === "active"
    )
    .reduce(
      (sum, service) =>
        sum + Number(service.monthly_fee || 0),
      0
    );

  const overdueTickets = tickets.filter(
    (ticket) =>
      ticket.sla_due_at &&
      !["resolved", "closed"].includes(
        ticket.status
      ) &&
      new Date(ticket.sla_due_at) < new Date()
  ).length;

  const filteredTickets = useMemo(() => {
    const query =
      ticketSearch.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesFilter =
        ticketFilter === "all" ||
        ticket.status === ticketFilter;

      const searchable = [
        ticket.ticket_number,
        ticket.subject,
        ticket.customers?.business_name,
        ticket.assigned_to,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesFilter &&
        (!query || searchable.includes(query))
      );
    });
  }, [
    tickets,
    ticketSearch,
    ticketFilter,
  ]);

  const filteredServices = useMemo(() => {
    const query =
      serviceSearch.trim().toLowerCase();

    return services.filter((service) => {
      const matchesFilter =
        serviceFilter === "all" ||
        service.status === serviceFilter;

      const searchable = [
        service.service_name,
        service.service_package,
        service.customers?.business_name,
        service.account_manager,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesFilter &&
        (!query || searchable.includes(query))
      );
    });
  }, [
    services,
    serviceSearch,
    serviceFilter,
  ]);

  if (checkingAuth) {
    return (
      <main className="loading-page">
        <p>
          Checking SofTech HQ access...
        </p>
      </main>
    );
  }

  return (
    <main className="hq-page">
      <header className="hq-header">
        <div>
          <Link
            href="/"
            className="brand"
          >
            <img
              src="/softech-logo.png"
              alt="SofTech"
            />
          </Link>

          <p>
            SofTech One — Support & Managed
            Services
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
            SOFTECH ONE / SERVICE OPERATIONS
          </span>

          <h1>
            Support & Managed Services
          </h1>

          <p>
            Manage customer support,
            service delivery, SLA commitments
            and recurring technology services.
          </p>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Open Tickets</span>
            <strong>{openTickets}</strong>
            <small>
              Awaiting action
            </small>
          </div>

          <div className="stat-card">
            <span>In Progress</span>
            <strong>{activeTickets}</strong>
            <small>
              Currently being handled
            </small>
          </div>

          <div className="stat-card">
            <span>Critical / SLA</span>
            <strong>
              {criticalTickets + overdueTickets}
            </strong>
            <small>
              {criticalTickets} critical ·{" "}
              {overdueTickets} overdue
            </small>
          </div>

          <div className="stat-card">
            <span>Monthly Services</span>
            <strong>
              {formatCurrency(monthlyRevenue)}
            </strong>
            <small>
              {activeServices} active services
            </small>
          </div>
        </section>

        <section className="service-tabs">
          <button
            type="button"
            className={
              activeTab === "tickets"
                ? "service-tab active"
                : "service-tab"
            }
            onClick={() =>
              setActiveTab("tickets")
            }
          >
            Support Tickets
          </button>

          <button
            type="button"
            className={
              activeTab === "services"
                ? "service-tab active"
                : "service-tab"
            }
            onClick={() =>
              setActiveTab("services")
            }
          >
            Managed Services
          </button>
        </section>

        {error && (
          <div className="save-error">
            <strong>
              Something went wrong.
            </strong>
            <p>{error}</p>
          </div>
        )}

        {activeTab === "tickets" && (
          <section className="leads-card">
            <div className="audit-toolbar">
              <div>
                <h2>
                  Support Tickets
                </h2>

                <p>
                  Track customer issues from
                  creation through resolution.
                </p>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  setShowTicketForm(
                    !showTicketForm
                  )
                }
              >
                {showTicketForm
                  ? "Close Form"
                  : "+ New Support Ticket"}
              </button>
            </div>

            {showTicketForm && (
              <form
                className="transformation-form"
                onSubmit={createTicket}
              >
                <div className="form-section-title">
                  Create Support Ticket
                </div>

                <div className="form-grid">
                  <label>
                    Customer *
                    <select
                      name="customerId"
                      value={
                        ticketForm.customerId
                      }
                      onChange={
                        selectTicketCustomer
                      }
                    >
                      <option value="">
                        Select customer
                      </option>

                      {customers.map(
                        (customer) => (
                          <option
                            key={customer.id}
                            value={customer.id}
                          >
                            {
                              customer.business_name
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label>
                    Project
                    <select
                      name="projectId"
                      value={
                        ticketForm.projectId
                      }
                      onChange={
                        updateTicketForm
                      }
                    >
                      <option value="">
                        General support
                      </option>

                      {projects
                        .filter(
                          (project) =>
                            !ticketForm.customerId ||
                            project.customer_id ===
                              ticketForm.customerId
                        )
                        .map((project) => (
                          <option
                            key={project.id}
                            value={project.id}
                          >
                            {
                              project.project_name
                            }
                          </option>
                        ))}
                    </select>
                  </label>

                  <label>
                    Subject *
                    <input
                      name="subject"
                      value={
                        ticketForm.subject
                      }
                      onChange={
                        updateTicketForm
                      }
                      placeholder="Network connectivity issue"
                    />
                  </label>

                  <label>
                    Assigned To
                    <input
                      name="assignedTo"
                      value={
                        ticketForm.assignedTo
                      }
                      onChange={
                        updateTicketForm
                      }
                      placeholder="Technician or team"
                    />
                  </label>

                  <label>
                    Priority
                    <select
                      name="priority"
                      value={
                        ticketForm.priority
                      }
                      onChange={
                        updateTicketForm
                      }
                    >
                      {priorities.map(
                        (priority) => (
                          <option
                            key={priority}
                            value={priority}
                          >
                            {formatLabel(
                              priority
                            )}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label>
                    SLA Due
                    <input
                      type="datetime-local"
                      name="slaDueAt"
                      value={
                        ticketForm.slaDueAt
                      }
                      onChange={
                        updateTicketForm
                      }
                    />
                  </label>
                </div>

                <label>
                  Description
                  <textarea
                    name="description"
                    value={
                      ticketForm.description
                    }
                    onChange={
                      updateTicketForm
                    }
                    rows="4"
                    placeholder="Describe the customer issue..."
                  />
                </label>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Create Support Ticket
                </button>
              </form>
            )}

            <div className="module-toolbar">
              <input
                value={ticketSearch}
                onChange={(event) =>
                  setTicketSearch(
                    event.target.value
                  )
                }
                placeholder="Search tickets..."
              />

              <select
                value={ticketFilter}
                onChange={(event) =>
                  setTicketFilter(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All statuses
                </option>

                {ticketStatuses.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {formatLabel(status)}
                    </option>
                  )
                )}
              </select>
            </div>

            {loading ? (
              <div className="empty-state">
                Loading support tickets...
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="empty-state">
                <p>
                  No support tickets found.
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() =>
                    setShowTicketForm(true)
                  }
                >
                  Create Ticket
                </button>
              </div>
            ) : (
              <div className="ticket-list">
                {filteredTickets.map(
                  (ticket) => {
                    const overdue =
                      ticket.sla_due_at &&
                      ![
                        "resolved",
                        "closed",
                      ].includes(
                        ticket.status
                      ) &&
                      new Date(
                        ticket.sla_due_at
                      ) < new Date();

                    return (
                      <article
                        className="ticket-card"
                        key={ticket.id}
                      >
                        <div className="ticket-main">
                          <div className="ticket-heading">
                            <span className="ticket-number">
                              {
                                ticket.ticket_number
                              }
                            </span>

                            <h3>
                              {
                                ticket.subject
                              }
                            </h3>

                            <p>
                              {ticket.customers
                                ?.business_name ||
                                "Unknown customer"}
                            </p>
                          </div>

                          <span
                            className={`priority-badge ${ticket.priority}`}
                          >
                            {formatLabel(
                              ticket.priority
                            )}
                          </span>
                        </div>

                        {ticket.description && (
                          <p className="ticket-description">
                            {
                              ticket.description
                            }
                          </p>
                        )}

                        <div className="ticket-meta">
                          <div>
                            <span>
                              Status
                            </span>

                            <select
                              className="status-select"
                              value={
                                ticket.status
                              }
                              onChange={(
                                event
                              ) =>
                                updateTicket(
                                  ticket.id,
                                  {
                                    status:
                                      event
                                        .target
                                        .value,
                                  }
                                )
                              }
                            >
                              {ticketStatuses.map(
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
                            <span>
                              Assigned
                            </span>

                            <strong>
                              {ticket.assigned_to ||
                                "Unassigned"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Project
                            </span>

                            <strong>
                              {ticket
                                .implementation_projects
                                ?.project_name ||
                                "General support"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              SLA
                            </span>

                            <strong
                              className={
                                overdue
                                  ? "sla-overdue"
                                  : ""
                              }
                            >
                              {ticket.sla_due_at
                                ? formatDateTime(
                                    ticket.sla_due_at
                                  )
                                : "Not set"}
                            </strong>
                          </div>
                        </div>

                        <div className="ticket-resolution">
                          <label>
                            Resolution Notes
                            <textarea
                              defaultValue={
                                ticket.resolution_notes ||
                                ""
                              }
                              placeholder="Add resolution notes..."
                              rows="2"
                              onBlur={(event) => {
                                const value =
                                  event.target.value.trim();

                                if (
                                  value !==
                                  (ticket.resolution_notes ||
                                    "")
                                ) {
                                  updateTicket(
                                    ticket.id,
                                    {
                                      resolution_notes:
                                        value ||
                                        null,
                                    }
                                  );
                                }
                              }}
                            />
                          </label>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === "services" && (
          <section className="leads-card">
            <div className="audit-toolbar">
              <div>
                <h2>
                  Managed Services
                </h2>

                <p>
                  Manage recurring technology
                  services and customer
                  subscriptions.
                </p>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  setShowServiceForm(
                    !showServiceForm
                  )
                }
              >
                {showServiceForm
                  ? "Close Form"
                  : "+ Add Managed Service"}
              </button>
            </div>

            {showServiceForm && (
              <form
                className="transformation-form"
                onSubmit={createService}
              >
                <div className="form-section-title">
                  Add Managed Service
                </div>

                <div className="form-grid">
                  <label>
                    Customer *
                    <select
                      name="customerId"
                      value={
                        serviceForm.customerId
                      }
                      onChange={
                        updateServiceForm
                      }
                    >
                      <option value="">
                        Select customer
                      </option>

                      {customers.map(
                        (customer) => (
                          <option
                            key={customer.id}
                            value={customer.id}
                          >
                            {
                              customer.business_name
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label>
                    Service Name *
                    <input
                      name="serviceName"
                      value={
                        serviceForm.serviceName
                      }
                      onChange={
                        updateServiceForm
                      }
                      placeholder="Managed IT Support"
                    />
                  </label>

                  <label>
                    Service Package
                    <input
                      name="servicePackage"
                      value={
                        serviceForm.servicePackage
                      }
                      onChange={
                        updateServiceForm
                      }
                      placeholder="Standard"
                    />
                  </label>

                  <label>
                    Monthly Fee
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="monthlyFee"
                      value={
                        serviceForm.monthlyFee
                      }
                      onChange={
                        updateServiceForm
                      }
                      placeholder="0.00"
                    />
                  </label>

                  <label>
                    Start Date
                    <input
                      type="date"
                      name="startDate"
                      value={
                        serviceForm.startDate
                      }
                      onChange={
                        updateServiceForm
                      }
                    />
                  </label>

                  <label>
                    Renewal Date
                    <input
                      type="date"
                      name="renewalDate"
                      value={
                        serviceForm.renewalDate
                      }
                      onChange={
                        updateServiceForm
                      }
                    />
                  </label>

                  <label>
                    Account Manager
                    <input
                      name="accountManager"
                      value={
                        serviceForm.accountManager
                      }
                      onChange={
                        updateServiceForm
                      }
                      placeholder="Account manager"
                    />
                  </label>
                </div>

                <label>
                  Service Description
                  <textarea
                    name="description"
                    value={
                      serviceForm.description
                    }
                    onChange={
                      updateServiceForm
                    }
                    rows="4"
                    placeholder="Describe the managed service..."
                  />
                </label>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Add Managed Service
                </button>
              </form>
            )}

            <div className="module-toolbar">
              <input
                value={serviceSearch}
                onChange={(event) =>
                  setServiceSearch(
                    event.target.value
                  )
                }
                placeholder="Search managed services..."
              />

              <select
                value={serviceFilter}
                onChange={(event) =>
                  setServiceFilter(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All services
                </option>

                {serviceStatuses.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {formatLabel(status)}
                    </option>
                  )
                )}
              </select>
            </div>

            {loading ? (
              <div className="empty-state">
                Loading managed services...
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="empty-state">
                <p>
                  No managed services found.
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() =>
                    setShowServiceForm(true)
                  }
                >
                  Add First Service
                </button>
              </div>
            ) : (
              <div className="service-grid">
                {filteredServices.map(
                  (service) => (
                    <article
                      className="managed-service-card"
                      key={service.id}
                    >
                      <div className="service-card-top">
                        <div>
                          <span className="ticket-number">
                            {
                              service.service_package
                            }
                          </span>

                          <h3>
                            {
                              service.service_name
                            }
                          </h3>

                          <p>
                            {service.customers
                              ?.business_name ||
                              "Unknown customer"}
                          </p>
                        </div>

                        <strong className="service-price">
                          {formatCurrency(
                            service.monthly_fee
                          )}
                          <small>
                            /month
                          </small>
                        </strong>
                      </div>

                      {service.description && (
                        <p className="service-description">
                          {
                            service.description
                          }
                        </p>
                      )}

                      <div className="service-details">
                        <div>
                          <span>
                            Status
                          </span>

                          <select
                            className="status-select"
                            value={
                              service.status
                            }
                            onChange={(event) =>
                              updateService(
                                service.id,
                                {
                                  status:
                                    event.target
                                      .value,
                                }
                              )
                            }
                          >
                            {serviceStatuses.map(
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
                          <span>
                            Start Date
                          </span>

                          <strong>
                            {service.start_date
                              ? formatDate(
                                  service.start_date
                                )
                              : "Not set"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Renewal
                          </span>

                          <strong>
                            {service.renewal_date
                              ? formatDate(
                                  service.renewal_date
                                )
                              : "Not set"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Account Manager
                          </span>

                          <strong>
                            {service.account_manager ||
                              "Unassigned"}
                          </strong>
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </section>
        )}
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

function formatCurrency(value) {
  return new Intl.NumberFormat("en-ZW", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value) {
  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString();
}

function formatDateTime(value) {
  return new Date(value).toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}