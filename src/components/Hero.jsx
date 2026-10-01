import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.35),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
        <div className="max-w-4xl">
          <div className="mb-6 inline-flex rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300">
            SOFTECH ONE
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl">
            Problem-Solving in the
            <span className="block text-blue-500">
              Tech-Space.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
            Connect. Secure. Digitise. Automate. Grow.
            SofTech helps businesses build and manage the technology
            they need to operate and grow.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
            href="/audit"
            className="inline-flex rounded-full bg-blue-600 px-7 py-4 font-bold text-white transition hover:bg-blue-700"
            >
              Start Technology Assessment →
            </Link>

            <Link
              href="/#services"
              className="rounded-xl border border-white/20 px-7 py-4 text-center font-bold text-white transition hover:bg-white/10"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}