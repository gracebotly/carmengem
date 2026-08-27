import Link from "next/link";
import { BUSINESS } from "@/lib/site";

/** Strips formatting for the tel: href while the visible text stays readable. */
function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export default function Footer() {
  return (
    <footer className="border-t border-line bg-shell">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-body text-lg tracking-[0.08em] text-ink">
            {BUSINESS.name}
          </p>
          {(BUSINESS.phone || BUSINESS.email) && (
            <div className="mt-4 flex flex-col gap-2 text-base font-light text-stone">
              {BUSINESS.phone && (
                <a
                  href={telHref(BUSINESS.phone)}
                  className="w-fit transition-colors hover:text-rose"
                >
                  {BUSINESS.phone}
                </a>
              )}
              {BUSINESS.email && (
                <a
                  href={`mailto:${BUSINESS.email}`}
                  className="w-fit transition-colors hover:text-rose"
                >
                  {BUSINESS.email}
                </a>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <Link
            href="/privacy"
            className="eyebrow text-sand transition-colors hover:text-ink"
          >
            Privacy
          </Link>
          <p className="eyebrow text-sand">
            © {new Date().getFullYear()} {BUSINESS.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
