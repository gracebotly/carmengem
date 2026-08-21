"use client";

import { useState } from "react";
import { SERVICES, MODALITIES } from "@/lib/services";
import {
  EMPTY_DRAFT,
  HOURS,
  LOCATION_OPTIONS,
  MERIDIEMS,
  MINUTES,
  isDraftReady,
  timingPhrase,
  type InquiryDraft,
} from "@/lib/inquiry";

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

  const ready = isDraftReady(draft);

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

      <div>
        <label htmlFor="name" className="eyebrow text-sand">Name</label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          className={FIELD}
          value={draft.name}
          onChange={(e) => update("name", e.target.value)}
        />
        {errors.name && <p className="mt-2 text-sm text-rose">{errors.name}</p>}
      </div>

      <div className="mt-9">
        <label htmlFor="modality" className="eyebrow text-sand">Service</label>
        <select
          id="modality"
          className={FIELD}
          value={draft.modality}
          onChange={(e) => update("modality", e.target.value)}
          disabled={MODALITIES.length === 0}
        >
          <option value="">
            {MODALITIES.length === 0 ? "Coming soon" : "Select a service"}
          </option>
          {MODALITIES.map((m) => (
            <option key={m.id} value={m.label}>{m.label}</option>
          ))}
        </select>
      </div>

      <fieldset className="mt-9">
        <legend className="eyebrow text-sand">Session length</legend>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {SERVICES.map((service) => (
            <button
              key={service.id}
              type="button"
              aria-pressed={draft.length === service.duration}
              onClick={() => update("length", service.duration)}
              className={chip(draft.length === service.duration)}
            >
              {service.duration}
            </button>
          ))}
        </div>
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

      <div className="mt-9 grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="eyebrow text-sand">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={FIELD}
            value={draft.email}
            onChange={(e) => update("email", e.target.value)}
          />
          {errors.email && <p className="mt-2 text-sm text-rose">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="eyebrow text-sand">
            Phone <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            className={FIELD}
            value={draft.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </div>
      </div>

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
