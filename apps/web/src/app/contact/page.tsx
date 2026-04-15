"use client";

import { useState } from "react";
import styles from "../marketing-pages.module.css";

const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "";
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    role: "Buyer",
  });

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Direct contact</p>
        <h1 className={styles.title}>Bring the right context. We will take it from there.</h1>
        <p className={styles.intro}>
          Reach the acquisition team for private buying, selective consignment, or discreet market guidance. The tone
          should feel personal, informed, and responsive from the first message.
        </p>
      </section>

      <section className={styles.grid2}>
        <article className={`${styles.panel} ${styles.contactCard}`}>
          <h2 className={styles.panelTitle}>VEX Auto private acquisitions</h2>
          <p className={styles.copy}>
            Concierge-led guidance for collectors, sellers, and high-intent buyers navigating rare inventory.
          </p>
          <p className={styles.contactLine}>Phone: {contactPhone || "Not configured"}</p>
          <p className={styles.contactLine}>Email: {contactEmail || "Not configured"}</p>
          <p className={styles.copy}>Hours: Mon-Sat 9AM-7PM MST</p>
        </article>

        <section className={styles.panel}>
          <div className={styles.form}>
            <label className={styles.field}>
              <span className={styles.label}>Name</span>
              <input
                className={styles.input}
                value={values.name}
                onChange={(event) => setValues({ ...values, name: event.target.value })}
                placeholder="Your name"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Phone</span>
              <input
                className={styles.input}
                value={values.phone}
                onChange={(event) => setValues({ ...values, phone: event.target.value })}
                placeholder="Phone number"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Email</span>
              <input
                className={styles.input}
                value={values.email}
                onChange={(event) => setValues({ ...values, email: event.target.value })}
                placeholder="Email address"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Message</span>
              <textarea
                className={styles.textarea}
                value={values.message}
                onChange={(event) => setValues({ ...values, message: event.target.value })}
                placeholder="Tell us about the vehicle, the acquisition brief, or the type of support you need"
              />
            </label>

            <div className={styles.field}>
              <span className={styles.label}>I am a</span>
              <div className={styles.radioGroup}>
                {[
                  { label: "Buyer", value: "Buyer" },
                  { label: "Seller", value: "Seller" },
                ].map((option) => (
                  <label key={option.value} className={styles.radioOption}>
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={values.role === option.value}
                      onChange={() => setValues({ ...values, role: option.value })}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <button type="button" className="btn btnPrimary" onClick={() => setSubmitted(true)}>
              Submit inquiry
            </button>

            {submitted ? (
              <div className={styles.success}>
                Thank you. Your message has been submitted and the team will follow up shortly.
              </div>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}
