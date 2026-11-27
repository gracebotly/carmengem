import Section from "@/components/Section";
import PortfolioGrid from "@/components/PortfolioGrid";
import InvestmentList from "@/components/InvestmentList";
import FlyMeToYou from "@/components/FlyMeToYou";
import ContactForm from "@/components/ContactForm";
import AboutIntro from "@/components/AboutIntro";
import { SITE_URL } from "@/lib/site";

export default function Home() {
  return (
    <main className="flex-1">
      {/* React hoists this into <head>, preserving the root URL's trailing slash. */}
      <link rel="canonical" href={`${SITE_URL}/`} />
      <h1 className="sr-only">
        Carmen Gem — Washington DC Luxury Escort &amp; High-End Companion
      </h1>

      <aside
        aria-label="Tour announcement"
        className="border-b border-line/60 bg-rose/10"
      >
        <p className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-1 px-6 py-3 text-center sm:flex-row sm:items-baseline sm:gap-4">
          <span className="font-display text-2xl leading-tight text-ink">
            Dubai Tour
          </span>
          <span className="text-sm text-stone">
            <time dateTime="2026-12-03">December 3</time>–<time dateTime="2026-12-10">10, 2026</time>
          </span>
        </p>
      </aside>

      <Section
        id="about"
        title="About"
        wide
        compactDesktopTop
        compactTitleGap
      >
        <AboutIntro />
      </Section>

      <Section id="portfolio" title="Portfolio" tone="dark" wide>
        <PortfolioGrid />
      </Section>

      <Section id="investment" title="Investment" wide>
        <InvestmentList />
        <FlyMeToYou />
      </Section>

      <Section id="contact" title="Contact">
        <ContactForm />
      </Section>
    </main>
  );
}
