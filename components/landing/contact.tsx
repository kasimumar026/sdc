import Link from "next/link";
import { Mail, MapPin, MessageSquare, Phone, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACT, FAQS } from "@/lib/landing/content";

const CHANNELS = [
  {
    icon: Phone,
    label: "Call us",
    value: CONTACT.phoneDisplay,
    href: `tel:${CONTACT.phone}`,
    note: "Mon – Sat, 8am – 8pm",
  },
  {
    icon: MessageSquare,
    label: "WhatsApp",
    value: CONTACT.phoneDisplay,
    href: `https://wa.me/${CONTACT.whatsapp}`,
    note: "Fastest way to reach us",
  },
  {
    icon: Mail,
    label: "Email",
    value: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
    note: "Replies within 24 hours",
  },
  {
    icon: MapPin,
    label: "Office",
    value: CONTACT.address,
    href: "#home",
    note: "Visits by appointment",
  },
];

export function Contact() {
  return (
    <section id="contact" className="bg-background py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Contact
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              We&apos;re here to help
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Whether you need help choosing a plan, tracking a transaction or
              setting up bulk gifting for your team, our support desk is ready.
              {CONTACT.responseTime}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {CHANNELS.map(({ icon: Icon, label, value, href, note }) => {
                const isExternal = href.startsWith("http") || href.startsWith("mailto");
                const inner = (
                  <>
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                      <Icon className="size-5" />
                    </span>
                    <span className="mt-4 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {label}
                    </span>
                    <span className="mt-1 block font-semibold text-foreground">
                      {value}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {note}
                    </span>
                  </>
                );

                return href === "#home" ? (
                  <div
                    key={label}
                    className="rounded-2xl border border-border bg-card p-5"
                  >
                    {inner}
                  </div>
                ) : (
                  <a
                    key={label}
                    href={href}
                    {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                  >
                    {inner}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-foreground">
              Frequently asked questions
            </h3>

            <div className="mt-6 space-y-3">
              {FAQS.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-2xl border border-border bg-background p-5 transition-colors open:border-primary/30"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground">
                    {faq.q}
                    <span className="text-primary transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>

            <div className="mt-8 rounded-2xl bg-gradient-to-br from-primary-900 to-primary-700 p-6">
              <div className="flex items-center gap-2 text-primary-200">
                <Clock className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Support hours
                </span>
              </div>
              <p className="mt-2 text-lg font-semibold text-primary-50">
                {CONTACT.hours}
              </p>
              <Button
                asChild
                className="mt-5 bg-primary-50 text-primary-900 hover:bg-primary-100"
              >
                <Link href="/">
                  Create your account
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
