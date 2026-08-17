"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  tone?: "light" | "dark";
  children: ReactNode;
};

export default function Section({
  id,
  eyebrow,
  title,
  tone = "light",
  children,
}: SectionProps) {
  const dark = tone === "dark";
  const reduceMotion = useReducedMotion();

  return (
    <section
      id={id}
      className={`section-anchor w-full ${dark ? "bg-pitch" : "bg-shell"}`}
    >
      <motion.div
        className="mx-auto max-w-6xl px-6 py-32 md:py-56"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{
          duration: reduceMotion ? 0 : 0.9,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {eyebrow && <p className="eyebrow mb-5 text-sand">{eyebrow}</p>}
        <h2
          className={`font-display text-[34px] leading-[1.1] md:text-[42px] ${
            dark ? "text-shell" : "text-ink"
          }`}
        >
          {title}
        </h2>
        <div
          className={`mt-10 max-w-lg text-base font-light leading-[1.75] ${
            dark ? "text-sand" : "text-stone"
          }`}
        >
          {children}
        </div>
      </motion.div>
    </section>
  );
}
