"use client";

import { useState, type FormEvent } from "react";
import PublicSiteChrome from "@/components/public-site-chrome";

export default function ContactPage() {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSending(true);
    setStatus("");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
        name: data.get("name"), email: data.get("email"), subject: data.get("subject"), message: data.get("message"), website: data.get("website"),
      }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send your message.");
      form.reset();
      setStatus("Your message was accepted by the email service and sent to the AIToolss contact inbox.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to send your message. Your entries have been kept; please try again.");
    } finally { setSending(false); }
  }
  return <PublicSiteChrome><main className="info-page"><article className="info-article">
    <p className="section-kicker">GET IN TOUCH</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">Contact Us</h1>
    <p className="section-description mt-4 max-w-2xl">Send feedback, report a problem, suggest a tool, or ask a question about AIToolss. Messages are routed to our contact inbox.</p>
    <form onSubmit={submit} className="mt-8 grid max-w-2xl gap-4 rounded-2xl border border-[#e8e2f2] bg-white p-5 sm:p-7">
      <label className="grid gap-2 text-sm font-semibold text-[#413753]">Full name<input name="name" required maxLength={120} autoComplete="name" className="rounded-xl border border-[#ded7eb] p-3 font-normal" /></label>
      <label className="grid gap-2 text-sm font-semibold text-[#413753]">Email address<input name="email" type="email" required maxLength={254} autoComplete="email" className="rounded-xl border border-[#ded7eb] p-3 font-normal" /></label>
      <label className="grid gap-2 text-sm font-semibold text-[#413753]">Subject<input name="subject" required maxLength={180} className="rounded-xl border border-[#ded7eb] p-3 font-normal" /></label>
      <label className="grid gap-2 text-sm font-semibold text-[#413753]">Message<textarea name="message" required maxLength={8000} rows={7} className="rounded-xl border border-[#ded7eb] p-3 font-normal" /></label>
      <label aria-hidden="true" className="hidden">Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <button type="submit" disabled={sending} className="rounded-xl bg-[#6d53d7] px-5 py-3 font-bold text-white disabled:opacity-60">{sending ? "Sending…" : "Send message"}</button>
      <p role="status" aria-live="polite" className="text-sm text-[#6e657d]">{status}</p>
    </form>
    <p className="mt-5 text-sm text-[#777087]">Contact email: aitoolss4u@gmail.com</p>
  </article></main></PublicSiteChrome>;
}
