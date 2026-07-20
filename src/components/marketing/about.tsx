import Image from "next/image";
import { Users2, Zap, Globe2 } from "lucide-react";

const STATS = [
  {
    icon: Users2,
    label: "Built for",
    value: "Founders, investors & mentors",
    color: "bg-brand-blue/10 text-brand-blue",
  },
  {
    icon: Zap,
    label: "Powered by",
    value: "AI-assisted evaluation",
    color: "bg-brand-green/10 text-brand-green",
  },
  {
    icon: Globe2,
    label: "Works",
    value: "Wherever your team is",
    color: "bg-brand-sky/10 text-brand-sky",
  },
] as const;

export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <Image
            src="/logofavicon.png"
            alt=""
            width={48}
            height={48}
            className="mb-4 h-12 w-12"
          />
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-orange">
            Business Ideas &middot; Innovate &middot; Grow
          </span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            About StartPitch
          </h2>
          <p className="mt-4 text-muted-foreground">
            StartPitch is a platform that connects startup founders with investors
            and mentors. We handle everything around the pitch itself — structured
            feedback, investor matching, mentor bookings, deal rooms, and
            reputation — so founders can spend their time building and investors can
            spend their time evaluating, not chasing paperwork.
          </p>
          <p className="mt-4 text-muted-foreground">
            Whether you&apos;re raising your first round, deploying capital, or
            mentoring the next generation of founders, StartPitch gives you one
            workspace to do it in.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-xl border bg-card p-5"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </div>
                <div className="font-medium">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
