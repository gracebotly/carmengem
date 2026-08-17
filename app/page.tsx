import Section from "@/components/Section";

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

      <Section id="about" eyebrow="Who I am" title="About">
        <p>Placeholder. Brand story, values, and approach land in Slice 2.</p>
      </Section>

      <Section id="portfolio" eyebrow="The work" title="Portfolio" tone="dark">
        <p>Placeholder. Photo grid and session environments land in Slice 3.</p>
      </Section>

      <Section id="investment" eyebrow="Rates" title="Investment">
        <p>Placeholder. Service tiers and pricing land in Slice 4.</p>
      </Section>

      <Section id="contact" eyebrow="Reach out" title="Contact">
        <p>Placeholder. Inquiry form, Supabase, and Resend land in Slice 5.</p>
      </Section>
    </main>
  );
}
