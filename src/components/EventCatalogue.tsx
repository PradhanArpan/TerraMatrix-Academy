import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Copy, ExternalLink, MapPin, Sparkles, UsersRound, Video, X } from "lucide-react";
import { submitPublicRegistration } from "../lib/appsScriptApi";
import { Badge, EmptyState, Metric, PageIntro } from "./Ui";
import { formatDate, formatFee, loadEvents, type AcademyEvent } from "../lib/catalogData";

type FormState = {
  name: string;
  email: string;
  phone: string;
  organisation: string;
  message: string;
};

const emptyForm: FormState = { name: "", email: "", phone: "", organisation: "", message: "" };

export default function EventCatalogue({ kind }: { kind: "webinars" | "workshops" }) {
  const [items, setItems] = useState<AcademyEvent[]>([]);
  const [selected, setSelected] = useState<AcademyEvent | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState<{ event: AcademyEvent; student: FormState; linkCopied?: boolean } | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("All");

  useEffect(() => setItems(loadEvents(kind)), [kind]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map((item) => item.category).filter(Boolean)))], [items]);
  const visible = filter === "All" ? items : items.filter((item) => item.category === filter);
  const noun = kind === "webinars" ? "Webinar" : "Workshop";
  const description = kind === "webinars"
    ? "Join expert-led conversations, research briefings and live knowledge sessions across engineering education, technology and professional practice."
    : "Participate in practice-led sessions built around engineering tools, methods, case evidence and guided application."

  const submit = async () => {
    if (!selected) return;
    if (!form.name.trim()) { alert("Please enter your name."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) { alert("Please enter a valid email."); return; }
    if (!form.phone.trim()) { alert("Please enter your phone number."); return; }
    setSubmitting(true);
    try {
      await submitPublicRegistration({
        kind: noun,
        eventId: selected.id,
        eventTitle: selected.title,
        category: selected.category,
        theme: selected.theme,
        date: selected.date,
        time: selected.time,
        mode: selected.mode,
        certification: selected.certification,
        paymentOption: /free/i.test(selected.fee) ? "Not Applicable / Free" : "Payment details requested",
        paymentStatus: /free/i.test(selected.fee) ? "Not Applicable" : "Pending",
        paymentReference: "",
        paymentNote: "",
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        organisation: form.organisation.trim(),
        message: form.message.trim(),
      });

      // Unified Learner Registration: Auto-enroll attendee into TerraMatrix Academy
      const studentSession = {
        email: form.email.trim().toLowerCase(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        organisation: form.organisation.trim(),
        role: "Student",
        joinedVia: `${noun}: ${selected.title}`,
        registeredAt: new Date().toLocaleDateString("en-IN"),
      };
      localStorage.setItem("terramatrix_student_login", JSON.stringify(studentSession));

      try {
        const storedEnrollments = JSON.parse(localStorage.getItem("terramatrix_enrollments") || "[]");
        storedEnrollments.unshift({
          id: Date.now(),
          courseId: selected.id,
          courseTitle: selected.title,
          studentName: studentSession.name,
          email: studentSession.email,
          phone: studentSession.phone,
          organisation: studentSession.organisation,
          enrolledAt: new Date().toLocaleDateString("en-IN"),
          status: "Enrolled",
          progress: 0,
          kind: noun,
          meetingLink: selected.link || "https://meet.google.com/trm-acdm-web",
        });
        localStorage.setItem("terramatrix_enrollments", JSON.stringify(storedEnrollments));
      } catch {
        // Fallback
      }

      window.dispatchEvent(new Event("storage"));
      setRegisteredSuccess({ event: selected, student: form });
      setSelected(null);
      setForm(emptyForm);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Registration could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <PageIntro
        eyebrow={kind === "webinars" ? "Live knowledge sessions" : "Applied learning events"}
        title={kind === "webinars" ? "Ideas, evidence and expertise—live." : "Learn by doing, with expert guidance."}
        description={description}
        aside={<Metric value={items.length} label={`Published ${kind}`} helper="Live shared schedule" />}
      />

      {categories.length > 2 && (
        <div className="tm3-shell" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 30 }}>
          {categories.map((category) => (
            <button key={category} type="button" className={`tm3-button ${filter === category ? "tm3-button--dark" : "tm3-button--outline"}`} style={{ minHeight: 40, padding: "8px 14px" }} onClick={() => setFilter(category)}>{category}</button>
          ))}
        </div>
      )}

      <section className="tm3-catalogue">
        {items.length === 0 ? (
          <EmptyState icon="calendar" title={`No ${kind} are published yet`} description={`When the academy publishes its first ${noun.toLowerCase()}, it will appear here automatically.`} />
        ) : (
          <div className="tm3-catalogue-grid">
            {visible.map((item) => (
              <article className="tm3-content-card" key={item.id}>
                <div className="tm3-content-card__media" style={{ backgroundImage: `url('${item.imageUrl}')` }}>
                  <span style={{ position: "absolute", zIndex: 2, left: 15, top: 15 }}><Badge tone={item.status === "Completed" ? "neutral" : "live"}>{item.status === "Completed" ? "Completed" : "Upcoming"}</Badge></span>
                </div>
                <div className="tm3-content-card__body">
                  <div className="tm3-badge-row"><Badge tone="green">{item.category}</Badge><Badge>{item.theme}</Badge></div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="tm3-content-card__meta">
                    <span><CalendarDays size={14} /> {formatDate(item.date)}</span>
                    <span><Clock3 size={14} /> {item.time || "Time TBA"}</span>
                    <span><MapPin size={14} /> {item.mode}</span>
                    <span><UsersRound size={14} /> {item.resourcePerson}</span>
                  </div>
                  <div className="tm3-content-card__footer">
                    <strong>{formatFee(item.fee)}</strong>
                    {item.status === "Completed" && item.recordingLink ? (
                      <a className="tm3-button tm3-button--ghost" href={item.recordingLink} target="_blank" rel="noreferrer">Watch recording <ArrowRight size={16} /></a>
                    ) : (
                      <button className="tm3-button tm3-button--ghost" type="button" onClick={() => setSelected(item)}>Register <ArrowRight size={16} /></button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <div className="tm3-modal-backdrop" role="dialog" aria-modal="true" aria-label={`${noun} registration`}>
          <div className="tm3-modal">
            <button className="tm3-modal__close" type="button" onClick={() => setSelected(null)} aria-label="Close"><X size={18} /></button>
            <div className="tm3-eyebrow tm3-eyebrow--gold">Register for {noun.toLowerCase()}</div>
            <h2>{selected.title}</h2>
            <div className="tm3-form">
              <div className="tm3-form-grid">
                <label className="tm3-field">Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
                <label className="tm3-field">Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
                <label className="tm3-field">Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
                <label className="tm3-field">Organisation<input value={form.organisation} onChange={(event) => setForm({ ...form, organisation: event.target.value })} /></label>
              </div>
              <label className="tm3-field">Message<textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Optional note or question" /></label>
              <button className="tm3-button tm3-button--dark" type="button" onClick={() => void submit()} disabled={submitting}>{submitting ? "Submitting…" : "Submit registration"}<ArrowRight size={17} /></button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTRATION CONFIRMED & ONBOARDING MODAL */}
      {registeredSuccess && (
        <div className="tm3-modal-backdrop" role="dialog" aria-modal="true" aria-label="Registration Confirmed">
          <div className="tm3-modal tm3-modal--composer" style={{ maxWidth: 580 }}>
            <button className="tm3-modal__close" type="button" onClick={() => setRegisteredSuccess(null)} aria-label="Close">
              <X size={18} />
            </button>

            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <span style={{ display: "inline-grid", placeItems: "center", width: 56, height: 56, borderRadius: "50%", background: "rgba(214,245,109,0.15)", color: "var(--tm3-lime)", marginBottom: 12 }}>
                <CheckCircle2 size={32} />
              </span>
              <div className="tm3-eyebrow tm3-eyebrow--gold" style={{ margin: "0 auto 4px" }}>
                Registration Confirmed · Welcome to the Community
              </div>
              <h2 style={{ fontSize: "1.45rem", margin: 0 }}>
                You're In! Welcome to TerraMatrix Academy
              </h2>
            </div>

            <div style={{ padding: 18, borderRadius: 16, background: "var(--tm3-surface)", border: "1px solid var(--tm3-border)", marginBottom: 18 }}>
              <Badge tone="green">{noun} Session Details</Badge>
              <h3 style={{ margin: "8px 0 6px", fontSize: "1.1rem", fontWeight: 800 }}>
                {registeredSuccess.event.title}
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: "0.82rem", color: "var(--tm3-text-soft)", margin: "8px 0 14px" }}>
                <span><CalendarDays size={14} style={{ verticalAlign: -2 }} /> {formatDate(registeredSuccess.event.date)}</span>
                <span><Clock3 size={14} style={{ verticalAlign: -2 }} /> {registeredSuccess.event.time || "Time TBA"}</span>
                <span><UsersRound size={14} style={{ verticalAlign: -2 }} /> {registeredSuccess.event.resourcePerson}</span>
              </div>

              <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(0,0,0,0.25)", border: "1px dashed var(--tm3-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: "0.8rem", color: "#a7f3d0", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Video size={15} style={{ color: "var(--tm3-lime)" }} />
                  <strong>Meeting Room:</strong> {registeredSuccess.event.link || "https://meet.google.com/trm-acdm-web"}
                </span>
                <button
                  type="button"
                  className="tm3-button tm3-button--outline"
                  onClick={() => {
                    navigator.clipboard.writeText(registeredSuccess.event.link || "https://meet.google.com/trm-acdm-web");
                    setRegisteredSuccess({ ...registeredSuccess, linkCopied: true });
                    setTimeout(() => setRegisteredSuccess((prev) => prev ? { ...prev, linkCopied: false } : null), 2500);
                  }}
                  style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                >
                  <Copy size={12} /> {registeredSuccess.linkCopied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>

            {/* TerraMatrix Academy Community Access Perk Banner */}
            <div style={{ padding: "14px 18px", borderRadius: 14, background: "rgba(214, 245, 109, 0.08)", border: "1px solid rgba(214, 245, 109, 0.25)", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--tm3-lime)", fontWeight: 800, fontSize: "0.82rem", marginBottom: 4 }}>
                <Sparkles size={16} />
                <span>Learner Community Privileges Unlocked:</span>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--tm3-text-soft)", lineHeight: 1.5 }}>
                Your email (<strong>{registeredSuccess.student.email}</strong>) is now registered in our active student community. You have immediate free access to all Learning Library videos, Competitive Exam Question Banks, and open-access code notebooks.
              </p>
            </div>

            <div className="tm3-modal__actions" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <Link
                to="/student-portal"
                className="tm3-button tm3-button--gold"
                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
                onClick={() => setRegisteredSuccess(null)}
              >
                Enter Student Portal Now <ArrowRight size={15} />
              </Link>
              <Link
                to="/exam-prep"
                className="tm3-button tm3-button--outline"
                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
                onClick={() => setRegisteredSuccess(null)}
              >
                Try Exam Simulator
              </Link>
              <button
                type="button"
                className="tm3-button tm3-button--ghost"
                onClick={() => setRegisteredSuccess(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
