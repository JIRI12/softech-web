"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* SofTech Logo */}
        <Link
          href="/"
          className="flex items-center"
          aria-label="SofTech Home"
        >
          <Image
            src="/softech-logo.png"
            alt="SofTech"
            width={150}
            height={55}
            priority
            className="h-auto w-[150px] object-contain"
          />
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/#services"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Services
          </Link>

          <Link
            href="/#business-box"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Business-in-a-Box
          </Link>

          <Link
            href="/audit"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Technology Audit
          </Link>

          <Link
            href="/hq"
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            SofTech HQ
          </Link>
        </nav>

        {/* Mobile button */}
        <Link
          href="/audit"
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white md:hidden"
        >
          Start Audit
        </Link>
      </div>
    </header>
  );
}