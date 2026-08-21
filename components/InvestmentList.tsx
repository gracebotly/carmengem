import { SERVICES } from "@/lib/services";

export default function InvestmentList() {
  return (
    <div className="grid gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:gap-20">
      <div>
        <div className="mb-8 flex items-end justify-between gap-6 border-b border-line pb-4">
          <p className="eyebrow text-sand">Massage offerings</p>
          <p className="text-sm text-stone">$600 per hour</p>
        </div>

        <ul
          className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2"
          aria-label="Massage rates"
        >
          {SERVICES.map((service) => (
            <li key={service.id} className="bg-shell p-6 md:p-8">
              <span className="eyebrow block text-sand">Massage</span>
              <div className="mt-8 flex items-end justify-between gap-5">
                <span className="font-display text-3xl leading-none text-ink md:text-4xl">
                  {service.duration}
                </span>
                <span className="shrink-0 text-lg text-ink">
                  {service.price}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-sm text-stone">
          Looking for more than four hours? Please inquire so we can plan your
          time together.
        </p>
      </div>

      <aside
        className="border-l border-rose/50 pl-7 md:pl-10"
        aria-labelledby="booking-notes-title"
      >
        <p id="booking-notes-title" className="eyebrow mb-8 text-sand">
          A note before booking
        </p>
        <div className="space-y-6 text-stone">
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
        <a
          href="#contact"
          className="eyebrow mt-10 inline-block border-b border-rose pb-1.5 text-ink transition-colors hover:text-rose"
        >
          Inquire about a session
        </a>
      </aside>
    </div>
  );
}
