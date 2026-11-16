/**
 * Single source of truth for the site's identity.
 *
 * Keep Carmen's identity and actual studio locality accurate. Service areas
 * describe where appointments are offered, not where the studio is located.
 *
 * Any field left as "" is omitted from the structured data rather than
 * published empty. Never put a placeholder value in this file.
 */

export type OpeningHours = {
  /** schema.org DayOfWeek values, e.g. "Monday". */
  days: string[];
  /** 24-hour "HH:MM". */
  opens: string;
  closes: string;
};

/**
 * Canonical origin. www is chosen because that is the version Google has
 * already indexed — switching to the apex would throw away that history.
 * Vercel must be configured to 301 carmengem.com -> www.carmengem.com.
 */
export const SITE_URL = "https://www.carmengem.com";

/** Landscape crop used for link previews. Roughly 1.91:1, which is what Open Graph wants. */
export const OG_IMAGE = "/portfolio/10-high-view-landscape.jpg";
export const OG_IMAGE_WIDTH = 3000;
export const OG_IMAGE_HEIGHT = 2000;

export const BUSINESS = {
  name: "Carmen Gem",
  tagline: "Washington DC Luxury Escort & High-End Companion",
  description:
    "Meet Carmen Gem, a luxury escort and high-end companion serving Washington, DC and Tysons Corner, VA. Warm, discreet, unhurried time with a personal touch.",

  // TODO(Grace): the number clients should call or text. Format "+1-301-555-0142".
  phone: "",
  email: "carmengem@protonmail.com",

  // Street address is intentionally blank — this is a home studio.
  // Keep the actual locality here; do not publish the private residential address.
  streetAddress: "",
  city: "Bowie",
  region: "MD",
  // TODO(Grace): the studio's 5-digit zip, e.g. "20715".
  postalCode: "",
  country: "US",

  priceRange: "$$$",

  areaServed: [
    "Washington, DC",
    "Tysons Corner, VA",
    "McLean, VA",
    "Arlington, VA",
    "Bethesda, MD",
    "Northern Virginia",
  ],

  // TODO(Grace): real hours. Example:
  // [{ days: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "10:00", closes: "20:00" }]
  openingHours: [] as OpeningHours[],

  // TODO(Grace): profile URLs that belong to this business — Google Business
  // Profile, Instagram, Facebook. These tell Google the profiles are the same entity.
  sameAs: [] as string[],

  // TODO(Grace): only if verifying Search Console by HTML tag. DNS verification
  // is easier and does not need this. Leave "" to omit the tag.
  googleSiteVerification: "",
};

/**
 * Person identity structured data. Studio address and business-only properties
 * are deliberately omitted. Only configured, authentic profile links are used.
 */
export function personJsonLd(): Record<string, unknown> {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: BUSINESS.name,
    description: BUSINESS.description,
    url: SITE_URL,
    image: `${SITE_URL}${OG_IMAGE}`,
  };

  if (BUSINESS.phone) data.telephone = BUSINESS.phone;
  if (BUSINESS.email) data.email = BUSINESS.email;
  if (BUSINESS.sameAs.length > 0) data.sameAs = BUSINESS.sameAs;
  return data;
}
