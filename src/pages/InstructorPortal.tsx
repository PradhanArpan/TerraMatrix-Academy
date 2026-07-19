import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileText,
  LayoutDashboard,
  Link2,
  LogOut,
  Megaphone,
  MonitorPlay,
  Paperclip,
  Plus,
  Send,
  Settings2,
  Users,
  Video,
  X,
} from "lucide-react";
import logo from "../assets/terramatrix-logo.png";
import heroImage from "../assets/hero-dam.jpg";
import { Badge, EmptyState } from "../components/Ui";
import { deriveShortTitle, formatDate, loadCourses, loadInstructors, normalizePublicAssetPath, type Course, type Instructor } from "../lib/catalogData";

type InstructorLogin = { id?: number; name: string; email: string; phone?: string };
type Enrollment = { id: number; courseId: number; courseTitle: string; name: string; email: string; phone: string; organisation: string; enrolledAt: string; status: string };
type ClassworkType = "announcement" | "material" | "assignment" | "link" | "recording";
type ClassworkItem = { id: number; courseId: number; type: ClassworkType; title: string; instructions: string; link: string; fileName: string; fileData: string; dueDate: string; postedAt: string };
type Submission = { id: number; courseId: number; itemId: number; email: string; phone: string; response: string; fileName: string; fileData: string; submittedAt: string };
type Attendance = { id: number; courseId: number; email: string; phone: string; markedAt: string };
type Schedule = { id: number; courseId: number; date: string; time: string; note: string };
type ViewKey = "home" | "calendar" | "course";
type CourseTab = "stream" | "classwork" | "people" | "analytics";

type Draft = { type: ClassworkType; title: string; instructions: string; link: string; dueDate: string; fileName: string; fileData: string };
const emptyDraft: Draft = { type: "announcement", title: "", instructions: "", link: "", dueDate: "", fileName: "", fileData: "" };

const typeMeta: Record<ClassworkType, { label: string; icon: typeof FileText; tone: "green" | "gold" | "blue" | "neutral" }> = {
  announcement: { label: "Announcement", icon: Megaphone, tone: "neutral" },
  material: { label: "Material", icon: FileText, tone: "blue" },
  assignment: { label: "Assignment", icon: ClipboardCheck, tone: "gold" },
  link: { label: "Link", icon: Link2, tone: "green" },
  recording: { label: "Recording", icon: MonitorPlay, tone: "green" },
};

function readArray<T>(key: string): T[] {
  try { const parsed = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
}
function saveArray<T>(key: string, value: T[]) { localStorage.setItem(key, JSON.stringify(value)); }
function safeText(value: unknown) { return String(value || "").trim(); }

export default function InstructorPortal() {
  const navigate = useNavigate();
  const [login, setLogin] = useState<InstructorLogin | null>(null);
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [view, setView] = useState<ViewKey>("home");
  const [tab, setTab] = useState<CourseTab>("stream");
  const [items, setItems] = useState<ClassworkItem[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ date: "", time: "", note: "" });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("terramatrix_instructor_login") || sessionStorage.getItem("terramatrix_instructor_login");
    if (!raw) { navigate("/instructor-login"); return; }
    const parsed = JSON.parse(raw) as InstructorLogin;
    setLogin(parsed);
    const instructors = loadInstructors();
    const profile = instructors.find((item) => (parsed.id && item.id === Number(parsed.id)) || item.email.toLowerCase() === parsed.email.toLowerCase() || item.name.toLowerCase() === parsed.name.toLowerCase()) || null;
    setInstructor(profile);
    const assigned = loadCourses(false).filter((course) => {
      if (profile && course.instructorIds.includes(profile.id)) return true;
      const name = `${course.instructorName}`.toLowerCase();
      return name.includes(parsed.name.toLowerCase()) || parsed.name.toLowerCase().includes(name);
    });
    setCourses(assigned);
    setItems(readArray<ClassworkItem>("terramatrix_classwork_items"));
    setEnrollments(readArray<Enrollment>("terramatrix_enrollments"));
    setSubmissions(readArray<Submission>("terramatrix_assignment_submissions"));
    setAttendance(readArray<Attendance>("terramatrix_attendance"));
    setSchedules(readArray<Schedule>("terramatrix_class_schedules"));
  }, [navigate]);

  const selectedCourse = courses.find((item) => item.id === selectedId) || null;
  const courseItems = useMemo(() => items.filter((item) => item.courseId === selectedId).sort((a, b) => b.id - a.id), [items, selectedId]);
  const courseStudents = useMemo(() => enrollments.filter((item) => item.courseId === selectedId), [enrollments, selectedId]);
  const courseSubmissions = useMemo(() => submissions.filter((item) => item.courseId === selectedId), [submissions, selectedId]);
  const courseAttendance = useMemo(() => attendance.filter((item) => item.courseId === selectedId), [attendance, selectedId]);
  const courseSchedules = useMemo(() => schedules.filter((item) => item.courseId === selectedId).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)), [schedules, selectedId]);
  const totalStudents = useMemo(() => new Set(enrollments.map((item) => `${item.email}|${item.phone}`)).size, [enrollments]);
  const assignmentCount = courseItems.filter((item) => item.type === "assignment").length;
  const completionRate = courseStudents.length ? Math.round((courseStudents.filter((item) => /completed|certificate/i.test(item.status)).length / courseStudents.length) * 100) : 0;

  const openCourse = (id: number) => { setSelectedId(id); setView("course"); setTab("stream"); };
  const goHome = () => { setSelectedId(null); setView("home"); };
  const goCalendar = () => { setSelectedId(null); setView("calendar"); };

  const uploadDraft = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (file.size > 12 * 1024 * 1024) { setNotice("Please use a file below 12 MB or add a Drive link."); return; }
    const reader = new FileReader(); reader.onload = () => setDraft((current) => ({ ...current, fileName: file.name, fileData: String(reader.result || "") })); reader.readAsDataURL(file);
  };

  const publishItem = () => {
    if (!selectedCourse || !safeText(draft.title)) { setNotice("Add a clear title before publishing."); return; }
    const item: ClassworkItem = { id: Date.now(), courseId: selectedCourse.id, type: draft.type, title: safeText(draft.title), instructions: safeText(draft.instructions), link: safeText(draft.link), dueDate: draft.dueDate, fileName: draft.fileName, fileData: draft.fileData, postedAt: new Date().toLocaleString("en-IN") };
    const next = [...items, item]; setItems(next); saveArray("terramatrix_classwork_items", next); setDraft(emptyDraft); setComposerOpen(false); setNotice(`${typeMeta[item.type].label} published to the class.`);
  };

  const deleteItem = (id: number) => {
    if (!window.confirm("Delete this classwork item?")) return;
    const next = items.filter((item) => item.id !== id); setItems(next); saveArray("terramatrix_classwork_items", next);
  };

  const addSchedule = () => {
    if (!selectedCourse || !newSchedule.date || !newSchedule.time) { setNotice("Choose a date and time for the class."); return; }
    const entry: Schedule = { id: Date.now(), courseId: selectedCourse.id, ...newSchedule, note: newSchedule.note || "Live class" };
    const next = [...schedules, entry]; setSchedules(next); saveArray("terramatrix_class_schedules", next); setNewSchedule({ date: "", time: "", note: "" }); setScheduleOpen(false); setNotice("Class added to the learner and instructor schedules.");
  };

  const logout = () => { localStorage.removeItem("terramatrix_instructor_login"); sessionStorage.removeItem("terramatrix_instructor_login"); navigate("/instructor-login"); };

  const workspaceTitle = selectedCourse ? deriveShortTitle(selectedCourse) : view === "calendar" ? "Teaching calendar" : "Instructor overview";

  return (
    <main className="tm3-workspace tm3-instructor-workspace">
      <aside className="tm3-workspace__sidebar">
        <Link className="tm3-workspace__brand" to="/"><img src={logo} alt="" /><span><strong>TerraMatrix</strong><small>Instructor workspace</small></span></Link>
        <div className="tm3-workspace__profile"><span>Instructor</span><strong>{login?.name || "Instructor"}</strong><small>{instructor?.designation || login?.email}</small></div>
        <nav className="tm3-workspace-nav" aria-label="Instructor workspace">
          <button type="button" className={view === "home" ? "is-active" : ""} onClick={goHome}><LayoutDashboard size={18} /><span>Overview</span></button>
          <button type="button" className={view === "calendar" ? "is-active" : ""} onClick={goCalendar}><CalendarDays size={18} /><span>Calendar</span></button>
        </nav>
        <div className="tm3-sidebar-label">My programmes</div>
        <div className="tm3-sidebar-courses">
          {courses.map((course) => <button type="button" className={selectedId === course.id ? "is-active" : ""} key={course.id} onClick={() => openCourse(course.id)}><span>{deriveShortTitle(course).slice(0, 1)}</span><strong>{deriveShortTitle(course)}</strong></button>)}
          {!courses.length && <p>No programmes assigned.</p>}
        </div>
        <div className="tm3-workspace__sidebar-footer"><button type="button" onClick={logout}><LogOut size={17} /><span>Sign out</span></button></div>
      </aside>

      <section className="tm3-workspace__main">
        <header className="tm3-workspace-topbar">
          <div><span className="tm3-workspace-kicker">Instructor studio</span><h1>{workspaceTitle}</h1><p>{selectedCourse ? `${selectedCourse.category} · ${courseStudents.length} learners` : `Welcome back, ${login?.name || "Instructor"}.`}</p></div>
          <div className="tm3-workspace-topbar__actions">{selectedCourse && <><button className="tm3-button tm3-button--outline" type="button" onClick={() => setScheduleOpen(true)}><CalendarDays size={16} /> Schedule class</button><button className="tm3-button tm3-button--gold" type="button" onClick={() => setComposerOpen(true)}><Plus size={16} /> Create</button></>}</div>
        </header>

        <div className="tm3-workspace-content">
          {notice && <div className="tm3-notice"><CheckCircle2 size={18} /><span>{notice}</span><button type="button" onClick={() => setNotice("")}>×</button></div>}

          {view === "home" && !selectedCourse && <InstructorHome courses={courses} enrollments={enrollments} submissions={submissions} totalStudents={totalStudents} onOpen={openCourse} />}
          {view === "calendar" && !selectedCourse && <InstructorCalendar courses={courses} schedules={schedules} onOpen={openCourse} />}
          {view === "course" && selectedCourse && (
            <>
              <section className="tm3-instructor-course-hero" style={{ backgroundImage: `linear-gradient(105deg,rgba(5,35,29,.96),rgba(5,35,29,.38)),url('${normalizePublicAssetPath(selectedCourse.imageUrl, heroImage) || heroImage}')` }}>
                <div><Badge tone="gold">{selectedCourse.status}</Badge><h2>{selectedCourse.title}</h2><p>{selectedCourse.description}</p><div className="tm3-hero__proof"><span><Users size={16} /> {courseStudents.length} learners</span><span><ClipboardCheck size={16} /> {assignmentCount} assignments</span><span><CalendarDays size={16} /> {courseSchedules.length} scheduled classes</span></div></div>
              </section>
              <div className="tm3-course-tabs" role="tablist">
                {(["stream", "classwork", "people", "analytics"] as CourseTab[]).map((key) => <button type="button" role="tab" aria-selected={tab === key} className={tab === key ? "is-active" : ""} key={key} onClick={() => setTab(key)}>{key === "stream" ? <Megaphone size={17} /> : key === "classwork" ? <BookOpen size={17} /> : key === "people" ? <Users size={17} /> : <BarChart3 size={17} />}{key.charAt(0).toUpperCase() + key.slice(1)}</button>)}
              </div>
              {tab === "stream" && <CourseStream items={courseItems.filter((item) => item.type === "announcement" || item.type === "recording")} schedules={courseSchedules} course={selectedCourse} onCreate={() => setComposerOpen(true)} onDelete={deleteItem} />}
              {tab === "classwork" && <CourseClasswork items={courseItems.filter((item) => item.type !== "announcement")} submissions={courseSubmissions} onCreate={() => setComposerOpen(true)} onDelete={deleteItem} />}
              {tab === "people" && <CoursePeople students={courseStudents} attendance={courseAttendance} />}
              {tab === "analytics" && <CourseAnalytics students={courseStudents} items={courseItems} submissions={courseSubmissions} attendance={courseAttendance} completionRate={completionRate} />}
            </>
          )}
        </div>
      </section>

      {composerOpen && selectedCourse && <ComposerModal draft={draft} setDraft={setDraft} onUpload={uploadDraft} onClose={() => { setComposerOpen(false); setDraft(emptyDraft); }} onPublish={publishItem} />}
      {scheduleOpen && selectedCourse && <ScheduleModal value={newSchedule} setValue={setNewSchedule} onClose={() => setScheduleOpen(false)} onSave={addSchedule} />}
    </main>
  );
}

function InstructorHome({ courses, enrollments, submissions, totalStudents, onOpen }: { courses: Course[]; enrollments: Enrollment[]; submissions: Submission[]; totalStudents: number; onOpen: (id: number) => void }) {
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long" });
  return <>
    <section className="tm3-dashboard-hero tm3-dashboard-hero--instructor"><div><div className="tm3-eyebrow tm3-eyebrow--light">Teaching intelligence</div><h2>Shape learning. Track progress. Build capability.</h2><p>Manage every class, resource, assignment and learner interaction from one focused workspace.</p></div><div className="tm3-instructor-today"><CalendarDays size={22} /><span>Today</span><strong>{today}</strong></div></section>
    <div className="tm3-stat-grid"><div className="tm3-stat-card"><span>Assigned programmes</span><strong>{courses.length}</strong></div><div className="tm3-stat-card"><span>Unique learners</span><strong>{totalStudents}</strong></div><div className="tm3-stat-card"><span>Submissions</span><strong>{submissions.length}</strong></div><div className="tm3-stat-card"><span>Active enrolments</span><strong>{enrollments.filter((item) => item.status === "Enrolled").length}</strong></div></div>
    <section className="tm3-dashboard-section tm3-dashboard-section--wide"><div className="tm3-dashboard-section__head"><div><span className="tm3-eyebrow">My programmes</span><h2>Teaching portfolio</h2></div></div>{courses.length ? <div className="tm3-instructor-course-grid">{courses.map((course) => { const count = enrollments.filter((item) => item.courseId === course.id).length; return <article key={course.id}><div className="tm3-instructor-course-card__image" style={{ backgroundImage: `linear-gradient(to top,rgba(5,35,29,.82),transparent),url('${normalizePublicAssetPath(course.imageUrl, heroImage) || heroImage}')` }}><Badge tone="gold">{course.status}</Badge><h3>{deriveShortTitle(course)}</h3></div><div><span>{course.category}</span><strong>{count} learner{count === 1 ? "" : "s"}</strong><button type="button" onClick={() => onOpen(course.id)}>Open classroom <ChevronRight size={17} /></button></div></article>; })}</div> : <EmptyState title="No assigned programmes" description="The academy administrator can assign courses to your instructor profile." />}</section>
  </>;
}

function InstructorCalendar({ courses, schedules, onOpen }: { courses: Course[]; schedules: Schedule[]; onOpen: (id: number) => void }) {
  const events = schedules.map((item) => ({ ...item, course: courses.find((course) => course.id === item.courseId) })).filter((item) => item.course).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  return <section className="tm3-dashboard-section tm3-dashboard-section--wide"><div className="tm3-dashboard-section__head"><div><span className="tm3-eyebrow">Teaching schedule</span><h2>Upcoming classes</h2></div></div>{events.length ? <div className="tm3-calendar-agenda">{events.map((item) => <article key={item.id}><span className="tm3-session-card__date"><strong>{new Date(`${item.date}T00:00:00`).getDate()}</strong><small>{new Date(`${item.date}T00:00:00`).toLocaleString("en-IN", { month: "short" })}</small></span><div><Badge tone="green">Live class</Badge><h3>{item.note || deriveShortTitle(item.course!)}</h3><p>{deriveShortTitle(item.course!)} · {item.time}</p></div><button type="button" onClick={() => onOpen(item.courseId)}>Open <ChevronRight size={17} /></button></article>)}</div> : <EmptyState title="No classes scheduled" description="Open a programme and schedule a class to build your teaching calendar." />}</section>;
}

function CourseStream({ items, schedules, course, onCreate, onDelete }: { items: ClassworkItem[]; schedules: Schedule[]; course: Course; onCreate: () => void; onDelete: (id: number) => void }) {
  return <div className="tm3-instructor-two-col"><section className="tm3-dashboard-section"><div className="tm3-dashboard-section__head"><h2>Class stream</h2><button type="button" onClick={onCreate}>Post update</button></div><div className="tm3-stream-list">{items.length ? items.map((item) => { const meta = typeMeta[item.type]; const Icon = meta.icon; return <article className="tm3-stream-item tm3-stream-item--admin" key={item.id}><span><Icon size={20} /></span><div><small>{item.postedAt}</small><h3>{item.title}</h3><p>{item.instructions}</p>{item.link && <a href={item.link} target="_blank" rel="noreferrer">Open link</a>}</div><button type="button" onClick={() => onDelete(item.id)}><X size={16} /></button></article>; }) : <EmptyState title="Start the conversation" description="Announcements and recordings help learners stay oriented between classes." actionLabel="Create announcement" onAction={onCreate} />}</div></section><aside className="tm3-dashboard-section"><div className="tm3-dashboard-section__head"><h2>Class schedule</h2></div>{schedules.length ? <div className="tm3-mini-agenda">{schedules.slice(0, 6).map((item) => <div key={item.id}><CalendarDays size={17} /><span><strong>{item.note || "Live class"}</strong><small>{formatDate(item.date)} · {item.time}</small></span></div>)}</div> : <p className="tm3-muted-copy">No classes are scheduled yet.</p>}{course.onlineSessionLink && <a className="tm3-button tm3-button--dark tm3-full-button" href={course.onlineSessionLink} target="_blank" rel="noreferrer"><Video size={16} /> Open meeting room</a>}</aside></div>;
}

function CourseClasswork({ items, submissions, onCreate, onDelete }: { items: ClassworkItem[]; submissions: Submission[]; onCreate: () => void; onDelete: (id: number) => void }) {
  return <section className="tm3-dashboard-section tm3-dashboard-section--wide"><div className="tm3-dashboard-section__head"><div><span className="tm3-eyebrow">Learning design</span><h2>Classwork and resources</h2></div><button type="button" onClick={onCreate}>Create classwork</button></div>{items.length ? <div className="tm3-classwork-list">{items.map((item) => { const meta = typeMeta[item.type]; const Icon = meta.icon; const count = submissions.filter((submission) => submission.itemId === item.id).length; return <article className="tm3-classwork-card" key={item.id}><div className="tm3-classwork-card__head"><span className={`tm3-resource-icon tm3-resource-icon--${meta.tone}`}><Icon size={20} /></span><div><Badge tone={meta.tone}>{meta.label}</Badge><h3>{item.title}</h3><small>{item.dueDate ? `Due ${formatDate(item.dueDate)}` : item.postedAt}</small></div><button className="tm3-icon-delete" type="button" onClick={() => onDelete(item.id)}><X size={16} /></button></div>{item.instructions && <p>{item.instructions}</p>}<div className="tm3-classwork-card__links"><span><Users size={16} /> {item.type === "assignment" ? `${count} submissions` : "Published to class"}</span>{item.link && <a href={item.link} target="_blank" rel="noreferrer">Open resource</a>}</div></article>; })}</div> : <EmptyState title="No classwork yet" description="Create an assignment, material, external link or recording for this programme." actionLabel="Create classwork" onAction={onCreate} />}</section>;
}

function CoursePeople({ students, attendance }: { students: Enrollment[]; attendance: Attendance[] }) {
  const attended = new Set(attendance.map((item) => `${item.email}|${item.phone}`));
  return <section className="tm3-dashboard-section tm3-dashboard-section--wide"><div className="tm3-dashboard-section__head"><div><span className="tm3-eyebrow">Learner management</span><h2>People</h2></div><Badge tone="green">{students.length} enrolled</Badge></div>{students.length ? <div className="tm3-people-table"><div className="tm3-people-table__head"><span>Learner</span><span>Organisation</span><span>Status</span><span>Attendance</span></div>{students.map((student) => <div className="tm3-people-table__row" key={student.id}><span><i>{student.name.slice(0, 1).toUpperCase()}</i><span><strong>{student.name}</strong><small>{student.email}</small></span></span><span>{student.organisation || "—"}</span><span><Badge tone={/completed|certificate/i.test(student.status) ? "gold" : "green"}>{student.status}</Badge></span><span>{attended.has(`${student.email}|${student.phone}`) ? <Badge tone="green">Marked</Badge> : <Badge tone="neutral">Pending</Badge>}</span></div>)}</div> : <EmptyState title="No enrolled learners" description="Learners will appear here after the admin confirms enrolment." />}</section>;
}

function CourseAnalytics({ students, items, submissions, attendance, completionRate }: { students: Enrollment[]; items: ClassworkItem[]; submissions: Submission[]; attendance: Attendance[]; completionRate: number }) {
  const assignments = items.filter((item) => item.type === "assignment");
  const submissionRate = students.length && assignments.length ? Math.min(100, Math.round((submissions.length / (students.length * assignments.length)) * 100)) : 0;
  const attendanceRate = students.length ? Math.min(100, Math.round((new Set(attendance.map((item) => `${item.email}|${item.phone}`)).size / students.length) * 100)) : 0;
  return <><div className="tm3-stat-grid"><div className="tm3-stat-card"><span>Enrolled learners</span><strong>{students.length}</strong></div><div className="tm3-stat-card"><span>Assignment submission</span><strong>{submissionRate}%</strong></div><div className="tm3-stat-card"><span>Attendance</span><strong>{attendanceRate}%</strong></div><div className="tm3-stat-card"><span>Completion</span><strong>{completionRate}%</strong></div></div><section className="tm3-dashboard-section tm3-dashboard-section--wide"><div className="tm3-dashboard-section__head"><div><span className="tm3-eyebrow">Course health</span><h2>Learning engagement</h2></div></div><div className="tm3-analytics-bars"><AnalyticsBar label="Assignment submission" value={submissionRate} /><AnalyticsBar label="Attendance participation" value={attendanceRate} /><AnalyticsBar label="Course completion" value={completionRate} /></div></section></>;
}
function AnalyticsBar({ label, value }: { label: string; value: number }) { return <div><span><strong>{label}</strong><b>{value}%</b></span><div><i style={{ width: `${value}%` }} /></div></div>; }

function ComposerModal({ draft, setDraft, onUpload, onClose, onPublish }: { draft: Draft; setDraft: Dispatch<SetStateAction<Draft>>; onUpload: (event: ChangeEvent<HTMLInputElement>) => void; onClose: () => void; onPublish: () => void }) {
  return <div className="tm3-modal-backdrop" role="presentation"><div className="tm3-modal tm3-modal--composer" role="dialog" aria-modal="true" aria-labelledby="composer-title"><div className="tm3-modal__head"><div><span className="tm3-eyebrow">Create for your class</span><h2 id="composer-title">Publish learning content</h2></div><button type="button" onClick={onClose}><X size={20} /></button></div><div className="tm3-composer-types">{(Object.keys(typeMeta) as ClassworkType[]).map((type) => { const meta = typeMeta[type]; const Icon = meta.icon; return <button type="button" className={draft.type === type ? "is-active" : ""} key={type} onClick={() => setDraft((current) => ({ ...current, type }))}><Icon size={18} /><span>{meta.label}</span></button>; })}</div><div className="tm3-form-grid"><label className="tm3-field tm3-field--full"><span>Title</span><input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="A clear, action-oriented title" /></label><label className="tm3-field tm3-field--full"><span>Instructions / context</span><textarea value={draft.instructions} onChange={(event) => setDraft((current) => ({ ...current, instructions: event.target.value }))} placeholder="Explain what learners should know or do…" /></label>{draft.type !== "announcement" && <label className="tm3-field"><span>Resource link</span><input value={draft.link} onChange={(event) => setDraft((current) => ({ ...current, link: event.target.value }))} placeholder="YouTube, Drive, Meet or web link" /></label>}{draft.type === "assignment" && <label className="tm3-field"><span>Due date</span><input type="date" value={draft.dueDate} onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))} /></label>}<label className="tm3-field tm3-field--full"><span>Attachment</span><label className="tm3-upload-zone"><Paperclip size={20} /><strong>{draft.fileName || "Attach a learning file"}</strong><small>PDF, document or image up to 12 MB</small><input type="file" onChange={onUpload} /></label></label></div><div className="tm3-modal__actions"><button className="tm3-button tm3-button--outline" type="button" onClick={onClose}>Cancel</button><button className="tm3-button tm3-button--dark" type="button" onClick={onPublish}><Send size={16} /> Publish to class</button></div></div></div>;
}

function ScheduleModal({ value, setValue, onClose, onSave }: { value: { date: string; time: string; note: string }; setValue: Dispatch<SetStateAction<{ date: string; time: string; note: string }>>; onClose: () => void; onSave: () => void }) {
  return <div className="tm3-modal-backdrop"><div className="tm3-modal" role="dialog" aria-modal="true"><div className="tm3-modal__head"><div><span className="tm3-eyebrow">Live learning</span><h2>Schedule a class</h2></div><button type="button" onClick={onClose}><X size={20} /></button></div><div className="tm3-form-grid"><label className="tm3-field"><span>Date</span><input type="date" value={value.date} onChange={(event) => setValue((current) => ({ ...current, date: event.target.value }))} /></label><label className="tm3-field"><span>Time</span><input type="time" value={value.time} onChange={(event) => setValue((current) => ({ ...current, time: event.target.value }))} /></label><label className="tm3-field tm3-field--full"><span>Session title / note</span><input value={value.note} onChange={(event) => setValue((current) => ({ ...current, note: event.target.value }))} placeholder="e.g. Live problem-solving studio" /></label></div><div className="tm3-modal__actions"><button className="tm3-button tm3-button--outline" type="button" onClick={onClose}>Cancel</button><button className="tm3-button tm3-button--dark" type="button" onClick={onSave}><CalendarDays size={16} /> Add to schedule</button></div></div></div>;
}
