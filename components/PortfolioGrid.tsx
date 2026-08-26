import Image from "next/image";
import { getPortfolio, type Shape } from "@/lib/portfolio";

const SHAPE: Record<Shape, string> = {
  wide: "sm:col-span-2 aspect-[16/9]",
  tall: "sm:row-span-2 aspect-[3/4]",
  square: "aspect-square",
};

export default function PortfolioGrid() {
  const items = getPortfolio();

  // Empty folder renders nothing rather than a grid of holes.
  if (items.length === 0) return null;

  return (
    <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.src}
          className={`relative overflow-hidden ${SHAPE[item.shape]}`}
        >
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </li>
      ))}
    </ul>
  );
}
