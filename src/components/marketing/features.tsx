import {
  FileSearch,
  HeartHandshake,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FEATURES = [
  {
    icon: FileSearch,
    title: "Pitch versioning & scoring",
    description:
      "Submit your pitch, iterate with new versions, and track your score history over time.",
  },
  {
    icon: Sparkles,
    title: "AI-assisted evaluation",
    description:
      "Get structured feedback across market, team, traction, financials, defensibility, and clarity.",
  },
  {
    icon: Target,
    title: "Investor matching",
    description:
      "Set your thesis or startup profile and get scored matches based on sector, stage, geography, and check size.",
  },
  {
    icon: HeartHandshake,
    title: "Mentor bookings",
    description:
      "Browse mentors, book sessions, and leave feedback after every call.",
  },
  {
    icon: ShieldCheck,
    title: "Secure deal rooms",
    description:
      "Share documents behind an NDA gate, with a full access log for every download.",
  },
  {
    icon: MessagesSquare,
    title: "Messaging & notifications",
    description:
      "Keep every conversation with investors and mentors in one place, with reputation and badges built in.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything you need to raise, mentor, or invest.
        </h2>
        <p className="mt-4 text-muted-foreground">
          One workspace for the entire fundraising lifecycle — from first draft to
          signed term sheet.
        </p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="border-muted-foreground/10">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
