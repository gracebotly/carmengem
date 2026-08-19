"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessageSquare } from "lucide-react";
import { SERVICES } from "@/lib/services";
import {
  EMPTY_DRAFT,
  LOCATION_OPTIONS,
  buildTextMessage,
  isDraftReady,
  smsHref,
  type InquiryDraft,
} from "@/lib/inquiry";

type Status = "idle" | "submitting" | "success" | "error";

const FIELD =
  "w-full border-b border-line bg-transparent py-3 text-base font-light text-ink outline-none transition-colors placeholder:text-sand focus:border-rose";

const OWNER_PHONE = process.env.NEXT_PUBLIC_OWNER_PHONE ?? "";

export default function ContactForm() {
  const [draft, setDraft] = useState<InquiryDraft>(EMPTY_DRAFT);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);

  const textMessage = useMemo(() => buildTextMessage(draft), [draft]);
  const ready = isDraftReady(draft);

  function update(field: keyof InquiryDraft, value: string) {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setCopied(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(textMessage);
      setCopied(true);
      setNotice("");
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setNotice(
        "Copy did not work here — select the message above and copy it manually.",
      );
    }
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
        body: JSON.stringify({ ...draft, company: honeypot }),
      });
      const result = await response.json();

      if (!response.ok) {
        setErrors(result.errors ?? {});
        setNotice(result.error ?? "");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setNotice("Something went wrong. Try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="mt-16 max-w-lg text-base font-light leading-[1.75] text-stone">
        Thank you. Your inquiry is in, and Carmen will reply within two business
        days.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-16 max-w-lg" noValidate>
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

      <div className="flex flex-col gap-10">
        <div>
          <label htmlFor="name" className="eyebrow text-sand">
            Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className={FIELD}
            value={draft.name}
            onChange={(e) => update("name", e.target.value)}
          />
          {errors.name && (
            <p className="mt-2 text-sm text-rose">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="age" className="eyebrow text-sand">
            Age
          </label>
          <input
            id="age"
            type="number"
            inputMode="numeric"
            min={18}
            max={100}
            className={FIELD}
            value={draft.age}
            onChange={(e) => update("age", e.target.value)}
          />
          {errors.age && <p className="mt-2 text-sm text-rose">{errors.age}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="eyebrow text-sand">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Best number to text you back"
            className={FIELD}
            value={draft.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
          {errors.phone && (
            <p className="mt-2 text-sm text-rose">{errors.phone}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="eyebrow text-sand">
            Email (optional)
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Only if you'd rather I reply by email"
            className={FIELD}
            value={draft.email}
            onChange={(e) => update("email", e.target.value)}
          />
          {errors.email && (
            <p className="mt-2 text-sm text-rose">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="duration" className="eyebrow text-sand">
            Session length
          </label>
          <select
            id="duration"
            className={FIELD}
            value={draft.duration}
            onChange={(e) => update("duration", e.target.value)}
          >
            <option value="">Not sure yet</option>
            {SERVICES.map((service) => (
              <option key={service.id} value={service.duration}>
                {service.duration}
              </option>
            ))}
          </select>
          {errors.duration && (
            <p className="mt-2 text-sm text-rose">{errors.duration}</p>
          )}
        </div>

        <fieldset>
          <legend className="eyebrow text-sand">Where</legend>
          <div className="mt-4 flex flex-col gap-3">
            {LOCATION_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 text-base font-light text-ink"
              >
                <input
                  type="radio"
                  name="locationType"
                  value={option.value}
                  checked={draft.locationType === option.value}
                  onChange={(e) => update("locationType", e.target.value)}
                  className="h-4 w-4 accent-rose"
                />
                {option.label}
              </label>
            ))}
          </div>
          {errors.locationType && (
            <p className="mt-2 text-sm text-rose">{errors.locationType}</p>
          )}
        </fieldset>

        {draft.locationType === "outcall" && (
          <div>
            <label htmlFor="city" className="eyebrow text-sand">
              Your city
            </label>
            <input
              id="city"
              type="text"
              placeholder="Bowie, Upper Marlboro, Annapolis…"
              className={FIELD}
              value={draft.city}
              onChange={(e) => update("city", e.target.value)}
            />
            {errors.city && (
              <p className="mt-2 text-sm text-rose">{errors.city}</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="preferredTime" className="eyebrow text-sand">
            Preferred day and time
          </label>
          <input
            id="preferredTime"
            type="text"
            placeholder="Saturday afternoon, weekday evenings…"
            className={FIELD}
            value={draft.preferredTime}
            onChange={(e) => update("preferredTime", e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="message" className="eyebrow text-sand">
            A little about you
          </label>
          <textarea
            id="message"
            rows={4}
            placeholder="What brings you in, anything I should know, what you're hoping for."
            className={`${FIELD} resize-none`}
            value={draft.message}
            onChange={(e) => update("message", e.target.value)}
          />
          {errors.message && (
            <p className="mt-2 text-sm text-rose">{errors.message}</p>
          )}
        </div>
      </div>

      {/* TEXT PATH */}
      <div className="mt-16 border-t border-line pt-10">
        <p className="eyebrow text-sand">Text me — fastest</p>
        <p className="mt-4 text-base font-light leading-[1.75] text-stone">
          Your message writes itself as you fill this out. Copy it, or open it
          straight in Messages.
        </p>
        <pre className="mt-6 whitespace-pre-wrap break-words border border-line bg-ink/[0.03] p-5 font-body text-sm font-light leading-[1.7] text-ink">
          {ready
            ? textMessage
            : "Fill in your name, age, session length, and where — your message will appear here."}
        </pre>
        <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!ready}
            className="eyebrow flex items-center gap-2 border-b border-rose pb-1.5 text-ink transition-colors hover:text-rose disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? (
              <Check size={13} strokeWidth={1.5} />
            ) : (
              <Copy size={13} strokeWidth={1.5} />
            )}
            {copied ? "Copied" : "Copy message"}
          </button>
          {OWNER_PHONE && (
            <a
              href={ready ? smsHref(OWNER_PHONE, textMessage) : undefined}
              aria-disabled={!ready}
              className={`eyebrow flex items-center gap-2 border-b border-line pb-1.5 transition-colors ${ready ? "text-stone hover:border-rose hover:text-rose" : "pointer-events-none text-sand opacity-40"}`}
            >
              <MessageSquare size={13} strokeWidth={1.5} />
              Open in Messages
            </a>
          )}
        </div>
      </div>

      {/* EMAIL PATH */}
      <div className="mt-14 border-t border-line pt-10">
        <p className="eyebrow text-sand">Or send it as an inquiry</p>
        <p className="mt-4 text-base font-light leading-[1.75] text-stone">
          Same details, straight to my inbox. Leave a phone number or an email
          so I can reach you.
        </p>
        {notice && <p className="mt-6 text-sm text-rose">{notice}</p>}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="eyebrow mt-8 border-b border-rose pb-1.5 text-ink transition-colors hover:text-rose disabled:opacity-50"
        >
          {status === "submitting" ? "Sending" : "Send inquiry"}
        </button>
      </div>
    </form>
  );
}
