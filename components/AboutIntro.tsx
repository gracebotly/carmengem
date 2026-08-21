export default function AboutIntro() {
  return (
    <div className="grid gap-12 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-16">
      {/* Copy */}
      <div className="max-w-lg space-y-6">
        <p>
          The right kind of touch can quiet a mind that hasn&rsquo;t stopped
          running. That&rsquo;s the experience I want to create for every person
          who walks through my door. My space is designed for you to slow down,
          let go, and simply be cared for without feeling rushed or having to
          explain what you need. Every session is personal, attentive, and
          guided by how your body feels that day, giving you the time and space
          to truly relax, reset, and recharge.
        </p>
        <p>
          I practice from a private studio nestled in a quiet, established
          neighborhood in Bowie. The residential setting is intentional,
          offering a warm, peaceful, and discreet environment where you can feel
          comfortable from the moment you arrive. You&rsquo;ll have driveway
          parking, a private entrance, and a thoughtfully prepared space
          dedicated to your comfort, privacy, and relaxation. Once you step
          inside, the rest of the world can wait.
        </p>
      </div>

      {/* Portrait slot */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-line/20">
        <div className="absolute inset-3 border border-line/60" />
      </div>
    </div>
  );
}
