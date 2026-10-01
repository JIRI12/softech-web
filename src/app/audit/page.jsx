"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const questions = [
  {
    id: "website",
    question: "Does your business have a professional website?",
    options: [
      { label: "Yes, and it is maintained", points: 10 },
      { label: "Yes, but it needs improvement", points: 6 },
      { label: "No", points: 0 },
    ],
  },
  {
    id: "email",
    question: "Does your business use professional business email?",
    options: [
      { label: "Yes", points: 10 },
      { label: "Partially", points: 5 },
      { label: "No", points: 0 },
    ],
  },
  {
    id: "cloud",
    question: "Does your business use cloud services?",
    options: [
      { label: "Regularly", points: 10 },
      { label: "Occasionally", points: 5 },
      { label: "No", points: 0 },
    ],
  },
  {
    id: "backup",
    question: "Are your important business files regularly backed up?",
    options: [
      { label: "Yes, automatically", points: 10 },
      { label: "Sometimes", points: 5 },
      { label: "No", points: 0 },
    ],
  },
  {
    id: "cybersecurity",
    question: "Does your business have cybersecurity protection?",
    options: [
      { label: "Yes, with monitoring", points: 10 },
      { label: "Basic protection", points: 5 },
      { label: "No", points: 0 },
    ],
  },
  {
    id: "automation",
    question: "How much of your business uses digital automation?",
    options: [
      { label: "Extensively", points: 10 },
      { label: "Some processes", points: 5 },
      { label: "Very little", points: 0 },
    ],
  },
  {
    id: "ai",
    question: "Does your business currently use AI tools?",
    options: [
      { label: "Regularly", points: 10 },
      { label: "Experimenting", points: 5 },
      { label: "No", points: 0 },
    ],
  },
  {
    id: "network",
    question: "Is your business network professionally managed?",
    options: [
      { label: "Yes", points: 10 },
      { label: "Partially", points: 5 },
      { label: "No", points: 0 },
    ],
  },
  {
    id: "support",
    question: "Does your business have reliable IT support?",
    options: [
      { label: "Dedicated support", points: 10 },
      { label: "Occasional support", points: 5 },
      { label: "No", points: 0 },
    ],
  },
  {
    id: "training",
    question: "Do staff receive technology/security training?",
    options: [
      { label: "Regularly", points: 10 },
      { label: "Occasionally", points: 5 },
      { label: "No", points: 0 },
    ],
  },
];

export default function AuditPage() {
  const router = useRouter();
  const savingRef = useRef(false);

  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [business, setBusiness] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    industry: "",
    location: "",
  });

  function updateBusiness(event) {
    const { name, value } = event.target;

    setBusiness((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function startAssessment(event) {
    event.preventDefault();

    if (!business.businessName.trim()) {
      setError("Please enter your business name.");
      return;
    }

    if (!business.contactName.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!business.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setError("");
    setStarted(true);
  }

  function selectAnswer(option) {
    if (savingRef.current) return;

    const question = questions[currentQuestion];

    const updatedAnswers = {
      ...answers,
      [question.id]: {
        answer: option.label,
        points: option.points,
      },
    };

    setAnswers(updatedAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
      return;
    }

    finishAssessment(updatedAnswers);
  }

  async function finishAssessment(finalAnswers) {
    if (savingRef.current) return;

    savingRef.current = true;
    setSaving(true);
    setError("");

    const score = Object.values(finalAnswers).reduce(
      (total, answer) => total + answer.points,
      0
    );

    let readinessLevel = "Foundation";

    if (score >= 80) {
      readinessLevel = "Advanced";
    } else if (score >= 60) {
      readinessLevel = "Developing";
    } else if (score >= 40) {
      readinessLevel = "Basic";
    }

    const audit = {
      business,
      answers: finalAnswers,
      score,
      readinessLevel,
      completedAt: new Date().toISOString(),
    };

    if (!supabase) {
      sessionStorage.setItem("softechAudit", JSON.stringify(audit));
      sessionStorage.setItem("softechAuditSaveState", "local");

      router.push("/audit/result");
      return;
    }

    const { error: saveError } = await supabase
      .from("technology_audits")
      .insert({
        business_name: business.businessName,
        contact_name: business.contactName,
        email: business.email,
        phone: business.phone,
        industry: business.industry,
        location: business.location,
        score,
        readiness_level: readinessLevel,
        answers: finalAnswers,
      });

    if (saveError) {
      console.error("Audit save failed:", saveError);

      savingRef.current = false;
      setSaving(false);
      setError(
        "Your assessment could not be saved. Please try again."
      );
      return;
    }

    sessionStorage.setItem("softechAudit", JSON.stringify(audit));
    sessionStorage.setItem("softechAuditSaveState", "saved");

    router.push("/audit/result");
  }

  return (
    <main className="audit-page">
      <header className="audit-header">
        <a href="/" className="brand">
          <img src="/softech-logo.png" alt="SofTech" />
        </a>

        <a href="/" className="back-link">
          ← Back to SofTech
        </a>
      </header>

      <div className="audit-container">
        {!started ? (
          <section className="audit-intro">
            <span className="eyebrow">SOFTECH TECHNOLOGY AUDIT</span>

            <h1>Understand your business technology readiness.</h1>

            <p>
              Answer 10 short questions and receive a Digital Readiness Score
              with a clear next step for your business.
            </p>

            <form onSubmit={startAssessment} className="business-form">
              <div className="form-grid">
                <label>
                  Business name *
                  <input
                    name="businessName"
                    value={business.businessName}
                    onChange={updateBusiness}
                    placeholder="ABC Enterprises"
                  />
                </label>

                <label>
                  Your name *
                  <input
                    name="contactName"
                    value={business.contactName}
                    onChange={updateBusiness}
                    placeholder="John Doe"
                  />
                </label>

                <label>
                  Email *
                  <input
                    type="email"
                    name="email"
                    value={business.email}
                    onChange={updateBusiness}
                    placeholder="john@company.com"
                  />
                </label>

                <label>
                  Phone
                  <input
                    name="phone"
                    value={business.phone}
                    onChange={updateBusiness}
                    placeholder="+263..."
                  />
                </label>

                <label>
                  Industry
                  <input
                    name="industry"
                    value={business.industry}
                    onChange={updateBusiness}
                    placeholder="Retail, Finance, Agriculture..."
                  />
                </label>

                <label>
                  Location
                  <input
                    name="location"
                    value={business.location}
                    onChange={updateBusiness}
                    placeholder="Harare, Zimbabwe"
                  />
                </label>
              </div>

              {error && <p className="form-error">{error}</p>}

              <button type="submit" className="primary-button">
                Start Technology Assessment →
              </button>
            </form>
          </section>
        ) : (
          <section className="question-section">
            <div className="question-top">
              <span>
                Question {currentQuestion + 1} of {questions.length}
              </span>

              <span>
                {Math.round(
                  ((currentQuestion + 1) / questions.length) * 100
                )}
                %
              </span>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    ((currentQuestion + 1) / questions.length) * 100
                  }%`,
                }}
              />
            </div>

            <div className="question-card">
              <span className="eyebrow">TECHNOLOGY ASSESSMENT</span>

              <h1>{questions[currentQuestion].question}</h1>

              <div className="answer-list">
                {questions[currentQuestion].options.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => selectAnswer(option)}
                    className="answer-button"
                    disabled={saving}
                  >
                    {saving && currentQuestion === questions.length - 1
                      ? "Saving assessment..."
                      : option.label}
                  </button>
                ))}
              </div>

              {error && <p className="form-error">{error}</p>}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}