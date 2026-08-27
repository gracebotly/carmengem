"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import {
  DURATION_OPTIONS,
  EMPTY_DRAFT,
  INQUIRE_VALUE,
  LOCATION_OPTIONS,
  TIMING_OPTIONS,
  TIME_SLOTS,
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

const FIELD_BASE =
  "w-full border-b border-line bg-transparent py-2.5 text-base font-light outline-none transition-colors placeholder:text-sand focus:border-rose";

const FIELD = `${FIELD_BASE} text-ink`;

const SELECT_BASE = `${FIELD_BASE} cursor-pointer appearance-none pr-7`;

type SelectFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  hint?: ReactNode;
  error?: string;
};

function SelectField({
  id,
  label,
  placeholder,
  value,
  options,
  onChange,
  hint,
  error,
}: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow text-sand">
        {label}
      </label>
      <div className="relative mt-1">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${SELECT_BASE} ${value === "" ? "text-sand" : "text-ink"}`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-sand"
        />
      </div>
      {hint && (
        <p className="mt-2 text-sm font-light leading-[1.7] text-sand">{hint}</p>
      )}
      {error && <p className="mt-2 text-sm text-rose">{error}</p>}
    </div>
  );
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

      <div className="mt-9 space-y-7">
        <SelectField
          id="length"
          label="Session length"
          placeholder="Choose a length"
          value={draft.length}
          onChange={(value) => update("length", value)}
          options={DURATION_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          hint={
            draft.length === INQUIRE_VALUE
              ? "Tell me what you have in mind below and I’ll come back to you with pricing."
              : undefined
          }
          error={errors.length}
        />

        <SelectField
          id="locationType"
          label="Where does your session begin?"
          placeholder="Choose a location"
          value={draft.locationType}
          onChange={(value) => update("locationType", value)}
          options={LOCATION_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          error={errors.locationType}
        />

        {draft.locationType === "client" && (
          <div>
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

        <SelectField
          id="timing"
          label="When works?"
          placeholder="Choose when"
          value={draft.timing}
          onChange={(value) => update("timing", value)}
          options={TIMING_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          error={errors.preferredTime}
        />

        {draft.timing === "scheduled" && (
          <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2">
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
            <SelectField
              id="time"
              label="Time"
              placeholder="Choose a time"
              value={draft.time}
              onChange={(value) => update("time", value)}
              options={TIME_SLOTS.map((slot) => ({ value: slot, label: slot }))}
            />
          </div>
        )}

        <div>
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
