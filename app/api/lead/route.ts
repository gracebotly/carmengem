import { getServiceClient } from "@/lib/supabase";
import { isEmailValid } from "@/lib/leadCapture";

export const runtime = "nodejs";

const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 12;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_HITS;
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: true });
  }

  if (typeof body.company === "string" && body.company.length > 0) {
    return Response.json({ ok: true });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) return Response.json({ ok: true });

  const firstName = str(body.firstName).slice(0, 100);
  const lastName = str(body.lastName).slice(0, 100);
  const email = str(body.email).slice(0, 200);
  const phone = str(body.phone).slice(0, 40);
  const leadId = str(body.leadId);

  // Email alone gates the save. Phone is optional and must never block capture.
  if (!isEmailValid(email)) return Response.json({ ok: true });

  const fields = {
    first_name: firstName || null,
    last_name: lastName || null,
    name: [firstName, lastName].filter(Boolean).join(" ") || null,
    email,
    phone: phone || null,
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = getServiceClient();

    if (leadId) {
      const { data, error } = await supabase
        .from("inquiries")
        .update(fields)
        .eq("id", leadId)
        .eq("status", "partial")
        .select("id")
        .maybeSingle();

      if (error) throw error;
      if (data) return Response.json({ ok: true, leadId: data.id });
    }

    const { data, error } = await supabase
      .from("inquiries")
      .insert({ ...fields, status: "partial" })
      .select("id")
      .single();

    if (error) throw error;
    return Response.json({ ok: true, leadId: data.id });
  } catch {
    return Response.json({ ok: true });
  }
}
