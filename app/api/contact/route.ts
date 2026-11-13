import { promises as dns } from "node:dns";
import { Resend } from "resend";
import { buildClientEmail, buildOwnerEmail, type InquirySummary } from "@/lib/emails";
import { EMPTY_DRAFT, inquiryPayload, splitName, validateInquiry, type InquiryDraft } from "@/lib/inquiry";
import { BUSINESS } from "@/lib/site";
import { getServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid request");
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof body.company === "string" && body.company.length > 0) {
    return Response.json({ ok: true });
  }

  const values = Object.fromEntries(Object.keys(EMPTY_DRAFT).map(key => [key, str(body[key])])) as InquiryDraft;
  const draft = { ...EMPTY_DRAFT, ...inquiryPayload(values) };
  const errors = validateInquiry(draft);
  if (Object.keys(errors).length > 0) {
    return Response.json({ errors }, { status: 400 });
  }
  const name = draft.name.replace(/\s+/g, " ");
  const { firstName, lastName } = splitName(name);
  const leadId = str(body.leadId);
  const { email, phone, note, length } = draft;
  const preferredTime = `${draft.date} at ${draft.preferredTime}`;

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
    location_type: draft.experience === "in-person" ? "client" : null,
    experience: draft.experience,
    virtual_format: draft.virtualFormat || null,
    screening_method: draft.screeningMethod || null,
    screening_value: draft.screeningValue || null,
    preferred_date: draft.date,
    // `zip` is retained in the table but no longer collected. Written null so a
    // promoted partial row can never carry a stale value.
    zip: null,
    city: draft.cityState || null,
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

  const summary: InquirySummary = { ...draft, name, emailStatus };

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
