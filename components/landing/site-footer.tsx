import Link from "next/link";
import { Mail, MapPin, Phone, Zap } from "lucide-react";
import { CONTACT, FOOTER_LINKS, NAV_LINKS } from "@/lib/landing/content";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary-950 text-primary-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="#home" className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary-50 text-primary-900">
                <Zap className="size-5" />
              </span>
              <span className="text-lg font-bold tracking-tight text-primary-50">
                SDC Smart Data
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-200/80">
              {CONTACT.tagline} One wallet for data, airtime and bills across every
              major network in Nigeria.
            </p>

            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-primary-400" />
                <a
                  href={`tel:${CONTACT.phone}`}
                  className="transition-colors hover:text-primary-50"
                >
                  {CONTACT.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary-400" />
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="transition-colors hover:text-primary-50"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary-400" />
                <span className="text-primary-200/80">{CONTACT.address}</span>
              </li>
            </ul>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-5">
            {FOOTER_LINKS.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-primary-50">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-primary-200/80 transition-colors hover:text-primary-50"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-primary-50">Get the app</h3>
            <p className="mt-4 text-sm text-primary-200/80">
              Manage your subscriptions on the move with the SDC mobile app.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="#home"
                className="rounded-lg border border-primary-400/30 bg-primary-900/60 px-3.5 py-2 text-xs font-semibold text-primary-50 transition-colors hover:bg-primary-800"
              >
                Google Play
              </a>
              <a
                href="#home"
                className="rounded-lg border border-primary-400/30 bg-primary-900/60 px-3.5 py-2 text-xs font-semibold text-primary-50 transition-colors hover:bg-primary-800"
              >
                App Store
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              {CONTACT.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary-200/80 transition-colors hover:text-primary-50"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-primary-400/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-primary-200/80 transition-colors hover:text-primary-50"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <p className="text-sm text-primary-200/70">
            © {year} SDC Smart Data. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
