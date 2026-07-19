import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Award,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  LayoutDashboard,
  LogOut,
  Search,
  Sparkles,
  Video,
} from "lucide-react";
import logo from "../assets/terramatrix-logo.png";
import heroImage from "../assets/hero-dam.jpg";
import { Badge, EmptyState } from "../components/Ui";
import { deriveShortTitle, formatDate, loadCourses, type Course } from "../lib/catalogData";

type EnrollmentStatus = "Enrolled" | "Course Completed" | "Certificate Issued";
type Enrollment = { id: number; courseId: number; courseTitle: string; name: string; email: string; phone: string; organisation: string; enrolledAt: string; status: EnrollmentStatus };
type EventRegistration = { id: number; kind: "Webinar" | "Workshop"; eventId: number; eventTitle: string; category: string; theme: string; date: string; time: string; mode: string; certification: string; name: string; email: string; phone: string; organisation: string; message: string; submittedAt: string; status: "Registered" | "Confirmed" | "Attended" | "Certificate Issued" };
type Login = { email: string; phone: string };
type ViewKey = "overview" | "learning" | "live" | "events" | "certificates";

const navItems: Array<{ key: ViewKey; label: string; icon: typeof LayoutDashboard }> = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "learning", label: "My Learning", icon: BookOpen },
  { key: "live", label: "Live & Schedule", icon: Video },
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "certificates", label: "Certificates", icon: Award },
];

function readArray<T>(key: string): T[] {
  try { const data = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(data) ? data : []; } catch { return []; }
}

function parseDate(value: string) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function progressFor(status: EnrollmentStatus) {
  if (status === "Certificate Issued") return 100;
  if (status === "Course Completed") return 92;
  return 24;
}

export default function StudentPortal() {
  const navigate = useNavigate();
  const [login, setLogin] = useState<Login | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [events, setEvents] = useState<EventRegistration[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [view, setView] = useState<ViewKey>("overview");

  useEffect(() => {
    const raw = localStorage.getItem("terramatrix_student_login") || sessionStorage.getItem("terramatrix_student_login");
    if (!raw) { navigate("/student-login"); return; }
    const parsed = JSON.parse(raw) as Login;
    setLogin(parsed);
    const allEnrollments = readArray<Enrollment>("terramatrix_enrollments");
    setEnrollments(allEnrollments.filter((item) => item.email.toLowerCase() === parsed.email.toLowerCase() && item.phone === parsed.phone));
    const allEvents = readArray<EventRegistration>("terramatrix_event_registrations");
    setEvents(allEvents.filter((item) => item.email.toLowerCase() === parsed.email.toLowerCase() && item.phone === parsed.phone));
    setCourses(loadCourses(false));
  }, [navigate]);

  const studentName = enrollments[0]?.name || events[0]?.name || "Learner";
  const activeCourses = enrollments.filter((item) => item.status === "Enrolled");
  const completed = enrollments.filter((item) => item.status === "Course Completed" || item.status === "Certificate Issued");
  const certificates = enrollments.filter((item) => item.status === "Certificate Issued");
  const eventCertificates = events.filter((item) => item.status === "Certificate Issued");
  const overallProgress = enrollments.length ? Math.round(enrollments.reduce((sum, item) => sum + progressFor(item.status), 0) / enrollments.length) : 0;

  const upcoming = useMemo(() => {
    const courseSessions = activeCourses.map((enrollment) => {
      const course = courses.find((item) => item.id === Number(enrollment.courseId));
      return course?.onlineSessionDate ? { id: `course-${enrollment.id}`, type: "Class", title: course.title, date: course.onlineSessionDate, time: course.onlineSessionTime, mode: course.mode, courseId: course.id } : null;
    }).filter(Boolean) as Array<{ id: string; type: string; title: string; date: string; time: string; mode: string; courseId: number }>;
    const eventSessions = events.map((item) => ({ id: `event-${item.id}`, type: item.kind, title: item.eventTitle, date: item.date, time: item.time, mode: item.mode, courseId: 0 }));
    return [...courseSessions, ...eventSessions]
      .filter((item) => item.date)
      .sort((a, b) => (parseDate(a.date)?.getTime() || 0) - (parseDate(b.date)?.getTime() || 0));
  }, [activeCourses, courses, events]);

  const logout = () => {
    localStorage.removeItem("terramatrix_student_login");
    sessionStorage.removeItem("terramatrix_student_login");
    navigate("/student-login");
  };

  const courseFor = (enrollment: Enrollment) => courses.find((item) => item.id === Number(enrollment.courseId));

  return (
    <main className="tm3-workspace">
      <aside className="tm3-workspace__sidebar">
        <div className="tm3-workspace__brand"><img src={logo} alt="" /><span><strong>TerraMatrix</strong><small>Learner workspace</small></span></div>
        <div className="tm3-workspace__profile"><span>Learner</span><strong>{studentName}</strong><small>{login?.email}</small></div>
        <nav className="tm3-workspace-nav" aria-label="Learner workspace">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button className={view === key ? "is-active" : ""} type="button" key={key} onClick={() => setView(key)}><Icon size={18} /><span>{label}</span></button>
          ))}
        </nav>
        <div className="tm3-workspace__sidebar-footer"><button type="button" onClick={logout}><LogOut size={17} /><span>Sign out</span></button></div>
      </aside>

      <section className="tm3-workspace__main">
        <header className="tm3-workspace-topbar">
          <div><h1>{navItems.find((item) => item.key === view)?.label}</h1><p>Welcome back, {studentName}. Continue where you left off.</p></div>
          <div className="tm3-workspace-topbar__actions"><Link className="tm3-button tm3-button--outline" to="/student"><Search size={16} /> Browse programmes</Link></div>
        </header>

        <div className="tm3-workspace-content">
          {view === "overview" && (
            <>
              <section className="tm3-dashboard-hero">
                <div><div className="tm3-eyebrow tm3-eyebrow--light">Your learning journey</div><h2>{activeCourses.length ? "Keep building momentum." : "Your next capability starts here."}</h2><p>{activeCourses.length ? `You have ${activeCourses.length} active programme${activeCourses.length === 1 ? "" : "s"}. Open a classroom to access the latest learning resources and schedule.` : "Once the academy enrols you into a programme, your learning workspace will organise all classes, resources and progress here."}</p></div>
                <div className="tm3-dashboard-hero__progress" style={{ "--progress": `${overallProgress}%` } as CSSProperties}><div><strong>{overallProgress}%</strong><span>overall progress</span></div></div>
              </section>

              <div className="tm3-stat-grid">
                <div className="tm3-stat-card"><span>Active programmes</span><strong>{activeCourses.length}</strong></div>
                <div className="tm3-stat-card"><span>Upcoming sessions</span><strong>{upcoming.length}</strong></div>
                <div className="tm3-stat-card"><span>Completed</span><strong>{completed.length}</strong></div>
                <div className="tm3-stat-card"><span>Certificates</span><strong>{certificates.length + eventCertificates.length}</strong></div>
              </div>

              <div className="tm3-dashboard-grid">
                <section className="tm3-dashboard-section">
                  <div className="tm3-dashboard-section__head"><h2>Continue learning</h2><button type="button" onClick={() => setView("learning")}>View all</button></div>
                  {enrollments.length === 0 ? (
                    <EmptyState title="No active learning yet" description="Your enrolled programmes will appear here after the academy confirms access." actionLabel="Explore programmes" actionTo="/student" />
                  ) : (
                    <div className="tm3-learning-list">
                      {enrollments.slice(0, 4).map((enrollment) => {
                        const course = courseFor(enrollment);
                        const progress = progressFor(enrollment.status);
                        return (
                          <article className="tm3-learning-item" key={enrollment.id}>
                            <div className="tm3-learning-item__image" style={{ backgroundImage: `url('${course?.imageUrl || heroImage}')` }} />
                            <div><div className="tm3-badge-row"><Badge tone={enrollment.status === "Enrolled" ? "green" : "gold"}>{enrollment.status}</Badge></div><h3>{course ? deriveShortTitle(course) : enrollment.courseTitle}</h3><p>{course?.category || "TerraMatrix programme"} · {course?.duration || "Duration TBA"} hrs</p><div className="tm3-learning-item__progress"><span style={{ width: `${progress}%` }} /></div></div>
                            <Link className="tm3-button tm3-button--dark" style={{ minHeight: 40, padding: "8px 13px" }} to={`/student-classroom/${course?.id || enrollment.courseId}`}>Open <ChevronRight size={15} /></Link>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="tm3-dashboard-section">
                  <div className="tm3-dashboard-section__head"><h2>Upcoming agenda</h2><button type="button" onClick={() => setView("live")}>Full schedule</button></div>
                  {upcoming.length === 0 ? <p style={{ color: "var(--tm3-muted)", fontSize: 13 }}>No scheduled sessions are available yet.</p> : (
                    <div className="tm3-agenda-list">
                      {upcoming.slice(0, 5).map((item) => {
                        const date = parseDate(item.date);
                        return <div className="tm3-agenda-item" key={item.id}><div className="tm3-agenda-item__date"><strong>{date?.getDate() || "—"}</strong><span>{date?.toLocaleString("en-IN", { month: "short" }) || "TBA"}</span></div><div><Badge tone="green">{item.type}</Badge><h3>{item.title}</h3><p>{item.time || "Time TBA"} · {item.mode}</p></div></div>;
                      })}
                    </div>
                  )}
                </section>
              </div>
            </>
          )}

          {view === "learning" && (
            <section className="tm3-dashboard-section">
              <div className="tm3-dashboard-section__head"><div><div className="tm3-eyebrow tm3-eyebrow--gold">My Learning</div><h2 style={{ marginTop: 8 }}>Enrolled programmes</h2></div><Badge tone="green">{enrollments.length} total</Badge></div>
              {enrollments.length === 0 ? <EmptyState title="No enrolled programmes" description="Programme access will appear after your enrolment is confirmed." actionLabel="Browse catalogue" actionTo="/student" /> : (
                <div className="tm3-learning-list">
                  {enrollments.map((enrollment) => {
                    const course = courseFor(enrollment); const progress = progressFor(enrollment.status);
                    return <article className="tm3-learning-item" key={enrollment.id}><div className="tm3-learning-item__image" style={{ backgroundImage: `url('${course?.imageUrl || heroImage}')` }} /><div><Badge tone={enrollment.status === "Enrolled" ? "green" : "gold"}>{enrollment.status}</Badge><h3>{course ? deriveShortTitle(course) : enrollment.courseTitle}</h3><p>{course?.category || "Programme"} · {course?.mode || "Mode TBA"} · {course?.duration || "Duration TBA"} hrs</p><div className="tm3-learning-item__progress"><span style={{ width: `${progress}%` }} /></div></div><Link className="tm3-button tm3-button--dark" to={`/student-classroom/${course?.id || enrollment.courseId}`}>Open classroom <ChevronRight size={15} /></Link></article>;
                  })}
                </div>
              )}
            </section>
          )}

          {view === "live" && (
            <section className="tm3-dashboard-section">
              <div className="tm3-dashboard-section__head"><div><div className="tm3-eyebrow tm3-eyebrow--gold">Schedule</div><h2 style={{ marginTop: 8 }}>Live classes and events</h2></div></div>
              {upcoming.length === 0 ? <EmptyState icon="calendar" title="No sessions are scheduled" description="Upcoming live classes, webinars and workshops will appear here." /> : (
                <div className="tm3-agenda-list">{upcoming.map((item) => <article className="tm3-panel" style={{ padding: 18 }} key={item.id}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 15 }}><div><div className="tm3-badge-row"><Badge tone="green">{item.type}</Badge><Badge>{item.mode}</Badge></div><h3 style={{ margin: "10px 0 4px" }}>{item.title}</h3><p style={{ margin: 0, color: "var(--tm3-muted)" }}><CalendarDays size={14} style={{ verticalAlign: -2 }} /> {formatDate(item.date)} · <Clock3 size={14} style={{ verticalAlign: -2 }} /> {item.time || "Time TBA"}</p></div>{item.courseId ? <Link className="tm3-button tm3-button--outline" to={`/student-classroom/${item.courseId}`}>Open classroom</Link> : <Badge tone="gold">Registered</Badge>}</div></article>)}</div>
              )}
            </section>
          )}

          {view === "events" && (
            <section className="tm3-dashboard-section">
              <div className="tm3-dashboard-section__head"><div><div className="tm3-eyebrow tm3-eyebrow--gold">My events</div><h2 style={{ marginTop: 8 }}>Webinars and workshops</h2></div><Badge tone="green">{events.length} registrations</Badge></div>
              {events.length === 0 ? <EmptyState icon="calendar" title="No event registrations" description="Registered webinars and workshops will appear here." /> : (
                <div className="tm3-learning-list">{events.map((item) => <article className="tm3-learning-item" key={item.id}><div className="tm3-learning-item__image" style={{ background: "linear-gradient(135deg,var(--tm3-green-900),var(--tm3-green-600))", display: "grid", placeItems: "center", color: "var(--tm3-lime)" }}>{item.kind === "Webinar" ? <Video size={25} /> : <Sparkles size={25} />}</div><div><div className="tm3-badge-row"><Badge tone="green">{item.kind}</Badge><Badge>{item.status}</Badge></div><h3>{item.eventTitle}</h3><p>{formatDate(item.date)} · {item.time || "Time TBA"} · {item.mode}</p></div><Badge tone={item.status === "Certificate Issued" ? "gold" : "neutral"}>{item.certification}</Badge></article>)}</div>
              )}
            </section>
          )}

          {view === "certificates" && (
            <section className="tm3-dashboard-section">
              <div className="tm3-dashboard-section__head"><div><div className="tm3-eyebrow tm3-eyebrow--gold">Achievements</div><h2 style={{ marginTop: 8 }}>Certificates and completion records</h2></div></div>
              {certificates.length + eventCertificates.length === 0 ? <EmptyState icon="spark" title="No certificates issued yet" description="Verified course and event certificates will appear here after completion." /> : (
                <div className="tm3-learning-list">
                  {certificates.map((item) => <article className="tm3-learning-item" key={`course-${item.id}`}><div className="tm3-learning-item__image" style={{ background: "var(--tm3-green-100)", display: "grid", placeItems: "center", color: "var(--tm3-green-700)" }}><Award size={28} /></div><div><Badge tone="gold">Course certificate</Badge><h3>{item.courseTitle}</h3><p>Certificate issued · TerraMatrix Academy</p></div><button className="tm3-button tm3-button--outline" type="button" disabled><FileText size={16} /> Certificate</button></article>)}
                  {eventCertificates.map((item) => <article className="tm3-learning-item" key={`event-${item.id}`}><div className="tm3-learning-item__image" style={{ background: "var(--tm3-green-100)", display: "grid", placeItems: "center", color: "var(--tm3-green-700)" }}><Award size={28} /></div><div><Badge tone="gold">{item.kind} certificate</Badge><h3>{item.eventTitle}</h3><p>Certificate issued · TerraMatrix Academy</p></div><button className="tm3-button tm3-button--outline" type="button" disabled><FileText size={16} /> Certificate</button></article>)}
                </div>
              )}
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
