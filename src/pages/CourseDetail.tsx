import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  GraduationCap,
  MonitorPlay,
  UsersRound,
  X,
} from "lucide-react";
import { submitPublicRegistration } from "../lib/appsScriptApi";
import { Badge, EmptyState, Eyebrow, FeatureList } from "../components/Ui";
import {
  formatDate,
  formatFee,
  getCourseInstructors,
  loadCourses,
  loadInstructors,
  parseOutcomes,
  type Course,
  type Instructor,
} from "../lib/catalogData";

type FormState = {
  name: string;
  email: string;
  phone: string;
  organisation: string;
  message: string;
};

const emptyForm: FormState = { name: "", email: "", phone: "", organisation: "", message: "" };

function getPdfPreviewUrl(value: string) {
  const file = value.match(/drive\.google\.com\/file\/d\/([^/]+)/)?.[1];
  if (file) return `https://drive.google.com/file/d/${file}/preview`;
  const id = value.match(/[?&]id=([^&]+)/)?.[1];
  if (value.includes("drive.google.com") && id) return `https://drive.google.com/file/d/${id}/preview`;
  return value.startsWith("/") ? `${value}#toolbar=0&navpanes=0` : value;
}

function cleanPhone(value: string) {
  let clean = value.replace(/[\s\-()]/g, "");
  if (clean.startsWith("+91")) clean = clean.slice(3);
  else if (clean.startsWith("91") && clean.length === 12) clean = clean.slice(2);
  else if (clean.startsWith("0") && clean.length === 11) clean = clean.slice(1);
  return /^[6-9]\d{9}$/.test(clean) ? clean : null;
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [showRegistration, setShowRegistration] = useState(false);
  const [pdf, setPdf] = useState<{ title: string; url: string } | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const courses = loadCourses();
    setCourse(courses.find((item) => item.id === Number(courseId)) || null);
    setInstructors(loadInstructors());
  }, [courseId]);

  if (!course) {
    return (
      <main className="tm3-catalogue" style={{ paddingTop: 80 }}>
        <EmptyState icon="search" title="Programme not found" description="This programme may be unpublished or no longer available." actionLabel="Return to catalogue" actionTo="/student" />
      </main>
    );
  }

  const faculty = getCourseInstructors(course, instructors);
  const outcomes = parseOutcomes(course.outcomes);

  const submit = async () => {
    if (!form.name.trim()) { alert("Please enter your name."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) { alert("Please enter a valid email address."); return; }
    const phone = cleanPhone(form.phone);
    if (!phone) { alert("Please enter a valid Indian mobile number."); return; }
    setSubmitting(true);
    try {
      await submitPublicRegistration({
        kind: "Course",
        eventId: course.id,
        eventTitle: course.title,
        category: course.category,
        theme: course.theme || course.level,
        date: course.startDate,
        time: "",
        mode: course.mode,
        certification: course.certificate,
        paymentOption: /free/i.test(course.fee) ? "Not Applicable / Free" : "Payment details requested",
        paymentStatus: /free/i.test(course.fee) ? "Not Applicable" : "Pending",
        paymentReference: "",
        paymentNote: "",
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone,
        organisation: form.organisation.trim(),
        message: form.message.trim(),
      });
      setShowRegistration(false);
      setForm(emptyForm);
      alert("Registration submitted. The academy will share confirmation and payment details.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "The registration could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <section className="tm3-course-hero">
        <div className="tm3-course-hero__image" style={{ backgroundImage: `url('${course.imageUrl}')` }} />
        <div className="tm3-course-hero__inner">
          <div className="tm3-course-hero__copy">
            <Link className="tm3-back-link" to="/student"><ArrowLeft size={15} /> Back to catalogue</Link>
            <div className="tm3-course-hero__badges">
              <Badge tone="gold">{course.category}</Badge>
              <Badge tone="green">{course.level}</Badge>
              <Badge>{course.mode}</Badge>
            </div>
            <h1>{course.title}</h1>
            <p className="tm3-course-hero__lead">{course.description}</p>
            <div className="tm3-hero__actions">
              <button className="tm3-button tm3-button--lime" type="button" onClick={() => setShowRegistration(true)}>Register interest <ArrowRight size={17} /></button>
              {course.brochureData && <button className="tm3-button tm3-button--outline" style={{ color: "white", borderColor: "rgba(255,255,255,.3)" }} type="button" onClick={() => setPdf({ title: "Programme brochure", url: getPdfPreviewUrl(course.brochureData) })}><FileText size={17} /> View brochure</button>}
            </div>
          </div>

          <aside className="tm3-course-summary">
            <div className="tm3-course-summary__price"><span>Programme fee</span><strong>{formatFee(course.fee)}</strong></div>
            <div className="tm3-detail-list">
              <div className="tm3-detail-row"><span><Clock3 size={14} /> Duration</span><strong>{course.duration} hrs</strong></div>
              <div className="tm3-detail-row"><span><MonitorPlay size={14} /> Format</span><strong>{course.mode}</strong></div>
              <div className="tm3-detail-row"><span><CalendarDays size={14} /> Starts</span><strong>{formatDate(course.startDate)}</strong></div>
              <div className="tm3-detail-row"><span><GraduationCap size={14} /> Level</span><strong>{course.level}</strong></div>
              <div className="tm3-detail-row"><span><CheckCircle2 size={14} /> Recognition</span><strong>{course.certificate}</strong></div>
            </div>
            <button className="tm3-button tm3-button--dark" type="button" onClick={() => setShowRegistration(true)}>Register for programme <ArrowRight size={17} /></button>
          </aside>
        </div>
      </section>

      <section className="tm3-course-body">
        <div className="tm3-course-main">
          <article className="tm3-panel">
            <Eyebrow>Programme overview</Eyebrow>
            <h2>What this learning experience is designed to achieve</h2>
            <p>{course.description}</p>
          </article>

          <article className="tm3-panel">
            <Eyebrow>Learning outcomes</Eyebrow>
            <h2>Capabilities you will build</h2>
            <FeatureList items={outcomes.length ? outcomes : ["Understand the programme concepts and methods", "Apply relevant tools to guided engineering tasks", "Interpret results and communicate professional findings"]} />
          </article>

          <article className="tm3-panel">
            <Eyebrow>Learning experience</Eyebrow>
            <h2>What enrolled learners can access</h2>
            <FeatureList items={["Live or guided learning sessions", "Structured course resources and reference material", "Assignments and applied practice tasks", "Session recordings where provided", course.certificate]} />
          </article>

          <article className="tm3-panel">
            <Eyebrow>Faculty</Eyebrow>
            <h2>Learn with academic and practice expertise</h2>
            <div className="tm3-instructor-stack">
              {faculty.map((instructor) => (
                <div className="tm3-instructor-row" key={instructor.id}>
                  <img src={instructor.photoUrl} alt={instructor.name} />
                  <div><h3>{instructor.name}</h3><p style={{ color: "var(--tm3-green-700)", fontWeight: 800 }}>{instructor.designation}</p><p>{instructor.company}</p>{instructor.expertise && <p>{instructor.expertise}</p>}</div>
                  {instructor.cvData && <a className="tm3-button tm3-button--outline" href={getPdfPreviewUrl(instructor.cvData)} target="_blank" rel="noreferrer">Resume <ExternalLink size={15} /></a>}
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="tm3-course-side">
          <article className="tm3-panel">
            <Eyebrow>At a glance</Eyebrow>
            <h2>Programme details</h2>
            <div className="tm3-detail-list">
              <div className="tm3-detail-row"><span>Learning area</span><strong>{course.category}</strong></div>
              <div className="tm3-detail-row"><span>Theme</span><strong>{course.theme}</strong></div>
              <div className="tm3-detail-row"><span>Duration</span><strong>{course.duration} hrs</strong></div>
              <div className="tm3-detail-row"><span>Mode</span><strong>{course.mode}</strong></div>
              <div className="tm3-detail-row"><span>Start date</span><strong>{formatDate(course.startDate)}</strong></div>
            </div>
          </article>
          <article className="tm3-panel" style={{ background: "var(--tm3-green-950)", color: "white" }}>
            <UsersRound size={28} color="var(--tm3-lime)" />
            <h2 style={{ color: "white", marginTop: 15 }}>Need this for a group?</h2>
            <p style={{ color: "#b9cec5" }}>The academy can adapt programme delivery for institutional or professional cohorts.</p>
            <button className="tm3-button tm3-button--lime" type="button" onClick={() => setShowRegistration(true)}>Discuss enrolment</button>
          </article>
        </aside>
      </section>

      {showRegistration && (
        <div className="tm3-modal-backdrop" role="dialog" aria-modal="true" aria-label="Programme registration">
          <div className="tm3-modal">
            <button className="tm3-modal__close" type="button" onClick={() => setShowRegistration(false)} aria-label="Close"><X size={18} /></button>
            <Eyebrow>Programme registration</Eyebrow>
            <h2>{course.title}</h2>
            <div className="tm3-form">
              <div className="tm3-form-grid">
                <label className="tm3-field">Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
                <label className="tm3-field">Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
                <label className="tm3-field">Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="10-digit Indian mobile number" /></label>
                <label className="tm3-field">Organisation<input value={form.organisation} onChange={(event) => setForm({ ...form, organisation: event.target.value })} /></label>
              </div>
              <label className="tm3-field">Message<textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Optional question or context" /></label>
              <button className="tm3-button tm3-button--dark" type="button" onClick={() => void submit()} disabled={submitting}>{submitting ? "Submitting…" : "Submit registration"}<ArrowRight size={17} /></button>
            </div>
          </div>
        </div>
      )}

      {pdf && (
        <div className="tm3-modal-backdrop" role="dialog" aria-modal="true" aria-label={pdf.title}>
          <div className="tm3-modal tm3-modal--wide">
            <button className="tm3-modal__close" type="button" onClick={() => setPdf(null)} aria-label="Close"><X size={18} /></button>
            <h2>{pdf.title}</h2>
            <iframe className="tm3-pdf-frame" src={pdf.url} title={pdf.title} />
          </div>
        </div>
      )}
    </main>
  );
}
