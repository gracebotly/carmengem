"use client";

import { useEffect, useRef, useState } from "react";
import {
  DURATION_OPTIONS,
  EMPTY_DRAFT,
  HOURS,
  INQUIRE_VALUE,
  LOCATION_OPTIONS,
  MERIDIEMS,
  MINUTES,
  isDraftReady,
  timingPhrase,
  type InquiryDraft,
} from "@/lib/inquiry";
import {
  LEAD_ID_KEY,
  formatPhone,
  isEmailValid,
  saveLead,
  suggestEmail,
} from "@/lib/leadCapture";

type Status = "idle" | "submitting" | "success" | "error";

const FIELD =
  "w-full border-b border-line bg-transparent py-2.5 text-base font-light text-ink outline-none transition-colors placeholder:text-sand focus:border-rose";

const CHIP_BASE =
  "eyebrow border px-4 py-2.5 transition-colors focus-visible:outline-none";
const CHIP_ON = "border-rose bg-rose/10 text-ink";
const CHIP_OFF = "border-line text-stone hover:border-sand hover:text-ink";

function chip(active: boolean) {
  return `${CHIP_BASE} ${active ? CHIP_ON : CHIP_OFF}`;
}

export default function ContactForm() {
  const [draft, setDraft] = useState<InquiryDraft>(EMPTY_DRAFT);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const leadIdRef = useRef<string | null>(null);
  const lastSavedRef = useRef("");
  const suggestion = suggestEmail(draft.email);

  const ready = isDraftReady(draft);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(LEAD_ID_KEY);
    if (stored) leadIdRef.current = stored;
  }, []);

  // Email alone triggers capture. Phone is optional and joins the same row later.
  useEffect(() => {
    if (status === "success") return;
    if (honeypot.length > 0) return;
    if (!isEmailValid(draft.email)) return;

    const signature = [
      draft.firstName.trim(),
      draft.lastName.trim(),
      draft.email.trim(),
      draft.phone.trim(),
    ].join("|");

    if (signature === lastSavedRef.current) return;

    const timer = window.setTimeout(async () => {
      lastSavedRef.current = signature;
      const id = await saveLead({
        firstName: draft.firstName,
        lastName: draft.lastName,
        email: draft.email,
        phone: draft.phone,
        leadId: leadIdRef.current,
        company: honeypot,
      });
      if (id) {
        leadIdRef.current = id;
        window.sessionStorage.setItem(LEAD_ID_KEY, id);
      }
    }, 900);

    return () => window.clearTimeout(timer);
  }, [draft.firstName, draft.lastName, draft.email, draft.phone, honeypot, status]);

  function update(field: keyof InquiryDraft, value: string) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrors({});
    setNotice("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          preferredTime: timingPhrase(draft),
          leadId: leadIdRef.current,
          company: honeypot,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setErrors(result.errors ?? {});
        setNotice(result.error ?? "");
        setStatus("error");
        return;
      }

      window.sessionStorage.removeItem(LEAD_ID_KEY);
      setStatus("success");
    } catch {
      setNotice("Something went wrong. Try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="mt-12 max-w-lg text-base font-light leading-[1.75] text-stone">
        Thank you. Your inquiry is in — I&rsquo;ll text you back shortly to confirm a time.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-12 max-w-lg" noValidate>
      <input
        type="text"
        name="company"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />

      <p className="eyebrow text-sand">Your details</p>

      <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="eyebrow text-sand">First name</label>
          <input id="firstName" type="text" autoComplete="given-name" className={FIELD} value={draft.firstName} onChange={(e) => update("firstName", e.target.value)} />
          {errors.firstName && <p className="mt-2 text-sm text-rose">{errors.firstName}</p>}
        </div>
        <div>
          <label htmlFor="lastName" className="eyebrow text-sand">Last name</label>
          <input id="lastName" type="text" autoComplete="family-name" className={FIELD} value={draft.lastName} onChange={(e) => update("lastName", e.target.value)} />
          {errors.lastName && <p className="mt-2 text-sm text-rose">{errors.lastName}</p>}
        </div>
        <div>
          <label htmlFor="email" className="eyebrow text-sand">Email</label>
          <input id="email" type="email" inputMode="email" autoComplete="email" className={FIELD} value={draft.email} onChange={(e) => update("email", e.target.value)} />
          {suggestion && (
            <button type="button" onClick={() => update("email", suggestion)} className="mt-2 text-left text-sm font-light text-rose underline underline-offset-4">
              Did you mean {suggestion}?
            </button>
          )}
          {errors.email && <p className="mt-2 text-sm text-rose">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="eyebrow text-sand">Phone</label>
          <input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(301) 555-0142" className={FIELD} value={draft.phone} onChange={(e) => update("phone", formatPhone(e.target.value))} />
          <p className="mt-2 text-sm font-light text-sand">Fastest way to reach you.</p>
          {errors.phone && <p className="mt-2 text-sm text-rose">{errors.phone}</p>}
        </div>
      </div>

      <div className="mt-14 border-t border-line pt-12">
        <p className="eyebrow text-sand">The session</p>
      </div>

      <fieldset className="mt-9">
        <legend className="eyebrow text-sand">Session length</legend>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {DURATION_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={draft.length === option.value}
              onClick={() => update("length", option.value)}
              className={chip(draft.length === option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        {draft.length === INQUIRE_VALUE && (
          <p className="mt-3 text-sm font-light leading-[1.7] text-sand">
            Tell me what you have in mind below and I&rsquo;ll come back to you with pricing.
          </p>
        )}
        {errors.length && <p className="mt-2 text-sm text-rose">{errors.length}</p>}
      </fieldset>

      <fieldset className="mt-9">
        <legend className="eyebrow text-sand">Where does your session begin?</legend>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {LOCATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={draft.locationType === option.value}
              onClick={() => update("locationType", option.value)}
              className={chip(draft.locationType === option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        {errors.locationType && (
          <p className="mt-2 text-sm text-rose">{errors.locationType}</p>
        )}
      </fieldset>

      {draft.locationType === "client" && (
        <div className="mt-7">
          <label htmlFor="zip" className="eyebrow text-sand">Zip code</label>
          <input
            id="zip"
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder="20774"
            className={`${FIELD} max-w-[9rem]`}
            value={draft.zip}
            onChange={(e) => update("zip", e.target.value.replace(/\D/g, ""))}
          />
          {errors.zip && <p className="mt-2 text-sm text-rose">{errors.zip}</p>}
        </div>
      )}

      <fieldset className="mt-9">
        <legend className="eyebrow text-sand">When works?</legend>
        <div className="mt-3 flex flex-wrap gap-2.5">
          <button
            type="button"
            aria-pressed={draft.timing === "asap"}
            onClick={() => update("timing", "asap")}
            className={chip(draft.timing === "asap")}
          >
            As soon as you have an opening
          </button>
          <button
            type="button"
            aria-pressed={draft.timing === "scheduled"}
            onClick={() => update("timing", "scheduled")}
            className={chip(draft.timing === "scheduled")}
          >
            Pick a date
          </button>
        </div>
        {errors.preferredTime && (
          <p className="mt-2 text-sm text-rose">{errors.preferredTime}</p>
        )}
      </fieldset>

      {draft.timing === "scheduled" && (
        <div className="mt-7 grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-[1fr_auto_auto_auto]">
          <div>
            <label htmlFor="date" className="eyebrow text-sand">Date</label>
            <input
              id="date"
              type="date"
              className={FIELD}
              value={draft.date}
              onChange={(e) => update("date", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="hour" className="eyebrow text-sand">Hour</label>
            <select
              id="hour"
              className={`${FIELD} min-w-[4.5rem]`}
              value={draft.hour}
              onChange={(e) => update("hour", e.target.value)}
            >
              <option value="">--</option>
              {HOURS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="minute" className="eyebrow text-sand">Min</label>
            <select
              id="minute"
              className={`${FIELD} min-w-[4.5rem]`}
              value={draft.minute}
              onChange={(e) => update("minute", e.target.value)}
            >
              <option value="">--</option>
              {MINUTES.map((m) => (
                <option key={m} value={m}>:{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="meridiem" className="eyebrow text-sand">AM / PM</label>
            <select
              id="meridiem"
              className={`${FIELD} min-w-[4.5rem]`}
              value={draft.meridiem}
              onChange={(e) => update("meridiem", e.target.value)}
            >
              <option value="">--</option>
              {MERIDIEMS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="mt-9">
        <label htmlFor="note" className="eyebrow text-sand">
          Anything I should know{" "}
          <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          id="note"
          rows={2}
          placeholder="Injuries, areas to focus on, what you're hoping for."
          className={`${FIELD} resize-none`}
          value={draft.note}
          onChange={(e) => update("note", e.target.value)}
        />
      </div>

      {notice && <p className="mt-6 text-sm text-rose">{notice}</p>}

      <button
        type="submit"
        disabled={!ready || status === "submitting"}
        className="eyebrow mt-12 border-b border-rose pb-1.5 text-ink transition-colors hover:text-rose disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === "submitting" ? "Sending" : "Send inquiry"}
      </button>
    </form>
  );
}
