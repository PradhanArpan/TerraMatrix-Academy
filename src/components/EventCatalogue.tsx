import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Clock3, MapPin, UsersRound, X } from "lucide-react";
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
      setSelected(null);
      setForm(emptyForm);
      alert(`${noun} registration submitted. The academy will send confirmation details.`);
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
    </main>
  );
}
