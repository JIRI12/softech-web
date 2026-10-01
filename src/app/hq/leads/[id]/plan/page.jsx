"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function TransformationPlan() {
  const params = useParams();
  const router = useRouter();

  const [lead, setLead] = useState(null);

  useEffect(() => {
    if (!params?.id) return;

    const stored = localStorage.getItem(
      `softech-lead-${params.id}`
    );

    if (stored) {
      setLead(JSON.parse(stored));
    }
  }, [params]);

  if (!lead) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Loading...
      </main>
    );
  }

  const recommendations = [];

  if (lead.score < 80) {
    recommendations.push({
      name: "SofTech Digital",
      reason: "Improve the company's digital presence and business systems.",
    });
  }

  if (lead.answers.security < 10) {
    recommendations.push({
      name: "SofTech Cyber",
      reason: "Strengthen cybersecurity protection and monitoring.",
    });
  }

  if (lead.answers.cloud < 10) {
    recommendations.push({
      name: "SofTech Cloud",
      reason: "Improve cloud adoption, backup and identity management.",
    });
  }

  if (lead.answers.automation < 10) {
    recommendations.push({
      name: "SofTech AI",
      reason: "Identify opportunities for automation and AI-assisted workflows.",
    });
  }

  if (lead.answers.connectivity < 10) {
    recommendations.push({
      name: "SofTech Connect",
      reason: "Improve connectivity, networking and monitoring.",
    });
  }

  if (lead.answers.training < 10) {
    recommendations.push({
      name: "SofTech Academy",
      reason: "Develop staff technology and cybersecurity capabilities.",
    });
  }

  const implementationCost = 500 + recommendations.length * 100;
  const monthly = 99 + recommendations.length * 25;

  function createProposal() {
    const proposal = {
      id: `PROP-${lead.id}`,
      leadId: lead.id,
      createdAt: new Date().toISOString(),
      recommendations,
      implementationCost,
      monthly,
    };

    localStorage.setItem(
      `softech-proposal-${lead.id}`,
      JSON.stringify(proposal)
    );

    const updatedLead = {
      ...lead,
      status: "Plan Created",
    };

    localStorage.setItem(
      `softech-lead-${lead.id}`,
      JSON.stringify(updatedLead)
    );

    const existing = JSON.parse(
      localStorage.getItem("softech-leads") || "[]"
    );

    localStorage.setItem(
      "softech-leads",
      JSON.stringify(
        existing.map((item) =>
          item.id === lead.id ? updatedLead : item
        )
      )
    );

    router.push(`/hq/leads/${lead.id}/proposal`);
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/hq">
            <img
              src="/softech-logo.png"
              alt="SofTech"
              className="h-11 w-auto"
            />
          </Link>

          <Link
            href={`/hq/leads/${lead.id}`}
            className="rounded-full border px-5 py-2 text-sm font-semibold"
          >
            ← Back to Lead
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="font-bold uppercase tracking-[0.2em] text-blue-600">
          Transformation Plan
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Technology Transformation Plan
        </h1>

        <p className="mt-2 text-slate-600">
          Recommended SofTech services for {lead.business.name}.
        </p>

        <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-sm text-slate-500">
                Current Digital Readiness
              </p>

              <p className="mt-1 text-4xl font-bold text-blue-600">
                {lead.score}/100
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Business
              </p>

              <p className="mt-1 font-bold">
                {lead.business.name}
              </p>
            </div>
          </div>
        </div>

        <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <p className="font-bold uppercase tracking-wider text-blue-600">
            Recommended Services
          </p>

          <div className="mt-6 grid gap-4">
            {recommendations.map((item) => (
              <div
                key={item.name}
                className="rounded-2xl border border-slate-200 p-6"
              >
                <h3 className="text-xl font-bold">
                  {item.name}
                </h3>

                <p className="mt-2 text-slate-600">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-slate-950 p-8 text-white">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-400">
            Initial Commercial Estimate
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-400">
                One-time implementation
              </p>

              <p className="mt-2 text-4xl font-bold">
                ${implementationCost.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Recurring managed service
              </p>

              <p className="mt-2 text-4xl font-bold text-blue-400">
                ${monthly}/month
              </p>
            </div>
          </div>
        </section>

        <button
          onClick={createProposal}
          className="mt-8 w-full rounded-full bg-blue-600 px-6 py-4 font-bold text-white hover:bg-blue-500"
        >
          Create Proposal →
        </button>
      </div>
    </main>
  );
}