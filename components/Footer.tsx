import Link from "next/link";
import { BUSINESS } from "@/lib/site";

/** Strips formatting for the tel: href while the visible text stays readable. */
function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export default function Footer() {
  return (
    <footer className="border-t border-line bg-shell">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-10 py-16 sm:flex-row sm:items-end sm:justify-between">
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

        <div className="flex flex-col items-center border-t border-line py-10 text-center sm:py-12">
          <p className="eyebrow text-sand">Independently Reviewed</p>
          <a
            href="https://www.theeroticreview.com/site_listing/refer.asp?c2l0ZV9pZD0xMDE3NDY2ODAy"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View Carmen Gem on The Erotic Review"
            className="mt-6 inline-flex h-[60px] max-w-full opacity-80 transition-opacity hover:opacity-100"
          >
            {/* Serve the official remote GIF directly so it remains untouched. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.theeroticreview.com/site_listing/reviewed_seal.gif"
              alt="The Erotic Review"
              className="h-full w-auto max-w-full object-contain"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
