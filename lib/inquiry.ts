export type LocationType = "incall" | "outcall";

export type InquiryDraft = {
  name: string;
  age: string;
  phone: string;
  email: string;
  duration: string;
  locationType: LocationType | "";
  city: string;
  preferredTime: string;
  message: string;
};

export const EMPTY_DRAFT: InquiryDraft = {
  name: "",
  age: "",
  phone: "",
  email: "",
  duration: "",
  locationType: "",
  city: "",
  preferredTime: "",
  message: "",
};

export const LOCATION_OPTIONS: { value: LocationType; label: string }[] = [
  { value: "incall", label: "I'll come to you" },
  { value: "outcall", label: "Please come to me" },
];

/** True when the draft has enough detail to be worth sending as a text. */
export function isDraftReady(draft: InquiryDraft): boolean {
  if (draft.name.trim().length < 2) return false;
  if (draft.age.trim() === "") return false;
  if (draft.duration === "") return false;
  if (draft.locationType === "") return false;
  if (draft.locationType === "outcall" && draft.city.trim() === "")
    return false;
  return true;
}

/** Assembles the copy-and-paste text message. Line labels keep it scannable on a phone. */
export function buildTextMessage(draft: InquiryDraft): string {
  const name = draft.name.trim();
  const age = draft.age.trim();
  const city = draft.city.trim();
  const time = draft.preferredTime.trim();
  const note = draft.message.trim();

  const lines: string[] = [];

  lines.push(
    age
      ? `Hi Carmen, my name is ${name || "___"} and I'm ${age}.`
      : `Hi Carmen, my name is ${name || "___"}.`,
  );

  if (draft.duration) lines.push(`Session: ${draft.duration}`);

  if (draft.locationType === "incall") {
    lines.push("Location: I'd come to you.");
  } else if (draft.locationType === "outcall") {
    lines.push(
      `Location: I'd like you to come to me${city ? ` in ${city}` : ""}.`,
    );
  }

  if (time) lines.push(`Preferred time: ${time}`);
  if (note) lines.push("", note);

  return lines.join("\n");
}

/** `?&body=` is the form that pre-fills on both iOS and Android. */
export function smsHref(phone: string, body: string): string {
  return `sms:${phone}?&body=${encodeURIComponent(body)}`;
}
