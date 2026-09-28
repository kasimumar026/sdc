import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Signal,
  ShieldCheck,
  Smartphone,
  Wallet,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACT, STATS } from "@/lib/landing/content";

const HIGHLIGHTS = [
  { icon: Signal, label: "All 4 networks" },
  { icon: Zap, label: "Instant delivery" },
  { icon: Wallet, label: "One wallet" },
  { icon: ShieldCheck, label: "Secure payments" },
];

export function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-b from-primary-950 via-primary-900 to-primary-800 pt-28 pb-20 sm:pt-32 lg:pt-40 lg:pb-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-primary-600/30 blur-3xl animate-bubble-slow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-0 size-80 rounded-full bg-primary-400/20 blur-3xl animate-bubble-fast"
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-400/30 bg-primary-400/10 px-3.5 py-1.5 text-xs font-semibold text-primary-100">
            <span className="size-1.5 rounded-full bg-primary-300" />
            Now serving MTN · Airtel · Glo · 9mobile
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-primary-50 sm:text-5xl lg:text-6xl">
            Buy data and airtime.
            <br />
            <span className="text-primary-300">Delivered in seconds.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-primary-100/80 sm:text-lg">
            {CONTACT.tagline} Fund one wallet, subscribe on any network, and track
            every transaction from a single dashboard built for you and your team.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild className="h-12 rounded-xl text-base">
              <Link href="/auth/login">
                Get started
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 rounded-xl border-primary-300/40 bg-transparent text-base text-primary-50 hover:bg-primary-400/10 hover:text-primary-50"
            >
              <a href="#pricing">View data plans</a>
            </Button>
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:flex-wrap sm:gap-x-8">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 text-sm text-primary-100/90"
              >
                <Icon className="size-4 text-primary-300" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="rounded-3xl border border-primary-300/20 bg-primary-900/60 p-5 shadow-2xl backdrop-blur-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-primary-200/70">
                  Active plan
                </p>
                <p className="mt-1 text-lg font-semibold text-primary-50">
                  Monthly Data Bundle
                </p>
              </div>
              <span className="rounded-full bg-primary-400/20 px-3 py-1 text-xs font-semibold text-primary-100">
                Active
              </span>
            </div>

            <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-primary-700">
              <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-primary-300 to-primary-500" />
            </div>
            <p className="mt-2 text-xs text-primary-200/70">7.2 GB of 10 GB used</p>

            <dl className="mt-6 grid grid-cols-2 gap-4">
              {[
                { label: "Network", value: "MTN" },
                { label: "Line", value: "0803 451 2098" },
                { label: "Renews", value: "28 Sep" },
                { label: "Price", value: "₦3,500" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl bg-primary-800/60 px-4 py-3"
                >
                  <dt className="text-xs text-primary-200/70">{item.label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-primary-50">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            <ul className="mt-6 space-y-2.5">
              {["Data delivery confirmed", "Payment receipt generated", "Auto-renew turned on"].map(
                (item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 rounded-xl bg-primary-800/40 px-3.5 py-2.5 text-sm text-primary-100/90"
                  >
                    <CheckCircle2 className="size-4 shrink-0 text-primary-300" />
                    {item}
                  </li>
                )
              )}
            </ul>

            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-primary-400/10 px-4 py-3">
              <Smartphone className="size-5 shrink-0 text-primary-300" />
              <p className="text-sm text-primary-100/90">
                Delivered to your line in under 10 seconds.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:mt-20 lg:px-8">
        <dl className="grid grid-cols-2 gap-4 rounded-3xl border border-primary-300/15 bg-primary-900/40 p-6 backdrop-blur-sm lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center lg:text-left">
              <dt className="text-3xl font-bold text-primary-50">{stat.value}</dt>
              <dd className="mt-1 text-sm text-primary-200/80">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
