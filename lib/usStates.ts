/**
 * US states and DC, used to normalise the free-text "City, State" field on the
 * contact form. The visitor types one line however they like; we store one
 * canonical form ("Bowie, MD") so the inquiries table stays consistent.
 */

export const US_STATES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

const NAME_TO_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(US_STATES).map(([code, name]) => [name.toLowerCase(), code])
);

/** Letters, spaces, hyphens, apostrophes and periods. 2–59 characters. */
const CITY_RE = /^[\p{L}][\p{L}\s.'-]{1,58}$/u;

export type CityState = { city: string; state: string };

function capitalise(part: string): string {
  return part.length === 0
    ? part
    : part[0].toUpperCase() + part.slice(1).toLowerCase();
}

/**
 * "bowie md" -> "Bowie", "o'fallon" -> "O'Fallon", but "prince george's"
 * stays "Prince George's" — the letter after an apostrophe is only capitalised
 * when what precedes it is a single letter, which is the Irish/French pattern.
 */
function titleCase(value: string): string {
  return value
    .split(" ")
    .map((word) =>
      word
        .split("-")
        .map((segment) => {
          const pieces = segment.split("'").map(capitalise);
          return pieces
            .map((piece, index) =>
              index > 0 && pieces[index - 1].length !== 1
                ? piece.toLowerCase()
                : piece
            )
            .join("'");
        })
        .join("-")
    )
    .join(" ");
}

/**
 * Accepts "Bowie, MD", "bowie md", "Upper Marlboro, Maryland",
 * "Washington, District of Columbia". Returns null when the state is missing
 * or is not a real US state — that is what makes the field mandatory.
 */
export function parseCityState(raw: string): CityState | null {
  const cleaned = raw.trim().replace(/\s+/g, " ").replace(/[,\s]+$/, "");
  if (cleaned.length < 4 || cleaned.length > 80) return null;

  let cityPart = "";
  let statePart = "";

  const comma = cleaned.lastIndexOf(",");
  if (comma > 0) {
    cityPart = cleaned.slice(0, comma).trim();
    statePart = cleaned.slice(comma + 1).trim();
  } else {
    // No comma. Try the last two words as a state name, then the last word.
    const words = cleaned.split(" ");
    const lastTwo = words.slice(-2).join(" ");
    if (words.length > 2 && NAME_TO_CODE[lastTwo.toLowerCase()]) {
      cityPart = words.slice(0, -2).join(" ");
      statePart = lastTwo;
    } else if (words.length > 1) {
      cityPart = words.slice(0, -1).join(" ");
      statePart = words[words.length - 1];
    } else {
      return null;
    }
  }

  if (cityPart === "" || statePart === "") return null;
  if (!CITY_RE.test(cityPart)) return null;

  const code =
    statePart.length === 2 && US_STATES[statePart.toUpperCase()]
      ? statePart.toUpperCase()
      : NAME_TO_CODE[statePart.toLowerCase()];

  if (!code) return null;

  return { city: titleCase(cityPart), state: code };
}

/** Canonical single-line form stored in inquiries.city, e.g. "Bowie, MD". */
export function formatCityState(parsed: CityState): string {
  return `${parsed.city}, ${parsed.state}`;
}
