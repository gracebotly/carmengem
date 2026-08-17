import Image from "next/image";
import { PORTFOLIO } from "@/lib/portfolio";

const SPAN: Record<string, string> = {
  wide: "sm:col-span-2 aspect-[16/9]",
  tall: "sm:row-span-2 aspect-[3/4]",
  square: "aspect-square",
};

export default function PortfolioGrid() {
  return (
    <ul className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {PORTFOLIO.map((item) => (
        <li
          key={item.id}
          className={`relative overflow-hidden ${SPAN[item.span]}`}
        >
          {item.src ? (
            <Image
              src={item.src}
              alt={item.caption}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-end border border-shell/10 bg-shell/5 p-5">
              <span className="eyebrow text-sand">{item.caption}</span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
