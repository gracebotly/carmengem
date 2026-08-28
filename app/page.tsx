import Section from "@/components/Section";
import PortfolioGrid from "@/components/PortfolioGrid";
import InvestmentList from "@/components/InvestmentList";
import ContactForm from "@/components/ContactForm";
import AboutIntro from "@/components/AboutIntro";
import { BUSINESS } from "@/lib/site";

export default function Home() {
  return (
    <main className="flex-1">
      <h1 className="sr-only">
        {BUSINESS.name} — {BUSINESS.tagline}
      </h1>

      <Section id="about" eyebrow="Who I am" title="About" wide>
        <AboutIntro />
      </Section>

      <Section id="portfolio" title="Portfolio" tone="dark" wide>
        <PortfolioGrid />
      </Section>

      <Section id="investment" eyebrow="Rates" title="Investment" wide>
        <InvestmentList />
      </Section>

      <Section id="contact" eyebrow="Reach out" title="Contact">
        <p className="font-display text-[26px] leading-[1.25] text-ink md:text-[32px]">
          Tell me what you need.
        </p>
        <p className="mt-5 max-w-lg">
          A few quick fields and I&rsquo;ll get back to you with times that work.
        </p>
        <ContactForm />
      </Section>
    </main>
  );
}
