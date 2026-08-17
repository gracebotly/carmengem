import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Wishlist — Carmen Rose",
  robots: { index: false, follow: false },
};

const ITEMS = [
  "Placeholder item one",
  "Placeholder item two",
  "Placeholder item three",
];

export default function Wishlist() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-32 md:py-56">
      <p className="eyebrow mb-5 text-sand">For the generous</p>
      <h1 className="font-display text-[42px] leading-[1.08] md:text-[68px]">
        Wishlist
      </h1>
      <p className="mt-7 max-w-lg text-base font-light leading-[1.75] text-stone">
        Placeholder copy. Replace with a note in Carmen&rsquo;s voice.
      </p>
      <ul className="mt-16 max-w-lg border-t border-line">
        {ITEMS.map((item) => (
          <li
            key={item}
            className="border-b border-line py-6 text-base font-light text-stone"
          >
            {item}
          </li>
        ))}
      </ul>
      <Link
        href="/"
        className="eyebrow mt-16 inline-block border-b border-rose pb-1.5 text-ink transition-colors hover:text-rose"
      >
        Back to site
      </Link>
    </main>
  );
}
