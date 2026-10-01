export default function BusinessBox() {
  return (
    <section id="business-box" className="bg-slate-950 py-20 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-bold uppercase tracking-[0.2em] text-blue-400">
              Flagship solution
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              SofTech Business-in-a-Box
            </h2>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
              One technology relationship covering connectivity, digital
              services, cloud, cybersecurity, backup, networking, AI,
              integration, support and analytics.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              "Internet",
              "Website",
              "Business Email",
              "Cloud",
              "Cybersecurity",
              "Backup",
              "Networking",
              "AI Assistant",
              "IT Support",
              "Analytics",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-medium"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}