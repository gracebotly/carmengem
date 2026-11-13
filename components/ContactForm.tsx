"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import {
  DURATION_OPTIONS, EMPTY_DRAFT, VIRTUAL_DURATIONS, VIRTUAL_FORMATS,
  SCREENING_OPTIONS, ID_NOTE, localDate, inquiryPayload, inquiryDetails,
  isDraftReady, validateInquiry, splitName, type InquiryDraft,
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

  // Preserve the existing partial-lead capture before final submission.
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
    setDraft((prev) => field === "experience"
      ? { ...EMPTY_DRAFT, name: prev.name, email: prev.email, phone: prev.phone, experience: value as InquiryDraft["experience"] }
      : { ...prev, [field]: value, ...(field === "screeningMethod" ? { screeningValue: "" } : {}) });
    setErrors({});
    setNotice("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    const validation = validateInquiry(draft);
    if (Object.keys(validation).length) { setErrors(validation); return; }
    setStatus("submitting");
    setErrors({});
    setNotice("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...inquiryPayload(draft),
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
    const summaryRows: [string, string][] = [
      ...inquiryDetails(draft), ["Email", draft.email], ["Phone", draft.phone],
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
        <fieldset>
          <legend className="eyebrow text-sand">What type of experience are you interested in?<Required /></legend>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {([ ["virtual", "Virtual"], ["in-person", "In person"] ] as const).map(([value, label]) => (
              <label key={value} className="relative cursor-pointer">
                <input type="radio" name="experience" value={value} required checked={draft.experience === value} onChange={() => update("experience", value)} className="peer sr-only" />
                <span className="eyebrow block border border-line px-3 py-4 text-center text-ink transition-colors peer-checked:border-rose peer-checked:bg-rose/10 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-rose">{label}</span>
              </label>
            ))}
          </div>
          {errors.experience && <p role="alert" className="mt-2 text-sm text-rose">{errors.experience}</p>}
        </fieldset>

        {draft.experience === "virtual" && <>
          <SelectField id="length" label="Session length" placeholder="Choose a length" value={draft.length} onChange={value => update("length", value)} required options={VIRTUAL_DURATIONS.map(value => ({ value, label: value }))} error={errors.length} />
          <fieldset>
            <legend className="eyebrow text-sand">Preferred virtual format<Required /></legend>
            <div className="mt-3 space-y-3">
              {VIRTUAL_FORMATS.map(value => <label key={value} className="flex cursor-pointer items-center gap-3 text-base font-light text-ink">
                <input type="radio" name="virtualFormat" value={value} required checked={draft.virtualFormat === value} onChange={() => update("virtualFormat", value)} className="accent-rose" />{value}
              </label>)}
            </div>
            {errors.virtualFormat && <p role="alert" className="mt-2 text-sm text-rose">{errors.virtualFormat}</p>}
          </fieldset>
        </>}

        {draft.experience === "in-person" && <fieldset>
          <legend className="eyebrow text-sand">Choose one screening method<Required /></legend>
          <div className="mt-3 space-y-3">
            {SCREENING_OPTIONS.map(({ value, label }) => <label key={value} className="flex cursor-pointer items-center gap-3 text-base font-light text-ink">
              <input type="radio" name="screeningMethod" value={value} required checked={draft.screeningMethod === value} onChange={() => update("screeningMethod", value)} className="accent-rose" />{label}
            </label>)}
          </div>
          {errors.screeningMethod && <p role="alert" className="mt-2 text-sm text-rose">{errors.screeningMethod}</p>}
          {draft.screeningMethod === "government-id" && <p className="mt-4 text-sm font-light leading-[1.7] text-stone">{ID_NOTE}</p>}
          {["linkedin", "website", "professional-email"].includes(draft.screeningMethod) && <div className="mt-5">
            <label htmlFor="screeningValue" className="eyebrow text-sand">{draft.screeningMethod === "linkedin" ? "LinkedIn profile" : draft.screeningMethod === "website" ? "Professional website or profile" : "Professional email address"}<Required /></label>
            <input id="screeningValue" type={draft.screeningMethod === "professional-email" ? "email" : "url"} required maxLength={2000} placeholder={draft.screeningMethod === "linkedin" ? "Link to your LinkedIn profile" : draft.screeningMethod === "website" ? "Enter your professional website or profile URL" : "name@company.com"} className={FIELD} value={draft.screeningValue} onChange={e => update("screeningValue", e.target.value)} />
            {errors.screeningValue && <p role="alert" className="mt-2 text-sm text-rose">{errors.screeningValue}</p>}
          </div>}
        </fieldset>}

        {draft.experience && <>
          <div>
            <label htmlFor="date" className="eyebrow text-sand">Preferred date<Required /></label>
            <input id="date" type="date" required min={localDate()} className={FIELD} value={draft.date} onClick={e => { try { e.currentTarget.showPicker?.(); } catch { /* Native picker remains available via keyboard. */ } }} onChange={e => update("date", e.target.value)} />
            {errors.date && <p role="alert" className="mt-2 text-sm text-rose">{errors.date}</p>}
          </div>
          {draft.experience === "in-person" && <>
            <div>
              <label htmlFor="cityState" className="eyebrow text-sand">City/state of date<Required /></label>
              <input id="cityState" type="text" required maxLength={200} autoComplete="address-level2" placeholder="Enter your city and state" className={FIELD} value={draft.cityState} onChange={e => update("cityState", e.target.value)} />
              {errors.cityState && <p role="alert" className="mt-2 text-sm text-rose">{errors.cityState}</p>}
            </div>
            <SelectField id="length" label="Length of date" placeholder="Choose a length" value={draft.length} onChange={value => update("length", value)} required options={DURATION_OPTIONS.map(value => ({ value, label: value }))} error={errors.length} />
          </>}
          <div>
            <label htmlFor="preferredTime" className="eyebrow text-sand">{draft.experience === "virtual" ? "Preferred time" : "Approximate time range of date"}<Required /></label>
            <input id="preferredTime" type={draft.experience === "virtual" ? "time" : "text"} required maxLength={200} placeholder={draft.experience === "in-person" ? "e.g. 5:00 PM – 7:00 PM" : undefined} className={FIELD} value={draft.preferredTime} onChange={e => update("preferredTime", e.target.value)} />
            {errors.preferredTime && <p role="alert" className="mt-2 text-sm text-rose">{errors.preferredTime}</p>}
          </div>
          <div>
            <label htmlFor="note" className="eyebrow text-sand">Additional details <span className="normal-case tracking-normal">(optional)</span></label>
            <textarea id="note" rows={2} maxLength={4000} placeholder="Anything else you'd like me to know?" className={`${FIELD} resize-none`} value={draft.note} onChange={e => update("note", e.target.value)} />
            {errors.note && <p role="alert" className="mt-2 text-sm text-rose">{errors.note}</p>}
          </div>
        </>}
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
