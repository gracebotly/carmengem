import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Carmen Gem collects through the inquiry form, why, and how to have it deleted.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-32 md:py-56">
      <p className="eyebrow mb-5 text-sand">Your information</p>
      <h1 className="font-display text-[42px] leading-[1.08] md:text-[68px]">
        Privacy
      </h1>

      <div className="mt-12 max-w-lg space-y-6 text-base font-light leading-[1.75] text-stone">
        <p>
          This site is a small business page. There is no advertising, no
          tracking pixel, and no analytics service running on it. It sets no
          cookies.
        </p>

        <h2 className="pt-6 font-display text-[26px] leading-[1.25] text-ink">
          What the inquiry form collects
        </h2>
        <p>
          When you send an inquiry, I receive your first and last name, email
          address, phone number if you give one, the session length and location
          you chose, when you would like to come in, and anything you write in
          the note field.
        </p>
        <p>
          One thing worth saying plainly: the form saves your name, email and
          phone shortly after you type a valid email address, before you press
          Send. It is there so a half-finished inquiry is not lost. If you would
          rather it were not kept, write to me and I will delete it.
        </p>

        <h2 className="pt-6 font-display text-[26px] leading-[1.25] text-ink">
          Where it goes
        </h2>
        <p>
          Inquiries are stored in a private database (Supabase) that only I can
          read, and a copy is emailed to me through Resend so I see it quickly.
          Both companies process the data on my behalf and nothing more.
        </p>
        <p>
          I do not sell your information, share it with advertisers, or add you
          to a mailing list. I use it to answer you and to keep track of your
          sessions.
        </p>

        <h2 className="pt-6 font-display text-[26px] leading-[1.25] text-ink">
          Removing your information
        </h2>
        <p>
          {BUSINESS.email
            ? `Email me at ${BUSINESS.email} and I will delete everything I hold about you.`
            : "Write to me through the inquiry form and I will delete everything I hold about you."}{" "}
          You are welcome to ask what I have on file at any time.
        </p>
      </div>

      <Link
        href="/"
        className="eyebrow mt-16 inline-block border-b border-rose pb-1.5 text-ink transition-colors hover:text-rose"
      >
        Back to site
      </Link>
    </main>
  );
}
