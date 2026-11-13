import { isEmailValid, isPhoneValid } from "@/lib/leadCapture";

export const DURATION_OPTIONS = ["1 hour", "90 minutes", "2 hours", "3 hours", "4 hours", "6 hours", "14 hours"];
export const VIRTUAL_DURATIONS = ["15 minutes", "30 minutes", "60 minutes"];
export const VIRTUAL_FORMATS = ["Video Call", "Voice Call", "Private Chat"];
export const SCREENING_OPTIONS = [
  { value: "government-id", label: "Government ID" },
  { value: "linkedin", label: "Employment Verification via LinkedIn" },
  { value: "website", label: "Professional Website or Wikipedia Page" },
  { value: "professional-email", label: "Email from Professional Email" },
];
export const ID_NOTE = "Once your inquiry has been received, you will receive an email with instructions for submitting your identification photos. No documents are required at this stage.";

export type InquiryDraft = {
  name: string;
  email: string;
  phone: string;
  experience: "" | "virtual" | "in-person";
  length: string;
  virtualFormat: string;
  screeningMethod: string;
  screeningValue: string;
  date: string;
  cityState: string;
  preferredTime: string;
  note: string;
};
export const EMPTY_DRAFT: InquiryDraft = {
  name: "", email: "", phone: "", experience: "", length: "", virtualFormat: "",
  screeningMethod: "", screeningValue: "", date: "", cityState: "", preferredTime: "", note: "",
};

export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Whitelist active fields at both boundaries; stale hidden data is discarded. */
export function inquiryPayload(draft: InquiryDraft) {
  const common = {
    name: draft.name, email: draft.email, phone: draft.phone, experience: draft.experience,
    length: draft.length, date: draft.date, preferredTime: draft.preferredTime, note: draft.note,
  };
  return draft.experience === "virtual"
    ? { ...common, virtualFormat: draft.virtualFormat }
    : { ...common, cityState: draft.cityState, screeningMethod: draft.screeningMethod,
        ...(draft.screeningMethod !== "government-id" ? { screeningValue: draft.screeningValue } : {}) };
}

function isWebUrl(value: string): boolean {
  try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
}

export function validateInquiry(draft: InquiryDraft, today = localDate()): Record<string, string> {
  const errors: Record<string, string> = {};
  if (draft.name.trim().length < 2 || draft.name.length > 200) errors.name = "Enter your name.";
  if (!isEmailValid(draft.email)) errors.email = "Enter a valid email address.";
  if (!isPhoneValid(draft.phone)) errors.phone = "Enter a complete 10-digit US phone number.";
  if (!["virtual", "in-person"].includes(draft.experience)) errors.experience = "Choose an experience.";
  const durations = draft.experience === "virtual" ? VIRTUAL_DURATIONS : DURATION_OPTIONS;
  if (!durations.includes(draft.length)) errors.length = "Choose a length.";
  const parsed = new Date(`${draft.date}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== draft.date || draft.date < today) errors.date = "Choose today or a future date.";
  if (!draft.preferredTime.trim() || draft.preferredTime.length > 200) errors.preferredTime = "Enter your preferred time.";
  if (draft.experience === "virtual") {
    if (!VIRTUAL_FORMATS.includes(draft.virtualFormat)) errors.virtualFormat = "Choose a virtual format.";
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.preferredTime)) errors.preferredTime = "Enter a valid time.";
  } else if (draft.experience === "in-person") {
    if (!draft.cityState.trim() || draft.cityState.length > 200) errors.cityState = "Enter your city and state.";
    if (!SCREENING_OPTIONS.some(option => option.value === draft.screeningMethod)) errors.screeningMethod = "Choose a screening method.";
    if (["linkedin", "website"].includes(draft.screeningMethod) && (!isWebUrl(draft.screeningValue) || draft.screeningValue.length > 2000)) errors.screeningValue = "Enter a valid website URL, including https://.";
    if (draft.screeningMethod === "professional-email" && !isEmailValid(draft.screeningValue)) errors.screeningValue = "Enter a valid professional email address.";
  }
  if (draft.note.length > 4000) errors.note = "Please keep additional details under 4,000 characters.";
  return errors;
}

export function isDraftReady(draft: InquiryDraft): boolean {
  return Object.keys(validateInquiry(draft)).length === 0;
}

export function inquiryDetails(draft: InquiryDraft): [string, string][] {
  return [
    ["Experience", draft.experience === "virtual" ? "VIRTUAL" : "IN PERSON"],
    ["Session length", draft.length],
    ...(draft.experience === "virtual" ? [["Virtual format", draft.virtualFormat] as [string, string]] : [
      ["Screening method", SCREENING_OPTIONS.find(option => option.value === draft.screeningMethod)?.label ?? ""] as [string, string],
      ...(draft.screeningMethod !== "government-id" ? [["Screening details", draft.screeningValue] as [string, string]] : []),
      ["City/state of date", draft.cityState] as [string, string],
    ]),
    ["Preferred date", draft.date], ["Preferred time", draft.preferredTime],
  ];
}

export function splitName(full: string): { firstName: string; lastName: string } {
  const cleaned = full.trim().replace(/\s+/g, " ");
  const space = cleaned.indexOf(" ");
  return space === -1 ? { firstName: cleaned, lastName: "" } : { firstName: cleaned.slice(0, space), lastName: cleaned.slice(space + 1) };
}
