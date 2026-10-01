"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default function HQLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkSession() {
      if (!supabase) return;

      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.replace("/hq");
      }
    }

    checkSession();
  }, [router]);

  async function handleLogin(event) {
    event.preventDefault();

    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    router.replace("/hq");
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <Link href="/">
          <img src="/softech-logo.png" alt="SofTech" />
        </Link>

        <span className="eyebrow">SOFTECH HQ</span>

        <h1>HQ Management</h1>

        <p>
          Sign in with your authorized SofTech HQ account.
        </p>

        <form onSubmit={handleLogin}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="hq@softech.co.zw"
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in to SofTech HQ"}
          </button>
        </form>

        <Link href="/" className="back-link">
          ← Back to website
        </Link>
      </div>
    </main>
  );
}