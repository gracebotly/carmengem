export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmailValid(value: string): boolean {
  const email = value.trim();
  return email.length <= 200 && EMAIL_RE.test(email);
}

/**
 * A real, dialable US number: exactly ten digits, with a valid area code and
 * exchange. NANP forbids 0 or 1 as the first digit of either, so this rejects
 * the junk people type to get past a required field — (111) 111-1111,
 * (000) 000-0000 — while accepting every genuine US number.
 *
 * International numbers are intentionally not accepted; this is a Bowie, MD
 * practice and an unreachable number is worse than a lost inquiry.
 */
export function isPhoneValid(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 10) return false;
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(digits);
}

/** Formats US numbers as (301) 555-0142 while typing. Leaves other lengths alone. */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

const COMMON_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "aol.com",
  "comcast.net",
  "verizon.net",
  "me.com",
];

function editDistance(a: string, b: string): number {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j += 1) rows[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
    }
  }
  return rows[a.length][b.length];
}

/**
 * Returns a corrected address when the domain is one typo away from a common one.
 * Returns null when the domain is already correct or too far from any known domain.
 */
export function suggestEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  if (!isEmailValid(email)) return null;

  const at = email.lastIndexOf("@");
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);

  if (COMMON_DOMAINS.includes(domain)) return null;

  for (const candidate of COMMON_DOMAINS) {
    // Distance 1 only. Distance 2 produces false positives on real domains.
    if (editDistance(domain, candidate) === 1) return `${local}@${candidate}`;
  }
  return null;
}

export type LeadPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  leadId: string | null;
  company: string;
};

/** Fire-and-forget partial save. Returns the row id, or null if it did not land. */
export async function saveLead(payload: LeadPayload): Promise<string | null> {
  try {
    const response = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return null;
    const result = (await response.json()) as { leadId?: string };
    return result.leadId ?? null;
  } catch {
    return null;
  }
}

export const LEAD_ID_KEY = "cg_lead_id";
