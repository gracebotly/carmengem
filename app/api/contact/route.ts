import { Resend } from "resend";
import { DURATION_VALUES } from "@/lib/inquiry";
import { getServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof body.company === "string" && body.company.length > 0) {
    return Response.json({ ok: true });
  }

  const name = str(body.name);
  const email = str(body.email);
  const phone = str(body.phone);
  const note = str(body.note);
  const length = str(body.length);
  const locationType = str(body.locationType);
  const zip = str(body.zip);
  const preferredTime = str(body.preferredTime);

  const errors: Record<string, string> = {};

  if (name.length < 2) errors.name = "Enter your name.";
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if (length === "") {
    errors.length = "Choose a session length.";
  } else if (!DURATION_VALUES.includes(length)) {
    errors.length = "Choose a session length.";
  }
  if (locationType !== "studio" && locationType !== "client") {
    errors.locationType = "Choose where your session begins.";
  }
  if (locationType === "client" && !/^\d{5}$/.test(zip)) {
    errors.zip = "Enter a 5-digit zip code.";
  }
  if (preferredTime === "") errors.preferredTime = "Let me know when.";
  if (
    name.length > 100 ||
    email.length > 200 ||
    phone.length > 40 ||
    preferredTime.length > 200 ||
    note.length > 4000
  ) {
    errors.note = "That is longer than I can accept.";
  }

  if (Object.keys(errors).length > 0) {
    return Response.json({ errors }, { status: 400 });
  }

  try {
    const supabase = getServiceClient();
    const { error } = await supabase.from("inquiries").insert({
      name,
      email,
      phone: phone || null,
      service: length,
      location_type: locationType,
      zip: locationType === "client" ? zip : null,
      city: null,
      preferred_time: preferredTime,
      message: note || "(no note)",
    });

    if (error) throw error;
  } catch {
    return Response.json(
      { error: "Could not save your inquiry. Try again." },
      { status: 500 }
    );
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Carmen Gem <onboarding@resend.dev>",
      to: process.env.OWNER_EMAIL ?? "",
      replyTo: email,
      subject: `${name} — ${length}, ${
        locationType === "client" ? zip : "studio"
      }, ${preferredTime}`,
      text: [
        `Name: ${name}`,
        `Phone: ${phone || "Not given"}`,
        `Email: ${email}`,
        `Length: ${length}`,
        locationType === "client" ? `Their location — ${zip}` : "My studio",
        `When: ${preferredTime}`,
        "",
        note || "(no note)",
      ].join("\n"),
    });
  } catch {
    // Inquiry is stored. Do not fail the request on email error.
  }

  return Response.json({ ok: true });
}
