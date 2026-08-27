export type LocationType = "studio" | "client";
export type Timing = "asap" | "scheduled";
export type Meridiem = "AM" | "PM";

export type InquiryDraft = {
  name: string;
  length: string;
  locationType: LocationType | "";
  zip: string;
  timing: Timing | "";
  date: string;
  hour: string;
  minute: string;
  meridiem: Meridiem | "";
  note: string;
  phone: string;
  email: string;
};

export const EMPTY_DRAFT: InquiryDraft = {
  name: "",
  length: "",
  locationType: "",
  zip: "",
  timing: "",
  date: "",
  hour: "",
  minute: "",
  meridiem: "",
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

export const HOURS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

export const MINUTES = ["00", "30"];

export const MERIDIEMS: Meridiem[] = ["AM", "PM"];

const ZIP_RE = /^\d{5}$/;

/**
 * Human-readable timing, stored in inquiries.preferred_time and used in the email subject.
 */
export function timingPhrase(draft: InquiryDraft): string {
  if (draft.timing === "asap") return "As soon as you have an opening";
  if (draft.timing !== "scheduled") return "";
  if (!draft.date || !draft.hour || !draft.minute || !draft.meridiem) return "";

  const [y, m, d] = draft.date.split("-").map(Number);
  const when = new Date(y, m - 1, d);
  const pretty = when.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return `${pretty} at ${draft.hour}:${draft.minute} ${draft.meridiem}`;
}

export function isZipValid(zip: string): boolean {
  return ZIP_RE.test(zip.trim());
}

/** Client-side gate for enabling the submit button. */
export function isDraftReady(draft: InquiryDraft): boolean {
  if (draft.name.trim().length < 2) return false;
  if (draft.length === "") return false;
  if (draft.locationType === "") return false;
  if (draft.locationType === "client" && !isZipValid(draft.zip)) return false;
  if (draft.timing === "") return false;
  if (draft.timing === "scheduled") {
    if (!draft.date || !draft.hour || !draft.minute || !draft.meridiem) return false;
  }
  if (draft.email.trim() === "") return false;
  return true;
}
