import { Resend } from "resend";
import { getServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const service = typeof body.service === "string" ? body.service.trim() : "";

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Enter your name.";
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if (message.length < 10) errors.message = "Tell me a little more.";
  if (name.length > 100 || email.length > 200 || message.length > 4000) {
    errors.message = "That message is too long.";
  }

  if (Object.keys(errors).length > 0) {
    return Response.json({ errors }, { status: 400 });
  }

  try {
    const supabase = getServiceClient();
    const { error } = await supabase
      .from("inquiries")
      .insert({ name, email, message, service: service || null });

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
      from: "Carmen Rose <onboarding@resend.dev>",
      to: process.env.OWNER_EMAIL ?? "",
      replyTo: email,
      subject: `New inquiry from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Service: ${service || "Not specified"}`,
        "",
        message,
      ].join("\n"),
    });
  } catch {
    // Inquiry is already stored. Do not fail the request on email error.
  }

  return Response.json({ ok: true });
}
