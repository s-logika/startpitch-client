import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t bg-[#0d1128]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row sm:px-6">
        <Link href="#home" className="flex items-center gap-2 font-semibold">
          <Image
            src="/logofavicon.png"
            alt="StartPitch"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-lg text-white">
            <span>Start</span>
            <span className="text-brand-green">Pitch</span>
          </span>
        </Link>
        <p className="text-sm text-white/60">
          &copy; {new Date().getFullYear()} StartPitch. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm text-white/60">
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#about" className="hover:text-white">
            About
          </a>
          <a href="#contact" className="hover:text-white">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
