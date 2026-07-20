import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionConfig } from "motion/react";
import "./globals.css";

import { AuthProvider } from "@/lib/auth/auth-provider";
import { QueryProvider } from "@/lib/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StartPitch — Where founders meet capital",
  description:
    "StartPitch connects startup founders with investors and mentors: AI-assisted pitch evaluation, investor matching, mentor bookings, and secure deal rooms.",
  openGraph: {
    title: "StartPitch — Where founders meet capital",
    description:
      "AI-Powered Startup Pitch Evaluator & Investment Marketplace. Evaluate. Connect. Invest. Mentor. Secure.",
    siteName: "StartPitch",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StartPitch — Where founders meet capital",
    description:
      "AI-Powered Startup Pitch Evaluator & Investment Marketplace. Evaluate. Connect. Invest. Mentor. Secure.",
  },
};

export const viewport = {
  themeColor: "#1e2a8a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <MotionConfig reducedMotion="user">
          <QueryProvider>
            <AuthProvider>
              <TooltipProvider delayDuration={200}>
                {children}
                <Toaster richColors position="top-right" />
              </TooltipProvider>
            </AuthProvider>
          </QueryProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
