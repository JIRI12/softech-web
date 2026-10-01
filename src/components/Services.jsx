const services = [
  {
    name: "SofTech Digital",
    description:
      "Websites, e-commerce, mobile applications, portals, payment integration and business automation.",
  },
  {
    name: "SofTech Cyber",
    description:
      "Security assessments, endpoint protection, email security, firewall, backups, monitoring and awareness.",
  },
  {
    name: "SofTech Cloud",
    description:
      "Cloud migration, Microsoft 365, Google Workspace, backup, identity, disaster recovery and optimisation.",
  },
  {
    name: "SofTech AI",
    description:
      "AI assistants, WhatsApp automation, document processing, analytics, workflow automation and AI training.",
  },
  {
    name: "SofTech Connect",
    description:
      "Business Wi-Fi, structured networking, fibre, LTE/5G, satellite, VPN, SD-WAN and monitoring.",
  },
  {
    name: "SofTech Energy & Smart Infrastructure",
    description:
      "Energy monitoring, IoT, solar and backup monitoring, agri-IoT and connected infrastructure.",
  },
  {
    name: "SofTech Academy",
    description:
      "Technology training, skills development and certification.",
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="font-bold uppercase tracking-[0.2em] text-blue-600">
            Our capabilities
          </p>

          <h2 className="mt-3 text-4xl font-bold text-slate-950">
            Technology services built around your business.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700">
                S
              </div>

              <h3 className="text-xl font-bold text-slate-950">
                {service.name}
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}