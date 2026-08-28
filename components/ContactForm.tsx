"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import {
  DURATION_OPTIONS,
  EMPTY_DRAFT,
  INQUIRE_VALUE,
  LOCATION_OPTIONS,
  TIMING_OPTIONS,
  HOURS,
  MERIDIEMS,
  MINUTES,
  isDraftReady,
  splitName,
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
import { formatCityState, parseCityState } from "@/lib/usStates";

type Status = "idle" | "submitting" | "success" | "error";

const FIELD_BASE =
  "w-full border-b border-line bg-transparent py-2.5 text-base font-light outline-none transition-colors placeholder:text-sand focus:border-rose";

const FIELD = `${FIELD_BASE} text-ink`;

const SELECT_BASE = `${FIELD_BASE} cursor-pointer appearance-none pr-7`;

/**
 * Visual marker for a field the form will not submit without. Hidden from
 * screen readers — they get the same information from the input's own
 * `required` attribute, and hearing "star" after every label is noise.
 */
function Required() {
  return (
    <span aria-hidden="true" className="text-rose">
      {" "}*
    </span>
  );
}

type SelectFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  required?: boolean;
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
  required = false,
  hint,
  error,
}: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow text-sand">
        {label}
        {required && <Required />}
      </label>
      <div className="relative mt-1">
        <select
          id={id}
          value={value}
          required={required}
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
      draft.name.trim(),
      draft.email.trim(),
      draft.phone.trim(),
    ].join("|");

    if (signature === lastSavedRef.current) return;

    const timer = window.setTimeout(async () => {
      lastSavedRef.current = signature;
      const { firstName, lastName } = splitName(draft.name);
      const id = await saveLead({
        firstName,
        lastName,
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
  }, [draft.name, draft.email, draft.phone, honeypot, status]);

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
    const firstName = draft.name.trim().split(" ")[0] || "there";
    const locationLabel =
      draft.locationType === "client"
        ? draft.cityState
        : LOCATION_OPTIONS.find((o) => o.value === draft.locationType)?.label ?? "";

    const summaryRows: [string, string][] = [
      ["Session", draft.length],
      [draft.locationType === "client" ? "Your location" : "Location", locationLabel],
      ["When", timingPhrase(draft)],
      ["Email", draft.email],
      ["Phone", draft.phone],
    ];

    return (
      <div className="max-w-lg">
        <p className="font-display text-[26px] leading-[1.25] text-ink md:text-[32px]">
          Thank you, {firstName}.
        </p>
        <p className="mt-5 text-base font-light leading-[1.75] text-stone">
          Your inquiry has reached me. I&rsquo;ll reply personally to confirm a
          time. A copy of the details below is on its way to {draft.email}.
        </p>

        <dl className="mt-10 border-t border-line">
          {summaryRows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-6 border-b border-line py-3.5"
            >
              <dt className="eyebrow shrink-0 text-sand">{label}</dt>
              <dd className="text-right text-base font-light text-ink">
                {value || "—"}
              </dd>
            </div>
          ))}
        </dl>

        {draft.note && (
          <p className="mt-6 text-sm font-light leading-[1.7] text-sand">
            Your note: {draft.note}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg" noValidate>
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

      <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="eyebrow text-sand">
            Name
            <Required />
          </label>
          <input id="name" type="text" required autoComplete="name" className={FIELD} value={draft.name} onChange={(e) => update("name", e.target.value)} />
          {errors.name && <p className="mt-2 text-sm text-rose">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="eyebrow text-sand">
            Email
            <Required />
          </label>
          <input id="email" type="email" required inputMode="email" autoComplete="email" className={FIELD} value={draft.email} onChange={(e) => update("email", e.target.value)} />
          {suggestion && (
            <button type="button" onClick={() => update("email", suggestion)} className="mt-2 text-left text-sm font-light text-rose underline underline-offset-4">
              Did you mean {suggestion}?
            </button>
          )}
          {errors.email && <p className="mt-2 text-sm text-rose">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="eyebrow text-sand">
            Phone
            <Required />
          </label>
          <input id="phone" type="tel" required inputMode="tel" autoComplete="tel" className={FIELD} value={draft.phone} onChange={(e) => update("phone", formatPhone(e.target.value))} />
          {errors.phone && <p className="mt-2 text-sm text-rose">{errors.phone}</p>}
        </div>
      </div>

      <div className="mt-7 space-y-7">
        <SelectField
          id="length"
          label="Session length"
          placeholder="Choose a length"
          value={draft.length}
          onChange={(value) => update("length", value)}
          required
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
          required
          options={LOCATION_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          error={errors.locationType}
        />

        {draft.locationType === "client" && (
          <div>
            <label htmlFor="cityState" className="eyebrow text-sand">
              City and state
              <Required />
            </label>
            <input
              id="cityState"
              type="text"
              required
              autoComplete="address-level2"
              maxLength={80}
              placeholder="Bowie, MD"
              className={FIELD}
              value={draft.cityState}
              onChange={(e) => update("cityState", e.target.value)}
              onBlur={(e) => {
                const parsed = parseCityState(e.target.value);
                if (parsed) update("cityState", formatCityState(parsed));
              }}
            />
            {errors.cityState && (
              <p className="mt-2 text-sm text-rose">{errors.cityState}</p>
            )}
          </div>
        )}

        <SelectField
          id="timing"
          label="When works?"
          placeholder="Choose when"
          value={draft.timing}
          onChange={(value) => update("timing", value)}
          required
          options={TIMING_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          error={errors.preferredTime}
        />

        {draft.timing === "scheduled" && (
          <div className="space-y-7">
            <div className="sm:max-w-xs">
              <label htmlFor="date" className="eyebrow text-sand">
                Date
                <Required />
              </label>
              <input
                id="date"
                type="date"
                required
                className={FIELD}
                value={draft.date}
                onChange={(e) => update("date", e.target.value)}
              />
            </div>

            {/* Three short lists read faster than one long one. */}
            <div className="grid max-w-xs grid-cols-3 gap-x-3">
              <SelectField
                id="hour"
                label="Hour"
                placeholder="--"
                value={draft.hour}
                onChange={(value) => update("hour", value)}
                required
                options={HOURS.map((hour) => ({ value: hour, label: hour }))}
              />
              <SelectField
                id="minute"
                label="Min"
                placeholder="--"
                value={draft.minute}
                onChange={(value) => update("minute", value)}
                required
                options={MINUTES.map((minute) => ({
                  value: minute,
                  label: `:${minute}`,
                }))}
              />
              <SelectField
                id="meridiem"
                label="AM/PM"
                placeholder="--"
                value={draft.meridiem}
                onChange={(value) => update("meridiem", value)}
                required
                options={MERIDIEMS.map((meridiem) => ({
                  value: meridiem,
                  label: meridiem,
                }))}
              />
            </div>
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
