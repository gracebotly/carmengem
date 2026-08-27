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

/**
 * Alt text per file. Describe what is actually in the photo — a screen reader
 * reads this aloud, and Google reads it to understand the image.
 *
 * TODO(Grace): replace each line with a real description of that photograph.
 * Keep them distinct; nine identical strings help no one.
 */
const ALT_TEXT: Record<string, string> = {
  "high 1 watermark.jpg": "Carmen Gem, massage therapist in Bowie, Maryland",
  "high 2 watermark.jpg": "Carmen Gem, massage therapist in Bowie, Maryland",
  "high 3 watermark.jpg": "Carmen Gem, massage therapist in Bowie, Maryland",
  "high 5 watermark.jpg": "Carmen Gem, massage therapist in Bowie, Maryland",
  "high 8 watermark.jpg": "Carmen Gem, massage therapist in Bowie, Maryland",
  "high 6 watermark landscape.jpg":
    "The private massage studio in Bowie, Maryland",
  "high 9 watermark landscape.jpg":
    "The private massage studio in Bowie, Maryland",
};

const ALT_FALLBACK = "Carmen Gem, therapeutic massage in Bowie, Maryland";

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
      const size = /landscape/i.test(file) ? LANDSCAPE : PORTRAIT;
      return {
        // Filenames contain spaces — encode or the request 404s.
        src: `/portfolio/${encodeURIComponent(file)}`,
        alt: ALT_TEXT[file] ?? ALT_FALLBACK,
        ...size,
      };
    });
}
