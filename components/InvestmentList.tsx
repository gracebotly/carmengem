import Image from "next/image";
import { SERVICES } from "@/lib/services";

export default function InvestmentList() {
  return (
    <div className="grid items-start gap-14 md:grid-cols-2 md:gap-20">
      <div className="md:order-1">
        <ul className="border-t border-line" aria-label="Investment rates">
          {SERVICES.map((service) => (
            <li
              key={service.id}
              className="flex items-baseline justify-between gap-8 border-b border-line py-4"
            >
              <span className="text-lg text-ink md:text-xl">
                {service.duration}
              </span>
              <span className="shrink-0 text-lg text-ink md:text-xl">
                {service.price}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-10 space-y-6">
          <p>
            Dates of 3 hours or longer require social time outside the room,
            such as drinks or a meal.
          </p>
          <p>
            If you’d like to extend our session, and my schedule allows for it,
            in-date extensions are $600 per hour.
          </p>
          <p>
            I welcome all suitors who are polite and kind. I will never
            discriminate based on race, ethnicity, religion, sex, age, body
            type, or disability, as long as you’re 21 or older. If you have
            accessibility needs, please let me know so I can accommodate you.
          </p>
          <p>
            Though I prefer advance bookings, I am also available for
            last-minute appointments.
          </p>
        </div>
      </div>
      <div className="relative aspect-[2/3] overflow-hidden md:order-2">
        <Image
          src="/images/high%204%20watermark.jpg"
          alt="Carmen Gem, therapeutic massage by appointment in Bowie, Maryland"
          fill
          sizes="(max-width: 768px) 100vw, 45vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
