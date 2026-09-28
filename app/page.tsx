import type { Metadata } from "next";
import { dataplans } from "@/app.js";
import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { About } from "@/components/landing/about";
import { Pricing } from "@/components/landing/pricing";
import { Contact } from "@/components/landing/contact";
import { SiteFooter } from "@/components/landing/site-footer";
import {
  type DataPlan,
  getProviders,
  sortPlans,
} from "@/lib/landing/plans";
import { CONTACT } from "@/lib/landing/content";

export const metadata: Metadata = {
  title: `${CONTACT.brand} — Data & Airtime Delivered in Seconds`,
  description:
    "Buy data and airtime across MTN, Airtel, Glo and 9mobile. Fund one wallet, subscribe instantly and track every transaction from a single dashboard.",
};

export default function HomePage() {
  const plans = sortPlans(
    dataplans
      .filter((plan) => plan.publish)
      .map(
        (plan) =>
          ({
            _id: plan._id,
            name: plan.name,
            amount: plan.amount,
            provider: plan.provider,
            category: plan.category,
            validity: plan.validity,
            externalId: plan.externalId,
          }) as DataPlan
      )
  );

  const providers = getProviders(plans);
  const categories = Array.from(new Set(plans.map((p) => p.category))).sort();

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <About />
        <Pricing plans={plans} providers={providers} categories={categories} />
        <Contact />
      </main>
      <SiteFooter />
    </div>
  );
}
