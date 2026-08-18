import { SERVICES } from "@/lib/services";

export default function InvestmentList() {
  return (
    <ul className="mt-16 border-t border-line">
      {SERVICES.map((service) => (
        <li
          key={service.id}
          className="flex items-baseline justify-between gap-10 border-b border-line py-8"
        >
          <span className="text-[20px] text-ink md:text-[26px]">
            {service.duration}
          </span>
          <span className="shrink-0 text-[20px] text-ink md:text-[26px]">
            {service.price}
          </span>
        </li>
      ))}
    </ul>
  );
}
