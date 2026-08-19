import { SERVICES } from "@/lib/services";

function PortraitPlaceholder({ position }: { position: "first" | "second" }) {
  return (
    <div
      className={`relative aspect-[4/5] overflow-hidden bg-line/45 ${
        position === "first" ? "md:order-2" : "md:order-1"
      }`}
      role="img"
      aria-label="Portrait photograph coming soon"
    >
      <div className="absolute inset-5 border border-shell/75" />
      <p className="eyebrow absolute inset-x-6 bottom-6 text-center text-stone">
        Portrait coming soon
      </p>
    </div>
  );
}

export default function InvestmentList() {
  return (
    <div className="space-y-24 md:space-y-40">
      <div className="grid items-start gap-14 md:grid-cols-2 md:gap-20">
        <div className="md:order-1">
          <p className="eyebrow mb-6 text-sand">Donations</p>
          <ul className="border-t border-line" aria-label="Donation rates">
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
              If you’d like to extend our date, and my schedule allows for it,
              in-date extensions are $600 per hour.
            </p>
            <p>
              On overnight dates, I ask for a minimum of 7 hours of sleep and
              tea with honey in the morning.
            </p>
          </div>
        </div>
        <PortraitPlaceholder position="first" />
      </div>

      <div className="grid items-center gap-14 md:grid-cols-2 md:gap-20">
        <PortraitPlaceholder position="second" />
        <div className="md:order-2">
          <p className="eyebrow mb-6 text-sand">Time together</p>
          <div className="space-y-6">
            <p>
              On dates of 48 hours and above, I typically take one to two hours
              of solo time each day to recharge and take care of personal
              tasks, so I remain my most present self while we’re together.
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
      </div>
    </div>
  );
}
