"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";

const questions = [
  {
    question: "How does your business currently manage its website?",
    options: [
      "Professional website that is regularly maintained",
      "We have a website but rarely update it",
      "We have a basic or outdated website",
      "We do not have a website",
    ],
  },
  {
    question: "How does your business manage email?",
    options: [
      "Professional business email with our domain",
      "Mostly business email but some personal accounts",
      "Mostly Gmail/Yahoo/personal email accounts",
      "We do not use email regularly",
    ],
  },
  {
    question: "How do you protect your business data?",
    options: [
      "Automated backups and secure storage",
      "Regular manual backups",
      "Occasional backups",
      "We do not have a backup system",
    ],
  },
  {
    question: "How would you describe your cybersecurity?",
    options: [
      "We have strong security controls and monitoring",
      "We use antivirus and basic security",
      "We have some security measures",
      "We have no formal cybersecurity measures",
    ],
  },
  {
    question: "How does your business use cloud services?",
    options: [
      "Cloud services are central to our operations",
      "We use several cloud services",
      "We use a few cloud services",
      "We mostly operate locally/offline",
    ],
  },
  {
    question: "How automated are your business processes?",
    options: [
      "Most important processes are automated",
      "Several processes are automated",
      "Only a few processes are automated",
      "Most processes are manual",
    ],
  },
  {
    question: "How does your business use digital payments?",
    options: [
      "We have integrated digital payment systems",
      "We accept several digital payment methods",
      "We accept some digital payments",
      "We mainly use cash/manual payments",
    ],
  },
  {
    question: "Does your business use technology to understand customers and sales?",
    options: [
      "We use dashboards and analytics regularly",
      "We use some reports and analytics",
      "We occasionally review data",
      "We do not use analytics",
    ],
  },
  {
    question: "Does your business use AI or intelligent automation?",
    options: [
      "Yes, AI is actively integrated into our operations",
      "We are currently experimenting with AI",
      "We occasionally use AI tools",
      "We do not currently use AI",
    ],
  },
  {
    question: "Do staff receive technology/security training?",
    options: ["Regularly", "Occasionally", "Rarely", "No"],
  },
];

const answerPoints = [10, 7, 4, 0];

const emptyBusiness = {
  businessName: "",
  contactName: "",
  email: "",
  phone: "",
  industry: "",
  employees: "",
};

function getReadiness(score) {
  if (score >= 80) {
    return {
      title: "Advanced",
      description:
        "Your business has a strong technology foundation. The next focus is optimisation, security, automation and continuous improvement.",
    };
  }

  if (score >= 60) {
    return {
      title: "Developing",
      description:
        "Your business has several useful technology foundations, with clear opportunities to strengthen integration, security and automation.",
    };
  }

  if (score >= 40) {
    return {
      title: "Basic",
      description:
        "Your business has some technology foundations in place, but several areas can be improved to support reliable growth.",
    };
  }

  return {
    title: "Needs Attention",
    description:
      "Your business has significant opportunities to strengthen its digital foundation, cybersecurity, connectivity, automation and support.",
  };
}

export default function AuditForm() {
  const router = useRouter();
  const [stage, setStage] = useState("business");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [business, setBusiness] = useState(emptyBusiness);
  const [answers, setAnswers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateBusiness(event) {
    setBusiness((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function startQuestions(event) {
    event.preventDefault();
    setError("");

    if (
      !business.businessName.trim() ||
      !business.contactName.trim() ||
      !business.email.trim() ||
      !business.phone.trim()
    ) {
      setError("Please complete Business Name, Contact Person, Email and Phone.");
      return;
    }

    setQuestionIndex(0);
    setStage("questions");
  }

  function selectAnswer(answer) {
    setAnswers((current) => {
      const next = [...current];
      next[questionIndex] = answer;
      return next;
    });
    setError("");
  }

  function goNext() {
    if (!answers[questionIndex]) {
      setError("Please select an answer before continuing.");
      return;
    }

    if (questionIndex === questions.length - 1) {
      finishAssessment();
      return;
    }

    setQuestionIndex((current) => current + 1);
    setError("");
  }

  function goBack() {
    setError("");
    if (questionIndex === 0) {
      setStage("business");
      return;
    }
    setQuestionIndex((current) => current - 1);
  }

  async function finishAssessment() {
    const score = answers.reduce((total, answer, index) => {
      const position = questions[index].options.indexOf(answer);
      return total + (answerPoints[position] ?? 0);
    }, 0);

    const readiness = getReadiness(score);
    const lead = {
      id: Date.now().toString(),
      business,
      answers,
      score,
      readiness,
      status: "Audited",
      createdAt: new Date().toISOString(),
    };

    setSaving(true);
    setError("");

    localStorage.setItem("softech_latest_audit", JSON.stringify(lead));
    localStorage.setItem(`softech-lead-${lead.id}`, JSON.stringify(lead));

    const existing = JSON.parse(localStorage.getItem("softech-leads") || "[]");
    localStorage.setItem("softech-leads", JSON.stringify([lead, ...existing]));

    if (supabase) {
      const { error: supabaseError } = await supabase.from("audits").insert({
        business_name: business.businessName,
        contact_name: business.contactName,
        email: business.email,
        phone: business.phone,
        industry: business.industry || null,
        employees: business.employees || null,
        answers,
        score,
        readiness_level: readiness.title,
        status: "Audited",
      });

      if (supabaseError) {
        console.error("Audit save failed:", supabaseError);
      }
    }

    setSaving(false);
    router.push("/audit/result");
  }

  if (stage === "business") {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            ← Back to SofTech
          </Link>

          <div className="mt-6 rounded-3xl bg-white p-8 shadow-xl md:p-12">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-600">
              SofTech Technology Assessment
            </p>

            <h1 className="mt-4 text-4xl font-bold text-slate-950">
              Tell us about your business
            </h1>

            <p className="mt-4 leading-7 text-slate-600">
              We will use this information to connect your assessment with the
              right SofTech transformation opportunities.
            </p>

            <form onSubmit={startQuestions} className="mt-8 space-y-5">
              <Field
                label="Business Name *"
                name="businessName"
                value={business.businessName}
                onChange={updateBusiness}
                placeholder="e.g. ABC Investments"
              />

              <Field
                label="Contact Person *"
                name="contactName"
                value={business.contactName}
                onChange={updateBusiness}
                placeholder="Your name"
              />

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Email *"
                  name="email"
                  type="email"
                  value={business.email}
                  onChange={updateBusiness}
                  placeholder="name@company.com"
                />

                <Field
                  label="Phone *"
                  name="phone"
                  type="tel"
                  value={business.phone}
                  onChange={updateBusiness}
                  placeholder="+263..."
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <SelectField
                  label="Industry"
                  name="industry"
                  value={business.industry}
                  onChange={updateBusiness}
                  options={[
                    "Retail",
                    "Finance",
                    "Healthcare",
                    "Education",
                    "Agriculture",
                    "Construction",
                    "Transport & Logistics",
                    "Professional Services",
                    "Manufacturing",
                    "Other",
                  ]}
                />

                <SelectField
                  label="Number of Employees"
                  name="employees"
                  value={business.employees}
                  onChange={updateBusiness}
                  options={["1–5", "6–20", "21–50", "51–100", "101–250", "250+"]}
                />
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-full bg-blue-600 px-7 py-4 font-bold text-white transition hover:bg-blue-700"
              >
                Start Technology Assessment →
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  const question = questions[questionIndex];
  const selected = answers[questionIndex];
  const progress = ((questionIndex + 1) / questions.length) * 100;

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between text-sm font-semibold">
            <span className="text-slate-500">
              Question {questionIndex + 1} of {questions.length}
            </span>
            <span className="text-blue-600">{Math.round(progress)}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-7 shadow-xl md:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-600">
            Technology Assessment
          </p>

          <h1 className="mt-5 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
            {question.question}
          </h1>

          <div className="mt-8 space-y-4">
            {question.options.map((option) => {
              const isSelected = selected === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => selectAnswer(option)}
                  className={`w-full rounded-2xl border p-5 text-left transition ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                      : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                        isSelected
                          ? "border-blue-600 bg-blue-600"
                          : "border-slate-300"
                      }`}
                    >
                      {isSelected && (
                        <span className="h-2.5 w-2.5 rounded-full bg-white" />
                      )}
                    </span>
                    <span className="font-medium text-slate-700">{option}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {error && (
            <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={goBack}
              className="rounded-full border border-slate-300 px-6 py-4 font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={saving}
              className="flex-1 rounded-full bg-blue-600 px-6 py-4 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving Assessment..."
                : questionIndex === questions.length - 1
                  ? "Calculate My Score →"
                  : "Next Question →"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, name, type = "text", value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        required={label.endsWith("*")}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
