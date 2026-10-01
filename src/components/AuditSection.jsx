"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const questions = [
  {
    id: "website",
    question: "Does your business have a professional website?",
    options: [
      { label: "Yes, and it works well", score: 10 },
      { label: "Yes, but it needs improvement", score: 5 },
      { label: "No", score: 0 },
    ],
  },
  {
    id: "security",
    question: "How would you describe your cybersecurity?",
    options: [
      { label: "Strong and actively managed", score: 10 },
      { label: "Some protection is in place", score: 5 },
      { label: "We have little or no protection", score: 0 },
    ],
  },
  {
    id: "cloud",
    question: "Does your business use cloud services?",
    options: [
      { label: "Yes, strategically", score: 10 },
      { label: "Some cloud services", score: 5 },
      { label: "No", score: 0 },
    ],
  },
  {
    id: "automation",
    question: "How much of your business is automated?",
    options: [
      { label: "Most important processes", score: 10 },
      { label: "Some processes", score: 5 },
      { label: "Very little", score: 0 },
    ],
  },
  {
    id: "connectivity",
    question: "How reliable is your business connectivity?",
    options: [
      { label: "Reliable and monitored", score: 10 },
      { label: "Generally reliable", score: 5 },
      { label: "Frequent problems", score: 0 },
    ],
  },
  {
    id: "backup",
    question: "Does your business have a reliable backup strategy?",
    options: [
      { label: "Yes, automated and tested", score: 10 },
      { label: "Some backups exist", score: 5 },
      { label: "No reliable backup", score: 0 },
    ],
  },
  {
    id: "support",
    question: "Do you have dedicated IT support?",
    options: [
      { label: "Yes", score: 10 },
      { label: "Part-time / informal", score: 5 },
      { label: "No", score: 0 },
    ],
  },
  {
    id: "data",
    question: "How well is business data managed?",
    options: [
      { label: "Centralised and organised", score: 10 },
      { label: "Partially organised", score: 5 },
      { label: "Mostly fragmented", score: 0 },
    ],
  },
  {
    id: "ai",
    question: "Is your business currently using AI?",
    options: [
      { label: "Yes, strategically", score: 10 },
      { label: "Experimenting with AI", score: 5 },
      { label: "Not yet", score: 0 },
    ],
  },
  {
    id: "training",
    question: "Do staff receive technology/security training?",
    options: [
      { label: "Regularly", score: 10 },
      { label: "Occasionally", score: 5 },
      { label: "No", score: 0 },
    ],
  },
];

export default function AuditSection() {
  const router = useRouter();

  const [started, setStarted] = useState(false);
  const [complete, setComplete] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [business, setBusiness] = useState({
    name: "",
    contact: "",
    email: "",
    industry: "",
  });

  const score = Object.values(answers).reduce(
    (total, value) => total + value,
    0
  );

  function chooseAnswer(value) {
    setAnswers((previous) => ({
      ...previous,
      [questions[current].id]: value,
    }));

    if (current < questions.length - 1) {
      setTimeout(() => setCurrent((value) => value + 1), 150);
    }
  }

  function finishAudit(event) {
    event.preventDefault();

    const finalScore = score;

    const id = Date.now().toString();

    const lead = {
      id,
      business,
      answers,
      score: finalScore,
      status: "Audited",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(`softech-lead-${id}`, JSON.stringify(lead));

    const existing = JSON.parse(
      localStorage.getItem("softech-leads") || "[]"
    );

    localStorage.setItem(
      "softech-leads",
      JSON.stringify([lead, ...existing])
    );

    setComplete(true);
  }

  if (!started) {
    return (
      <section id="audit" className="bg-slate-100 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-[2rem] bg-white p-8 text-center shadow-xl md:p-14">
            <p className="font-bold uppercase tracking-[0.2em] text-blue-600">
              Technology Audit
            </p>

            <h2 className="mt-4 text-4xl font-bold text-slate-950">
              Discover your Digital Readiness Score.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Complete a short assessment of your business technology
              environment and receive an initial readiness score.
            </p>

            <button
              onClick={() => setStarted(true)}
              className="mt-8 rounded-full bg-blue-600 px-8 py-4 font-bold text-white hover:bg-blue-500"
            >
              Start Technology Audit →
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (complete) {
    return (
      <section className="bg-slate-100 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-[2rem] bg-white p-10 text-center shadow-xl">
            <p className="font-bold uppercase tracking-[0.2em] text-blue-600">
              Audit Complete
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              Your Digital Readiness Score
            </h2>

            <div className="mx-auto mt-8 flex h-48 w-48 items-center justify-center rounded-full border-[18px] border-blue-100">
              <div>
                <div className="text-5xl font-bold text-blue-600">
                  {score}
                </div>
                <div className="text-sm text-slate-500">out of 100</div>
              </div>
            </div>

            <p className="mx-auto mt-8 max-w-xl text-slate-600">
              Your assessment has been submitted to SofTech HQ. The next
              stage is transformation planning.
            </p>

            <button
              onClick={() => router.push("/hq")}
              className="mt-8 rounded-full bg-slate-950 px-7 py-3.5 font-bold text-white hover:bg-blue-700"
            >
              View in SofTech HQ →
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (current === questions.length) {
    return (
      <section className="bg-slate-100 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <form
            onSubmit={finishAudit}
            className="rounded-[2rem] bg-white p-8 shadow-xl md:p-12"
          >
            <p className="font-bold uppercase tracking-[0.2em] text-blue-600">
              Final Step
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Tell us about your business
            </h2>

            <div className="mt-8 grid gap-5">
              <input
                required
                placeholder="Business name"
                value={business.name}
                onChange={(e) =>
                  setBusiness({ ...business, name: e.target.value })
                }
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              <input
                required
                placeholder="Contact person"
                value={business.contact}
                onChange={(e) =>
                  setBusiness({ ...business, contact: e.target.value })
                }
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              <input
                required
                type="email"
                placeholder="Email address"
                value={business.email}
                onChange={(e) =>
                  setBusiness({ ...business, email: e.target.value })
                }
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              <input
                required
                placeholder="Industry"
                value={business.industry}
                onChange={(e) =>
                  setBusiness({ ...business, industry: e.target.value })
                }
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="mt-7 w-full rounded-full bg-blue-600 px-6 py-4 font-bold text-white hover:bg-blue-500"
            >
              Complete Technology Audit →
            </button>
          </form>
        </div>
      </section>
    );
  }

  const question = questions[current];

  return (
    <section className="bg-slate-100 py-20">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-6 flex items-center justify-between text-sm font-semibold">
          <span>
            Question {current + 1} of {questions.length}
          </span>

          <span className="text-blue-600">
            {Math.round((current / questions.length) * 100)}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{
              width: `${((current + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        <div className="mt-8 rounded-[2rem] bg-white p-8 shadow-xl md:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            Technology Assessment
          </p>

          <h2 className="mt-4 text-3xl font-bold leading-tight">
            {question.question}
          </h2>

          <div className="mt-8 grid gap-4">
            {question.options.map((option) => (
              <button
                key={option.label}
                onClick={() => chooseAnswer(option.score)}
                className="rounded-2xl border border-slate-200 p-5 text-left font-semibold transition hover:border-blue-500 hover:bg-blue-50"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}