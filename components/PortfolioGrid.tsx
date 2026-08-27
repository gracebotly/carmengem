import Image from "next/image";
import { getPortfolio } from "@/lib/portfolio";

export default function PortfolioGrid() {
  const items = getPortfolio();

  // Empty folder renders nothing rather than a grid of holes.
  if (items.length === 0) return null;

  return (
    <ul className="mt-4 columns-1 gap-4 sm:columns-2 lg:columns-3">
      {items.map((item) => (
        <li key={item.src} className="mb-4 break-inside-avoid overflow-hidden">
          <Image
            src={item.src}
            alt={item.alt}
            width={item.width}
            height={item.height}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="h-auto w-full"
          />
        </li>
      ))}
    </ul>
  );
}
