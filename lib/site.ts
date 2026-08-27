/**
 * Single source of truth for the site's identity.
 *
 * The name, phone, and locality here must match the Google Business Profile
 * character for character — inconsistent "NAP" data across the web is one of
 * the few things that measurably suppresses local rankings.
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
export const OG_IMAGE = "/portfolio/high%206%20watermark%20landscape.jpg";
export const OG_IMAGE_WIDTH = 2000;
export const OG_IMAGE_HEIGHT = 1125;

export const BUSINESS = {
  name: "Carmen Gem",
  tagline: "Therapeutic Massage in Bowie, Maryland",
  description:
    "Therapeutic massage by appointment from a private studio in Bowie, Maryland. Serving Bowie, Crofton, Upper Marlboro and Prince George's County.",

  // TODO(Grace): the number clients should call or text. Format "+1-301-555-0142".
  phone: "",
  email: "carmengem@protonmail.com",

  // Street address is intentionally blank — this is a home studio. Locality,
  // region and zip are enough for local relevance without publishing where you live.
  streetAddress: "",
  city: "Bowie",
  region: "MD",
  // TODO(Grace): the studio's 5-digit zip, e.g. "20715".
  postalCode: "",
  country: "US",

  priceRange: "$$$",

  areaServed: [
    "Bowie, MD",
    "Crofton, MD",
    "Upper Marlboro, MD",
    "Mitchellville, MD",
    "Prince George's County, MD",
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
 * LocalBusiness structured data. Empty fields are dropped rather than emitted.
 * Validate the result at https://search.google.com/test/rich-results after deploy.
 */
export function localBusinessJsonLd(): Record<string, unknown> {
  const address: Record<string, string> = {
    "@type": "PostalAddress",
    addressLocality: BUSINESS.city,
    addressRegion: BUSINESS.region,
    addressCountry: BUSINESS.country,
  };
  if (BUSINESS.streetAddress) address.streetAddress = BUSINESS.streetAddress;
  if (BUSINESS.postalCode) address.postalCode = BUSINESS.postalCode;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "@id": `${SITE_URL}/#business`,
    name: BUSINESS.name,
    description: BUSINESS.description,
    url: SITE_URL,
    image: `${SITE_URL}${OG_IMAGE}`,
    address,
    areaServed: BUSINESS.areaServed.map((name) => ({
      "@type": "Place",
      name,
    })),
    priceRange: BUSINESS.priceRange,
  };

  if (BUSINESS.phone) data.telephone = BUSINESS.phone;
  if (BUSINESS.email) data.email = BUSINESS.email;
  if (BUSINESS.sameAs.length > 0) data.sameAs = BUSINESS.sameAs;
  if (BUSINESS.openingHours.length > 0) {
    data.openingHoursSpecification = BUSINESS.openingHours.map((slot) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: slot.days,
      opens: slot.opens,
      closes: slot.closes,
    }));
  }

  return data;
}
