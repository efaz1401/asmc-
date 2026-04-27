import { NextResponse } from "next/server";
import { SITE } from "@/lib/site";

type Body = {
  name?: string;
  email?: string;
  company?: string;
  message?: string;
  honey?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (body.honey) {
    return NextResponse.json({ ok: true });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();
  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email." }, { status: 400 });
  }

  const subject = `New enquiry from ${name}`;
  const lines = [
    `From: ${name} <${email}>`,
    body.company ? `Company: ${body.company}` : "",
    "",
    message,
  ].filter(Boolean);

  if (process.env.RESEND_API_KEY) {
    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM ?? "ASMC <onboarding@resend.dev>",
          to: [process.env.CONTACT_TO ?? SITE.contact.email],
          reply_to: email,
          subject,
          text: lines.join("\n"),
        }),
      });
      if (!resp.ok) {
        console.error("Resend failed", await resp.text());
        return NextResponse.json({ ok: false, error: "Send failed." }, { status: 502 });
      }
      return NextResponse.json({ ok: true });
    } catch (e) {
      console.error("Resend error", e);
      return NextResponse.json({ ok: false, error: "Send failed." }, { status: 502 });
    }
  }

  console.info("[contact-fallback]", { subject, body: lines.join("\n") });
  return NextResponse.json({ ok: true, queued: true });
}
