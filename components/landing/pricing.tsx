"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type DataPlan,
  formatNaira,
  getCategoryMeta,
  getProviderMeta,
  parseValidity,
} from "@/lib/landing/plans";

type Props = {
  plans: DataPlan[];
  providers: string[];
  categories: string[];
};

export function Pricing({ plans, providers, categories }: Props) {
  const [provider, setProvider] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  const visible = useMemo(
    () =>
      plans.filter(
        (plan) =>
          (provider === "all" || plan.provider.toLowerCase() === provider) &&
          (category === "all" || plan.category === category)
      ),
    [plans, provider, category]
  );

  const cheapest = useMemo(
    () =>
      visible.length > 0
        ? Math.min(...visible.map((p) => p.amount))
        : 0,
    [visible]
  );

  return (
    <section
      id="pricing"
      className="border-y border-border bg-muted/40 py-20 lg:py-28"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Pricing
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Data plans for every budget
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Every bundle below is live and purchasable right now. Filter by network
            or plan type, then subscribe straight from your dashboard.
          </p>
        </div>

        <div className="mt-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip
              label="All networks"
              active={provider === "all"}
              onClick={() => setProvider("all")}
            />
            {providers.map((name) => {
              const meta = getProviderMeta(name);
              return (
                <FilterChip
                  key={name}
                  label={meta.label}
                  active={provider === name}
                  onClick={() => setProvider(name)}
                  dot={meta.dot}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterChip
              label="All types"
              active={category === "all"}
              onClick={() => setCategory("all")}
            />
            {categories.map((name) => {
              const meta = getCategoryMeta(name);
              return (
                <FilterChip
                  key={name}
                  label={meta.label}
                  active={category === name}
                  onClick={() => setCategory(name)}
                />
              );
            })}
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">{visible.length}</span>{" "}
          {visible.length === 1 ? "plan" : "plans"}
          {visible.length > 0 && (
            <>
              {" "}
              · cheapest{" "}
              <span className="font-semibold text-foreground">
                {formatNaira(cheapest)}
              </span>
            </>
          )}
        </p>

        {visible.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No plans match that combination yet. Try another network or type.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((plan) => (
              <PlanCard key={plan._id} plan={plan} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  dot,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  dot?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {dot && <span className={`size-2 rounded-full ${dot}`} />}
      {label}
    </button>
  );
}

function PlanCard({ plan }: { plan: DataPlan }) {
  const provider = getProviderMeta(plan.provider);
  const category = getCategoryMeta(plan.category);
  const validity = parseValidity(plan.validity);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${provider.badgeBg} ${provider.badgeText}`}
        >
          {provider.label}
        </span>
        <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
          {category.label}
        </span>
      </div>

      <h3 className="mt-5 text-2xl font-bold text-foreground">{plan.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{validity.label}</p>

      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-primary">
          {formatNaira(plan.amount)}
        </span>
        <span className="text-sm text-muted-foreground">/ bundle</span>
      </div>

      {validity.note && (
        <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
          <Sparkles className="size-3" />
          {validity.note}
        </p>
      )}

      <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <Check className="size-4 text-primary" />
          Instant delivery to your line
        </li>
        <li className="flex items-center gap-2">
          <Check className="size-4 text-primary" />
          Valid for {validity.label.toLowerCase()}
        </li>
      </ul>

      <Button asChild className="mt-6 w-full">
        <Link href={`/?plan=${plan._id}`}>Subscribe now</Link>
      </Button>
    </article>
  );
}
