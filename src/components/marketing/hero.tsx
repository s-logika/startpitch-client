import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden border-b">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-blue/10 via-transparent to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-brand-green/10 blur-3xl"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:py-32">
        <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <Badge
            variant="secondary"
            className="gap-1.5 rounded-full border border-brand-blue/15 bg-brand-blue/5 px-3 py-1 text-brand-blue"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI-assisted pitch evaluation
          </Badge>
          <h1 className="max-w-xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Where founders meet{" "}
            <span className="text-brand-green">capital</span>.
          </h1>
          <p className="max-w-xl text-balance text-lg text-muted-foreground">
            StartPitch connects startup founders with investors and mentors — submit
            your pitch, get AI-assisted feedback, match with the right investors, and
            run diligence in secure deal rooms.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/signup">
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            No credit card required &middot; Founders, investors &amp; mentors welcome
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-brand-sky/15 via-transparent to-transparent blur-2xl"
          />
          <Image
            src="/posternobg.png"
            alt="StartPitch — Evaluate, Connect, Invest, Mentor, Secure"
            width={615}
            height={624}
            className="mx-auto w-full max-w-sm drop-shadow-xl"
            priority
          />
        </div>
      </div>
    </section>
  );
}
