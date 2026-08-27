import { promises as dns } from "node:dns";
import { Resend } from "resend";
import { DURATION_VALUES } from "@/lib/inquiry";
import { isPhoneValid } from "@/lib/leadCapture";
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

  const firstName = str(body.firstName);
  const lastName = str(body.lastName);
  const name = [firstName, lastName].filter(Boolean).join(" ");
  const leadId = str(body.leadId);
  const email = str(body.email);
  const phone = str(body.phone);
  const note = str(body.note);
  const length = str(body.length);
  const locationType = str(body.locationType);
  const zip = str(body.zip);
  const preferredTime = str(body.preferredTime);

  const errors: Record<string, string> = {};

  if (firstName.length < 2) errors.firstName = "Enter your first name.";
  if (lastName.length < 2) errors.lastName = "Enter your last name.";
  // Phone stays optional. Only complain when it is present and malformed.
  if (phone !== "" && !isPhoneValid(phone)) {
    errors.phone = "That number looks incomplete.";
  }
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
    firstName.length > 100 ||
    lastName.length > 100 ||
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

  // Warn-only. A domain with no mail server is recorded, never rejected.
  let emailStatus: "ok" | "no_mx" = "ok";
  try {
    const domain = email.slice(email.lastIndexOf("@") + 1);
    const records = await dns.resolveMx(domain);
    if (records.length === 0) emailStatus = "no_mx";
  } catch {
    emailStatus = "no_mx";
  }

  const record = {
    name,
    first_name: firstName,
    last_name: lastName,
    email,
    phone: phone || null,
    service: length,
    location_type: locationType,
    zip: locationType === "client" ? zip : null,
    city: null,
    preferred_time: preferredTime,
    message: note || "(no note)",
    status: "complete",
    email_status: emailStatus,
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = getServiceClient();
    let saved = false;

    // Promote the partial row already captured rather than duplicating it.
    if (leadId) {
      const { data, error } = await supabase
        .from("inquiries")
        .update(record)
        .eq("id", leadId)
        .eq("status", "partial")
        .select("id")
        .maybeSingle();
      if (error) throw error;
      saved = Boolean(data);
    }

    if (!saved) {
      const { error } = await supabase.from("inquiries").insert(record);
      if (error) throw error;
    }
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
        `Name: ${firstName} ${lastName}`,
        `Phone: ${phone || "Not given"}`,
        `Email: ${email}`,
        ...(emailStatus === "no_mx"
          ? ["** This email domain has no mail server. A reply may bounce. **"]
          : []),
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
