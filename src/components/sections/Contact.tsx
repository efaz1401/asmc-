"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";
import { Reveal } from "../Reveal";

type Status = "idle" | "submitting" | "ok" | "error";

export function Contact({ lang = "en" }: { lang?: "en" | "ar" }) {
  const isAr = lang === "ar";
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("submitting");
    setError("");
    const fd = new FormData(form);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          company: fd.get("company"),
          message: fd.get("message"),
          honey: fd.get("website"),
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatus("error");
        setError(json.error ?? "Something went wrong.");
        return;
      }
      setStatus("ok");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Network error.");
    }
  }

  return (
    <section id="contact" className="relative border-t hairline py-24 md:py-40">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal className="mb-10 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          <span>08</span>
          <span className="h-px w-8 bg-line" />
          <span>{isAr ? "تواصل" : "Contact"}</span>
        </Reveal>

        <Reveal as="h2" className="max-w-5xl text-balance text-4xl leading-[0.95] tracking-tight md:text-7xl lg:text-[120px]">
          {isAr ? (
            <>
              <span className="font-arabic">دعنا نبني</span>{" "}
              <span className="font-display italic text-muted">المشروع التالي</span>{" "}
              <span className="font-arabic">معاً.</span>
            </>
          ) : (
            <>
              Let’s build the
              <span className="block">
                <em className="font-display italic text-muted">next project</em> together.
              </span>
            </>
          )}
        </Reveal>

        <div className="mt-14 grid gap-12 md:grid-cols-12 md:gap-16">
          <Reveal as="div" className="md:col-span-5 space-y-10">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                {isAr ? "المكتب الرئيسي" : "Headquarters"}
              </div>
              <p className="mt-4 text-lg">
                {SITE.contact.address.en}
                <br />
                <span className="text-muted">9P9F+6Q, Al Hofuf · KSA</span>
              </p>
            </div>
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                {isAr ? "هاتف" : "Phone"}
              </div>
              <ul className="mt-4 space-y-1 text-lg">
                {SITE.contact.phones.map((p, i) => (
                  <li key={p}>
                    <a
                      href={`tel:${SITE.contact.phonesIntl[i]}`}
                      className="hover:text-muted"
                    >
                      {p}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                {isAr ? "بريد إلكتروني" : "Email"}
              </div>
              <a
                href={`mailto:${SITE.contact.email}`}
                className="mt-4 block text-balance text-3xl tracking-tight md:text-4xl"
              >
                {SITE.contact.email}
              </a>
            </div>

            <div className="border-t hairline pt-6">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                {isAr ? "ساعات العمل" : "Business hours"}
              </div>
              <ul className="mt-4 space-y-1 text-sm text-muted">
                <li>{SITE.contact.hours.weekdays}</li>
                <li>{SITE.contact.hours.saturday}</li>
                <li>{SITE.contact.hours.friday}</li>
              </ul>
            </div>

            <div className="border-t hairline pt-6">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                {isAr ? "مدراء التسويق" : "Marketing managers"}
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {SITE.managers.map((m) => (
                  <li key={m.name}>
                    <span className="text-foreground">{m.name}</span>{" "}
                    <span className="text-muted">— {m.phone}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal as="div" className="md:col-span-7" delay={150}>
            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />
              <Field
                label={isAr ? "الاسم" : "Name"}
                name="name"
                required
                autoComplete="name"
              />
              <Field
                label={isAr ? "البريد الإلكتروني" : "Email"}
                name="email"
                type="email"
                required
                autoComplete="email"
              />
              <Field
                label={isAr ? "الشركة (اختياري)" : "Company (optional)"}
                name="company"
                autoComplete="organization"
              />
              <Field
                label={isAr ? "تفاصيل المشروع" : "Project details"}
                name="message"
                textarea
                required
                rows={5}
              />
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="group inline-flex h-12 items-center gap-3 rounded-full bg-foreground px-6 font-mono text-[11px] uppercase tracking-[0.18em] text-background transition-transform hover:scale-[1.02] disabled:opacity-60"
                >
                  {status === "submitting"
                    ? isAr
                      ? "جارٍ الإرسال…"
                      : "Sending…"
                    : isAr
                      ? "إرسال الطلب"
                      : "Send enquiry"}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7h10M8 3l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {status === "ok" && (
                  <span className="text-sm text-emerald-300">
                    {isAr
                      ? "تم الإرسال — سنعود إليك خلال يوم عمل."
                      : "Sent — we’ll reply within one business day."}
                  </span>
                )}
                {status === "error" && (
                  <span className="text-sm text-rose-300">{error}</span>
                )}
              </div>
              <p className="pt-3 text-xs text-muted">
                {isAr
                  ? "بإرسال هذا النموذج فإنك توافق على سياسة الخصوصية الخاصة بنا."
                  : "By submitting this form you agree to our privacy policy."}
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  textarea,
  rows = 3,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  textarea?: boolean;
  rows?: number;
}) {
  const cls =
    "peer block w-full bg-transparent border-b hairline pb-3 pt-7 text-base outline-none focus:border-foreground transition-colors placeholder-transparent";
  return (
    <label className="relative block">
      <span className="pointer-events-none absolute left-0 top-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-all peer-focus:top-2 peer-focus:text-foreground peer-placeholder-shown:top-7">
        {label}
        {required && <span className="ml-1 text-muted">*</span>}
      </span>
      {textarea ? (
        <textarea
          name={name}
          required={required}
          rows={rows}
          placeholder={label}
          className={cls + " resize-y"}
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          placeholder={label}
          autoComplete={autoComplete}
          className={cls}
        />
      )}
    </label>
  );
}
