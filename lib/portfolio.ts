import fs from "node:fs";
import path from "node:path";

export type Shape = "wide" | "tall" | "square";

export type PortfolioItem = {
  src: string;
  shape: Shape;
  alt: string;
};

const DIR = path.join(process.cwd(), "public", "portfolio");

/** NN-shape-optional-description.ext */
const FILENAME =
  /^(\d+)-(wide|tall|square)(?:-([a-z0-9-]+))?\.(jpe?g|png|webp|avif)$/i;

function toAlt(slug: string | undefined): string {
  if (!slug) return "Carmen Gem";
  const words = slug.replace(/-/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Reads public/portfolio at build time. Adding a photo is a file drop,
 * never a code edit. Anything that does not match FILENAME is ignored.
 */
export function getPortfolio(): PortfolioItem[] {
  let files: string[];

  try {
    files = fs.readdirSync(DIR);
  } catch {
    return [];
  }

  return files
    .map((file) => {
      const match = FILENAME.exec(file);
      if (!match) return null;

      const [, order, shape, slug] = match;
      return {
        order: Number(order),
        src: `/portfolio/${file}`,
        shape: shape.toLowerCase() as Shape,
        alt: toAlt(slug),
      };
    })
    .filter((item) => item !== null)
    .sort((a, b) => a.order - b.order)
    .map(({ src, shape, alt }) => ({ src, shape, alt }));
}
