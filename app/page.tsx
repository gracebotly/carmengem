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
