import Link from "next/link";
import Image from "next/image";

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
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-8 overflow-hidden bg-muted/30 px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-blue/10 via-transparent to-transparent"
      />
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <Image
          src="/logofavicon.png"
          alt="StartPitch"
          width={36}
          height={36}
          className="h-9 w-9"
          priority
        />
        <span className="text-lg tracking-tight">
          <span className="text-brand-blue">Start</span>
          <span className="text-brand-green">Pitch</span>
        </span>
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
