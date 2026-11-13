import Image from "next/image";

export default function AboutIntro() {
  return (
    <div className="grid gap-12 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-16">
      {/* Copy */}
      <div className="max-w-lg space-y-6">
        <p>
          I&apos;m a naturally feminine, affectionate woman who believes a
          gentleman deserves to feel appreciated, relaxed, and genuinely cared
          for. I enjoy the finer things in life, but what I cherish most is
          making a man feel special through warm companionship, thoughtful
          attention, and a gentle, personal touch.
        </p>
        <p>
          I understand that a man carries responsibilities and pressures he
          rarely gets to set aside. The right kind of touch can quiet a mind
          that hasn&apos;t stopped running. That&apos;s the experience I want to
          create for every gentleman who walks through my door.
        </p>
        <p>
          My space is designed for you to slow down, let go, and simply be cared
          for without feeling rushed or having to explain what you need. Every
          session is personal, attentive, and guided by how your body feels that
          day, giving you the time and space to truly relax, reset, and recharge.
        </p>
      </div>

      {/* Portrait */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src="/images/5-high-view.jpeg"
          alt="Carmen Gem"
          fill
          sizes="(max-width: 768px) 100vw, 45vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
