import Link from "next/link";
import { Rocket } from "lucide-react";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-muted/30 px-4 py-12">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Rocket className="h-4 w-4" />
        </span>
        <span className="text-lg tracking-tight">StartPitch</span>
      </Link>

      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>

      {footer}
    </div>
  );
}
