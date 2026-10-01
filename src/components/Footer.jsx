export default function Footer() {
  return (
    <footer id="contact" className="bg-slate-950 py-12 text-white">
      <div className="mx-auto max-w-7xl px-6">

        <div className="grid gap-10 md:grid-cols-3">

          <div>
            <h2 className="text-2xl font-bold">
              SofTech
            </h2>

            <p className="mt-4 max-w-sm leading-7 text-slate-400">
              Connect. Secure. Digitise. Automate. Grow.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">
              Solutions
            </h3>

            <div className="mt-4 space-y-2 text-sm text-slate-400">
              <p>SofTech Digital</p>
              <p>SofTech Cyber</p>
              <p>SofTech Cloud</p>
              <p>SofTech AI</p>
              <p>SofTech Connect</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">
              Contact
            </h3>

            <p className="mt-4 text-sm text-slate-400">
              Technology solutions for businesses.
            </p>

            <a
              href="mailto:info@softech.co.zw"
              className="mt-3 inline-block text-blue-400 hover:text-blue-300"
            >
              Contact SofTech →
            </a>
          </div>

        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-500">
          © {new Date().getFullYear()} SofTech. All rights reserved.
        </div>

      </div>
    </footer>
  );
}