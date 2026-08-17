import { SERVICES } from "@/lib/services";

export default function InvestmentList() {
  return (
    <ul className="mt-16 border-t border-line">
      {SERVICES.map((service) => (
        <li
          key={service.id}
          className="flex flex-col gap-2 border-b border-line py-8 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10"
        >
          <div className="max-w-md">
            <div className="flex items-baseline gap-4">
              <h3 className="text-[20px] text-ink md:text-[26px]">
                {service.name}
              </h3>
              <span className="eyebrow text-sand">{service.duration}</span>
            </div>
            <p className="mt-2 text-base font-light leading-[1.75] text-stone">
              {service.description}
            </p>
          </div>
          <span className="shrink-0 text-[20px] text-ink md:text-[26px]">
            {service.price}
          </span>
        </li>
      ))}
    </ul>
  );
}
