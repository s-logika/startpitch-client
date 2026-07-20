"use client";

import {
  FileSearch,
  HeartHandshake,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { motion } from "motion/react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

const FEATURES = [
  {
    icon: FileSearch,
    title: "Pitch versioning & scoring",
    description:
      "Submit your pitch, iterate with new versions, and track your score history over time.",
    color: "blue",
  },
  {
    icon: Sparkles,
    title: "AI-assisted evaluation",
    description:
      "Get structured feedback across market, team, traction, financials, defensibility, and clarity.",
    color: "green",
  },
  {
    icon: Target,
    title: "Investor matching",
    description:
      "Set your thesis or startup profile and get scored matches based on sector, stage, geography, and check size.",
    color: "sky",
  },
  {
    icon: HeartHandshake,
    title: "Mentor bookings",
    description:
      "Browse mentors, book sessions, and leave feedback after every call.",
    color: "orange",
  },
  {
    icon: ShieldCheck,
    title: "Secure deal rooms",
    description:
      "Share documents behind an NDA gate, with a full access log for every download.",
    color: "blue",
  },
  {
    icon: MessagesSquare,
    title: "Messaging & notifications",
    description:
      "Keep every conversation with investors and mentors in one place, with reputation and badges built in.",
    color: "green",
  },
] as const;

const ICON_STYLES: Record<(typeof FEATURES)[number]["color"], string> = {
  blue: "bg-brand-blue/10 text-brand-blue",
  green: "bg-brand-green/10 text-brand-green",
  sky: "bg-brand-sky/10 text-brand-sky",
  orange: "bg-brand-orange/10 text-brand-orange",
};

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={fadeUp}
        className="mx-auto max-w-2xl text-center"
      >
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything you need to raise, mentor, or invest.
        </h2>
        <p className="mt-4 text-muted-foreground">
          One workspace for the entire fundraising lifecycle — from first draft to
          signed term sheet.
        </p>
      </motion.div>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={staggerContainer(0.08)}
        className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map((feature) => (
          <motion.div key={feature.title} variants={fadeUp} whileHover={{ y: -6 }}>
            <Card className="group h-full border-muted-foreground/10 transition-all duration-300 hover:border-brand-green/40 hover:shadow-lg hover:shadow-brand-green/10">
              <CardHeader>
                <div
                  className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 ${ICON_STYLES[feature.color]}`}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
