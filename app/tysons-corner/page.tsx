import type { Metadata } from "next";
import Link from "next/link";
import {
  BUSINESS,
  OG_IMAGE,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_URL,
} from "@/lib/site";

const TITLE = "Carmen Gem | Luxury Companion in Tysons Corner, VA";
const DESCRIPTION =
  "Meet Carmen Gem, a high-end luxury companion serving Tysons Corner, Virginia. Enjoy discreet, personalized companionship and warm, thoughtful attention by appointment.";
const PAGE_URL = `${SITE_URL}/tysons-corner`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    siteName: BUSINESS.name,
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    locale: "en_US",
    images: [
      {
        url: OG_IMAGE,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: BUSINESS.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function TysonsCorner() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-32 md:py-56">
      <h1 className="font-display text-[42px] leading-[1.08] md:text-[68px]">
        Luxury Companionship in Tysons Corner, Virginia
      </h1>

      <section
        aria-labelledby="tysons-intro"
        className="mt-12 max-w-lg text-base font-light leading-[1.75] text-stone"
      >
        <h2
          id="tysons-intro"
          className="font-display text-[26px] leading-[1.25] text-ink"
        >
          A Little Time to Yourself
        </h2>
        <div className="mt-6 space-y-6">
          <p>
            Some days ask more of a gentleman than others. When you&apos;re ready
            to leave those responsibilities behind for a little while, I would
            love to make our time together feel like a welcome change of pace.
          </p>
          <p>
            I offer private appointments in Tysons Corner by arrangement,
            bringing the same feminine warmth, affectionate attention, and
            unhurried presence that define my experience.
          </p>
          <p>
            I appreciate the finer things in life, but I believe real luxury is
            having the freedom to slow down, enjoy the moment, and feel
            genuinely cared for. My approach is personal and attentive, with
            your comfort and discretion always in mind.
          </p>
          <p>
            If you&apos;re in Tysons Corner or nearby McLean, you&apos;re welcome
            to introduce yourself through my{" "}
            <Link
              href="/#contact"
              className="border-b border-rose transition-colors hover:text-rose"
            >
              contact form
            </Link>
            . I look forward to hearing from you.
          </p>
        </div>
      </section>
    </main>
  );
}
