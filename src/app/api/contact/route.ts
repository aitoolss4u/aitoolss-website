import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const recentSubmissions = new Map<string, number[]>();
const destination = "aitoolss4u@gmail.com";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body?.website === "string" && body.website.trim()) {
      return NextResponse.json({ ok: true });
    }
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!name || name.length > 120 || !subject || subject.length > 180 || !message || message.length > 8000 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Please complete all fields with a valid email address." }, { status: 400 });
    }
    const ip = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    const now = Date.now();
    const recent = (recentSubmissions.get(ip) || []).filter((time) => now - time < 10 * 60 * 1000);
    if (recent.length >= 5) return NextResponse.json({ error: "Too many messages have been sent. Please try again later." }, { status: 429 });
    recent.push(now);
    recentSubmissions.set(ip, recent);

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.CONTACT_FROM_EMAIL;
    if (!apiKey || !from) {
      const supabase = await createClient();
      const { error } = await supabase.from("contact_messages").insert({ name, email, subject, message, status: "new" });
      if (error) return NextResponse.json({ error: "Contact storage is not configured yet. Please try again later." }, { status: 503 });
      return NextResponse.json({ ok: true, delivery: "inbox", message: "Your message has been saved securely in the AIToolss admin inbox. Email forwarding is not configured yet." });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br>");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [destination],
        reply_to: email,
        subject: `AIToolss contact: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
        html: `<h2>Website contact message</h2><p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p><strong>Subject:</strong> ${safeSubject}</p><p>${safeMessage}</p>`,
      }),
    });
    if (!response.ok) {
      return NextResponse.json({ error: "The email provider could not accept your message. Please try again later." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, delivery: "email" });
  } catch {
    return NextResponse.json({ error: "Unable to submit the message. Please check the fields and try again." }, { status: 400 });
  }
}
