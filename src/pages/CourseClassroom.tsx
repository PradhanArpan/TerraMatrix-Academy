import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  LayoutDashboard,
  Link2,
  LogOut,
  MessageSquareText,
  MonitorPlay,
  Paperclip,
  PlayCircle,
  Send,
  Sparkles,
  Video,
} from "lucide-react";
import logo from "../assets/terramatrix-logo.png";
import heroImage from "../assets/hero-dam.jpg";
import { Badge, EmptyState } from "../components/Ui";
import { deriveShortTitle, formatDate, loadCourses, normalizePublicAssetPath, type Course } from "../lib/catalogData";

type EnrollmentStatus = "Enrolled" | "Course Completed" | "Certificate Issued";
type Enrollment = {
  id: number;
  courseId: number;
  courseTitle: string;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  enrolledAt: string;
  status: EnrollmentStatus;
};
type Login = { email: string; phone: string };
type ClassworkType = "announcement" | "material" | "assignment" | "link" | "recording";
type ClassworkItem = {
  id: number;
  courseId: number;
  type: ClassworkType;
  title: string;
  instructions: string;
  link: string;
  fileName: string;
  fileData: string;
  dueDate: string;
  postedAt: string;
};
type Submission = {
  id: number;
  courseId: number;
  itemId: number;
  email: string;
  phone: string;
  response: string;
  fileName: string;
  fileData: string;
  submittedAt: string;
};
type Attendance = { id: number; courseId: number; email: string; phone: string; markedAt: string };
type Schedule = { id: number; courseId: number; date: string; time: string; note: string };
type ViewKey = "overview" | "stream" | "classwork" | "progress";

const navItems: Array<{ key: ViewKey; label: string; icon: typeof LayoutDashboard }> = [
  { key: "overview", label: "Course home", icon: LayoutDashboard },
  { key: "stream", label: "Stream", icon: MessageSquareText },
  { key: "classwork", label: "Classwork", icon: ClipboardCheck },
  { key: "progress", label: "Progress", icon: CheckCircle2 },
];

const typeMeta: Record<ClassworkType, { label: string; icon: typeof FileText; tone: "green" | "gold" | "blue" | "neutral" }> = {
  announcement: { label: "Announcement", icon: MessageSquareText, tone: "neutral" },
  material: { label: "Learning material", icon: FileText, tone: "blue" },
  assignment: { label: "Assignment", icon: ClipboardCheck, tone: "gold" },
  link: { label: "External resource", icon: Link2, tone: "green" },
  recording: { label: "Class recording", icon: PlayCircle, tone: "green" },
};

function readArray<T>(key: string): T[] {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function openUrl(value: string) {
  const clean = normalizePublicAssetPath(value);
  const match = clean.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  return match?.[1] ? `https://drive.google.com/file/d/${match[1]}/view` : clean;
}

function progressFor(status: EnrollmentStatus, submitted: number, totalAssignments: number) {
  if (status === "Certificate Issued") return 100;
  if (status === "Course Completed") return 92;
  if (!totalAssignments) return 22;
  return Math.min(86, 22 + Math.round((submitted / totalAssignments) * 64));
}

export default function CourseClassroom() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState<ViewKey>("overview");
  const [login, setLogin] = useState<Login | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [items, setItems] = useState<ClassworkItem[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [files, setFiles] = useState<Record<number, { fileName: string; fileData: string }>>({});
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("terramatrix_student_login") || sessionStorage.getItem("terramatrix_student_login");
    if (!raw) { navigate("/student-login"); return; }
    const parsed = JSON.parse(raw) as Login;
    setLogin(parsed);

    const requestedId = Number(courseId);
    const courses = loadCourses(false);
    const allEnrollments = readArray<Enrollment>("terramatrix_enrollments");
    const matchedEnrollment = allEnrollments.find((item) =>
      item.email.toLowerCase() === parsed.email.toLowerCase() &&
      item.phone === parsed.phone &&
      ["Enrolled", "Course Completed", "Certificate Issued"].includes(item.status) &&
      Number(item.courseId) === requestedId
    );
    if (!matchedEnrollment) { navigate("/student-portal"); return; }

    const matchedCourse = courses.find((item) => item.id === requestedId) || {
      ...courses[0],
      id: requestedId,
      title: matchedEnrollment.courseTitle,
      shortTitle: matchedEnrollment.courseTitle,
      imageUrl: heroImage,
    } as Course;

    setCourse(matchedCourse);
    setEnrollment(matchedEnrollment);
    setItems(readArray<ClassworkItem>("terramatrix_classwork_items").filter((item) => Number(item.courseId) === requestedId).sort((a, b) => b.id - a.id));
    setSchedules(readArray<Schedule>("terramatrix_class_schedules").filter((item) => Number(item.courseId) === requestedId).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)));

    const ownSubmissions = readArray<Submission>("terramatrix_assignment_submissions").filter((item) => Number(item.courseId) === requestedId && item.email.toLowerCase() === parsed.email.toLowerCase() && item.phone === parsed.phone);
    setSubmissions(ownSubmissions);
    setResponses(Object.fromEntries(ownSubmissions.map((item) => [item.itemId, item.response || ""])));
    setFiles(Object.fromEntries(ownSubmissions.map((item) => [item.itemId, { fileName: item.fileName || "", fileData: item.fileData || "" }])));
    setAttendanceMarked(readArray<Attendance>("terramatrix_attendance").some((item) => Number(item.courseId) === requestedId && item.email.toLowerCase() === parsed.email.toLowerCase() && item.phone === parsed.phone));
  }, [courseId, navigate]);

  const assignments = useMemo(() => items.filter((item) => item.type === "assignment"), [items]);
  const materials = useMemo(() => items.filter((item) => item.type === "material" || item.type === "link" || item.type === "recording"), [items]);
  const announcements = useMemo(() => items.filter((item) => item.type === "announcement"), [items]);
  const submittedIds = useMemo(() => new Set(submissions.map((item) => item.itemId)), [submissions]);
  const progress = enrollment ? progressFor(enrollment.status, submittedIds.size, assignments.length) : 0;
  const nextSession = schedules[0] || (course?.onlineSessionDate ? { id: 0, courseId: course.id, date: course.onlineSessionDate, time: course.onlineSessionTime, note: "Live class" } : null);

  const markAttendance = () => {
    if (!login || !course || attendanceMarked) return;
    const all = readArray<Attendance>("terramatrix_attendance");
    all.push({ id: Date.now(), courseId: course.id, email: login.email, phone: login.phone, markedAt: new Date().toLocaleString("en-IN") });
    localStorage.setItem("terramatrix_attendance", JSON.stringify(all));
    setAttendanceMarked(true);
    setNotice("Attendance recorded for this course.");
  };

  const upload = (itemId: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setNotice("Please select a file below 8 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => setFiles((current) => ({ ...current, [itemId]: { fileName: file.name, fileData: String(reader.result || "") } }));
    reader.readAsDataURL(file);
  };

  const submitAssignment = (item: ClassworkItem) => {
    if (!login || !course) return;
    const response = (responses[item.id] || "").trim();
    const file = files[item.id];
    if (!response && !file?.fileData) { setNotice("Add a response or attach a file before submitting."); return; }
    const all = readArray<Submission>("terramatrix_assignment_submissions");
    const existingIndex = all.findIndex((entry) => entry.courseId === course.id && entry.itemId === item.id && entry.email.toLowerCase() === login.email.toLowerCase() && entry.phone === login.phone);
    const submission: Submission = {
      id: existingIndex >= 0 ? all[existingIndex].id : Date.now(), courseId: course.id, itemId: item.id,
      email: login.email, phone: login.phone, response, fileName: file?.fileName || "", fileData: file?.fileData || "", submittedAt: new Date().toLocaleString("en-IN"),
    };
    if (existingIndex >= 0) all[existingIndex] = submission; else all.push(submission);
    localStorage.setItem("terramatrix_assignment_submissions", JSON.stringify(all));
    setSubmissions((current) => [...current.filter((entry) => entry.itemId !== item.id), submission]);
    setNotice(existingIndex >= 0 ? "Your submission has been updated." : "Assignment submitted successfully.");
  };

  const logout = () => {
    localStorage.removeItem("terramatrix_student_login");
    sessionStorage.removeItem("terramatrix_student_login");
    navigate("/student-login");
  };

  if (!course || !enrollment) return <div className="tm3-bootstrap"><div className="tm3-loader"><i /></div></div>;

  const courseImage = normalizePublicAssetPath(course.imageUrl, heroImage) || heroImage;

  return (
    <main className="tm3-workspace tm3-classroom">
      <aside className="tm3-workspace__sidebar">
        <Link className="tm3-workspace__brand" to="/student-portal"><img src={logo} alt="" /><span><strong>TerraMatrix</strong><small>Learning environment</small></span></Link>
        <Link className="tm3-back-link" to="/student-portal"><ArrowLeft size={16} /> My learning</Link>
        <div className="tm3-course-mini"><span>{course.category}</span><strong>{deriveShortTitle(course)}</strong><small>{course.mode} · {course.duration} hrs</small></div>
        <nav className="tm3-workspace-nav" aria-label="Course classroom">
          {navItems.map(({ key, label, icon: Icon }) => <button type="button" className={view === key ? "is-active" : ""} key={key} onClick={() => setView(key)}><Icon size={18} /><span>{label}</span></button>)}
        </nav>
        <div className="tm3-workspace__sidebar-footer"><button type="button" onClick={logout}><LogOut size={17} /><span>Sign out</span></button></div>
      </aside>

      <section className="tm3-workspace__main">
        <header className="tm3-workspace-topbar">
          <div><span className="tm3-workspace-kicker">{course.category}</span><h1>{deriveShortTitle(course)}</h1><p>{course.instructorName || "TerraMatrix Faculty"}</p></div>
          <div className="tm3-workspace-topbar__actions">
            {course.onlineSessionLink && <a className="tm3-button tm3-button--gold" href={course.onlineSessionLink} target="_blank" rel="noreferrer"><Video size={16} /> Join live class</a>}
          </div>
        </header>

        <div className="tm3-workspace-content">
          {notice && <div className="tm3-notice" role="status"><CheckCircle2 size={18} /><span>{notice}</span><button type="button" onClick={() => setNotice("")}>×</button></div>}

          {view === "overview" && (
            <>
              <section className="tm3-classroom-hero">
                <div className="tm3-classroom-hero__image" style={{ backgroundImage: `linear-gradient(110deg, rgba(4,40,34,.94), rgba(4,40,34,.34)), url('${courseImage}')` }}>
                  <div><Badge tone="gold">{enrollment.status}</Badge><h2>{course.title}</h2><p>{course.description}</p></div>
                </div>
                <div className="tm3-classroom-progress"><span>Course progress</span><strong>{progress}%</strong><div><i style={{ width: `${progress}%` }} /></div><small>{submittedIds.size} of {assignments.length || 0} assignments submitted</small></div>
              </section>

              <div className="tm3-stat-grid">
                <div className="tm3-stat-card"><span>Learning resources</span><strong>{materials.length}</strong></div>
                <div className="tm3-stat-card"><span>Assignments</span><strong>{assignments.length}</strong></div>
                <div className="tm3-stat-card"><span>Live sessions</span><strong>{schedules.length + (course.onlineSessionDate ? 1 : 0)}</strong></div>
                <div className="tm3-stat-card"><span>Attendance</span><strong>{attendanceMarked ? "Marked" : "Pending"}</strong></div>
              </div>

              <div className="tm3-dashboard-grid">
                <section className="tm3-dashboard-section">
                  <div className="tm3-dashboard-section__head"><h2>Next learning action</h2><button type="button" onClick={() => setView("classwork")}>Open classwork</button></div>
                  {assignments.length ? assignments.slice(0, 2).map((item) => (
                    <article className="tm3-action-card" key={item.id}><span className="tm3-action-card__icon"><ClipboardCheck size={20} /></span><div><Badge tone={submittedIds.has(item.id) ? "green" : "gold"}>{submittedIds.has(item.id) ? "Submitted" : "Action required"}</Badge><h3>{item.title}</h3><p>{item.instructions || "Review the brief and submit your response."}</p></div><button type="button" onClick={() => setView("classwork")}><ChevronRight size={18} /></button></article>
                  )) : <EmptyState title="No classwork published" description="Assignments and activities from your instructor will appear here." />}
                </section>

                <section className="tm3-dashboard-section">
                  <div className="tm3-dashboard-section__head"><h2>Upcoming class</h2><button type="button" onClick={() => setView("stream")}>View stream</button></div>
                  {nextSession ? <div className="tm3-session-card"><span className="tm3-session-card__date"><strong>{new Date(`${nextSession.date}T00:00:00`).getDate() || "–"}</strong><small>{new Date(`${nextSession.date}T00:00:00`).toLocaleString("en-IN", { month: "short" })}</small></span><div><Badge tone="green">Live session</Badge><h3>{nextSession.note || course.title}</h3><p><Clock3 size={15} /> {nextSession.time || "Time TBA"}</p></div>{course.onlineSessionLink && <a href={course.onlineSessionLink} target="_blank" rel="noreferrer"><ExternalLink size={18} /></a>}</div> : <EmptyState title="No upcoming sessions" description="Your next live class will appear here when it is scheduled." />}
                  <button className={`tm3-attendance-button ${attendanceMarked ? "is-complete" : ""}`} type="button" onClick={markAttendance} disabled={attendanceMarked}><CheckCircle2 size={18} />{attendanceMarked ? "Attendance marked" : "Mark attendance"}</button>
                </section>
              </div>
            </>
          )}

          {view === "stream" && (
            <section className="tm3-dashboard-section tm3-dashboard-section--wide">
              <div className="tm3-dashboard-section__head"><div><span className="tm3-eyebrow">Class stream</span><h2>Announcements and sessions</h2></div></div>
              <div className="tm3-stream-list">
                {announcements.length === 0 && schedules.length === 0 ? <EmptyState title="The stream is quiet" description="Announcements and scheduled classes will appear here." /> : null}
                {announcements.map((item) => <article className="tm3-stream-item" key={item.id}><span><MessageSquareText size={20} /></span><div><small>{item.postedAt}</small><h3>{item.title}</h3><p>{item.instructions}</p></div></article>)}
                {schedules.map((item) => <article className="tm3-stream-item" key={`schedule-${item.id}`}><span><CalendarDays size={20} /></span><div><small>{formatDate(item.date)} · {item.time || "Time TBA"}</small><h3>{item.note || "Live class"}</h3><p>Open the course live-session link at the scheduled time.</p></div></article>)}
              </div>
            </section>
          )}

          {view === "classwork" && (
            <section className="tm3-classwork-layout">
              <div className="tm3-classwork-main">
                <div className="tm3-dashboard-section__head"><div><span className="tm3-eyebrow">Learning plan</span><h2>Classwork and resources</h2></div></div>
                {items.length === 0 ? <EmptyState title="No content published yet" description="Your instructor's learning materials, recordings and assignments will appear here." /> : (
                  <div className="tm3-classwork-list">
                    {items.filter((item) => item.type !== "announcement").map((item) => {
                      const meta = typeMeta[item.type]; const Icon = meta.icon; const submitted = submittedIds.has(item.id);
                      return <article className="tm3-classwork-card" key={item.id}>
                        <div className="tm3-classwork-card__head"><span className={`tm3-resource-icon tm3-resource-icon--${meta.tone}`}><Icon size={20} /></span><div><Badge tone={meta.tone}>{meta.label}</Badge><h3>{item.title}</h3><small>{item.dueDate ? `Due ${formatDate(item.dueDate)}` : item.postedAt}</small></div>{submitted && <Badge tone="green">Submitted</Badge>}</div>
                        {item.instructions && <p>{item.instructions}</p>}
                        <div className="tm3-classwork-card__links">
                          {item.link && <a href={openUrl(item.link)} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Open resource</a>}
                          {item.fileData && <a href={openUrl(item.fileData)} target="_blank" rel="noreferrer" download={item.fileName || undefined}><Download size={16} /> {item.fileName || "Download file"}</a>}
                        </div>
                        {item.type === "assignment" && <div className="tm3-submission-box"><label htmlFor={`response-${item.id}`}>Your response</label><textarea id={`response-${item.id}`} value={responses[item.id] || ""} onChange={(event) => setResponses((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Add your response, link or submission note…" /><div className="tm3-submission-box__footer"><label className="tm3-file-button"><Paperclip size={16} />{files[item.id]?.fileName || "Attach file"}<input type="file" onChange={(event) => upload(item.id, event)} /></label><button className="tm3-button tm3-button--dark" type="button" onClick={() => submitAssignment(item)}><Send size={16} /> {submitted ? "Update submission" : "Submit assignment"}</button></div></div>}
                      </article>;
                    })}
                  </div>
                )}
              </div>
              <aside className="tm3-classwork-side"><div><Sparkles size={20} /><h3>Learning support</h3><p>Use the stream for announcements, join live classes on time, and keep every assignment submission clear and evidence-based.</p></div><div><BookOpen size={20} /><h3>Course resources</h3><p>{materials.length} resource{materials.length === 1 ? "" : "s"} available in this classroom.</p></div></aside>
            </section>
          )}

          {view === "progress" && (
            <section className="tm3-progress-page">
              <div className="tm3-dashboard-section__head"><div><span className="tm3-eyebrow">Learning analytics</span><h2>Your progress</h2></div></div>
              <div className="tm3-progress-overview"><div className="tm3-progress-ring"><strong>{progress}%</strong><span>complete</span></div><div><h3>{enrollment.status}</h3><p>Your progress is based on course status and assignment submissions.</p><div className="tm3-progress-bar"><span style={{ width: `${progress}%` }} /></div></div></div>
              <div className="tm3-progress-checklist">
                <article className="is-complete"><CheckCircle2 size={20} /><div><h3>Course access activated</h3><p>Enrolled on {formatDate(enrollment.enrolledAt)}</p></div></article>
                <article className={attendanceMarked ? "is-complete" : ""}><CheckCircle2 size={20} /><div><h3>Attendance record</h3><p>{attendanceMarked ? "Attendance has been recorded." : "Mark attendance from the course home."}</p></div></article>
                <article className={assignments.length > 0 && submittedIds.size === assignments.length ? "is-complete" : ""}><CheckCircle2 size={20} /><div><h3>Assignments completed</h3><p>{submittedIds.size} of {assignments.length} submitted</p></div></article>
                <article className={enrollment.status === "Certificate Issued" ? "is-complete" : ""}><CheckCircle2 size={20} /><div><h3>Certificate issued</h3><p>{enrollment.status === "Certificate Issued" ? "Your credential is ready." : "Issued after course completion and verification."}</p></div></article>
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
