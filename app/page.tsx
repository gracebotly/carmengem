import Section from "@/components/Section";
import PortfolioGrid from "@/components/PortfolioGrid";
import InvestmentList from "@/components/InvestmentList";
import ContactForm from "@/components/ContactForm";
import AboutIntro from "@/components/AboutIntro";

export default function Home() {
  return (
    <main className="flex-1">
      {/* HERO */}
      <section
        id="hero"
        className="section-anchor mx-auto flex min-h-[90vh] w-full max-w-6xl flex-col justify-center px-6"
      >
        <p className="eyebrow mb-5 text-sand">Bowie, Maryland</p>
        <h1 className="font-display text-[42px] leading-[1.08] md:text-[68px]">
          An hour that belongs
          <br />
          to your body.
        </h1>
        <p className="mt-7 max-w-lg text-base font-light leading-[1.75] text-stone">
          Therapeutic massage by appointment. Placeholder copy — replace in a
          later slice.
        </p>
        <a
          href="#contact"
          className="eyebrow mt-12 w-fit border-b border-rose pb-1.5 text-ink transition-colors hover:text-rose"
        >
          Start an inquiry
        </a>
      </section>

      <Section id="about" eyebrow="Who I am" title="About" wide>
        <AboutIntro />
      </Section>

      <Section id="portfolio" eyebrow="The work" title="Portfolio" tone="dark" wide>
        <p className="max-w-lg">
          Placeholder. Real photography replaces these tiles in a later slice.
        </p>
        <PortfolioGrid />
      </Section>

      <Section id="investment" eyebrow="Rates" title="Investment" wide>
        <InvestmentList />
      </Section>

      <Section id="contact" eyebrow="Reach out" title="Contact">
        <p className="font-display text-[26px] leading-[1.25] text-ink md:text-[32px]">
          I prefer to be contacted by text.
        </p>
        <p className="mt-5 max-w-lg">
          Tap through the fields below and your message writes itself. Copy it,
          send it, and I can answer you in one reply.
        </p>
        <ContactForm />
      </Section>
    </main>
  );
}
