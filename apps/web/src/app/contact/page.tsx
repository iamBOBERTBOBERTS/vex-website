"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createLead } from "@/lib/api";
import { MotionReveal } from "@/components/site/MotionReveal";

const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "";
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";

function buildMailtoHref(subject: string, lines: Array<string | null | undefined>) {
  if (!contactEmail) return null;
  const body = lines.filter(Boolean).join("\n");
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function ContactPage() {
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState({
    name: "",
    phone: "",
    email: "",
    message: vehicleId ? `Interested in vehicle ${vehicleId}.` : "",
    role: "Buyer",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    setVehicleId(new URLSearchParams(window.location.search).get("vehicle"));
  }, []);

  const source = useMemo(() => (vehicleId ? `CONTACT_VEHICLE_${vehicleId}` : "CONTACT_PAGE"), [vehicleId]);
  const conciergeFallbackHref = useMemo(
    () =>
      buildMailtoHref("Private VEX inquiry", [
        `Name: ${values.name.trim() || "Not provided"}`,
        `Role: ${values.role}`,
        `Email: ${values.email.trim() || "Not provided"}`,
        `Phone: ${values.phone.trim() || "Not provided"}`,
        `Vehicle: ${vehicleId || "Not specified"}`,
        "",
        values.message.trim() || "No message provided.",
      ]),
    [values, vehicleId]
  );

  const handleSubmit = async () => {
    setError(null);
    setSubmitted(false);

    if (!values.email.trim() && !values.phone.trim()) {
      setError("Provide at least an email address or phone number.");
      return;
    }

    setLoading(true);
    try {
      await createLead({
        source,
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        vehicleInterest: vehicleId || undefined,
        notes: `${values.role}: ${values.message.trim()}`,
      });
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to submit inquiry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content" className="shell py-14 sm:py-18">
      <MotionReveal className="max-w-3xl">
        <p className="section-kicker">Direct contact</p>
        <h1 className="section-title">Bring the right context. We will take it from there.</h1>
        <p className="section-copy">
          Reach the acquisition team for private buying, selective consignment, or discreet market guidance.
          The tone should feel personal, informed, and responsive from the first message.
        </p>
      </MotionReveal>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <MotionReveal className="glass-panel rounded-[2rem] p-7 sm:p-9">
          <p className="section-kicker">Direct line</p>
          <h2 className="mt-4 text-3xl text-[#fff8eb]">VEX Auto private acquisitions</h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-[#d8d0c2]">
            <p>Concierge-led guidance for collectors, sellers, and high-intent buyers navigating rare inventory.</p>
            <p>Phone: {contactPhone || "Not configured"}</p>
            <p>Email: {contactEmail || "Not configured"}</p>
            <p>Hours: Mon-Sat 9AM-7PM MST</p>
          </div>
        </MotionReveal>

        <MotionReveal delay={0.08} className="cinema-panel rounded-[2rem] p-7 sm:p-9">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-[#ddd4c6]">Name</span>
              <input
                className="field-base"
                value={values.name}
                onChange={(event) => setValues({ ...values, name: event.target.value })}
                placeholder="Your name"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-[#ddd4c6]">Phone</span>
              <input
                className="field-base"
                value={values.phone}
                onChange={(event) => setValues({ ...values, phone: event.target.value })}
                placeholder="Phone number"
              />
            </label>
          </div>

          <label className="mt-5 grid gap-2">
            <span className="text-sm text-[#ddd4c6]">Email</span>
            <input
              className="field-base"
              value={values.email}
              onChange={(event) => setValues({ ...values, email: event.target.value })}
              placeholder="Email address"
            />
          </label>

          <label className="mt-5 grid gap-2">
            <span className="text-sm text-[#ddd4c6]">Message</span>
            <textarea
              className="field-base min-h-40"
              value={values.message}
              onChange={(event) => setValues({ ...values, message: event.target.value })}
              placeholder="Tell us about the vehicle, the acquisition brief, or the support you need"
            />
          </label>

          <div className="mt-5">
            <span className="text-sm text-[#ddd4c6]">I am a</span>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {["Buyer", "Seller"].map((option) => (
                <label key={option} className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-[#f5f1e8]">
                  <input
                    type="radio"
                    name="role"
                    value={option}
                    checked={values.role === option}
                    onChange={() => setValues({ ...values, role: option })}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <button type="button" className="gold-button mt-6 w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit inquiry"}
          </button>

          {error ? (
            <div className="mt-4 rounded-[1.2rem] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              <p>{error}</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                {conciergeFallbackHref ? (
                  <a href={conciergeFallbackHref} className="ghost-button">
                    Email Concierge
                  </a>
                ) : null}
                {contactPhone ? (
                  <a href={`tel:${contactPhone.replace(/\D/g, "")}`} className="gold-button">
                    Call Concierge
                  </a>
                ) : (
                  <Link href="/appraisal" className="gold-button">
                    Open Appraisal Intake
                  </Link>
                )}
              </div>
            </div>
          ) : null}
          {submitted ? (
            <div className="mt-4 rounded-[1.2rem] border border-[#f1d38a]/18 bg-[#d4af37]/8 px-4 py-3 text-sm text-[#fff8eb]">
              Thank you. Your message has been submitted and the team will follow up shortly.
            </div>
          ) : null}
        </MotionReveal>
      </div>
    </main>
  );
}
