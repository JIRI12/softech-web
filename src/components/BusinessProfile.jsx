"use client";

import { useState } from "react";

export default function BusinessProfile({ onContinue }) {
  const [form, setForm] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    industry: "",
    employees: "",
  });

  const updateField = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.businessName ||
      !form.contactName ||
      !form.email ||
      !form.phone
    ) {
      return;
    }

    onContinue(form);
  };

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl">

        <div className="rounded-3xl bg-white p-8 shadow-xl md:p-12">

          <p className="font-semibold uppercase tracking-wider text-blue-600">
            Business Profile
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-950">
            Tell us about your business
          </h2>

          <p className="mt-3 leading-7 text-slate-600">
            This information helps SofTech understand your business
            environment and prepare a more relevant technology roadmap.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Business Name *
              </label>

              <input
                type="text"
                value={form.businessName}
                onChange={(e) =>
                  updateField("businessName", e.target.value)
                }
                placeholder="e.g. ABC Investments"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Contact Person *
              </label>

              <input
                type="text"
                value={form.contactName}
                onChange={(e) =>
                  updateField("contactName", e.target.value)
                }
                placeholder="Your name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email *
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    updateField("email", e.target.value)
                  }
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Phone *
                </label>

                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    updateField("phone", e.target.value)
                  }
                  placeholder="+263..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Industry
                </label>

                <select
                  value={form.industry}
                  onChange={(e) =>
                    updateField("industry", e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
                >
                  <option value="">Select industry</option>
                  <option>Retail</option>
                  <option>Finance</option>
                  <option>Healthcare</option>
                  <option>Education</option>
                  <option>Agriculture</option>
                  <option>Construction</option>
                  <option>Transport & Logistics</option>
                  <option>Professional Services</option>
                  <option>Manufacturing</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Number of Employees
                </label>

                <select
                  value={form.employees}
                  onChange={(e) =>
                    updateField("employees", e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
                >
                  <option value="">Select</option>
                  <option>1–5</option>
                  <option>6–20</option>
                  <option>21–50</option>
                  <option>51–100</option>
                  <option>101–250</option>
                  <option>250+</option>
                </select>
              </div>

            </div>

            <button
              type="submit"
              className="mt-4 w-full rounded-full bg-blue-600 px-7 py-4 font-semibold text-white transition hover:bg-blue-700"
            >
              Continue to Technology Audit →
            </button>

          </form>

        </div>
      </div>
    </section>
  );
}