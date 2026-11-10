import Image from "next/image";

const TRAVEL_RATES = [
  {
    id: "usa",
    destination: "USA",
    detail: null,
    duration: "6 hours minimum",
    price: "$3,500",
    travelFee: "$1,000",
  },
  {
    id: "international-short-flight",
    destination: "International",
    detail: "Flights of 6 hours or less",
    duration: "12 hours",
    price: "$5,000",
    travelFee: "$1,000",
  },
  {
    id: "international-long-distance",
    destination: "International",
    detail: "Long Distance",
    duration: "24 hours",
    price: "$10,000",
    travelFee: "$2,000",
  },
];

export default function FlyMeToYou() {
  return (
    <section
      id="fly-me-to-you"
      aria-labelledby="fly-me-to-you-heading"
      className="section-anchor mt-24 grid items-start gap-14 md:mt-32 md:grid-cols-2 md:gap-20"
    >
      <div className="md:order-2">
        <h3
          id="fly-me-to-you-heading"
          className="font-display text-[30px] leading-[1.1] text-ink md:text-[36px]"
        >
          Fly Me to You
        </h3>

        <ul
          aria-label="Fly Me to You rates"
          className="mt-8 border-t border-line"
        >
          {TRAVEL_RATES.map((rate) => (
            <li key={rate.id} className="border-b border-line py-6">
              <h4 className="text-lg font-normal text-ink md:text-xl">
                {rate.destination}
              </h4>
              {rate.detail && <p className="text-sm">{rate.detail}</p>}
              <p className="mt-3 text-lg text-ink md:text-xl">
                {rate.duration} <span aria-hidden="true">|</span>{" "}
                <span className="whitespace-nowrap">{rate.price}</span>
              </p>
              <p>+ {rate.travelFee} travel fee</p>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm leading-relaxed">
          Rates exclude flight and accommodation expenses. First or business
          class flights would be appreciated.
        </p>
      </div>

      <div className="relative aspect-[2/3] overflow-hidden md:order-1">
        <Image
          src="/portfolio/13-high-view.JPG"
          alt="Carmen Gem in a red dress beside tall windows"
          fill
          sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1152px) calc((100vw - 128px) / 2), 512px"
          className="object-cover"
        />
      </div>
    </section>
  );
}
