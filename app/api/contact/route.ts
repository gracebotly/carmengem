import { Resend } from "resend";
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
  const message = str(body.message);
  const duration = str(body.duration);
  const locationType = str(body.locationType);
  const city = str(body.city);
  const preferredTime = str(body.preferredTime);
  const ageRaw = str(body.age);
  const age = Number.parseInt(ageRaw, 10);

  const errors: Record<string, string> = {};

  if (name.length < 2) errors.name = "Enter your name.";
  if (!Number.isFinite(age) || age < 18 || age > 100) {
    errors.age = "Enter your age. Clients must be 18 or older to book online.";
  }
  if (email !== "" && !EMAIL_RE.test(email)) {
    errors.email = "That email address does not look right.";
  }
  if (email === "" && phone.replace(/\D/g, "").length < 10) {
    errors.phone = "Leave a phone number or an email so I can reply.";
  }
  if (duration === "") errors.duration = "Choose a session length.";
  if (locationType !== "incall" && locationType !== "outcall") {
    errors.locationType = "Let me know where the session would be.";
  }
  if (locationType === "outcall" && city === "") {
    errors.city = "Which city should I come to?";
  }
  if (message.length < 10) errors.message = "Tell me a little more.";
  if (
    name.length > 100 ||
    email.length > 200 ||
    phone.length > 40 ||
    city.length > 100 ||
    preferredTime.length > 200 ||
    message.length > 4000
  ) {
    errors.message = "That is longer than I can accept.";
  }

  if (Object.keys(errors).length > 0) {
    return Response.json({ errors }, { status: 400 });
  }

  try {
    const supabase = getServiceClient();
    const { error } = await supabase.from("inquiries").insert({
      name,
      email: email || null,
      phone: phone || null,
      age,
      service: duration,
      location_type: locationType,
      city: city || null,
      preferred_time: preferredTime || null,
      message,
    });

    if (error) throw error;
  } catch {
    return Response.json(
      { error: "Could not save your inquiry. Try again." },
      { status: 500 },
    );
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Carmen Gem <onboarding@resend.dev>",
      to: process.env.OWNER_EMAIL ?? "",
      ...(email ? { replyTo: email } : {}),
      subject: `New inquiry — ${name}, ${duration}`,
      text: [
        `Name: ${name}`,
        `Age: ${age}`,
        `Phone: ${phone || "Not given"}`,
        `Email: ${email || "Not given"}`,
        `Session: ${duration}`,
        locationType === "outcall"
          ? `Location: Outcall to ${city}`
          : "Location: Incall (client comes to you)",
        `Preferred time: ${preferredTime || "Not given"}`,
        "",
        message,
      ].join("\n"),
    });
  } catch {
    // Inquiry is already stored. Do not fail the request on email error.
  }

  return Response.json({ ok: true });
}
