"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function LeadPage() {
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
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Lead not found</h1>

          <Link
            href="/hq"
            className="mt-4 inline-block text-blue-600"
          >
            ← Back to HQ
          </Link>
        </div>
      </main>
    );
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
            href="/hq"
            className="rounded-full border px-5 py-2 text-sm font-semibold"
          >
            Back to HQ
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="font-bold uppercase tracking-[0.2em] text-blue-600">
          Lead Profile
        </p>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-4xl font-bold">
              {lead.business.name}
            </h1>

            <p className="mt-2 text-slate-600">
              {lead.business.industry}
            </p>
          </div>

          <div className="rounded-2xl bg-white px-6 py-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-blue-600">
              {lead.score}/100
            </div>
            <div className="text-xs text-slate-500">
              Digital Readiness
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <InfoCard title="Contact" value={lead.business.contact} />
          <InfoCard title="Email" value={lead.business.email} />
          <InfoCard title="Status" value={lead.status} />
        </div>

        <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <p className="font-bold uppercase tracking-[0.15em] text-blue-600">
            Technology Audit
          </p>

          <h2 className="mt-3 text-2xl font-bold">
            Assessment Responses
          </h2>

          <div className="mt-7 grid gap-4">
            {Object.entries(lead.answers).map(([key, value], index) => (
              <div
                key={key}
                className="rounded-2xl border border-slate-200 p-5"
              >
                <div className="text-xs font-bold uppercase text-slate-400">
                  Question {index + 1}
                </div>

                <div className="mt-2 flex items-center justify-between gap-4">
                  <span className="font-semibold capitalize">
                    {key.replaceAll("-", " ")}
                  </span>

                  <span className="font-bold text-blue-600">
                    {value}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8">
          <button
            onClick={() =>
              router.push(`/hq/leads/${lead.id}/plan`)
            }
            className="w-full rounded-full bg-blue-600 px-6 py-4 font-bold text-white hover:bg-blue-500"
          >
            Create Transformation Plan →
          </button>
        </div>
      </div>
    </main>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <p className="mt-2 break-words font-semibold">
        {value}
      </p>
    </div>
  );
}