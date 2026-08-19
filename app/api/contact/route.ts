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
  const note = str(body.note);
  const length = str(body.length);
  const locationType = str(body.locationType);
  const city = str(body.city);
  const when = str(body.when);
  const ageRaw = str(body.age);
  const age = Number.parseInt(ageRaw, 10);

  const errors: Record<string, string> = {};

  if (name.length < 2) errors.name = "Enter your name.";
  if (!Number.isFinite(age) || age < 18 || age > 100) {
    errors.age = "Enter your age. Booking is 18 and over.";
  }
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if (length === "") errors.length = "Choose a length.";
  if (locationType !== "incall" && locationType !== "outcall") {
    errors.locationType = "Choose incall or outcall.";
  }
  if (locationType === "outcall" && city === "") {
    errors.city = "Which city should I come to?";
  }
  if (when === "") errors.when = "Let me know when.";
  if (
    name.length > 100 ||
    email.length > 200 ||
    phone.length > 40 ||
    city.length > 100 ||
    when.length > 200 ||
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
      age,
      service: length,
      location_type: locationType,
      city: city || null,
      preferred_time: when,
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
      subject: `${name} — ${length}, ${locationType === "outcall" ? city : "incall"}, ${when}`,
      text: [
        `Name: ${name}`,
        `Age: ${age}`,
        `Phone: ${phone || "Not given"}`,
        `Email: ${email}`,
        `Length: ${length}`,
        locationType === "outcall" ? `Outcall — ${city}` : "Incall",
        `When: ${when}`,
        "",
        note || "(no note)",
      ].join("\n"),
    });
  } catch {
    // Inquiry is stored. Do not fail the request on email error.
  }

  return Response.json({ ok: true });
}
