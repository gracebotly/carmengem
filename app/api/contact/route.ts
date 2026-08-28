import { promises as dns } from "node:dns";
import { Resend } from "resend";
import { buildClientEmail, buildOwnerEmail, type InquirySummary } from "@/lib/emails";
import { DURATION_VALUES, splitName } from "@/lib/inquiry";
import { isPhoneValid } from "@/lib/leadCapture";
import { BUSINESS } from "@/lib/site";
import { getServiceClient } from "@/lib/supabase";
import { formatCityState, parseCityState, type CityState } from "@/lib/usStates";

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

  const name = str(body.name).replace(/\s+/g, " ");
  const { firstName, lastName } = splitName(name);
  const leadId = str(body.leadId);
  const email = str(body.email);
  const phone = str(body.phone);
  const note = str(body.note);
  const length = str(body.length);
  const locationType = str(body.locationType);
  const cityState = str(body.cityState);
  const preferredTime = str(body.preferredTime);

  const errors: Record<string, string> = {};

  if (name.length < 2) errors.name = "Enter your name.";
  if (phone === "") {
    errors.phone = "Enter your phone number.";
  } else if (!isPhoneValid(phone)) {
    errors.phone = "Enter a complete 10-digit US phone number.";
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
  let location: CityState | null = null;
  if (locationType === "client") {
    location = parseCityState(cityState);
    if (!location) {
      errors.cityState = "Enter the city and state you're in, e.g. Bowie, MD.";
    }
  }
  if (preferredTime === "") errors.preferredTime = "Let me know when.";
  if (
    name.length > 200 ||
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

  // Non-null past validation whenever locationType === "client".
  const locationLabel = location ? formatCityState(location) : "studio";

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
    last_name: lastName || null,
    email,
    phone,
    service: length,
    location_type: locationType,
    // `zip` is retained in the table but no longer collected. Written null so a
    // promoted partial row can never carry a stale value.
    zip: null,
    city: location ? locationLabel : null,
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

  const summary: InquirySummary = {
    name,
    email,
    phone,
    length,
    locationLabel,
    atClientLocation: locationType === "client",
    preferredTime,
    note,
    emailStatus,
  };

  // The inquiry is already saved. Email problems are logged, never surfaced to
  // the visitor and never allowed to fail the request — but they must not be
  // invisible either, which is what the previous bare `catch {}` made them.
  const FROM = `${BUSINESS.name} <noreply@carmengem.com>`;

  // A domain with no mail server will hard-bounce, and bounces on a sending
  // domain this new are what get a Resend account suspended. Carmen's
  // notification still goes out and carries the warning in its own copy.
  const sendClient = emailStatus === "ok";
  if (!sendClient) {
    console.warn("[contact] client confirmation skipped, no mail server:", email);
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const owner = buildOwnerEmail(summary);
    const client = buildClientEmail(summary);

    const [ownerResult, clientResult] = await Promise.allSettled([
      resend.emails.send({
        from: FROM,
        to: process.env.OWNER_EMAIL ?? "",
        replyTo: email,
        subject: owner.subject,
        text: owner.text,
        html: owner.html,
      }),
      sendClient
        ? resend.emails.send({
            from: FROM,
            to: email,
            replyTo: BUSINESS.email,
            subject: client.subject,
            text: client.text,
            html: client.html,
          })
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (ownerResult.status === "rejected") {
      console.error("[contact] owner email failed:", ownerResult.reason);
    } else if (ownerResult.value.error) {
      console.error("[contact] owner email rejected:", ownerResult.value.error);
    }

    if (clientResult.status === "rejected") {
      console.error("[contact] client email failed:", clientResult.reason);
    } else if (clientResult.value.error) {
      console.error("[contact] client email rejected:", clientResult.value.error);
    }
  } catch (error) {
    console.error("[contact] email step failed:", error);
  }

  return Response.json({ ok: true });
}
