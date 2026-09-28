import { FEATURES, STEPS } from "@/lib/landing/content";

const MARK = ["01", "02", "03", "04", "05", "06"];

export function About() {
  return (
    <section id="about" className="bg-background py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              About us
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Data subscriptions without the stress
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              SDC Smart Data started with a simple frustration: buying data in
              Nigeria meant queueing, sharing out SIM data, or trusting a stranger
              with your airtime. We built the platform we wished existed — one
              place where you can fund a wallet, compare every network&apos;s plans
              side by side, and see exactly what happened to every naira.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Today we serve individuals, small businesses and enterprise agents who
              need dependable bulk provisioning. The same dashboard that lets you buy
              a 1GB bundle on your personal line lets an operations manager renew
              forty staff lines before lunch.
            </p>

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {STEPS.map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <dt className="text-xs font-bold tracking-widest text-primary">
                    STEP {item.step}
                  </dt>
                  <dd>
                    <p className="mt-2 font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {item.body}
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature, index) => (
              <article
                key={feature.title}
                className={`rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md ${
                  index % 3 === 0 ? "sm:col-span-2" : ""
                }`}
              >
                <span className="text-xs font-bold tracking-widest text-muted-foreground/70">
                  {MARK[index]}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
