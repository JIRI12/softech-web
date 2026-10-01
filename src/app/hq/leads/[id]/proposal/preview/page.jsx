"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ProposalPreview() {
  const params = useParams();

  const [lead, setLead] = useState(null);
  const [proposal, setProposal] = useState(null);

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

  const proposalNumber =
    proposal.id || `PROP-${lead.id}`;

  function printProposal() {
    window.print();
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="no-print mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
        <Link
          href={`/hq/leads/${lead.id}/proposal`}
          className="font-semibold text-slate-700 hover:text-blue-600"
        >
          ← Back to Proposal
        </Link>

        <button
          onClick={printProposal}
          className="rounded-full bg-slate-950 px-7 py-3 font-bold text-white hover:bg-blue-700"
        >
          Print / Save PDF
        </button>
      </div>

      <section className="print-page mx-auto max-w-4xl bg-white shadow-xl">
        <div className="p-8 md:p-14">
          <div className="flex flex-wrap items-start justify-between gap-8 border-b border-slate-200 pb-8">
            <div>
              <img
                src="/softech-logo.png"
                alt="SofTech"
                className="h-20 w-auto object-contain"
              />

              <p className="mt-2 font-semibold text-slate-600">
                Problem-Solving in the Tech-Space
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                SOFTECH ONE
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Technology Proposal
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {proposalNumber}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {new Date(proposal.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <section className="mt-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Prepared For
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              {lead.business.name}
            </h2>

            <p className="mt-1">{lead.business.contact}</p>

            <p className="text-slate-600">
              {lead.business.email}
            </p>

            <p className="text-slate-600">
              {lead.business.industry}
            </p>
          </section>

          <section className="mt-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Executive Summary
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              A structured technology transformation plan
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              Based on the SofTech Technology Audit, the current Digital
              Readiness Score is{" "}
              <strong>{lead.score}/100</strong>. SofTech proposes a
              structured programme to address the identified technology
              priorities and establish a foundation for continuous
              improvement.
            </p>
          </section>

          <section className="mt-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Recommended Services
            </p>

            <div className="mt-5 grid gap-4">
              {proposal.recommendations.map((item, index) => (
                <div
                  key={item.name}
                  className="flex gap-4 rounded-2xl border border-slate-200 p-5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                    {index + 1}
                  </div>

                  <div>
                    <h3 className="font-bold">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {item.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Investment
            </p>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="flex justify-between border-b p-5">
                <span>One-time implementation</span>

                <strong>
                  $
                  {Number(
                    proposal.finalImplementation ??
                      proposal.implementationCost
                  ).toLocaleString()}
                </strong>
              </div>

              {proposal.discountAmount > 0 && (
                <div className="flex justify-between border-b p-5 text-green-700">
                  <span>Implementation discount</span>

                  <strong>
                    -${Number(proposal.discountAmount).toLocaleString()}
                  </strong>
                </div>
              )}

              <div className="flex justify-between bg-slate-50 p-5">
                <span>Recurring managed service</span>

                <strong className="text-blue-600">
                  ${proposal.monthly}/month
                </strong>
              </div>
            </div>
          </section>

          <section className="mt-12 rounded-2xl bg-slate-950 p-7 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
              Next Steps
            </p>

            <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>1. Review this technology proposal.</li>
              <li>2. Confirm the recommended implementation scope.</li>
              <li>3. Agree on implementation scheduling.</li>
              <li>4. Begin the SofTech transformation programme.</li>
            </ol>
          </section>

          <section className="mt-12 grid gap-10 border-t border-slate-200 pt-10 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                SofTech
              </p>

              <p className="mt-6 border-b border-slate-400 pb-2">
                Authorised Representative
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Client
              </p>

              <p className="mt-6 border-b border-slate-400 pb-2">
                Authorised Representative
              </p>
            </div>
          </section>

          <footer className="mt-14 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
            SofTech • Problem-Solving in the Tech-Space
          </footer>
        </div>
      </section>
    </main>
  );
}