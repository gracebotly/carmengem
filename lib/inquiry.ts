import { isEmailValid } from "@/lib/leadCapture";
import { parseCityState } from "@/lib/usStates";

export type LocationType = "studio" | "client";
export type Timing = "asap" | "scheduled";

export type InquiryDraft = {
  /** One field. Split into first/last only when it is stored. */
  name: string;
  length: string;
  locationType: LocationType | "";
  /** Free text, normalised to "Bowie, MD". Required only for client locations. */
  cityState: string;
  timing: Timing | "";
  date: string;
  /** Display value from TIME_SLOTS, e.g. "3:30 PM". */
  time: string;
  note: string;
  phone: string;
  email: string;
};

export const EMPTY_DRAFT: InquiryDraft = {
  name: "",
  length: "",
  locationType: "",
  cityState: "",
  timing: "",
  date: "",
  time: "",
  note: "",
  phone: "",
  email: "",
};

export type DurationOption = {
  id: string;
  label: string;
  /** Stored in inquiries.service and shown in the notification email. */
  value: string;
};

/**
 * Owned by the contact form, deliberately not derived from SERVICES.
 * Durations offered and services priced are separate concerns — keep them separate.
 */
export const DURATION_OPTIONS: DurationOption[] = [
  { id: "1-hour", label: "1 hour", value: "1 hour" },
  { id: "90-min", label: "90 minutes", value: "90 minutes" },
  { id: "2-hour", label: "2 hours", value: "2 hours" },
  { id: "3-hour", label: "3 hours", value: "3 hours" },
  { id: "4-hour", label: "4 hours", value: "4 hours" },
  { id: "inquire", label: "Inquire", value: "Inquire — more than 4 hours" },
];

export const INQUIRE_VALUE = "Inquire — more than 4 hours";

export const DURATION_VALUES: string[] = DURATION_OPTIONS.map((o) => o.value);

export const LOCATION_OPTIONS: { value: LocationType; label: string }[] = [
  { value: "studio", label: "My studio in Bowie" },
  { value: "client", label: "Your location" },
];

export const TIMING_OPTIONS: { value: Timing; label: string }[] = [
  { value: "asap", label: "As soon as you have an opening" },
  { value: "scheduled", label: "Pick a date and time" },
];

/** 8:00 AM through 8:30 PM, every 30 minutes. Adjust the bounds here only. */
function buildTimeSlots(): string[] {
  const START_MINUTES = 8 * 60;
  const END_MINUTES = 20 * 60 + 30;
  const slots: string[] = [];

  for (let total = START_MINUTES; total <= END_MINUTES; total += 30) {
    const hour24 = Math.floor(total / 60);
    const minute = total % 60;
    const meridiem = hour24 < 12 ? "AM" : "PM";
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    slots.push(`${hour12}:${String(minute).padStart(2, "0")} ${meridiem}`);
  }

  return slots;
}

export const TIME_SLOTS: string[] = buildTimeSlots();

/**
 * Human-readable timing, stored in inquiries.preferred_time and used in the email subject.
 */
export function timingPhrase(draft: InquiryDraft): string {
  if (draft.timing === "asap") return "As soon as you have an opening";
  if (draft.timing !== "scheduled") return "";
  if (!draft.date || !draft.time) return "";

  const [y, m, d] = draft.date.split("-").map(Number);
  const when = new Date(y, m - 1, d);
  const pretty = when.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return `${pretty} at ${draft.time}`;
}

/**
 * Splits one typed name for the first_name / last_name columns. The first word
 * is the first name, everything after it is the last name. A single word leaves
 * lastName empty — accepted by design, the form does not demand a surname.
 */
export function splitName(full: string): { firstName: string; lastName: string } {
  const cleaned = full.trim().replace(/\s+/g, " ");
  const space = cleaned.indexOf(" ");
  if (space === -1) return { firstName: cleaned, lastName: "" };
  return {
    firstName: cleaned.slice(0, space),
    lastName: cleaned.slice(space + 1),
  };
}

export function isCityStateValid(value: string): boolean {
  return parseCityState(value) !== null;
}

/** Client-side gate for enabling the submit button. */
export function isDraftReady(draft: InquiryDraft): boolean {
  if (draft.name.trim().length < 2) return false;
  if (draft.length === "") return false;
  if (draft.locationType === "") return false;
  if (draft.locationType === "client" && !isCityStateValid(draft.cityState))
    return false;
  if (draft.timing === "") return false;
  if (draft.timing === "scheduled") {
    if (!draft.date || !draft.time) return false;
  }
  if (!isEmailValid(draft.email)) return false;
  return true;
}
