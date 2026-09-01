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

      <Section id="investment" title="Investment" wide>
        <InvestmentList />
      </Section>

      <Section id="contact" title="Contact">
        <ContactForm />
      </Section>
    </main>
  );
}
