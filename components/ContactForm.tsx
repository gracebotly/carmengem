"use client";

import { useState } from "react";
import { SERVICES } from "@/lib/services";

type Status = "idle" | "submitting" | "success" | "error";

const FIELD =
  "w-full border-b border-line bg-transparent py-3 text-base font-light text-ink outline-none transition-colors placeholder:text-sand focus:border-rose";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("submitting");
    setErrors({});
    setMessage("");

    const data = Object.fromEntries(new FormData(form));

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        setErrors(result.errors ?? {});
        setMessage(result.error ?? "");
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setMessage("Something went wrong. Try again.");
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
          <input id="name" name="name" type="text" className={FIELD} />
          {errors.name && (
            <p className="mt-2 text-sm text-rose">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="eyebrow text-sand">
            Email
          </label>
          <input id="email" name="email" type="email" className={FIELD} />
          {errors.email && (
            <p className="mt-2 text-sm text-rose">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="service" className="eyebrow text-sand">
            Preferred service
          </label>
          <select id="service" name="service" defaultValue="" className={FIELD}>
            <option value="">Not sure yet</option>
            {SERVICES.map((service) => (
              <option key={service.id} value={service.duration}>
                {service.duration}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="message" className="eyebrow text-sand">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className={`${FIELD} resize-none`}
          />
          {errors.message && (
            <p className="mt-2 text-sm text-rose">{errors.message}</p>
          )}
        </div>
      </div>

      {message && <p className="mt-8 text-sm text-rose">{message}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="eyebrow mt-12 border-b border-rose pb-1.5 text-ink transition-colors hover:text-rose disabled:opacity-50"
      >
        {status === "submitting" ? "Sending" : "Send inquiry"}
      </button>
    </form>
  );
}
