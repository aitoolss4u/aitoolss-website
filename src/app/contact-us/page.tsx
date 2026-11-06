"use client";
import { useState, type FormEvent } from "react";
import PublicSiteChrome from "@/components/public-site-chrome";
import CmsPageContent from "@/components/cms-page-content";
import LegalPageLinks from "@/components/legal-page-links";

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
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"), email: data.get("email"), subject: data.get("subject"),
          message: data.get("message"), website: data.get("website"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send your message.");
      form.reset();
      setStatus(result.message || (result.delivery === "email"
        ? "Your message was sent to the AIToolss contact inbox."
        : "Your message has been received."));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to send your message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return <PublicSiteChrome><main className="info-page"><article className="info-article">
    <CmsPageContent slug="contact-us" fallbackTitle="Contact AIToolss" fallbackIntro="Contact our team about a tool listing, website issue, privacy request, partnership enquiry or general feedback. We welcome clear details that help us understand and respond to your request." preserveChildren>
      <div className="mt-5 max-w-2xl space-y-3 text-sm leading-7 text-[#6e657d]">
        <p>Use this form to contact the AIToolss team about a website issue, an incorrect tool listing, a feature suggestion, a privacy request, a partnership enquiry or general feedback. Messages are forwarded to <a href="mailto:aitoolss4u@gmail.com" className="font-semibold text-violet-700 underline">aitoolss4u@gmail.com</a> through our email service. If forwarding is temporarily unavailable, the website may retain the submission in its protected admin inbox so it can be reviewed.</p>
        <h2 className="mt-5 text-base font-extrabold text-[#413753]">How to write a useful support request</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Give a short, specific subject that describes the request.</li>
          <li>For a broken tool, include the tool page URL, the steps you followed and the exact error message.</li>
          <li>For a listing correction, include the current page and the detail that should be reviewed.</li>
          <li>For a partnership or tool suggestion, explain the service and why it may be useful to AIToolss visitors.</li>
        </ul>
        <p>We review messages as resources allow. Sending a request does not create an account, guarantee acceptance of a suggestion or establish a response deadline.</p>
        <p>Please do not send passwords, payment details, identity documents, private keys or confidential files. Contact form submissions are handled as described in our <a href="/privacy" className="font-semibold text-violet-700 underline">Privacy Policy</a>. You can also review our <a href="/terms" className="font-semibold text-violet-700 underline">Terms &amp; Conditions</a> and <a href="/disclaimer" className="font-semibold text-violet-700 underline">Disclaimer</a> before using site tools.</p>
      </div>
      <form onSubmit={submit} className="mt-8 grid max-w-2xl gap-4 rounded-2xl border border-[#e8e2f2] bg-white p-5 sm:p-7">
        <label className="grid gap-2 text-sm font-semibold text-[#413753]">Full name<input name="name" required maxLength={120} autoComplete="name" className="rounded-xl border border-[#ded7eb] p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-semibold text-[#413753]">Email address<input name="email" type="email" required maxLength={254} autoComplete="email" className="rounded-xl border border-[#ded7eb] p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-semibold text-[#413753]">Subject<input name="subject" required maxLength={180} className="rounded-xl border border-[#ded7eb] p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-semibold text-[#413753]">Message<textarea name="message" required maxLength={8000} rows={7} className="rounded-xl border border-[#ded7eb] p-3 font-normal" /></label>
        <label aria-hidden="true" className="hidden">Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
        <button type="submit" disabled={sending} className="rounded-xl bg-[#6d53d7] px-5 py-3 font-bold text-white disabled:opacity-60">{sending ? "Sending…" : "Send message"}</button>
        <p role="status" aria-live="polite" className="text-sm text-[#6e657d]">{status}</p>
      </form>
      <p className="mt-5 text-sm text-[#777087]">Direct email: <a href="mailto:aitoolss4u@gmail.com" className="font-semibold text-violet-700 underline">aitoolss4u@gmail.com</a></p>
    </CmsPageContent>
    <LegalPageLinks />
  </article></main></PublicSiteChrome>;
}
