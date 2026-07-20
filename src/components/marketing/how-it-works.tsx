const STEPS = [
  {
    step: "01",
    title: "Create your account",
    description:
      "Sign up as a founder, investor, or mentor. Set up your profile and startup or thesis details.",
    color: "text-brand-blue/25",
  },
  {
    step: "02",
    title: "Submit & evaluate",
    description:
      "Founders submit a pitch and queue an AI evaluation to get a scorecard across six dimensions.",
    color: "text-brand-green/25",
  },
  {
    step: "03",
    title: "Match & connect",
    description:
      "Investors recompute matches against every startup and reach out to the best-fit founders.",
    color: "text-brand-sky/25",
  },
  {
    step: "04",
    title: "Close in the deal room",
    description:
      "Share documents behind an NDA, message directly, and track every access in one audit log.",
    color: "text-brand-orange/25",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            How StartPitch works
          </h2>
          <p className="mt-4 text-muted-foreground">
            Four steps from first draft to funded.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item) => (
            <div key={item.step} className="relative">
              <span className={`text-3xl font-bold ${item.color}`}>{item.step}</span>
              <h3 className="mt-2 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
