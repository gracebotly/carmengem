export type LocationType = "incall" | "outcall";
export type WhenChoice = "now" | "today" | "tomorrow" | "week" | "specific";

export type InquiryDraft = {
  name: string;
  age: string;
  length: string;
  locationType: LocationType | "";
  city: string;
  when: WhenChoice | "";
  whenDetail: string;
  note: string;
  phone: string;
  email: string;
};

export const EMPTY_DRAFT: InquiryDraft = {
  name: "",
  age: "",
  length: "",
  locationType: "",
  city: "",
  when: "",
  whenDetail: "",
  note: "",
  phone: "",
  email: "",
};

export const LOCATION_OPTIONS: {
  value: LocationType;
  label: string;
  hint: string;
}[] = [
  { value: "incall", label: "Incall", hint: "I come to you" },
  { value: "outcall", label: "Outcall", hint: "You come to me" },
];

export const WHEN_OPTIONS: { value: WhenChoice; label: string; phrase: string }[] = [
  { value: "now", label: "Now", phrase: "Now — as soon as you're free" },
  { value: "today", label: "Today", phrase: "Today" },
  { value: "tomorrow", label: "Tomorrow", phrase: "Tomorrow" },
  { value: "week", label: "This week", phrase: "Sometime this week" },
  { value: "specific", label: "Pick a time", phrase: "" },
];

/** Human-readable form of the timing answer, used in the text and the email. */
export function whenPhrase(draft: InquiryDraft): string {
  if (draft.when === "specific") return draft.whenDetail.trim();
  return WHEN_OPTIONS.find((o) => o.value === draft.when)?.phrase ?? "";
}

/** Enough filled in to be worth sending. */
export function isDraftReady(draft: InquiryDraft): boolean {
  if (draft.name.trim().length < 2) return false;
  if (draft.age.trim() === "") return false;
  if (draft.length === "") return false;
  if (draft.locationType === "") return false;
  if (draft.locationType === "outcall" && draft.city.trim() === "") return false;
  if (draft.when === "") return false;
  if (draft.when === "specific" && draft.whenDetail.trim() === "") return false;
  return true;
}

/** The message the visitor copies. Short labelled lines — scannable on a phone. */
export function buildTextMessage(draft: InquiryDraft): string {
  const name = draft.name.trim() || "___";
  const age = draft.age.trim();
  const city = draft.city.trim() || "___";
  const note = draft.note.trim();
  const when = whenPhrase(draft);

  const lines: string[] = [];

  lines.push(`Hi Carmen, I'm ${name}${age ? `, ${age}` : ""}.`);
  if (draft.length) lines.push(`Length: ${draft.length}`);
  if (draft.locationType === "incall") lines.push("Incall — I'll come to you");
  if (draft.locationType === "outcall") lines.push(`Outcall — ${city}`);
  if (when) lines.push(`When: ${when}`);
  if (note) lines.push("", note);

  return lines.join("\n");
}

/** `?&body=` is the form that pre-fills on both iOS and Android. */
export function smsHref(phone: string, body: string): string {
  return `sms:${phone}?&body=${encodeURIComponent(body)}`;
}
