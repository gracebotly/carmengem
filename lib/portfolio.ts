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

// Intrinsic dimensions reserve each photo's actual aspect ratio before loading.
const IMAGE_SIZES: Record<string, { width: number; height: number }> = {
  "2-high-view.JPG": { width: 1992, height: 3000 },
  "3-high-view.JPG": { width: 2000, height: 3000 },
  "4-high-view.JPG": { width: 2000, height: 3000 },
  "6-high-view.jpeg": { width: 1920, height: 2560 },
  "7-high-view.jpeg": { width: 1920, height: 2560 },
  "8-high-view-landscape.jpg": { width: 2999, height: 2000 },
  "9-high-view.jpg": { width: 2000, height: 2999 },
  "10-high-view-landscape.jpg": { width: 3000, height: 2000 },
  "11-high-view.JPG": { width: 2000, height: 3000 },
  "12-high-view.JPG": { width: 2000, height: 3000 },
  "13-high-view.JPG": { width: 2000, height: 3000 },
};

/**
 * Alt text per file. Describe what is actually in the photo — a screen reader
 * reads this aloud, and Google reads it to understand the image.
 *
 * Add individual descriptions once the replacement photo copy is ready.
 */
const ALT_TEXT: Record<string, string> = {};

const ALT_FALLBACK = "Carmen Gem";

/** First run of digits in the filename, for numeric ordering. */
function orderOf(file: string): number {
  const match = file.match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

/**
 * Reads public/portfolio at build time. Non-image files are ignored.
 *
 * Add new photos' dimensions to IMAGE_SIZES to reserve their actual proportions.
 * Unlisted photos use a 2:3 portrait fallback until dimensions are supplied.
 *
 * A photo with no entry in ALT_TEXT still renders — it just gets the generic
 * fallback, so dropping in a new file never ships an image with no alt at all.
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
      const size = IMAGE_SIZES[file] ?? { width: 2000, height: 3000 };
      return {
        // Public files use URL-safe names and remain available as direct URLs.
        src: `/portfolio/${file}`,
        alt: ALT_TEXT[file] ?? ALT_FALLBACK,
        ...size,
      };
    });
}
