import Link from "next/link";

const services = [
  {
    title: "SofTech Digital",
    text: "Websites, e-commerce, applications, portals and business automation.",
  },
  {
    title: "SofTech Cyber",
    text: "Cybersecurity assessments, endpoint protection, backups and monitoring.",
  },
  {
    title: "SofTech Cloud",
    text: "Cloud migration, productivity platforms, backup, identity and recovery.",
  },
  {
    title: "SofTech AI",
    text: "AI assistants, WhatsApp automation, analytics and workflow automation.",
  },
  {
    title: "SofTech Connect",
    text: "Business networking, Wi-Fi, connectivity, VPN and infrastructure.",
  },
  {
    title: "SofTech Academy",
    text: "Practical technology training and professional development.",
  },
];

export default function HomePage() {
  return (
    <main className="site-shell">
      <header className="site-header">
        <Link href="/" className="brand">
          <img src="/softech-logo.png" alt="SofTech" />
        </Link>

        <nav>
          <a href="#services">Services</a>
          <a href="#business-box">Business-in-a-Box</a>
          <Link href="/audit">Technology Audit</Link>
          <Link href="/hq/login" className="hq-button">
            SofTech HQ
          </Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">SOFTECH ONE</span>

          <h1>
            Problem-Solving in the
            <span> Tech-Space.</span>
          </h1>

          <p>
            Connect. Secure. Digitise. Automate. Grow. SofTech helps businesses
            build and manage the technology they need to operate and grow.
          </p>

          <div className="hero-actions">
            <Link href="/audit" className="primary-button">
              Start Technology Audit
            </Link>

            <a href="#services" className="secondary-button">
              Explore Services
            </a>
          </div>
        </div>
      </section>

      <section id="services" className="section">
        <div className="section-heading">
          <span className="eyebrow">OUR SERVICES</span>
          <h2>Technology built around your business.</h2>
          <p>
            From digital systems and cybersecurity to cloud, AI and
            connectivity, SofTech brings the technology together.
          </p>
        </div>

        <div className="service-grid">
          {services.map((service) => (
            <article key={service.title} className="service-card">
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="business-box" className="business-box">
        <div>
          <span className="eyebrow">SOFTECH BUSINESS-IN-A-BOX</span>

          <h2>Your outsourced technology department.</h2>

          <p>
            Internet, website, business email, cloud, cybersecurity, backup,
            networking, AI, digital integration, IT support and analytics.
          </p>

          <Link href="/audit" className="primary-button">
            Assess My Business
          </Link>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-brand">
          <img src="/softech-logo.png" alt="SofTech" />
          <p>Problem-Solving in the Tech-Space.</p>
        </div>

        <p>© 2026 SofTech. All rights reserved.</p>
      </footer>
    </main>
  );
}