"use client";

import { useState, type FormEvent } from "react";
import { Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fadeUp, viewportOnce } from "@/lib/motion";

export function Contact() {
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const form = event.currentTarget;
    setTimeout(() => {
      toast.success("Thanks for reaching out!", {
        description: "We'll get back to you shortly.",
      });
      form.reset();
      setSubmitting(false);
    }, 500);
  }

  return (
    <section id="contact" className="scroll-mt-20 border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Get in touch
          </h2>
          <p className="mt-4 text-muted-foreground">
            Questions about StartPitch? Send us a message and we&apos;ll get back to
            you.
          </p>
          <div className="mt-8 space-y-4">
            <a
              href="mailto:hello@startpitch.dev"
              className="flex items-center gap-3 text-sm transition-transform duration-200 hover:translate-x-1"
            >
              <Mail className="h-4 w-4 text-brand-blue" />
              hello@startpitch.dev
            </a>
            <div className="flex items-center gap-3 text-sm transition-transform duration-200 hover:translate-x-1">
              <MapPin className="h-4 w-4 text-brand-green" />
              Remote-first, worldwide
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border bg-card p-6 transition-colors duration-300 hover:border-brand-green/30"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name</Label>
              <Input id="contact-name" name="name" placeholder="Ada Lovelace" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                placeholder="you@company.com"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-message">Message</Label>
            <Textarea
              id="contact-message"
              name="message"
              placeholder="Tell us a bit about what you're looking for..."
              rows={4}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Sending..." : "Send message"}
          </Button>
        </motion.form>
      </div>
    </section>
  );
}
