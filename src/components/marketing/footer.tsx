"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";

import { fadeUp, viewportOnce } from "@/lib/motion";

export function Footer() {
  return (
    <footer className="border-t bg-[#0d1128]">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={fadeUp}
        className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row sm:px-6"
      >
        <Link href="#home" className="flex items-center gap-2 font-semibold">
          <motion.span
            whileHover={{ scale: 1.1, rotate: 6 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="inline-flex"
          >
            <Image
              src="/logofavicon.png"
              alt="StartPitch"
              width={32}
              height={32}
              className="h-8 w-8"
            />
          </motion.span>
          <span className="text-lg text-white">
            <span>Start</span>
            <span className="text-brand-green">Pitch</span>
          </span>
        </Link>
        <p className="text-sm text-white/60">
          &copy; {new Date().getFullYear()} StartPitch. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm text-white/60">
          <a href="#features" className="transition-colors hover:text-brand-green">
            Features
          </a>
          <a href="#about" className="transition-colors hover:text-brand-green">
            About
          </a>
          <a href="#contact" className="transition-colors hover:text-brand-green">
            Contact
          </a>
        </div>
      </motion.div>
    </footer>
  );
}
