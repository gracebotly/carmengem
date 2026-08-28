import { BUSINESS } from "@/lib/site";

/**
 * Everything both emails need, assembled once in the route so the client's
 * copy and the owner's copy can never disagree about what was submitted.
 */
export type InquirySummary = {
  name: string;
  email: string;
  phone: string;
  /** Session length, e.g. "2 hours". */
  length: string;
  /** "My studio in Bowie", or the client's "Bowie, MD". */
  locationLabel: string;
  atClientLocation: boolean;
  /** Already-formatted phrase, e.g. "Friday, September 4 at 3:30 PM". */
  preferredTime: string;
  note: string;
  emailStatus: "ok" | "no_mx";
};

export type BuiltEmail = {
  subject: string;
  text: string;
  html: string;
};

/**
 * Pulled from app/globals.css so the emails read as the same brand as the
 * site. Mail clients cannot resolve CSS custom properties, so the hex values
 * are duplicated here on purpose. If a token changes there, change it here.
 */
const COLOR = {
  shell: "#F7F2ED",
  ink: "#2E2724",
  stone: "#6E6058",
  sand: "#A8907F",
  line: "#CBBBAE",
  rose: "#B5697A",
};

/** Label / value pairs, shared by both messages. */
function detailRows(summary: InquirySummary): [string, string][] {
  return [
    ["Name", summary.name],
    ["Email", summary.email],
    ["Phone", summary.phone],
    ["Session", summary.length],
    [summary.atClientLocation ? "Your location" : "Location", summary.locationLabel],
    ["When", summary.preferredTime],
    ["Notes", summary.note || "—"],
  ];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textBlock(rows: [string, string][]): string {
  return rows.map(([label, value]) => `${label}: ${value}`).join("\n");
}

/** A clickable address, safe to drop into the outro slot. */
function mailtoLink(address: string): string {
  const safe = escapeHtml(address);
  return `<a href="mailto:${safe}" style="color:${COLOR.rose};">${safe}</a>`;
}

/**
 * Inline styles only — every mail client strips <style> blocks, and many strip
 * classes. Kept to one column so it reads on a phone without zooming.
 *
 * `preheader` is the grey line the inbox shows next to the subject. Without
 * one, Gmail previews the first visible text, which is the "CARMEN GEM"
 * eyebrow — useless. It is hidden in the body and shown only in the preview.
 *
 * `outroHtml` is trusted markup built by the functions below, not user input,
 * so it is inserted unescaped — that is what allows a real mailto link. Every
 * value that comes from the visitor still goes through escapeHtml().
 */
function htmlShell(
  heading: string,
  preheader: string,
  intro: string,
  rows: [string, string][],
  outroHtml: string
): string {
  const cells = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${COLOR.line};color:${COLOR.sand};font-size:12px;letter-spacing:0.12em;text-transform:uppercase;vertical-align:top;width:38%;">${escapeHtml(label)}</td>
        <td style="padding:10px 0;border-bottom:1px solid ${COLOR.line};color:${COLOR.ink};font-size:15px;vertical-align:top;">${escapeHtml(value)}</td>
      </tr>`
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${COLOR.shell};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
    <div style="max-width:560px;margin:0 auto;padding:40px 24px;font-family:Georgia,'Times New Roman',serif;color:${COLOR.ink};">
      <p style="margin:0 0 28px;font-size:13px;letter-spacing:0.22em;text-transform:uppercase;color:${COLOR.sand};">${escapeHtml(BUSINESS.name)}</p>
      <h1 style="margin:0 0 18px;font-size:26px;font-weight:normal;line-height:1.25;">${escapeHtml(heading)}</h1>
      <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:${COLOR.stone};">${escapeHtml(intro)}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border-top:1px solid ${COLOR.line};">
        ${cells}
      </table>
      <p style="margin:28px 0 0;font-size:15px;line-height:1.7;color:${COLOR.stone};">${outroHtml}</p>
    </div>
  </body>
</html>`;
}

/**
 * Sent to Carmen. replyTo is the client, so replying reaches them — and the
 * outro names the address outright rather than assuming she trusts the button.
 */
export function buildOwnerEmail(summary: InquirySummary): BuiltEmail {
  const rows = detailRows(summary);

  const outroText =
    summary.emailStatus === "no_mx"
      ? `Heads up: ${summary.email} has no mail server, so no confirmation was sent to them and a reply will bounce. Reach them at ${summary.phone}.`
      : `Reply to this message and it goes straight to ${summary.email}.`;

  const outroHtml =
    summary.emailStatus === "no_mx"
      ? `Heads up: ${mailtoLink(summary.email)} has no mail server, so no confirmation was sent to them and a reply will bounce. Reach them at ${escapeHtml(summary.phone)}.`
      : `Reply to this message and it goes straight to ${mailtoLink(summary.email)}.`;

  const intro = `${summary.name} just sent an inquiry through the site.`;

  return {
    subject: `New inquiry — ${summary.name}, ${summary.length}, ${summary.preferredTime}`,
    text: [`New inquiry from ${summary.name}`, "", textBlock(rows), "", outroText].join("\n"),
    html: htmlShell(
      "New inquiry",
      `${summary.length}, ${summary.preferredTime}`,
      intro,
      rows,
      outroHtml
    ),
  };
}

/**
 * Sent to the client. Says "received" rather than "confirmed" — Carmen replies
 * personally to settle the time, so the form itself never promises a slot.
 *
 * The closing line names Carmen's address instead of saying "reply to this
 * message": the visible sender is noreply@, and telling someone to reply to a
 * noreply address reads as broken even though replyTo is set correctly.
 */
export function buildClientEmail(summary: InquirySummary): BuiltEmail {
  const firstName = summary.name.trim().split(" ")[0] || "there";
  const rows = detailRows(summary);
  const intro =
    "Your inquiry has reached me and I will reply personally to confirm a time. Below is a record of what you sent.";

  return {
    subject: `Your inquiry — ${BUSINESS.name}`,
    text: [
      `Thank you, ${firstName}.`,
      "",
      intro,
      "",
      textBlock(rows),
      "",
      `If anything above is wrong, email me at ${BUSINESS.email} and I will correct it.`,
      "",
      BUSINESS.name,
    ].join("\n"),
    html: htmlShell(
      `Thank you, ${firstName}.`,
      "I have your inquiry and will reply personally to confirm a time.",
      intro,
      rows,
      `If anything above is wrong, email me at ${mailtoLink(BUSINESS.email)} and I will correct it.`
    ),
  };
}
