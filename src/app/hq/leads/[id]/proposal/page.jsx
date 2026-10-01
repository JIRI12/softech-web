"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ProposalPage() {
  const params = useParams();
  const router = useRouter();

  const [lead, setLead] = useState(null);
  const [proposal, setProposal] = useState(null);

  const [discount, setDiscount] = useState("none");

  useEffect(() => {
    if (!params?.id) return;

    const leadData = localStorage.getItem(
      `softech-lead-${params.id}`
    );

    const proposalData = localStorage.getItem(
      `softech-proposal-${params.id}`
    );

    if (leadData) {
      setLead(JSON.parse(leadData));
    }

    if (proposalData) {
      setProposal(JSON.parse(proposalData));
    }
  }, [params]);

  if (!lead || !proposal) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Loading proposal...
      </main>
    );
  }

  const discountAmount =
    discount === "5"
      ? proposal.implementationCost * 0.05
      : discount === "10"
      ? proposal.implementationCost * 0.1
      : 0;

  const finalImplementation =
    proposal.implementationCost - discountAmount;

  function saveProposal() {
    const updatedProposal = {
      ...proposal,
      discount,
      discountAmount,
      finalImplementation,
    };

    localStorage.setItem(
      `softech-proposal-${lead.id}`,
      JSON.stringify(updatedProposal)
    );

    const updatedLead = {
      ...lead,
      status: "Proposal Ready",
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

    router.push(`/hq/leads/${lead.id}/proposal/preview`);
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
            href={`/hq/leads/${lead.id}/plan`}
            className="rounded-full border px-5 py-2 text-sm font-semibold"
          >
            ← Back to Plan
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="font-bold uppercase tracking-[0.2em] text-blue-600">
          Proposal Builder
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Create Technology Proposal
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold">
              Recommended Solution
            </h2>

            <div className="mt-6 grid gap-3">
              {proposal.recommendations.map((item) => (
                <div
                  key={item.name}
                  className="rounded-xl bg-slate-50 p-4"
                >
                  <div className="font-bold">{item.name}</div>
                  <div className="mt-1 text-sm text-slate-600">
                    {item.reason}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-slate-950 p-8 text-white">
            <p className="text-sm text-slate-400">
              Monthly Service
            </p>

            <p className="mt-2 text-4xl font-bold text-blue-400">
              ${proposal.monthly}/month
            </p>

            <div className="mt-8">
              <label className="text-sm text-slate-400">
                Implementation discount
              </label>

              <select
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-slate-900"
              >
                <option value="none">No discount</option>
                <option value="5">5% discount</option>
                <option value="10">10% discount</option>
              </select>
            </div>

            <div className="mt-8">
              <p className="text-sm text-slate-400">
                One-time implementation
              </p>

              <p className="mt-2 text-4xl font-bold">
                ${finalImplementation.toLocaleString()}
              </p>
            </div>

            <button
              onClick={saveProposal}
              className="mt-8 w-full rounded-full bg-blue-600 px-5 py-4 font-bold hover:bg-blue-500"
            >
              Generate Proposal →
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}