"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { SECTIONS } from "@/lib/sections";
import { useActiveSection } from "@/lib/useActiveSection";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const active = useActiveSection();
  const dark = active === "portfolio" && !open;

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-500 ${
        dark ? "bg-pitch/85 border-shell/15" : "bg-shell/85 border-line/60"
      }`}
    >
      <nav className="relative z-10 mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:h-[72px]">
        <a
          href="#about"
          className={`font-body text-lg tracking-[0.08em] transition-colors duration-500 ${
            dark ? "text-shell" : "text-ink"
          }`}
        >
          Carmen Gem
        </a>

        <ul className="hidden gap-10 md:flex">
          {SECTIONS.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={`eyebrow transition-colors duration-300 ${
                  active === id
                    ? "text-rose"
                    : dark
                      ? "text-sand hover:text-shell"
                      : "text-sand hover:text-ink"
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
          className={`transition-colors duration-500 md:hidden ${
            dark ? "text-shell" : "text-ink"
          }`}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div
          id="mobile-navigation"
          className="fixed inset-0 bg-shell md:hidden"
        >
          <ul className="flex h-full flex-col items-center justify-center gap-9 px-6 pt-16">
            {SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  className={`font-display text-3xl [font-size:32px] transition-colors duration-300 ${
                    active === id ? "text-rose" : "text-ink hover:text-rose"
                  }`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
