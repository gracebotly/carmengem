import fs from "node:fs";
import path from "node:path";

export type PortfolioItem = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

const DIR = path.join(process.cwd(), "public", "portfolio");
const IMAGE = /\.(jpe?g|png|webp|avif)$/i;

// The two crops in use. Dimensions prevent layout shift; the browser still
// renders each file at its own true ratio, so a future photo slightly off
// these numbers is harmless.
const LANDSCAPE = { width: 2000, height: 1125 };
const PORTRAIT = { width: 1333, height: 2000 };

/** First run of digits in the filename, for numeric ordering. */
function orderOf(file: string): number {
  const match = file.match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

/**
 * Reads public/portfolio at build time. Adding a photo is a file drop,
 * never a code edit. Non-image files are ignored.
 *
 * Orientation is read from the filename: any file with "landscape" in the
 * name is treated as 16:9, everything else as 2:3.
 */
export function getPortfolio(): PortfolioItem[] {
  let files: string[];

  try {
    files = fs.readdirSync(DIR);
  } catch {
    return [];
  }

  return files
    .filter((file) => IMAGE.test(file))
    .sort((a, b) => orderOf(a) - orderOf(b) || a.localeCompare(b))
    .map((file) => {
      const size = /landscape/i.test(file) ? LANDSCAPE : PORTRAIT;
      return {
        // Filenames contain spaces — encode or the request 404s.
        src: `/portfolio/${encodeURIComponent(file)}`,
        alt: "Carmen Gem",
        ...size,
      };
    });
}
