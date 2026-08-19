"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessageSquare } from "lucide-react";
import { SERVICES } from "@/lib/services";
import {
  EMPTY_DRAFT,
  LOCATION_OPTIONS,
  WHEN_OPTIONS,
  buildTextMessage,
  isDraftReady,
  smsHref,
  whenPhrase,
  type InquiryDraft,
} from "@/lib/inquiry";

type Status = "idle" | "submitting" | "success" | "error";

const OWNER_PHONE = process.env.NEXT_PUBLIC_OWNER_PHONE ?? "";

/** Bubble fill: rose at ~7% flattened onto shell, so the tail never seams. */
const BUBBLE = "#F1E8E4";

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
  const [showEmail, setShowEmail] = useState(false);
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
      setNotice("Copy did not work here — select the message and copy it by hand.");
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
        body: JSON.stringify({
          ...draft,
          when: whenPhrase(draft),
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
        Thank you. Your inquiry is in, and Carmen will reply within two business days.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-12 max-w-lg" noValidate>
      <input type="text" name="company" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="pointer-events-none absolute h-0 w-0 opacity-0" />

      <div className="grid grid-cols-[1fr_5rem] gap-x-5">
        <div>
          <label htmlFor="name" className="eyebrow text-sand">Name</label>
          <input id="name" type="text" autoComplete="given-name" className={FIELD} value={draft.name} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div>
          <label htmlFor="age" className="eyebrow text-sand">Age</label>
          <input id="age" type="number" inputMode="numeric" min={18} max={100} className={FIELD} value={draft.age} onChange={(e) => update("age", e.target.value)} />
        </div>
      </div>
      {(errors.name || errors.age) && <p className="mt-2 text-sm text-rose">{errors.name ?? errors.age}</p>}

      <fieldset className="mt-9">
        <legend className="eyebrow text-sand">Length</legend>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {SERVICES.map((service) => (
            <button key={service.id} type="button" aria-pressed={draft.length === service.duration} onClick={() => update("length", service.duration)} className={chip(draft.length === service.duration)}>{service.duration}</button>
          ))}
        </div>
        {errors.length && <p className="mt-2 text-sm text-rose">{errors.length}</p>}
      </fieldset>

      <fieldset className="mt-9">
        <legend className="eyebrow text-sand">Where</legend>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {LOCATION_OPTIONS.map((option) => (
            <button key={option.value} type="button" aria-pressed={draft.locationType === option.value} onClick={() => update("locationType", option.value)} className={chip(draft.locationType === option.value)}>{option.label}</button>
          ))}
        </div>
        <p className="mt-3 text-sm font-light text-sand">Incall — I come to you. Outcall — you come to me.</p>
        {errors.locationType && <p className="mt-2 text-sm text-rose">{errors.locationType}</p>}
      </fieldset>

      {draft.locationType === "outcall" && (
        <div className="mt-7">
          <label htmlFor="city" className="eyebrow text-sand">Your city</label>
          <input id="city" type="text" placeholder="Bowie, Upper Marlboro, Annapolis…" className={FIELD} value={draft.city} onChange={(e) => update("city", e.target.value)} />
          {errors.city && <p className="mt-2 text-sm text-rose">{errors.city}</p>}
        </div>
      )}

      <fieldset className="mt-9">
        <legend className="eyebrow text-sand">When</legend>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {WHEN_OPTIONS.map((option) => (
            <button key={option.value} type="button" aria-pressed={draft.when === option.value} onClick={() => update("when", option.value)} className={chip(draft.when === option.value)}>{option.label}</button>
          ))}
        </div>
        {errors.when && <p className="mt-2 text-sm text-rose">{errors.when}</p>}
      </fieldset>

      {draft.when === "specific" && (
        <div className="mt-7">
          <label htmlFor="whenDetail" className="eyebrow text-sand">What time</label>
          <input id="whenDetail" type="text" placeholder="Saturday around 2pm" className={FIELD} value={draft.whenDetail} onChange={(e) => update("whenDetail", e.target.value)} />
        </div>
      )}

      <div className="mt-9">
        <label htmlFor="note" className="eyebrow text-sand">Anything I should know <span className="normal-case tracking-normal">(optional)</span></label>
        <textarea id="note" rows={2} placeholder="What brings you in, any injuries, what you're hoping for." className={`${FIELD} resize-none`} value={draft.note} onChange={(e) => update("note", e.target.value)} />
      </div>

      <div className="mt-12">
        <p className="eyebrow text-sand">Your message</p>
        <div className="relative mt-4">
          <div className="rounded-lg rounded-br-none px-6 py-5" style={{ backgroundColor: BUBBLE }}>
            <pre className="whitespace-pre-wrap break-words font-body text-[15px] font-light leading-[1.7] text-ink">{ready ? textMessage : "Fill in the fields above and your message appears here, ready to copy."}</pre>
          </div>
          <span aria-hidden="true" className="absolute -bottom-2 right-0 h-4 w-4" style={{ backgroundColor: BUBBLE, clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
          <button type="button" onClick={handleCopy} disabled={!ready} className="eyebrow flex items-center gap-2 border-b border-rose pb-1.5 text-ink transition-colors hover:text-rose disabled:cursor-not-allowed disabled:opacity-40">
            {copied ? <Check size={13} strokeWidth={1.5} /> : <Copy size={13} strokeWidth={1.5} />}
            {copied ? "Copied" : "Copy message"}
          </button>
          {OWNER_PHONE && (
            <a href={ready ? smsHref(OWNER_PHONE, textMessage) : undefined} aria-disabled={!ready} className={`eyebrow flex items-center gap-2 border-b border-line pb-1.5 transition-colors ${ready ? "text-stone hover:border-rose hover:text-rose" : "pointer-events-none text-sand opacity-40"}`}>
              <MessageSquare size={13} strokeWidth={1.5} /> Open in Messages
            </a>
          )}
        </div>
      </div>

      <div className="mt-14 border-t border-line pt-8">
        {!showEmail ? (
          <button type="button" onClick={() => setShowEmail(true)} className="text-sm font-light text-sand underline underline-offset-4 transition-colors hover:text-rose">Rather email than text?</button>
        ) : (
          <div>
            <p className="text-sm font-light leading-[1.7] text-stone">Same details, sent to my inbox instead. I reply within two business days.</p>
            <div className="mt-7 grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="eyebrow text-sand">Email</label>
                <input id="email" type="email" autoComplete="email" className={FIELD} value={draft.email} onChange={(e) => update("email", e.target.value)} />
                {errors.email && <p className="mt-2 text-sm text-rose">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="eyebrow text-sand">Phone <span className="normal-case tracking-normal">(optional)</span></label>
                <input id="phone" type="tel" autoComplete="tel" className={FIELD} value={draft.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
            </div>
            {notice && <p className="mt-6 text-sm text-rose">{notice}</p>}
            <button type="submit" disabled={status === "submitting"} className="eyebrow mt-8 border-b border-rose pb-1.5 text-ink transition-colors hover:text-rose disabled:opacity-50">{status === "submitting" ? "Sending" : "Send inquiry"}</button>
          </div>
        )}
      </div>
    </form>
  );
}
